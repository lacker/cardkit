
import * as Util from './util';

// A card for Spacetime.
export class Card {
  constructor(player) {
    // Get some card info to create a new card
    let cardName = Util.choice(player.deck.cards)
    let cardReference = ALL_CARDS[cardName]

    // Clone the card reference's info into this new card
    this.name = cardName    
    for (let key in cardReference) {
      this[key] = cardReference[key]
    }

    // Set some default properties for the card
    this.canAct = false
    this.playerName = player.name
    this.attackCount = 0
    this.warm = .2
    this.guid = Util.makeId()
  }
}
 
// Each creature attacks at a certain rate.
// This is the default rate in milliseconds.
export const DEFAULT_ATTACK_RATE = 5000;

/* 
   ALL_CARDS maps names of cards to properties/definitions.

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
     damage         - INT            deals damage to target(s)
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
export const ALL_CARDS = {
  Bot: {
    cost: 1,
    permanent: true,
    attack: 1,
    defense: 1,
    attackRate: DEFAULT_ATTACK_RATE,
  },
  BetterBot: {
    cost: 1,
    permanent: true,
    attack: 1,
    defense: 2,
    attackRate: DEFAULT_ATTACK_RATE,
  },
  "Errant Blast": {
    cost: 0,
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
  "Laser Blast": {  
    cost: 2,
    permanent: false,
    target: TARGETS.ANY_PERMANENT,
    targetCount: 1,
    randomTarget: false,
    description: "Deal 3 damage to a creature or player.",
    damage: 3,
  },
}

// Key card names to images
export const CARD_IMAGES = {
  "Bot": "bot",
  "BetterBot": "bot",
}


// Define a couple of simple decks.
export const DECKS = [
  {
    name: "Control",
    cards: ["BetterBot"],
  },
  {
    name: "Control",
    cards: ["BetterBot", "BetterBot", "BetterBot", "EMP"],
  },
]

export const COMPUTER_DECKS = [
  {
    name: "Weenie",
    cards: ["Bot"],
  },
  {
    name: "WeenieBlast",
    cards: ["Bot", "Errant Blast"],
  },
  {
    name: "BetterWeenie",
    cards: ["BetterBot", "Errant Blast"],
  },
]

