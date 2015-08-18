// This server just broadcasts all messages to all clients.

// Client protocol:
// To sign up for a game:
// { "op": "register", "name": "yourPlayerName", "seeking": true }
// To reconnect when already in a game, just say seeking = false.

// Server protocol:
// The server bounces client messages to all clients, except registers.
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

// the number of cards each player starts with 
export const STARTING_HAND_SIZE = 3;

// when a turn passes, each player draws and adds mana
// this is the time (milliseconds) it takes for the turn to tick
export const DRAW_MS = 10000;

// some json for cards
import {

         CARDS, 
         DECKS
       
       } from './cards.js';

require("seedrandom")
Math.seedrandom()

const WebSocketServer = require("ws").Server

let wss = new WebSocketServer({port: 9090})

function choice(list) {
  // random card from deck
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
  broadcast(message) {
    for (let conn of Connection.all.values()) {
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
        Connection.waiting.set(this.name, this)
      }
    } else if (message.op == "resign") {
      // \TODO use gameID
      clearInterval(this.timeLoop)
      clearInterval(this.drawLoop)
    } else if (message.gameID) {
      // Give the message an id depending on its game
      if (!Connection.games.has(message.gameID)) {
        Connection.games.set(message.gameID, [])
      }
      let moves = Connection.games.get(message.gameID)
      message.id = moves.length + 1
      moves.push(message)

      // Bounce anything but registers
      this.broadcast(message)
    }

    // Consider starting a new game
    if (Connection.waiting.size == 2 || message.hasComputerOpponent) {
      let players = Array.from(Connection.waiting.keys())
      if (message.hasComputerOpponent) {
        players.push('cpu')

        let cpuPlayer = {
          'ws': null, //unneeded maybe I should delete
          'hasComputerOpponent': false,  //unneeded maybe I should delete
          'address': null,  //unneeded maybe I should delete
          'name': 'cpu',
          'deck': DECKS[0], //the bibot deck
        }
        Connection.all.set('cpuAddress', cpuPlayer)
      }
      let gameID = Math.floor(Math.random() * 1000000)
      console.log(`starting ${players[0]} vs ${players[1]}. gameID: ${gameID}`)
      let start = { op: "start", players, gameID }
      this.broadcast(start)
      Connection.waiting.clear()

      // everyone starts with three cards
      for (let i = 0; i < STARTING_HAND_SIZE; i++) {        
        this.everyoneDraws(gameID)
      }
      
      this.drawLoop = setInterval(() => {
        this.tickTurn(gameID);
      }, DRAW_MS);

      this.currentGameSecond = DRAW_MS / 1000;
      this.timeLoop = setInterval(() => {
        this.currentGameSecond--;
        this.broadcast({ op: "tickTime", time: this.currentGameSecond, player: "no_player", gameID:gameID})
      }, 1000);

    }
  }

  // \TODO only send to players with approrpiate gameID
  // Update the timer every second or so.
  tickTurn(gameID) {
    this.everyoneDraws()
    let message = { op: "refreshPlayers", "player": "no_player" }
    let moves = Connection.games.get(gameID)
    message.id = moves.length + 1
    moves.push(message)    
    this.broadcast(message)
    this.currentGameSecond = DRAW_MS / 1000
  }

  // \TODO only send to players with approrpiate gameID
  // Broadcast to all players to draw a card
  everyoneDraws(gameID) {
    let players = Array.from(Connection.all.values())
    let moves = Connection.games.get(gameID)
    for (let player of players) {
      let card = this.cardCopy(player);
      let message = { op: "draw" , player: {name: player.name}, card, gameID:gameID}
      message.id = moves.length + 1
      moves.push(message)    
      this.broadcast(message)
    }
  }

  // Gets the actual card object to use for a player drawing a card.
  cardCopy(player) {
    let cardName = choice(player.deck.cards)
    let card = CARDS[cardName]

    // Make a copy so that we can edit this card        
    let copy = {}     
    copy['name'] = cardName    
    for (let key in card) {
      copy[key] = card[key]
    }

    copy.canAct = false
    copy.playerName = player.name
    return copy
  }

  close() {
    console.log(`disconnected from ${this.address}`)
    Connection.all.delete(this.address)
    if (this.name != null && Connection.waiting.has(this.name)) {
      Connection.waiting.delete(this.name)
    }
    clearInterval(this.timeLoop)
    clearInterval(this.drawLoop)
  }
  
}

wss.on("connection", function(ws) {
  let connection = new Connection(ws)

  ws.on("message", function(message) {
    connection.receive(message)
  })

  ws.on("close", () => connection.close())

  ws.send(JSON.stringify({op: "hello"}))
})

console.log("server running...")
