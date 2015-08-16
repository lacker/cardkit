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
  
  // Creates a string that, when printed, is a nice way to view the
  // contents of the PlayerState for debugging.
  displayString() {
    return `name: ${this.name}
            hand: ${this.hand}
            board: ${this.board}
            life: ${this.life}
            mana: ${this.mana}/${this.maxMana}
           `
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
      clearInterval(card.warmLoop)
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
// Some number of selectCard, selectOpponent, resign
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

    // A list of all moves we have ever made on the game state
    this.history = []

    this.damageDuration = 900

    // set this to true for plenty of mana, for testing
    this.godMode = true
    
  }

  // The player for the provided name.
  playerForName(name) {
    let answer = undefined
    this.players.forEach(player => {
      if (player.name == name) {
        answer = player
      }
    })
    return answer
  }

  // A string that can be displayed to debug the game state.
  // This string should be consistent for all clients viewing the same  
  // game. In particular, it prints players by alphabetical order.
  displayString() {
    let answer = ""
    let playerNames = this.players.map(p => p.name)
    playerNames.sort()
    playerNames.forEach(name => {
      let p = this.playerForName(name)
      if (p) {
        answer += p.displayString()
      }
    })
    return answer
  }

  // The local player
  localPlayer() {
    return this.players[0]
  }

  // The remote player
  remotePlayer() {
    return this.players[1]
  }

  // Each type of move has a JSON representation.
  //
  // The useful keys include:
  // op: the method name. selectCard, selectOpponent, refreshPlayers
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

    if (move.op == "refreshPlayers") {
      this.refreshPlayers()
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
    } else if (move.op == "tickTime") {
      this.currentGameSecond = move.time
      window.client.forceUpdate()
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
      this.remotePlayer().name = players[1]
    } else if (players[1] == this.name) {
      this.remotePlayer().name = players[0]
    } else {
      console.log(`a game started without me, ${this.name}`)
      return
    }

    // always your turn in spacetime
    this._started = true
    this.refreshPlayers()
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
    
    this.checkForWinner()
  }

  // set the winner and trigger some animation or show if game ends
  checkForWinner() {
    if (this.localPlayer().life <= 0) {
      this.winner = this.remotePlayer().name
    } else if (this.remotePlayer().life <= 0) {
      this.winner = this.localPlayer().name
    }
    if (this.winner != null && this.declaredWinner == false) {
      console.log(this.winner + " wins!")
      // alert(this.winner + " wins!")
      this.declaredWinner = true
      
      // stop all cards from attacking
      for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i]
        for (var j = 0; j < player.board.length; j++) {
          var card = player.board[j]
          if (card.attackLoop) {
            clearInterval(card.attackLoop)
            clearInterval(card.warmLoop)
          }
        }
      }

    }
  }

  // containerType can be board, hand, or opponentBoard
  selectCard(index, containerType, selectingPlayerName) {
    let actingPlayer
    let opponent
    if (selectingPlayerName == this.localPlayer().name) {
      actingPlayer = this.localPlayer()
      opponent = this.remotePlayer()
    } else {
      actingPlayer = this.remotePlayer()
      opponent = this.localPlayer()
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
      // this.attack(boardIndex, index, player);
      this.selectTargetForAttack(boardIndex, index, player)
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
      player.selectedCard = card;
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
    if (player == this.localPlayer().name) {
      actingPlayer = this.localPlayer()
    } else {
      actingPlayer = this.remotePlayer()
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

  selectTargetForAttack(from, to, player) {
    let opponent = this.localPlayer().name == player.name ? this.remotePlayer() : this.localPlayer()
    let attacker = player.getBoard(from)
    let defender = opponent.getBoard(to)
    attacker.attackTarget = defender   
  }

  // from and to are indices into board
  attack(from, to, player) {
    let opponent = this.localPlayer().name == player.name ? this.remotePlayer() : this.localPlayer()
    let attacker = player.getBoard(from)
    let defender = opponent.getBoard(to)
    this.showCardDamage(attacker)
    this.showCardDamage(defender)
    attacker.defense -= defender.attack
    defender.defense -= attacker.attack
    attacker.canAct = false;
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
      player.selectedCard = null
      // throw `need ${card.cost} mana but only have ${player.mana}`
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
      for (let p of this.players) {
        if (p == player) {          
          card.attacker = p
          break;
        }
      }
      
      card.warm = 0

      card.warmLoop = setInterval(() => {
        card.warm += 1
        window.client.forceUpdate()
      } ,card.attackRate/10);

      card.attackLoop = setInterval(() => {
        // card is set to attack a creatiure
        if (card.attackTarget && this.attackCreature(card)) {
        } else {
          // card is set to attack a player
          this.faceForCard(card, card.attacker)
        }
        card.warm = 0
        window.client.forceUpdate()
      } ,card.attackRate);
    } 

    // kill a permanent at random
    if (card.kill) { 
      let actingPlayer
      if (player == this.localPlayer()) {
        actingPlayer = this.remotePlayer()
      } else {
        actingPlayer = this.localPlayer()
      }

      if (actingPlayer.board.length) {
        let randomIndex = this.rng() * (actingPlayer.board.length-1);
        actingPlayer.boardToTrash(randomIndex)
      }
    }

    // let all permanents act again
    if (card.refreshPlayers) { 
      this.refreshPlayers()
    }

    // kill all permanents
    if (card.emp) {
      for (let player of this.players) {
        while (player.board.length > 0) {
          player.boardToTrash(0)
        }
      }
    }
  }

  // have a card attack its attack target
  // if its still in play
  // returns true if the attack is legal and therefore occurs
  attackCreature (card) {
    let cardOwner, opponent
    if (card.playerName == this.localPlayer().name) {
      cardOwner = this.localPlayer()
      opponent = this.remotePlayer()
    } else {
      cardOwner = this.remotePlayer()
      opponent = this.localPlayer()
    }

    let from = -1, to = -1

    // could this happen? is the architecture just bad?
    for (let i = 0; i < cardOwner.board.length; i++) {
      let c = cardOwner.board[i];
      if (c == card) {
        from = i 
        break;
      }
    }
    
    // check if the attackTarget still exists
    for (let i = 0; i < opponent.board.length; i++) {
      let c = opponent.board[i];
      if (c == card.attackTarget) {
        to = i
        break;
      }
    }

    if (from >= 0 && to >= 0) {
      this.attack(from, to, cardOwner)
      return true
    }
    card.attackTarget = null
    return false
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
    let opponent = this.localPlayer().name == player.name ? this.remotePlayer() : this.localPlayer()
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
    if (player == this.localPlayer()) {
      actingPlayer = this.remotePlayer()
    } else {
      actingPlayer = this.localPlayer()
    }
    let target = actingPlayer.getBoard(to)
    target.defense -= amount
    this.resolveDamage()
  }

  // whether the game has started
  started() {
    return this._started
  }

  // attacks face
  face(from, player) {
    let card = player.getBoard(from)
    this.faceForCard(card, player)
  }

  faceForCard(card, player) {
    let opponent = this.localPlayer().name == player.name ? this.remotePlayer() : this.localPlayer()
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
    player.showDamage = true
    player.damageAnimation = setInterval(() => {
      player.showDamage = null;
      window.client.forceUpdate()
    }, this.damageDuration) 
    
  }

  // this is only used in testing right now
  draw(player, card) {
    for (var i = 0; i < this.players.length; i++) {
      var p = this.players[i]
      if (p.name == player.name) {
        p.hand.push(card) 
        break;   
      }
    }
  }

  // let all cards act, give everyone a mana, and restore everyone's mana
  refreshPlayers() {
    this.localPlayer().maxMana = Math.min(1 + this.localPlayer().maxMana, 10)
    this.remotePlayer().maxMana = Math.min(1 + this.remotePlayer().maxMana, 10)

    if (this.godMode) {
      this.localPlayer().maxMana = 99;
      this.remotePlayer().maxMana = 99;
    }

    this.localPlayer().mana = this.localPlayer().maxMana
    this.remotePlayer().mana = this.remotePlayer().maxMana

    this.selectedCard = null;
    if (this.localPlayer().board.length) {
      for (let i = 0; i < this.localPlayer().board.length; i++) {
        let card = this.localPlayer().board[i];
        card.canAct = true;
      }      
    }
    if (this.remotePlayer().board.length) {
      for (let i = 0; i < this.remotePlayer().board.length; i++) {
        let card = this.remotePlayer().board[i];
        card.canAct = true;
      }      
    }
  }

  resign(move) {
    let player = this.localPlayer().name == move.player ? this.localPlayer() : this.remotePlayer()
    player.life = 0
    this.resolveDamage()
  }

}

module.exports = GameState;
