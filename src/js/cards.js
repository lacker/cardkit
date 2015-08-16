export const DRAW_SPEED_IN_MILLIS = 10000;
export const STARTING_HAND_SIZE = 3;

export const CARDS = {
  BiBot: {
    permanent: true,
    attack: 2,
    defense: 2,
    attackRate: 3000,
    cost: 2
  },
  TriBot: {
    permanent: true,
    attack: 3,
    defense: 3,
    attackRate: 3000,
    cost: 3
  },
  QuadBot: {
    permanent: true,
    attack: 4,
    defense: 4,
    attackRate: 3000,
    cost: 4
  },
  PentaBot: {
    permanent: true,
    attack: 5,
    defense: 5,
    attackRate: 3000,
    cost: 5
  },
  "Laser Blast": {
    description: "Deal 3 damage to a creature or player.",
    requiresTarget: true,
    damage: 3,
    cost: 2
  },
  "Errant Blast": {
    description: "Kill one of your opponent's fleet at random.",
    kill: true,
    cost: 3
  },
  EMP: {
    description: "Destroy all cards in play.",
    flavor: "Watch that basket.",
    emp: true,
    cost: 2
  },
}

export var DECKS = [
  {
    name: "Weenie",
    cards: ["BiBot"],
  },
  {
    name: "Control",
    cards: ["EMP", "QuadBot", "PentaBot", "TriBot"],
  },
  //{
  //  name: "Midrange",
  //  cards: ["QuadBot", "Errant Blast"],
  //},
]
