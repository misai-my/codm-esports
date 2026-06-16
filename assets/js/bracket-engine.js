// CODM Tournament OS - Advanced Bracket Engine
// Supports single elimination, dynamic double elimination, and Swiss rounds.

function getModeSequence(format) {
  const f = String(format || "BO5").toUpperCase();
  if (f.includes("BO3")) return ["Hardpoint", "Search and Destroy", "Control"];
  if (f.includes("BO7")) return ["Hardpoint", "Search and Destroy", "Control", "Hardpoint", "Search and Destroy", "Control", "Search and Destroy"];
  return ["Hardpoint", "Search and Destroy", "Control", "Hardpoint", "Search and Destroy"];
}

function bestOfNumber(format) {
  const f = String(format || "BO5").toUpperCase();
  if (f.includes("BO3")) return 3;
  if (f.includes("BO7")) return 7;
  return 5;
}

function sortBySeed(a, b) {
  return Number(a.seed ?? 999) - Number(b.seed ?? 999) || String(a.team_name).localeCompare(String(b.team_name));
}

function pairHighLow(teams) {
  const list = [...teams].sort(sortBySeed);
  const pairs = [];
  while (list.length > 1) pairs.push([list.shift(), list.pop()]);
  if (list.length) pairs.push([list.shift(), null]);
  return pairs;
}

function matchPairKey(aId, bId) {
  return [aId, bId].filter(Boolean).sort().join("::");
}

async function fetchApprovedTeams(tournamentId, registrationMode = null) {
  let query = window.sb
    .from("teams")
    .select("id, team_name, team_tag, logo_url, captain_name, registration_mode")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (registrationMode) query = query.eq("registration_mode", registrationMode);

  const { data, error } = await query.order("team_name", { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchSeeds(tournamentId, registrationMode = null) {
  let query = window.sb
    .from("tournament_seeds")
    .select("team_id, seed")
    .eq("tournament_id", tournamentId);

  if (registrationMode) query = query.eq("registration_mode", registrationMode);

  const { data, error } = await query;
  if (error) throw error;
  return Object.fromEntries((data || []).map(row => [row.team_id, row.seed]));
}

async function upsertSeeds(tournamentId, seededTeams) {
  const registrationMode = seededTeams[0]?.registration_mode || window.getSelectedRegistrationMode?.() || 'multiplayer_5v5';
  const rows = seededTeams.map((team, idx) => ({
    tournament_id: tournamentId,
    registration_mode: team.registration_mode || registrationMode,
    team_id: team.id,
    seed: Number(team.seed || idx + 1)
  }));

  if (!rows.length) return;

  // Guard against two teams being assigned the same seed in the UI.
  const seenSeeds = new Set();
  for (const row of rows) {
    if (!Number.isInteger(row.seed) || row.seed < 1) {
      throw new Error("Seeds must be whole numbers starting from 1.");
    }

    if (seenSeeds.has(row.seed)) {
      throw new Error(`Duplicate seed number detected: ${row.seed}. Each team must have a unique seed.`);
    }

    seenSeeds.add(row.seed);
  }

  // Important:
  // tournament_seeds has a unique constraint on (tournament_id, seed).
  // Updating seed 1 -> 2 while seed 2 still exists causes Postgres to throw:
  // duplicate key value violates unique constraint "tournament_seeds_tournament_id_seed_key".
  // The safest client-side fix is to replace the tournament seed set atomically by flow:
  // delete current seeds for this tournament, then insert the new clean seed order.
  const { error: deleteError } = await window.sb
    .from("tournament_seeds")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("registration_mode", registrationMode);

  if (deleteError) throw deleteError;

  const { error: insertError } = await window.sb
    .from("tournament_seeds")
    .insert(rows);

  if (insertError) throw insertError;
}

async function initializeStandings(tournamentId, seededTeams) {
  const registrationMode = seededTeams[0]?.registration_mode || window.getSelectedRegistrationMode?.() || 'multiplayer_5v5';
  const rows = seededTeams.map((team, idx) => ({
    tournament_id: tournamentId,
    registration_mode: team.registration_mode || registrationMode,
    team_id: team.id,
    seed: Number(team.seed || idx + 1),
    matches_played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    byes: 0,
    points: 0,
    map_wins: 0,
    map_losses: 0,
    map_diff: 0,
    buchholz: 0,
    status: "active"
  }));
  if (!rows.length) return;
  const { error } = await window.sb.from("tournament_standings").upsert(rows, { onConflict: "tournament_id,registration_mode,team_id" });
  if (error) throw error;
}

async function createMatchGames(matchId, tournament) {
  const modes = getModeSequence(tournament.format);
  const rows = modes.map((mode, index) => ({ match_id: matchId, game_no: index + 1, mode, status: "scheduled" }));
  const { error } = await window.sb.from("match_games").insert(rows);
  if (error) throw error;
}

async function createMatch(tournament, roundNo, matchNo, teamA, teamB, bracketGroup, roundLabel, isBye = false) {
  const registrationMode = tournament.registration_mode || teamA?.registration_mode || teamB?.registration_mode || window.getSelectedRegistrationMode?.() || 'multiplayer_5v5';
  const { data, error } = await window.sb
    .from("matches")
    .insert({
      tournament_id: tournament.id,
      registration_mode: registrationMode,
      bracket_type: tournament.bracket_type,
      bracket_group: bracketGroup,
      round_no: roundNo,
      match_no: matchNo,
      round_label: roundLabel,
      team_a_id: teamA?.id || teamA?.team_id || null,
      team_b_id: teamB?.id || teamB?.team_id || null,
      is_bye: isBye,
      best_of: bestOfNumber(tournament.format),
      status: isBye ? "completed" : "scheduled"
    })
    .select("*")
    .single();
  if (error) throw error;

  if (!isBye) await createMatchGames(data.id, tournament);

  if (isBye && (teamA || teamB)) {
    const winnerId = teamA?.id || teamA?.team_id || teamB?.id || teamB?.team_id;
    await window.sb.from("matches").update({
      team_a_series_score: 1,
      team_b_series_score: 0,
      winner_team_id: winnerId,
      status: "completed"
    }).eq("id", data.id);
  }

  return data;
}

async function clearCompetition(tournamentOrSlug = null, registrationMode = null) {
  if (tournamentOrSlug?.id) {
    const tournamentId = tournamentOrSlug.id;
    const mode = registrationMode || tournamentOrSlug.registration_mode || window.getSelectedRegistrationMode?.() || "multiplayer_5v5";

    const { data: modeMatches, error: matchLookupError } = await window.sb
      .from("matches")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("registration_mode", mode);

    if (matchLookupError) throw matchLookupError;

    const matchIds = (modeMatches || []).map(match => match.id);

    if (matchIds.length) {
      await window.sb.from("match_reports").delete().in("match_id", matchIds);
      await window.sb.from("match_games").delete().in("match_id", matchIds);
      await window.sb.from("matches").delete().in("id", matchIds);
    }

    await window.sb.from("tournament_standings").delete().eq("tournament_id", tournamentId).eq("registration_mode", mode);
    await window.sb.from("tournament_seeds").delete().eq("tournament_id", tournamentId).eq("registration_mode", mode);
    return;
  }

  const { error } = await window.sb.rpc("clear_tournament_competition", { p_slug: cfg.DEFAULT_TOURNAMENT_SLUG });
  if (error) throw error;
}

async function fetchCompletedMatches(tournamentId, registrationMode = null) {
  let query = window.sb
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("status", "completed");

  if (registrationMode) query = query.eq("registration_mode", registrationMode);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function recalcStandings(tournament, approvedTeams) {
  const registrationMode = tournament.registration_mode || approvedTeams[0]?.registration_mode || window.getSelectedRegistrationMode?.() || 'multiplayer_5v5';
  const seeds = await fetchSeeds(tournament.id, registrationMode);
  const base = approvedTeams.map((team, idx) => ({ ...team, seed: seeds[team.id] || idx + 1 }));
  const table = new Map(base.map(team => [team.id, {
    tournament_id: tournament.id,
    registration_mode: team.registration_mode || registrationMode,
    team_id: team.id,
    seed: team.seed,
    matches_played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    byes: 0,
    points: 0,
    map_wins: 0,
    map_losses: 0,
    map_diff: 0,
    buchholz: 0,
    status: "active"
  }]));

  const matches = await fetchCompletedMatches(tournament.id, registrationMode);
  for (const match of matches) {
    if (!match.winner_team_id) continue;
    const a = match.team_a_id;
    const b = match.team_b_id;
    const aScore = Number(match.team_a_series_score || 0);
    const bScore = Number(match.team_b_series_score || 0);

    const winner = table.get(match.winner_team_id);
    if (!winner) continue;

    if (match.is_bye || !a || !b) {
      winner.matches_played += 1;
      winner.wins += 1;
      winner.byes += 1;
      winner.points += tournament.bracket_type === "swiss" ? 3 : 1;
      winner.map_wins += 1;
      winner.map_diff = winner.map_wins - winner.map_losses;
      continue;
    }

    const loserId = match.winner_team_id === a ? b : a;
    const loser = table.get(loserId);

    winner.matches_played += 1;
    winner.wins += 1;
    winner.points += tournament.bracket_type === "swiss" ? 3 : 1;
    winner.map_wins += match.winner_team_id === a ? aScore : bScore;
    winner.map_losses += match.winner_team_id === a ? bScore : aScore;

    if (loser) {
      loser.matches_played += 1;
      loser.losses += 1;
      loser.map_wins += loserId === a ? aScore : bScore;
      loser.map_losses += loserId === a ? bScore : aScore;
      if (tournament.bracket_type === "double_elimination" && loser.losses >= 2) loser.status = "eliminated";
      if (tournament.bracket_type === "single_elimination" && loser.losses >= 1) loser.status = "eliminated";
    }
  }

  for (const row of table.values()) row.map_diff = row.map_wins - row.map_losses;

  // Buchholz for Swiss: sum opponent points.
  if (tournament.bracket_type === "swiss") {
    for (const row of table.values()) {
      const opponents = matches
        .filter(m => !m.is_bye && (m.team_a_id === row.team_id || m.team_b_id === row.team_id))
        .map(m => m.team_a_id === row.team_id ? m.team_b_id : m.team_a_id)
        .filter(Boolean);
      row.buchholz = opponents.reduce((sum, oppId) => sum + (table.get(oppId)?.points || 0), 0);
    }
  }

  const rows = Array.from(table.values());
  if (rows.length) {
    const { error } = await window.sb.from("tournament_standings").upsert(rows, { onConflict: "tournament_id,registration_mode,team_id" });
    if (error) throw error;
  }
  return rows;
}

function activeSingleTeams(standings) { return standings.filter(s => s.losses < 1); }
function activeDoubleTeams(standings) { return standings.filter(s => s.losses < 2); }
function standingSort(a, b) {
  return Number(b.points) - Number(a.points)
    || Number(b.wins) - Number(a.wins)
    || Number(b.map_diff) - Number(a.map_diff)
    || Number(a.seed) - Number(b.seed);
}

async function playedPairs(tournamentId) {
  const { data, error } = await window.sb
    .from("matches")
    .select("team_a_id, team_b_id")
    .eq("tournament_id", tournamentId)
    .not("team_a_id", "is", null)
    .not("team_b_id", "is", null);
  if (error) throw error;
  return new Set((data || []).map(m => matchPairKey(m.team_a_id, m.team_b_id)));
}

function pairSwiss(standings, playedSet) {
  const available = [...standings].sort(standingSort);
  const pairs = [];

  // Give bye to the lowest-ranked team without a bye if count is odd.
  if (available.length % 2 === 1) {
    let byeIndex = -1;
    for (let i = available.length - 1; i >= 0; i--) {
      if (available[i].byes < 1) { byeIndex = i; break; }
    }
    if (byeIndex === -1) byeIndex = available.length - 1;
    const bye = available.splice(byeIndex, 1)[0];
    pairs.push([bye, null]);
  }

  while (available.length) {
    const a = available.shift();
    let opponentIndex = available.findIndex(b => !playedSet.has(matchPairKey(a.team_id, b.team_id)));
    if (opponentIndex === -1) opponentIndex = 0;
    const b = available.splice(opponentIndex, 1)[0];
    pairs.push([a, b]);
  }

  return pairs;
}

async function setTournamentEngine(tournament, bracketType, roundCount) {
  const value = Number(roundCount || tournament.round_count || (tournament.round_count || tournament.swiss_round_count) || 5);

  const { error } = await window.sb
    .from("tournaments")
    .update({
      bracket_type: bracketType,
      round_count: value,
      swiss_round_count: value
    })
    .eq("id", tournament.id);

  if (error) throw error;
}

async function generateInitialRound(tournament, seededTeams) {
  await clearCompetition(tournament, tournament.registration_mode || seededTeams[0]?.registration_mode || window.getSelectedRegistrationMode?.() || 'multiplayer_5v5');
  await setTournamentEngine(tournament, tournament.bracket_type, (tournament.round_count || tournament.swiss_round_count));
  await upsertSeeds(tournament.id, seededTeams);
  await initializeStandings(tournament.id, seededTeams);

  const seeded = seededTeams.map((t, i) => ({ ...t, seed: Number(t.seed || i + 1) })).sort(sortBySeed);
  let pairs = [];
  let group = "main";
  let label = "Round 1";

  if (tournament.bracket_type === "swiss") {
    const standings = seeded.map(t => ({ team_id: t.id, seed: t.seed, points: 0, wins: 0, map_diff: 0, byes: 0 }));
    pairs = pairSwiss(standings, new Set()).map(([a, b]) => [seeded.find(t => t.id === a.team_id), b ? seeded.find(t => t.id === b.team_id) : null]);
    group = "swiss";
    label = "Swiss Round 1";
  } else if (tournament.bracket_type === "double_elimination") {
    pairs = pairHighLow(seeded);
    group = "winners";
    label = "Winners Round 1";
  } else {
    pairs = pairHighLow(seeded);
    group = "main";
    label = "Round 1";
  }

  let matchNo = 1;
  for (const [a, b] of pairs) {
    await createMatch(tournament, 1, matchNo++, a, b, group, label, !b);
  }

  await window.sb.from("tournaments").update({ current_round: 1, bracket_status: "in_progress" }).eq("id", tournament.id);

  const approved = await fetchApprovedTeams(tournament.id);
  await recalcStandings(tournament, approved);
}

async function allMatchesComplete(tournamentId, roundNo) {
  const { data, error } = await window.sb
    .from("matches")
    .select("id, status")
    .eq("tournament_id", tournamentId)
    .eq("round_no", roundNo);
  if (error) throw error;
  const matches = data || [];
  return matches.length > 0 && matches.every(m => m.status === "completed" || m.status === "cancelled");
}

async function generateNextRound(tournament) {
  const complete = await allMatchesComplete(tournament.id, tournament.current_round);
  if (!complete) throw new Error("Finish all matches in the current round first.");

  const approved = await fetchApprovedTeams(tournament.id);
  let standings = await recalcStandings(tournament, approved);
  const nextRound = Number(tournament.current_round || 0) + 1;
  let pairs = [];

  if (tournament.bracket_type === "swiss") {
    if (tournament.current_round >= (tournament.round_count || tournament.swiss_round_count)) {
      await window.sb.from("tournaments").update({ bracket_status: "completed" }).eq("id", tournament.id);
      return { completed: true, message: "Swiss rounds completed." };
    }
    const active = standings.sort(standingSort);
    const played = await playedPairs(tournament.id);
    pairs = pairSwiss(active, played);
    let matchNo = 1;
    for (const [a, b] of pairs) {
      await createMatch(tournament, nextRound, matchNo++, a, b, "swiss", `Swiss Round ${nextRound}`, !b);
    }
  } else if (tournament.bracket_type === "single_elimination") {
    const active = activeSingleTeams(standings).sort(sortBySeed);
    if (active.length <= 1) {
      await markChampion(tournament, active[0]);
      return { completed: true, message: "Single elimination completed." };
    }
    pairs = pairHighLow(active);
    let matchNo = 1;
    for (const [a, b] of pairs) {
      await createMatch(tournament, nextRound, matchNo++, a, b, "main", `Round ${nextRound}`, !b);
    }
  } else if (tournament.bracket_type === "double_elimination") {
    const active = activeDoubleTeams(standings).sort(sortBySeed);
    if (active.length <= 1) {
      await markChampion(tournament, active[0]);
      return { completed: true, message: "Double elimination completed." };
    }

    const zeroLoss = active.filter(s => s.losses === 0).sort(sortBySeed);
    const oneLoss = active.filter(s => s.losses === 1).sort(sortBySeed);

    if (active.length === 2) {
      pairs = [[active[0], active[1]]];
      await createMatch(tournament, nextRound, 1, active[0], active[1], "grand_final", zeroLoss.length === 1 && oneLoss.length === 1 ? "Grand Final" : "Final Reset", false);
    } else {
      let matchNo = 1;
      for (const [a, b] of pairHighLow(zeroLoss)) {
        await createMatch(tournament, nextRound, matchNo++, a, b, "winners", `Winners Round ${nextRound}`, !b);
      }
      for (const [a, b] of pairHighLow(oneLoss)) {
        await createMatch(tournament, nextRound, matchNo++, a, b, "losers", `Elimination Round ${nextRound}`, !b);
      }
    }
  }

  await window.sb.from("tournaments").update({ current_round: nextRound, bracket_status: "in_progress" }).eq("id", tournament.id);
  const freshApproved = await fetchApprovedTeams(tournament.id);
  await recalcStandings(tournament, freshApproved);
  return { completed: false, message: `Round ${nextRound} generated.` };
}

async function markChampion(tournament, row) {
  if (row?.team_id) {
    await window.sb
      .from("tournament_standings")
      .update({ status: "champion" })
      .eq("tournament_id", tournament.id)
      .eq("team_id", row.team_id);
  }
  await window.sb.from("tournaments").update({ bracket_status: "completed" }).eq("id", tournament.id);
}
