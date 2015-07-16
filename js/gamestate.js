/* 
   The state of a ccg type card game.
*/

require("seedrandom")

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

  // Moves a card from hand to trash.
  handToTrash(index) {
    let card = this.getHand(index)
    this.hand.splice(index, 1)
    this.trash.push(card)
  }

  // Moves a card from board to trash.
  boardToTrash(index) {
    let card = this.getBoard(index)
    if (card.attackLoop) {
      clearInterval(card.attackLoop)
    }
    this.board.splice(index, 1)
    this.trash.push(card)
  }

  // Moves a card from hand to board.
  handToBoard(index) {
    let card = this.getHand(index)
    this.hand.splice(index, 1)
    this.board.push(card)
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
// Some number of selectCard, selectOpponent
// endTurn
//
class GameState {

  // name is the name of the human at the controls.
  constructor(data) {
    this.name = data.name
    this._started = data._started || false

    let playerInfo = data.players || [{name: this.name},
                                      {name: "waiting..."}]
    this.players = playerInfo.map(info => new PlayerState(info))

    // The name of the winner
    this.winner = data.winner || null
    // a flag to do an alert just once
    this.declaredWinner = false

    // set this to true for plenty of mana, for testing
    this.godMode = true

    // A list of all moves we have ever made on the game state
    this.history = []

    // how much time it takes to show damage to a card or player in millis
    this.damageDuration = 900
  }

  // The player who's playing locally
  current() {
    return this.players[0]
  }

  // The remote player
  opponent() {
    return this.players[1]
  }

  // Each type of move has a JSON representation.
  //
  // The useful keys include:
  // op: the method name. selectCard, selectOpponent, refreshCards
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

    if (move.op == "refreshCards") {
      this.refreshCards()
    } else if (move.op == "resign") {
      this.resign(move)
    } else if (move.op == "selectCard") {
      /*
        the possible container types are board, hand, trash, 
        as well as the opponentFoo for each type
      */
      this.selectCard(move.index, move.containerType, move.player)
    } else if (move.op == "selectOpponent") {
      this.selectOpponent(move.player)
    } else if (move.op == "draw") {
      this.draw(move.player, move.card)
    } else {
      console.log("ignoring op: " + move.op)
      return false
    }

    this.history.push(move)
    return true
  }

  logHistory() {
    console.log("" + this.history.length + " moves in history.")
    for (let move of this.history) {
      console.log(JSON.stringify(move))
    }
  }

  startGame(players, seed) {
    this.rng = new Math.seedrandom(seed)
    if (players[0] == this.name) {
      this.players[1].name = players[1]
    } else if (players[1] == this.name) {
      this.players[1].name = players[0]
    } else {
      console.log(`a game started without me, ${this.name}`)
      return
    }

    // always your turn in spacetime
    this._started = true
    this.refreshCards()
  }

  started() {
    return this._started;
  }

  resolveDamage() {

    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i]

      // find dead creatures
      var cardsToRemove = [];
      for (var j = 0; j < player.board.length; j++) {
        var card = player.board[j]
        if (card.defense <= 0) {
          cardsToRemove.push(card)
        }
      }
      
      // trash any dead creatures
      // unselect any trashed cards
      for (var j = 0; j < cardsToRemove.length; j++) {
        var card = cardsToRemove[j]
        player.trash.push(card)
        if (card == player.selectedCard) {
          player.selectedCard = null;
        }
      }
      player.board = player.board.filter(c => cardsToRemove.indexOf(c) < 0)

    }

    if (this.current().life <= 0) {
      this.winner = this.opponent().name
    } else if (this.opponent().life <= 0) {
      this.winner = this.current().name
    }
    if (this.winner != null && this.declaredWinner == false) {
      console.log(this.winner + " wins!")
      alert(this.winner + " wins!")
      this.declaredWinner = true

      for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i]
        for (var j = 0; j < player.board.length; j++) {
          var card = player.board[j]
          if (card.attackLoop) {
            clearInterval(card.attackLoop)
          }
        }
      }


    }
  }

  // containerType can be board or hand
  selectCard(index, containerType, selectingPlayerName) {
    let actingPlayer
    let opponent
    if (selectingPlayerName == this.current().name) {
      actingPlayer = this.current()
      opponent = this.opponent()
    } else {
      actingPlayer = this.opponent()
      opponent = this.current()
    }
    if (!actingPlayer.selectedCard) {
      this.setSelectedCard(index, containerType, actingPlayer)
      return;
    }
    let card;
    if (containerType == "board") {
      if (actingPlayer.name == selectingPlayerName) {
        this.faceForPlayer(actingPlayer, index)
      } else {
        this.faceForPlayer(opponent, index)
      }
    } else if (containerType == "hand") { 
      if (actingPlayer.name == selectingPlayerName) {
        this.playForPlayer(actingPlayer, index)
      } else {
        this.playForPlayer(opponent, index)
      }
    } else if (containerType == "opponentBoard") {
      // select a card in opponent's board
      if (actingPlayer.name == selectingPlayerName) {
        this.attackForPlayerIfBoardSelected(actingPlayer, index)
        this.playOnForPlayerIfHandSelected(actingPlayer, index)
      } else {
        this.attackForPlayerIfBoardSelected(opponent, index)
        this.playOnForPlayerIfHandSelected(opponent, index)
      }
    }
  }

  attackForPlayerIfBoardSelected(player, index) {
    // check for attack from board
    let boardIndex = player.board.indexOf(player.selectedCard);
    if (boardIndex != -1) {
      player.selectedCard = null;
      this.attack(boardIndex, index, player);
    }
  }

  playOnForPlayerIfHandSelected(player, index) {
    let handIndex = player.hand.indexOf(player.selectedCard);
    if (handIndex != -1) {
      player.selectedCard = null;
      this.playOn(handIndex, index, player)
    }        
  }

  faceForPlayer(player, index) {
    let card = player.getBoard(index)      
    if (card == player.selectedCard) {
      player.selectedCard = null;
      this.face(index, player)        
    }
  }

  playForPlayer(player, index) {
    let card = player.getHand(index)
    if (card == player.selectedCard) {
      player.selectedCard = null;
      this.play(index, player)
    }
  }

  // containerType can be board or hand
  setSelectedCard(index, containerType, player) {
    if (containerType == "board") {
      let card = player.getBoard(index);
      player.selectedCard = card.canAct ? card : null;
    } else if (containerType == "hand") { 
      let card = player.getHand(index);
      if (player.mana >= card.cost) {
        player.selectedCard = card
      }
    }
  }

  // select the opponent to cast a spell or target with attack
  selectOpponent(player) {
    let actingPlayer
    if (player == this.current().name) {
      actingPlayer = this.current()
    } else {
      actingPlayer = this.opponent()
    }

    if (!actingPlayer.selectedCard) {
      return;
    }
    let boardIndex = actingPlayer.board.indexOf(actingPlayer.selectedCard);
    if (boardIndex != -1) {
      this.face(boardIndex, actingPlayer);
    }
    let handIndex = actingPlayer.hand.indexOf(actingPlayer.selectedCard);
    if (handIndex != -1) {
      this.playFace(handIndex, actingPlayer)
    }        
  }    

  // from and to are indices into board
  attack(from, to, player) {
    let opponent = this.current().name == player.name ? this.opponent() : this.current()
    let attacker = player.getBoard(from)
    let defender = opponent.getBoard(to)
    attacker.defense -= defender.attack
    defender.defense -= attacker.attack
    attacker.canAct = false;
    attacker.needsAttackDisplay = true;
    this.resolveDamage()
  }

  // Plays a card from the hand.
  // Throws if there's not enough mana.
  // from is an index of the hand
  play(from, player) {
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
    player.mana -= card.cost      

    // move the card to the appropriate container
    if (card.permanent) {
      player.handToBoard(from)
    } else {
      player.handToTrash(from)
    }

    // Finally, play any abilities the card has.

    // for permanents that attack on a loop
    if (card.attackRate) {
      // default to attack opponent's face
      card.attacker = this.current()

      card.attackLoop = setInterval(() => {
        console.log("atack")
        this.faceForCard(card, card.attacker)
        window.client.forceUpdate()
      } ,card.attackRate);
    } 

    if (card.kill) { 
      let actingPlayer
      if (player == this.current()) {
        actingPlayer = this.opponent()
      } else {
        actingPlayer = this.current()
      }

      if (actingPlayer.board.length) {
        let randomIndex = this.rng() * (actingPlayer.board.length-1);
        actingPlayer.boardToTrash(randomIndex)
      }
    }
 
    if (card.refreshCards) { 
      for (let i = 0; i < card.refreshCards; i++) {
        this.refreshCards()
      }
    }

    if (card.emp) {
      for (let player of this.players) {
        while (player.board.length > 0) {
          player.boardToTrash(0)
        }
      }
    }
  }

  // Plays a card from the hand, onto a target.
  // Throws if there's not enough mana.
  // from is an index of the hand
  playOn(from, to, player) {
    let card = player.getHand(from)
    if (player.mana < card.cost) {
      throw `need ${card.cost} mana but only have ${player.mana}`
    }
    player.handToTrash(from)

    // for direct damage
    if (card.damage) { 
      this.damage(to, card.damage, player)
    }
  }

  // Plays a card from the hand, onto a player.
  // Throws if there's not enough mana.
  // from is an index of the hand
  playFace(from, player) {
    let opponent = this.current().name == player.name ? this.opponent() : this.current()
    let card = player.getHand(from)
    if (player.mana < card.cost) {
      throw `need ${card.cost} mana but only have ${player.mana}`
    }
    player.handToTrash(from)

    // for direct damage
    if (card.damage) { 
      opponent.life -= card.damage
      this.resolveDamage()
    }
  }

  // for direct damage spells
  damage(to, amount, player) {
    let actingPlayer
    if (player == this.current()) {
      actingPlayer = this.opponent()
    } else {
      actingPlayer = this.current()
    }
    let target = actingPlayer.getBoard(to)
    target.defense -= amount
    this.resolveDamage()
  }

  // Whether the game has started
  started() {
    return this._started
  }

  // Attacks face
  face(from, player) {
    let card = player.getBoard(from)
    this.faceForCard(card, player)
  }

  faceForCard(card, player) {
    let opponent = this.current().name == player.name ? this.opponent() : this.current()
    opponent.life -= card.attack

    card.canAct = false
    player.selectedCard = null;
    this.resolveDamage()

    this.showCardDamage(card)
    this.showPlayerDamage(opponent)
  }

  showCardDamage(card) {
    // opponent damage animation
    card.showDamage = true
    card.damageAnimation = setInterval(() => {
      card.showDamage = null;
      window.client.forceUpdate()
    }, this.damageDuration) 
  }

  showPlayerDamage(player) {
    // card damage animation
    card.showDamage = true
    card.damageAnimation = setInterval(() => {
      card.showDamage = null;
      window.client.forceUpdate()
    }, this.damageDuration) 
    
  }

  draw(player, card) {
    for (var i = 0; i < this.players.length; i++) {
      var p = this.players[i]
      if (p.name == player.name) {
        p.hand.push(card) 
        break;   
      }
    }
  }

  refreshCards() {
    this.current().maxMana = Math.min(1 + this.current().maxMana, 10)
    this.opponent().maxMana = Math.min(1 + this.opponent().maxMana, 10)

    if (this.godMode) {
      this.current().maxMana = 99;
      this.opponent().maxMana = 99;
    }

    this.current().mana = this.current().maxMana
    this.opponent().mana = this.opponent().maxMana

    this.selectedCard = null;
    if (this.current().board.length) {
      for (let i = 0; i < this.current().board.length; i++) {
        let card = this.current().board[i];
        card.canAct = true;
      }      
    }
    if (this.opponent().board.length) {
      for (let i = 0; i < this.opponent().board.length; i++) {
        let card = this.opponent().board[i];
        card.canAct = true;
      }      
    }
  }

  resign(move) {
    let player = this.current().name == move.player ? this.current() : this.opponent()
    player.life = 0
    this.resolveDamage()
  }

}

module.exports = GameState;
