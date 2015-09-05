import * as Util from './util';

// A card for Spacetime.
export class Card {
  constructor(player) {
    // Get a card to use for a player drawing a card.
    let cardName = Util.choice(player.deck.cards)
    let card = CARDS[cardName]

    this.name = cardName    
    for (let key in card) {
      this[key] = card[key]
    }

    this.canAct = false
    this.playerName = player.name
    this.attackCount = 0
    this.warm = .2
    card.guid = Util.makeId()
  }
}
 
// Each creature attacks at a certain rate.
// This is the default rate in milliseconds.
export const DEFAULT_ATTACK_RATE = 5000;

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
     damage         - INT            deals damage to target(s)
     kill           - BOOL           kills permanents when used
     description    - STRING         what the card does (TODO: this should actually be auto-genned)
     flavor         - STRING         text just for fun

   A typical card that stays in play when used will have at least: 
     cost, permanent=true, attack, defense, attackRate

   A typical card that doesn't stay in play when used will have at least: 
     cost, permanent=false, target, targetCount, description

   For imageName:
      If the imagename is "better-bot", then you can use images like
      better-bot.png, better-bot-damaged.png
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
  Bot: {
    cost: 1,
    permanent: true,
    attack: 1,
    defense: 1,
    attackRate: DEFAULT_ATTACK_RATE,
    imageName: "bot",
  },
  BetterBot: {
    cost: 1,
    permanent: true,
    attack: 1,
    defense: 2,
    attackRate: DEFAULT_ATTACK_RATE,
    imageName: "better-bot",
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

