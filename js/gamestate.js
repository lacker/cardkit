// The state of a ccg type card game.

const CARDS = [
  {
    name: "Twobot",
    attack: 2,
    defense: 2
  },
  {
    name: "Threebot",
    attack: 3,
    defense: 3
  },
  {
    name: "Fourbot",
    attack: 4,
    defense: 4
  },
  {
    name: "Fivebot",
    attack: 5,
    defense: 5
  },
  {
    name: "Sixbot",
    attack: 6,
    defense: 6
  },
  {
    name: "Sevenbot",
    attack: 7,
    defense: 7
  },
  {
    name: "Eightbot",
    attack: 8,
    defense: 8
  },
]

function randomCard() {
  return CARDS[Math.floor(Math.random() * CARDS.length)]
}

// The state of a single player.
class PlayerState {
  constructor(goingFirst) {
    this.hand = [randomCard(), randomCard(), randomCard()]
    this.board = []
  }
}

class GameState {
  constructor() {
    this.turn = 0
    this.players = [new PlayerState(true), new PlayerState(false)]
  }

  log() {
    console.log("It is player " + this.turn + "'s turn'")
  }
}

module.exports = GameState;