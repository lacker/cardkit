export const CARDS = {
  BiBot: {
    permanent: true,
    attack: 2,
    defense: 2,
    cost: 2
  },
  TriBot: {
    permanent: true,
    attack: 3,
    defense: 3,
    cost: 3
  },
  QuadBot: {
    permanent: true,
    attack: 4,
    defense: 4,
    cost: 4
  },
  Pentabot: {
    permanent: true,
    attack: 5,
    defense: 5,
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
    cost: 4
  },
}

export const DECKS = [
  {
    name: "Control",
    cards: ["Pentabot", "EMP"],
  },
  {
    name: "Weenie",
    cards: ["BiBot", "TriBot"],
  },
  {
    name: "Midrange",
    cards: ["QuadBot", "Errant Blast"],
  },
]
