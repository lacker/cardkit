// The state of a ccg type card game.

require("seedrandom")

const CARDS = [
  {
    name: "Twobot",
    attack: 2,
    defense: 2,
    cost: 1
  },
  {
    name: "Threebot",
    attack: 3,
    defense: 3,
    cost: 2
  },
  {
    name: "Donk",
    description: "End the next two turns.",
    endTurn: 2,
    cost: 0
  },
]

// The state of a single player.
class PlayerState {
  constructor(data) {
    this.name = data.name
    this.hand = data.hand || []
    this.board = data.board || []
    this.trash = data.trash || []
    this.life = data.life || 30
    this.mana = data.mana || 0
    this.maxMana = data.maxMana || 0
    this.passNextTurn = false
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
  constructor(data) {
    this.name = data.name
    this._started = data._started || false

    // Index of whose turn it is.
    // The human at the controls is always 0 here.
    // We just start off with it not being our turn so that the UI
    // will be disabled - when we actually start the game it may or
    // may not be our turn.
    this.turn = (data.turn == null) ? 1 : data.turn

    let playerInfo = data.players || [{name: this.name},
                                      {name: "waiting for opponent..."}]
    this.players = playerInfo.map(info => new PlayerState(info))

    // The name of the winner
    this.winner = data.winner || null
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
  // The useful keys are:
  // op: the method name. beginTurn, attack, face, play, endTurn
  // from: the index a card is coming from
  // to: the index a card is going to
  //
  // The move also has a "player" and "id" but those are only used by
  // the networking layer.
  //
  // makeMove makes a move that is provided via a JSON representation.
  //
  // In typical operation, only the Client should call makeMove.
  //
  // Returns whether the move was understood.
  makeMove(move) {
    if (this.winner != null) {
      // You can't make normal moves when the game is over
      return false
    }

    if (move.op == "beginTurn") {
      this.beginTurn()
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

    this._started = true
    this.beginTurn()
  }

  started() {
    return this._started;
  }

  resolveDamage() {
    for (let player of this.players) {
      player.board = player.board.filter(card => card.defense > 0)
    }
    if (this.current().life <= 0) {
      this.winner = this.opponent().name
    } else if (this.opponent().life <= 0) {
      this.winner = this.current().name
    }
    if (this.winner != null) {
      console.log(this.winner + " wins!")
    }
  }

  // from and to are indices into board
  attack(from, to) {
    let attacker = this.current().getBoard(from)
    let defender = this.opponent().getBoard(to)
    attacker.defense -= defender.attack
    defender.defense -= attacker.attack
    this.resolveDamage()
  }

  // Plays a card from the hand.
  // Throws if there's not enough mana.
  // from is an index of the hand
  play(from) {
    let player = this.current()
    let card = player.getHand(from)
    if (player.mana < card.cost) {
      throw `need ${card.cost} mana but only have ${player.mana}`
    }
    // it's a creature
    if (card.defense) {
      player.board.push(card)
      player.hand.splice(from, 1)
      player.mana -= card.cost      
    } else if (card.endTurn) { // it's a donk
      player.trash.push(card)
      player.hand.splice(from, 1)
      player.mana -= card.cost     
      for (let i=0;i<card.endTurn;i++) {
        this.endTurn()
        this.beginTurn()
      }
    }
  }

  // Whether the game has started
  started() {
    return this._started
  }

  // Attacks face
  face(from) {
    let attacker = this.current().getBoard(from)
    this.opponent().life -= attacker.attack
    this.resolveDamage()
  }

  draw() {
    // Make a copy so that we can edit this card
    let card = CARDS[Math.floor(this.rng() * CARDS.length)]
    let copy = {}
    for (let key in card) {
      copy[key] = card[key]
    }

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
