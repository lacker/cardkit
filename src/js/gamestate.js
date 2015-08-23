/* 
   The state of a Spacetime game.
   It's realtime, but not twitchy, and similar
   to card games like Magic, Pokemon, and Hearthstone.

   It's also like a PvP version of Plants vs. Zombies.

   It's so rad, it's hard to even stuff into a genre.
*/

require("seedrandom")

import { TARGETS } from './cards.js';

// The state of a single player.
class PlayerState {
  constructor(data) {
    this.name = data.name
    this.hand = data.hand || []
    this.board = data.board || []
    this.trash = data.trash || []
    this.life = data.life || 30
    this.energy = data.energy || 0
    this.maxEnergy = data.maxEnergy || 0
  }
  
  // Creates a string that, when printed, is a nice way to view the
  // contents of the PlayerState for debugging.
  displayString() {
    return `name: ${this.name}
            hand: ${this.hand}
            board: ${this.board}
            life: ${this.life}
            energy: ${this.energy}/${this.maxEnergy}
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
// Some number of: 
//  selectCard, selectOpponent, resign, refreshPlayers, tickTime
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

    // the time of the main game loop 
    this.gameTime = 0

    // the time (ms) to animate damage effects
    this.damageDuration = 900

    // set this to true for plenty of energy, for testing
    this.godMode = false
    
  }

  // Whether the game has started.
  started() {
    return this._started
  }

  // The player object for the provided name.
  playerForName(name, isOpponent) {
    let answer = undefined
    this.players.forEach(player => {
      if (player.name == name && !isOpponent) {
        answer = player
      }
      if (player.name != name && isOpponent) {
        answer = player
      }
    })
    return answer
  }

  // The opponent player object for the provided name.
  // Only works for two player games, which Spacetime is.
  opponentForName(name) {
    return this.playerForName(name, true)
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
  // op: the method name (selectCard, selectOpponent, refreshPlayers, resign, tickTime)
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
      // the server sends this on a continuous loop
      this.refreshPlayers()
    } else if (move.op == "resign") {
      // either player may resign at any time
      this.resign(move)
    } else if (move.op == "selectCard") {
      /*
        this is the most common action in a game
        selecting a card twice usually means to takean action with it
        
        the possible container types are board, hand, trash, 
        as well as the opponentFoo for each type
      */
      this.selectCard(move.index, move.containerType, move.player)
    } else if (move.op == "selectOpponent") {
      // players can select an opponent to use cards on them
      // or target permanents they have in play
      this.selectOpponent(move.player)
    } else if (move.op == "draw") {
      // the server tells the players to draw occasionally
      this.draw(move.player, move.card)
    } else if (move.op == "tickTime") {
      // the server sends the current time for the client to display
      if (!this.gameTime) {
        this.startTime = move.gameTime
        this.gameTime = move.gameTime
        setInterval(() => {
          this.tickLocalTime()
        }, 100)
      }
      this.gameTime = move.gameTime
    } else {
      console.log("ignoring op: " + move.op)
      return false
    }
    
    // client doesn't exist in tests
    if (window.client) {
      window.client.forceUpdate()
    }
    if (move.op != "tickTime") {
      this.history.push(move)
    }
    return true
  }

  // Tick time locally, and act based on last gameTime sent by server
  tickLocalTime() {

    // set currentGameSecond to 10 through 1 based on what second it is in the round
    this.currentGameSecond = Math.floor(10 - ((this.gameTime - this.startTime) % 10000)/1000)
    
    // loop over all cards in play to see if they should act
    for (let p of this.players) {
      for (let card of p.board) {
        // only creatures attack
        if (!card.attackRate) {
          continue
        }
        // how long the card has been in play
        let cardTime = this.gameTime - card.creationTime
        // set this to animate the opacity of a card as it becomes ready to attack again
        card.warm = (cardTime % card.attackRate) / card.attackRate

        // don't attack if the it's not within 1 second of the attack time
        // or if the card hasn't been in play long enough
        if ((cardTime % card.attackRate > 1000) || 
           (cardTime < card.attackRate*(card.attackCount+1))) {
          continue
        }
        card.attackCount++

        // attack a creature if one is targeted
        // otherwise attack the opponent
        if (card.attackTarget && this.attackCreature(card)) {
        } else {
          // card is set to attack a player
          this.faceForCard(card, card.attacker)
        }
      }
    }
    window.client.forceUpdate()
  }

  // Log all moves in the game so far.
  logHistory() {
    console.log("" + this.history.length + " moves in history.")
    for (let move of this.history) {
      console.log(JSON.stringify(move))
    }
  }

  // Seed the game and start giving players cards/energy.
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

    this.refreshPlayers()
  }

  // At the end of a combat or a damage spell,
  // kill anything that died.
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
      alert(this.winner + " wins!")
      this.declaredWinner = true
      if (this.localPlayer().life <= 0) {
        window.track("computer wins")
      } else if (this.remotePlayer().life <= 0) {
        window.track("human wins")
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
      if (index >= actingPlayer.hand.length) {
        console.log("computer tried to click a card not there")
        return
      }
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
      if (player.energy >= card.cost) {
        player.selectedCard = card
      }
    }
  }

  // select the opponent to cast a spell or target with attack
  selectOpponent(playerName) {
    let actingPlayer = this.playerForName(playerName)

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
    let opponent = this.opponentForName(player.name)
    let attacker = player.getBoard(from)
    let defender = opponent.getBoard(to)
    attacker.attackTarget = defender   
  }

  // from and to are indices into board
  attack(from, to, player) {
    let opponent = this.opponentForName(player.name)
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
  // Throws if there's not enough energy.
  // from is an index of the hand
  play(from, player) {
    let card = player.getHand(from)
    if (card.target && !card.randomTarget) {
      // Player has re-selected this.selectedCard in their hand,
      // but the card needs a target, so nothing happens.
      return;
    }
    if (player.energy < card.cost) {
      player.selectedCard = null
      // throw `need ${card.cost} energy but only have ${player.energy}`
    }
    player.energy -= card.cost      

    // move the card to the appropriate container
    if (card.permanent) {
      player.handToBoard(from)
      card.creationTime = Date.now()
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
    }

    // kill permanents
    if (card.kill) { 
      let actingPlayer = this.opponentForName(player.name)

      // kill a random opponent permanent
      if (card.randomTarget && 
          card.target == TARGETS.OPPONENT_PERMANENT) {
        if (actingPlayer.board.length) {
          let randomIndex = this.rng() * (actingPlayer.board.length - 1);
          actingPlayer.boardToTrash(randomIndex)
        }
      } else if (card.targetCount == TARGETS.ALL_PERMANENTS && 
                 card.target == TARGETS.ANY_PERMANENT) {
        // kill all permanents
        for (let player of this.players) {
          while (player.board.length > 0) {
            player.boardToTrash(0)
          }
        }
      } else {
        throw 'kill ability is only implemented for random OPPONENT and ALL_PERMANENTS'
      }
    }

  }

  // have a card attack its attack target
  // if its still in play
  // returns true if the attack is legal and therefore occurs
  attackCreature (card) {
    let cardOwner = this.playerForName(card.playerName)
    let opponent = this.opponentForName(card.playerName)

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
  // Throws if there's not enough energy.
  // from is an index of the hand
  playOn(from, to, player) {
    let card = player.getHand(from)
    if (player.energy < card.cost) {
      throw `need ${card.cost} energy but only have ${player.energy}`
    }
    player.handToTrash(from)

    // for direct damage
    if (card.damage) { 
      this.damage(to, card.damage, player)
    }
  }

  // Plays a card from the hand, onto a player.
  // Throws if there's not enough energy.
  // from is an index of the hand
  playFace(from, player) {
    let opponent = this.opponentForName(player.name)
    let card = player.getHand(from)
    if (player.energy < card.cost) {
      throw `need ${card.cost} energy but only have ${player.energy}`
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
    let opponent = this.opponentForName(player.name)
    let target = opponent.getBoard(to)
    target.defense -= amount
    this.resolveDamage()
  }

  // attacks face
  face(from, player) {
    let card = player.getBoard(from)
    this.faceForCard(card, player)
  }

  faceForCard(card, player) {
    let opponent = this.opponentForName(player.name)
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

  // let all cards act, give everyone a energy, and restore everyone's energy
  refreshPlayers() {
    for (let p of this.players) {
      p.maxEnergy = Math.min(1 + p.maxEnergy, 10)
      if (this.godMode) {
        p.maxEnergy = 99;
      }
      p.energy = p.maxEnergy
      if (p.board.length) {
        for (let i = 0; i < p.board.length; i++) {
          let card = p.board[i];
          card.canAct = true;
        }      
      }
    }
    this.selectedCard = null;
  }

  resign(move) {
    this.playerForName(move.player).life = 0
    this.resolveDamage()
  }

}

module.exports = GameState;