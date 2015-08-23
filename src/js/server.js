// This server just broadcasts all messages to all clients.

// Client protocol:
// To sign up for a game:
// { "op": "register", "name": "yourPlayerName", "seeking": true }

// Server protocol:
// The server bounces client messages to all clients, except register and resign
// It assigns a numerical "id" field to each op, ascending for each
// game. This is based on the past moves, kept in Connection.games.
// NOTE: this means that when the server reboots, it borks games in
// progress.
// When a client connects, the server sends it
// { "op": "hello" }
// When a game starts, the server sends out
// { "op": "start", "players": [list of player names], "gameID": <gameid>}
// To verify that clients are in sync, clients send up
// { "op": "checkSync", "key": key, "value": value }
// and if the same key ever goes to multiple values, the server logs an error.

// some JSON definitions for cards and decks
import { CARDS, DECKS } from './cards.js';

// for shuffling
require("seedrandom")
Math.seedrandom()

const WebSocketServer = require("ws").Server
let wss = new WebSocketServer({port: 9090})

// the number of cards each player starts with 
export const STARTING_HAND_SIZE = 2;

// when a turn passes, each player draws and adds energy
// this is the time (milliseconds) it takes for the turn to tick
export const DRAW_MS = 10000;

// random card from deck
function choice(list) {
  return list[Math.floor(Math.random() * list.length)]
}

class Connection {
  constructor(ws) {
    this.ws = ws
    this.name = null
    this.address = `${ws._socket.remoteAddress}:${ws._socket.remotePort}`
    
    console.log(`connected to ${this.address}`)

    if (Connection.all === undefined) {
      // Connection.all maps client addresses to connected clients
      Connection.all = new Map()

      // Connection.waiting is a map of clients that have sent a
      // register operation, keyed by name.
      Connection.waiting = new Map()

      // Connection.games maps each gameID to a list of all moves that
      // have been made in the game.
      Connection.games = new Map()

      // Track these to clear them at end of game.
      // Connection.drawLoops maps each gameID to a drawLoop
      Connection.drawLoops = new Map()
      // Connection.timeLoops maps each gameID to a timeLoop
      Connection.timeLoops = new Map()
      // Connection.currentGameSeconds maps each gameID to a currentGameSecond in whole seconds counting down from 10
      Connection.currentGameSeconds = new Map()
      // Connection.gameTime maps each gameID to a gameTime in millis
      Connection.gameTime = new Map()

      // Connection.checkSync maps generic keys to generic
      // values. Clients can use this to check for synchronization
      // bugs. Each client should log the same value for a particular
      // key. The server just logs if it ever sees multiple values for
      // the same key.
      Connection.checkSync = new Map()


    }
    Connection.all.set(this.address, this)
  }

  // Message should be JSON
  // broadcast to any clients with the given gameID
  broadcast(message, gameID) {
    for (let conn of Connection.all.values()) {
      if (conn.gameID != gameID) {
        continue
      }
      try {
        // computer players don't have sockets
        if (conn.ws) {          
          conn.ws.send(JSON.stringify(message))
          console.log("broadcast " + JSON.stringify(message))
        }
      } catch(err) {
        console.log("caught websocket send error: " + err)
      }
    }
  }

  // messages with special handling: checkSync, register, resign
  // other messages just get bounced to all clients for message.gameID
  receive(messageData) {
    console.log("received: " + messageData)

    let message = JSON.parse(messageData)
    if (message.op == "checkSync") {
      if (Connection.checkSync.has(message.key)) {
        let oldValue = Connection.checkSync.get(message.key)
        if (oldValue != message.value) {
          console.log("checkSync FAIL: expected key " + message.key +
                      " to map to value " + oldValue + " but saw " +
                      message.value)
        }
      } else {
        Connection.checkSync.set(message.key, message.value)
      }
    } else if (message.op == "register") {
      this.name = message.name
      this.deck = choice(DECKS)
      if (message.hasComputerOpponent) {
        this.deck = DECKS[1] // always get the control deck against the computer, who gets bibots

      }
      this.hasComputerOpponent = message.hasComputerOpponent
      if (message.seeking) {
        this.gameID = Math.floor(Math.random() * 1000000)
        console.log(`${this.name} waiting for game with gameID: ${this.gameID}`)
        Connection.waiting.set(this.name, this)
      }
      // Consider starting a new game
      if (Connection.waiting.size == 2 || message.hasComputerOpponent) {
        // this.gameID was defined by game seeker
        this.startGame(message, this.gameID)
      }
    } else if (message.op == "resign") {
      this.endGame(message.gameID)
    } else if (message.gameID) {
      // Bounce anything but registers
      this.addToMoveListAndBroadcast(message, message.gameID)
    }

  }

  endGame(gameID) {
    clearInterval(Connection.timeLoops.get(gameID))
    clearInterval(Connection.drawLoops.get(gameID))
  }

  // Deal cards, and start game loop.
  startGame(message, gameID) {
     
    // set a blank list for the moves for the game
    Connection.games.set(gameID, [])

    // add a computer player if needed  
    let players = Array.from(Connection.waiting.keys())
    if (message.hasComputerOpponent) {
      let cpuName = 'cpu' + gameID
      players.push(cpuName)
      let cpuPlayer = this.defaultComputerPlayer(gameID)
      Connection.all.set('cpuAddress', cpuPlayer)
    }
    
    // send the start move
    // this doesn't get bounced by server, only broadcast to client
    console.log(`starting ${players[0]} vs ${players[1]}. gameID: ${gameID}`)
    let start = { op: "start", players, gameID }

    this.addToMoveListAndBroadcast(start, gameID)
    Connection.waiting.clear()
    
    // everyone starts with three cards
    for (let i = 0; i < STARTING_HAND_SIZE; i++) {        
      this.everyoneDraws(gameID)
    }
    
    // Players draw and receive energy occasionally.
    // Some cards played trigger on timers.
    this.startGameLoop(gameID)

  }

  // A computer player that pumps out simple attacking cards.
  defaultComputerPlayer(gameID) {
    return {
      'name': 'cpu' + gameID,
      'gameID': gameID,
      'deck': DECKS[0], //the bibot deck
    }
  }

  // Refresh players energy and draw cards every DRAW_MS.
  // Update the timer every second or so.
  startGameLoop(gameID) {

    // draw a card every DRAW_MS period
    let drawLoop = setInterval(() => {
      // this.everyoneDraws(gameID)
      let message = { op: "refreshPlayers", "player": "no_player", gameID}    
      this.addToMoveListAndBroadcast(message, gameID)
      Connection.currentGameSeconds.set(gameID, DRAW_MS / 1000)
    }, DRAW_MS);
    Connection.drawLoops.set(gameID, drawLoop)

    // for ticking down whole seconds in game display
    Connection.currentGameSeconds.set(gameID, DRAW_MS / 1000)

    // for the main game loop
    let startTime = Date.now()
    Connection.gameTime.set(gameID, startTime)

    // fire a message right away
    let message = { op: "tickTime", gameTime:startTime, currentGameSecond:DRAW_MS / 1000, player: "no_player", gameID}
    this.addToMoveListAndBroadcast(message, gameID)
    // for exact time for game loop
    Connection.gameTime.set(gameID, 0)
    // tick down time every second
    let timeLoop = setInterval(() => {
      let currentGameSecond = Connection.currentGameSeconds.get(gameID)
      Connection.gameTime.set(gameID, Date.now())
      Connection.currentGameSeconds.set(gameID, --currentGameSecond)
      let message = { op: "tickTime", gameTime:Connection.gameTime.get(gameID), currentGameSecond, player: "no_player", gameID}
      this.addToMoveListAndBroadcast(message, gameID)
    }, 1000);
    Connection.timeLoops.set(gameID, timeLoop)
  }

  // Broadcast to all players for a gameID to draw a card
  everyoneDraws(gameID) {
    let players = Array.from(Connection.all.values())
    for (let player of players) {
      if (player.gameID == gameID) {
        let card = this.cardCopy(player);
        let message = { op: "draw" , player: {name: player.name}, card, gameID}
        this.addToMoveListAndBroadcast(message, gameID)        
      }
    }
  }

  // Push the move and broadcast to all clients for the gameID
  addToMoveListAndBroadcast(move, gameID) {
    let moves = Connection.games.get(gameID)
    move.id = moves.length + 1
    this.broadcast(move, gameID)
    moves.push(move)    
  }

  // Get a card object to use for a player drawing a card.
  cardCopy(player) {
    let cardName = choice(player.deck.cards)
    let card = CARDS[cardName]

    // Make a copy so that we can edit this card        
    let copy = {}     
    copy['name'] = cardName    
    for (let key in card) {
      copy[key] = card[key]
    }

    copy.id = this.makeid()
    copy.canAct = false
    copy.playerName = player.name
    copy.creationTime = Date.now()
    copy.attackCount = 0
    return copy
  }
 
  makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 64; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

  // Close the connection and clear timers
  close() {
    console.log(`disconnected from ${this.address}`)
    Connection.all.delete(this.address)
    if (this.name != null && Connection.waiting.has(this.name)) {
      Connection.waiting.delete(this.name)
    }
    this.endGame(this.gameID)
  }

}

// Make a new WebSocket, and send "hello" mostly for debugging.
// Listen for message and close events
wss.on("connection", function(ws) {
  let connection = new Connection(ws)

  ws.on("message", function(message) {
    connection.receive(message)
  })

  ws.on("close", () => connection.close())

  ws.send(JSON.stringify({op: "hello"}))
})

console.log("server running...")
