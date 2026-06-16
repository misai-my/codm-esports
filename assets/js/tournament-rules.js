// CODM Tournament OS - Format, Bracket, and Scoring Rules
// Central reference for Multiplayer and Battle Royale tournament operations.

const CODM_TOURNAMENT_RULES = {
  modes: {
    multiplayer_1v1: { label: "Multiplayer 1v1", short: "MP 1v1", discipline: "multiplayer", entrant: "player" },
    multiplayer_5v5: { label: "Multiplayer 5v5", short: "MP 5v5", discipline: "multiplayer", entrant: "team" },
    battle_royale_solo: { label: "Battle Royale Solo", short: "BR Solo", discipline: "battle_royale", entrant: "player" },
    battle_royale_squads: { label: "Battle Royale Squads", short: "BR Squads", discipline: "battle_royale", entrant: "team" }
  },

  battleRoyale: {
    groupMin: 15,
    groupMax: 24,
    qualifiers: {
      label: "Qualifiers",
      rounds: [{ round: 1, map: "Isolated" }],
      slots: { battle_royale_solo: 80, battle_royale_squads: 40 }
    },
    group_stage: {
      label: "Group Stage",
      rounds: [
        { round: 1, map: "Isolated" },
        { round: 2, map: "Blackout" },
        { round: 3, map: "Isolated" }
      ],
      slots: { battle_royale_solo: 20, battle_royale_squads: 16 }
    },
    playoffs: {
      label: "Playoffs / Finals",
      rounds: [
        { round: 1, map: "Isolated" },
        { round: 2, map: "Blackout" },
        { round: 3, map: "Isolated" },
        { round: 4, map: "Blackout" },
        { round: 5, map: "Isolated" },
        { round: 6, map: "Blackout" }
      ]
    },
    placementPoints: {
      1: 10,
      2: 6,
      3: 5,
      4: 4,
      5: 3,
      6: 2,
      7: 1,
      8: 1
    },
    eliminationPoint: 1,
    tiebreakers: [
      "Total Victory",
      "Total Elimination Points",
      "Last Round Survival Rank"
    ]
  },

  multiplayer: {
    qualifiers: {
      label: "Qualifiers",
      bracket: "single_elimination",
      slots: { multiplayer_1v1: 12, multiplayer_5v5: 12 },
      series: {
        multiplayer_1v1: { label: "1 Round Only", maps: ["Team Death Match"] },
        multiplayer_5v5: { label: "BO3 Series", maps: ["Hardpoint", "Search & Destroy", "Control"] }
      }
    },
    group_stage: {
      label: "Group Stage",
      bracket: "round_robin",
      groups: 2,
      slots: { multiplayer_1v1: 4, multiplayer_5v5: 4 },
      series: {
        multiplayer_1v1: { label: "BO3 Series", maps: ["Team Death Match", "Hardpoint", "Search & Destroy"] },
        multiplayer_5v5: { label: "BO3 Series", maps: ["Hardpoint", "Search & Destroy", "Control"] }
      },
      seriesPoints: {
        "2-0": { winner: 3, loser: 0 },
        "2-1": { winner: 2, loser: 1 }
      },
      ranking: ["Series Points", "Series Score", "Match Win", "Match Loss"]
    },
    playoffs: {
      label: "Playoffs",
      bracket: "double_elimination",
      series: {
        multiplayer_1v1: {
          BO3: ["Team Death Match", "Hardpoint", "Search & Destroy"],
          BO5: ["Team Death Match", "Hardpoint", "Search & Destroy", "Team Death Match", "Search & Destroy"],
          BO7: ["Team Death Match", "Hardpoint", "Search & Destroy", "Team Death Match", "Hardpoint", "Search & Destroy", "Team Death Match"]
        },
        multiplayer_5v5: {
          BO3: ["Hardpoint", "Search & Destroy", "Control"],
          BO5: ["Hardpoint", "Search & Destroy", "Control", "Hardpoint", "Search & Destroy"]
        }
      }
    },
    tiebreakers: [
      "Head-to-head Series Score",
      "Head-to-head Match Win points",
      "Head-to-head Dominance Score"
    ]
  }
};

function isBattleRoyaleMode(mode) {
  return CODM_TOURNAMENT_RULES.modes[mode]?.discipline === "battle_royale";
}

function isMultiplayerMode(mode) {
  return CODM_TOURNAMENT_RULES.modes[mode]?.discipline === "multiplayer";
}

function battleRoyalePlacementPoints(placement) {
  return CODM_TOURNAMENT_RULES.battleRoyale.placementPoints[Number(placement)] || 0;
}

function calculateBattleRoyaleScore({ placement, eliminations }) {
  const survivalPoints = battleRoyalePlacementPoints(placement);
  const eliminationPoints = Number(eliminations || 0) * CODM_TOURNAMENT_RULES.battleRoyale.eliminationPoint;
  return {
    victory: Number(placement) === 1,
    survival_points: survivalPoints,
    elimination_points: eliminationPoints,
    total_points: survivalPoints + eliminationPoints
  };
}

function battleRoyaleRounds(stageKey) {
  return CODM_TOURNAMENT_RULES.battleRoyale[stageKey]?.rounds
    || CODM_TOURNAMENT_RULES.battleRoyale.group_stage.rounds;
}

function suggestedBattleRoyaleGroupCount(total) {
  const max = CODM_TOURNAMENT_RULES.battleRoyale.groupMax;
  return Math.max(1, Math.ceil(Number(total || 0) / max));
}

function battleRoyaleGroupCode(index) {
  return `Group ${String.fromCharCode(65 + Number(index || 0))}`;
}

window.CODM_TOURNAMENT_RULES = CODM_TOURNAMENT_RULES;
window.isBattleRoyaleMode = isBattleRoyaleMode;
window.isMultiplayerMode = isMultiplayerMode;
window.battleRoyalePlacementPoints = battleRoyalePlacementPoints;
window.calculateBattleRoyaleScore = calculateBattleRoyaleScore;
window.battleRoyaleRounds = battleRoyaleRounds;
window.suggestedBattleRoyaleGroupCount = suggestedBattleRoyaleGroupCount;
window.battleRoyaleGroupCode = battleRoyaleGroupCode;
