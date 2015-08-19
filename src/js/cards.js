// Each creature attacks at a certain rate.
// This is the default rate in milliseconds.
export const DEFAULT_ATTACK_RATE = 3000;

/* 
   CARDS maps names of cards to properties/definitions.

   Cards must have these properties: 
     cost           - INT            (>=0)
     permanent      - BOOL           stays in play when used

   Cards may have these optional properties:
     attack         - INT            (>=0)
     defense        - INT            (>=1)
     attackRate     - INT            (millis)
     target         - enum TARGETS   what permanents/players can be targeted
     targetCount    - INT            how many targets, or TARGETS.ALL_PERMANENTS
     randomTarget   - BOOL           whether the target(s) are chosen randomly
     kill           - BOOL           kills permanents when used
     description    - STRING         what the card does (TODO: this should actually be auto-genned)
     flavor         - STRING         text just for fun 

   A typical card that stays in play when used will have at least: 
     cost, permanent=true, attack, defense, attackRate

   A typical card that doesn't stay in play when used will have at least: 
     cost, permanent=false, target, targetCount, description
*/

// Possible values for target property
export const TARGETS = {
    ALL_PERMANENTS      : -1,
    ANY_PERMANENT       : 0,
    ANY_PLAYER          : 1,
    ANY_ANY             : 2,
    OPPONENT_PLAYER     : 3,
    OPPONENT_PERMANENT  : 4,
    OPPONENT_ANY        : 5,
    SELF_PLAYER         : 6,
    SELF_PERMANENT      : 7,
    SELF_ANY            : 8,
}

// Legal cards for Spacetime.
export const CARDS = {
  BiBot: {
    cost: 2,
    permanent: true,
    attack: 2,
    defense: 2,
    attackRate: DEFAULT_ATTACK_RATE,
  },
  TriBot: {
    cost: 3,
    permanent: true,
    attack: 3,
    defense: 3,
    attackRate: DEFAULT_ATTACK_RATE,
  },
  QuadBot: {
    cost: 4,
    permanent: true,
    attack: 4,
    defense: 4,
    attackRate: DEFAULT_ATTACK_RATE,
  },
  "Laser Blast": {
    cost: 2,
    permanent: false,
    target: TARGETS.ANY_PERMANENT,
    targetCount: 1,
    randomTarget: false,
    description: "Deal 3 damage to a creature or player.",
    damage: 3,
  },
  "Errant Blast": {
    cost: 3,
    permanent: false,
    target: TARGETS.OPPONENT_PERMANENT,
    targetCount: 1,
    randomTarget: true,
    description: "Kill one of your opponent's fleet at random.",
    kill: true,
  },
  EMP: {
    cost: 2,
    permanent: false,
    target: TARGETS.ANY_PERMANENT,
    targetCount: TARGETS.ALL_PERMANENTS,
    description: "Destroy all cards in play.",
    flavor: "Watch that basket.",
    kill: true,
  },
}

// Define a couple of simple decks.
// The current computer player always gets Weenie.
// The human player always gets Control.
export var DECKS = [
  {
    name: "Weenie",
    cards: ["BiBot"],
  },
  {
    name: "Control",
    cards: ["EMP", "QuadBot", "TriBot"],
  },
]
