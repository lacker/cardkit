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
    this.life = 30
  }
}

class GameState {
  constructor() {
    // Index of whose turn it is
    this.turn = 0

    this.players = [new PlayerState(true), new PlayerState(false)]
  }

  // Index of whose turn it isn't
  opponent() {
    return 1 - this.turn
  }

  clearDead() {
    for (let player of this.players) {
      player.board = player.board.filter(card => card.defense > 0)
    }
  }

  // from and to are indices into board
  attack(from, to) {
    let attacker = this.players[this.turn].board[from]
    let defender = this.players[this.opponent()].board[to]
    attacker.defense -= defender.attack
    defender.defense -= attacker.attack
    clearDead()
  }

  // Plays a card from the hand. For now assumes it's a creature.
  // from is an index of the hand
  play(from) {
    let player = this.players[this.turn]
    player.board.push(player.hand[from])
    player.hand.splice(from, 1)
  }

  // Attacks face
  face(from) {
    let attacker = this.players[this.turn].board[from]
    this.players[this.opponent()].life -= attacker.attack
  }

  endTurn() {
    this.turn = this.opponent()
  }

  log() {
    console.log("It is player " + this.turn + "'s turn'")
  }
}

module.exports = GameState;
