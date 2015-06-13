// The state of a ccg type card game.

require("seedrandom")

const CARDS = [
  {
    name: "Twobot",
    attack: 2,
    defense: 2,
    cost: 2
  },
  {
    name: "Threebot",
    attack: 3,
    defense: 3,
    cost: 3
  },
  {
    name: "Fourbot",
    attack: 4,
    defense: 4,
    cost: 4
  },
  {
    name: "Fivebot",
    attack: 5,
    defense: 5,
    cost: 5
  },
  {
    name: "Sixbot",
    attack: 6,
    defense: 6,
    cost: 6
  },
  {
    name: "Sevenbot",
    attack: 7,
    defense: 7,
    cost: 7
  },
  {
    name: "Eightbot",
    attack: 8,
    defense: 8,
    cost: 8
  },
]

// The state of a single player.
class PlayerState {
  constructor(name) {
    this.name = name
    this.hand = []
    this.board = []
    this.life = 30
    this.mana = 0
    this.maxMana = 0
  }

  // Throws if the index is bad
  getHand(index) {
    if (index >= this.hand.length) {
      throw (this.name + "'s hand has no card at index " + index)
    }
    return this.hand[index]
  }

  // Throws if the index is bad
  getBoard(index) {
    if (index >= this.board.length) {
      throw (this.name + "'s board has no card at index " + index)
    }
    return this.board[index]
  }
}

// A turn goes like
//
// beginTurn
// Some number of attack, face, and play
// endTurn
//
class GameState {

  // name is the name of the human at the controls.
  constructor(name) {
    this.name = name

    // Index of whose turn it is.
    // The human at the controls is always 0 here.
    // We just start off with it not being our turn so that the UI
    // will be disabled - when we actually start the game it may or
    // may not be our turn.
    this.turn = 1

    this.players = [new PlayerState("You", true),
                    new PlayerState("waiting for opponent...", false)]
  }

  // The player whose turn it is
  current() {
    return this.players[this.turn]
  }

  // The player whose turn it isn't
  opponent() {
    return this.players[1 - this.turn]
  }

  // Each type of move has a JSON representation.
  //
  // The keys are:
  // op: the method name. beginTurn, attack, face, play, endTurn
  // from: the index a card is coming from
  // to: the index a card is going to
  // makeMove makes a move that is provided via a JSON representation.
  //
  // In typical operation, only the Client should call makeMove.
  //
  // Returns whether the move was understood.
  makeMove(move) {
    console.log("makeMove: " + JSON.stringify(move))
    if (move.op == "beginTurn") {
      this.beginTurn()
    } else if (move.op == "hover") {
      this.hover(move.from, move.active)
    } else if (move.op == "attack") {
      this.attack(move.from, move.to)
    } else if (move.op == "face") {
      this.face(move.from)
    } else if (move.op == "play") {
      this.play(move.from)
    } else if (move.op == "endTurn") {
      this.endTurn()
    } else {
      console.log("ignoring op: " + move.op)
      return false
    }
    return true
  }

  startGame(players, seed) {
    this.rng = new Math.seedrandom(seed)

    if (players[0] == this.name) {
      // We go first
      console.log(`we, ${this.name}, go first`)
      this.turn = 0

      this.players[1].name = players[1]
    } else if (players[1] == this.name) {
      // We go second
      console.log(`we, ${this.name}, go second`)
      this.turn = 1

      this.players[1].name = players[0]
    } else {
      console.log(`a game started without me, ${this.name}`)
      return
    }

    this.beginTurn()
  }

  clearDead() {
    for (let player of this.players) {
      player.board = player.board.filter(card => card.defense > 0)
    }
  }

  // Track whether the given card is being hovered.
  // active is a bool
  hover(from, active) {
    // TODO: need to also pass the player whose card is being hovered, instead of just
    // hovering the cards of whoever's turn it is.
    let card = this.current().getHand(from)
    card.hover = active
  }

  // from and to are indices into board
  attack(from, to) {
    let attacker = this.current().getBoard(from)
    let defender = this.opponent().getBoard(to)
    attacker.defense -= defender.attack
    defender.defense -= attacker.attack
    clearDead()
  }

  // Plays a card from the hand. For now assumes it's a creature.
  // Throws if there's not enough mana.
  // from is an index of the hand
  play(from) {
    let player = this.current()
    let card = player.getHand(from)
    if (player.mana < card.cost) {
      throw `need ${card.cost} mana but only have ${player.mana}`
    }
    player.board.push(card)
    player.hand.splice(from, 1)
    player.mana -= card.cost
  }

  // Attacks face
  face(from) {
    let attacker = this.current().getBoard(from)
    this.opponent().life -= attacker.attack
  }

  draw() {
    // Make a copy so that we can edit this card
    let card = CARDS[Math.floor(this.rng() * CARDS.length)]
    let copy = {}
    for (let key in card) {
      copy[key] = card[key]
    }
    copy.hover = false;
    this.current().hand.push(copy)
  }

  beginTurn() {
    this.current().maxMana = Math.min(1 + this.current().maxMana, 10)
    this.current().mana = this.current().maxMana
    this.draw()
  }

  endTurn() {
    this.turn = 1 - this.turn
  }

  log() {
    console.log("It is player " + this.turn + "'s turn")
    console.log(this.players)
  }
}

module.exports = GameState;
