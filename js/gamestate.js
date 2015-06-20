// The state of a ccg type card game.

require("seedrandom")

// set this to true for plenty of mana
let DEBUG = false

const CARDS = [
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
    name: "Blast BiBot",
    description: "Destroy one of your opponent's permanents at random.",
    permanent: true,
    attack: 2,
    defense: 2,
    kill: true,
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
    description: "Destroy one of your opponent's permanents at random.",
    kill: true,
    cost: 3
  },
  {
    name: "Time Stop",
    description: "End this turn and the next.",
    endTurn: 2,
    cost: 5
  },
  {
    name: "Time Cruiser",
    description: "End this turn and the next.",
    permanent: true,
    attack: 10,
    defense: 1,
    endTurn: 2,
    cost: 8
  }
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
                                      {name: "waiting..."}]
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
  // op: the method name. beginTurn, selectCard, selectOpponent, endTurn
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
    } else if (move.op == "selectCard") {
      this.selectCard(move.index, move.containerType)
    } else if (move.op == "selectOpponent") {
      this.selectOpponent()
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

  // container can be board or hand
  selectCard(index, containerType) {
    if (!this.selectedCard) {
      this.setSelectedCard(index, containerType)
      return;
    }
    let card;
    if (containerType == "board") {
      // select a card in current player's board
      card = this.current().getBoard(index)
      if (card == this.selectedCard) {
        this.selectedCard = null;
        this.face(index)        
      }
    } else if (containerType == "hand") { 
      // select a card in current player's hand
      card = this.current().getHand(index)
      if (card == this.selectedCard) {
        this.selectedCard = null;
        this.play(index)
      }
    } else if (containerType == "opponentBoard") {
      // select a card in opponent's board

      // check for attack from board
      var boardIndex = this.current().board.indexOf(this.selectedCard);
      if (boardIndex != -1) {
        this.selectedCard = null;
        this.attack(boardIndex, index);
      }

      // check for action card from hand
      var handIndex = this.current().hand.indexOf(this.selectedCard);
      if (handIndex != -1) {
        this.selectedCard = null;
        this.playOn(handIndex, index)
      }        
    }
  }

  // container can be board or hand
  setSelectedCard(index, containerType) {
    if (containerType == "board") {
      let card = this.current().getBoard(index);
      this.selectedCard = card.canAct ? card : null;
    } else if (containerType == "hand") { 
      let card = this.current().getHand(index);
      if (this.current().mana >= card.cost) {
        this.selectedCard = card
      }
    }
  }

  // select the opponent to cast a spell or target with attack
  selectOpponent() {
    if (!this.selectedCard) {
      return;
    }
    var boardIndex = this.current().board.indexOf(this.selectedCard);
    if (boardIndex != -1) {
      this.face(boardIndex);
    }
    var handIndex = this.current().hand.indexOf(this.selectedCard);
    if (handIndex != -1) {
      this.playFace(handIndex)
    }        
  }    

  // from and to are indices into board
  attack(from, to) {
    let attacker = this.current().getBoard(from)
    let defender = this.opponent().getBoard(to)
    attacker.defense -= defender.attack
    defender.defense -= attacker.attack
    attacker.canAct = false;
    this.resolveDamage()
  }

  // Plays a card from the hand.
  // Throws if there's not enough mana.
  // from is an index of the hand
  play(from) {
    let player = this.current()
    let card = player.getHand(from)

    if (card.requiresTarget) {
      // Player has re-selected this.selectedCard in their hand.
      // In this case, this.selectedCard requiresTarget, 
      // so no action occurs besides unselecting the card,
      return;
    }
    if (player.mana < card.cost) {
      throw `need ${card.cost} mana but only have ${player.mana}`
    }

    // move the card to the appropriate container
    player.hand.splice(from, 1)
    player.mana -= card.cost
    if (card.permanent) {
      player.board.push(card)
    } else {
      player.trash.push(card)
    }

    /* 
       finally, play any abilities the card has
    */

    // it has Kill ability
    if (card.kill) { 
      if (this.opponent().board.length) {
        let randomIndex = Math.floor(Math.random() * (this.opponent().board.length-1));
        this.opponent().trash.push(this.opponent().board[randomIndex])
        this.opponent().board.splice(randomIndex, 1)
      }
    }
 
    // it has Time Stop ability
    if (card.endTurn) { 
      player.trash.push(card)
      player.hand.splice(from, 1)
      for (let i=0;i<card.endTurn;i++) {
        this.endTurn()
        this.beginTurn()
      }
    }
  }

  // Plays a card from the hand, onto a target.
  // Throws if there's not enough mana.
  // from is an index of the hand
  playOn(from, to) {
    let player = this.current()
    let card = player.getHand(from)
    if (player.mana < card.cost) {
      throw `need ${card.cost} mana but only have ${player.mana}`
    }
    // for direct damage
    if (card.damage) { 
      player.trash.push(card)
      player.hand.splice(from, 1)
      this.damage(to, card.damage)
    }
  }

  // Plays a card from the hand, onto a player.
  // Throws if there's not enough mana.
  // from is an index of the hand
  playFace(from) {
    let player = this.current()
    let card = player.getHand(from)
    if (player.mana < card.cost) {
      throw `need ${card.cost} mana but only have ${player.mana}`
    }
    // for direct damage
    if (card.damage) { 
      player.trash.push(card)
      player.hand.splice(from, 1)
      this.opponent().life -= card.damage
      this.resolveDamage()
    }
  }

  // for direct damage spells
  damage(to, amount) {
    let target = this.opponent().getBoard(to)
    target.defense -= amount
    this.resolveDamage()
  }

  // Whether the game has started
  started() {
    return this._started
  }

  // Attacks face
  face(from) {
    let attacker = this.current().getBoard(from)
    this.opponent().life -= attacker.attack
    attacker.canAct = false
    this.selectedCard = null;
    this.resolveDamage()
  }

  draw() {
    // Make a copy so that we can edit this card
    let card = CARDS[Math.floor(this.rng() * CARDS.length)]
    let copy = {}
    for (let key in card) {
      copy[key] = card[key]
    }
    copy.canAct = false; 
    this.current().hand.push(copy)
  }

  beginTurn() {
    this.current().maxMana = Math.min(1 + this.current().maxMana, 10)
    if (DEBUG) {
      this.current().maxMana = 99;
    }
    this.current().mana = this.current().maxMana
    this.draw()
  }

  endTurn() {
    this.selectedCard = null;
    for (let card of this.current().board) {
      card.canAct = true;
    }
    this.turn = 1 - this.turn
  }

  log() {
    console.log("It is player " + this.turn + "'s turn")
    console.log(this.players)
  }
}

module.exports = GameState;