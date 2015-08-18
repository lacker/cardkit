// each creature attacks a certain rate
// this is the default rate in milliseconds
export const DEFAULT_ATTACK_RATE = 3000;

// the number of cards each player starts with 
export const STARTING_HAND_SIZE = 3;

/* 
   define the cards that are legal as JSON
   
   keys in the CARDS dict are the Names of the card

   cards must have these properties: 
     cost             - INT        (>=0)

   cards may have these optional properties:
     permanent        - BOOL       stays in play when used
     attack           - INT        (>=0)
     defense          - INT        (>=1)
     attackRate       - INT        (millis)
     kill             - BOOL       kills a random permanent when used
     emp              - BOOL       kills everything when used
     requiresTarget   - BOOL       select a permanent/player to use
     description      - STRING     what the card does
     flavor           - STRING     text just for fun 

   a typical card that stays in play when used will have: 
     cost, permanent, attack, defense, attackRate

   a typical card that doesn't stay in play when used will have: 
     cost, description

*/
export const CARDS = {
  BiBot: {
    permanent: true,
    attack: 2,
    defense: 2,
    attackRate: DEFAULT_ATTACK_RATE,
    cost: 2
  },
  TriBot: {
    permanent: true,
    attack: 3,
    defense: 3,
    attackRate: DEFAULT_ATTACK_RATE,
    cost: 3
  },
  QuadBot: {
    permanent: true,
    attack: 4,
    defense: 4,
    attackRate: DEFAULT_ATTACK_RATE,
    cost: 4
  },
  PentaBot: {
    permanent: true,
    attack: 5,
    defense: 5,
    attackRate: DEFAULT_ATTACK_RATE,
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


// define a couple of decks, still very simple
// the current computer player always gets Weenie
// the human player always gets control
export var DECKS = [
  {
    name: "Weenie",
    cards: ["BiBot"],
  },
  {
    name: "Control",
    cards: ["EMP", "QuadBot", "PentaBot", "TriBot"],
  },
]
