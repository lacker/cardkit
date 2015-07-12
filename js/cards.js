export const CARDS = [
  {
    name: "BiBot",
    permanent: true,
    attack: 2,
    defense: 2,
    cost: 2
  },
  {
    name: "TriBot",
    permanent: true,
    attack: 3,
    defense: 3,
    cost: 3
  },
  {
    name: "QuadBot",
    permanent: true,
    attack: 4,
    defense: 4,
    cost: 4
  },
  {
    name: "Pentabot",
    permanent: true,
    attack: 5,
    defense: 5,
    cost: 5
  },
  {
    name: "Laser Blast",
    description: "Deal 3 damage to a creature or player.",
    requiresTarget: true,
    damage: 3,
    cost: 2
  },
  {
    name: "Errant Blast",
    description: "Kill one of your opponent's fleet at random.",
    kill: true,
    cost: 3
  },
  {
    name: "EMP",
    description: "Destroy all cards in play.",
    flavor: "Watch that basket.",
    emp: true,
    cost: 4
  },
  /*{
    name: "Time Stop",
    description: "End this turn and the next.",
    endTurn: 2,
    cost: 7
  },
  {
    name: "Blast BiBot",
    description: "Kill one of your opponent's fleet at random.",
    permanent: true,
    attack: 2,
    defense: 2,
    kill: true,
    cost: 5
  },
  {
    name: "Time Cruiser",
    description: "End this turn and the next.",
    permanent: true,
    attack: 5,
    defense: 1,
    endTurn: 2,
    cost: 8
  }*/
]