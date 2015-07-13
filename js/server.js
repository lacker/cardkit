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

// some json for cards
import {CARDS} from './cards.js';
require("seedrandom")

const WebSocketServer = require("ws").Server

let wss = new WebSocketServer({port: 9090})

class Connection {
  constructor(ws) {
    this.ws = ws
    this.rng = new Math.seedrandom(1337)
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
    }
    Connection.all.set(this.address, this)
  }

  // Message should be JSON
  broadcast(message) {
    for (let conn of Connection.all.values()) {
      try {
        conn.ws.send(JSON.stringify(message))
        console.log("broadcast " + JSON.stringify(message))
      } catch(err) {
        console.log("caught websocket send error: " + err)
      }
    }
  }

  receive(messageData) {
    console.log("received: " + messageData)

    let message = JSON.parse(messageData)
    if (message.op == "register") {
      this.name = message.name
      if (message.seeking) {
        Connection.waiting.set(this.name, this)
      }
    } else if (message.op == "resign") {
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
    if (Connection.waiting.size == 2) {
      let players = Array.from(Connection.waiting.keys())
      let gameID = Math.floor(Math.random() * 1000000)
      console.log(`starting ${players[0]} vs ${players[1]}. gameID: ${gameID}`)
      let start = { op: "start", players, gameID }
      this.broadcast(start)
      Connection.waiting.clear()

      // everyone starts with three cards
      this.everyoneDraws()
      this.everyoneDraws()
      this.everyoneDraws()
      
      // you are always drawing cards in spacetime
      this.drawLoop = setInterval(() => {
        this.tickTurn();
      }, 10000);

    }
  }

  // in spacetime, we simul-draw!
  tickTurn() {
    this.everyoneDraws()
    this.broadcast({ op: "endTurn", "player": "no_player" })
    this.broadcast({ op: "beginTurn", "player": "no_player" })
  }

  // in spacetime, we simul-draw!
  everyoneDraws() {
    let players = Array.from(Connection.all.values())
    for (let player of players) {
      let card = this.cardCopy(player.name);
      let draw = { op: "draw" , player: {name: player.name}, card}
      this.broadcast(draw)
    }
  }

  cardCopy(player) {
    let card = CARDS[Math.floor(this.rng() * CARDS.length)]         
    // Make a copy so that we can edit this card        
    let copy = {}         
    for (let key in card) {
      copy[key] = card[key]
    }

    copy.canAct = false; 
    copy.player = player;
    return copy
  }

  close() {
    console.log(`disconnected from ${this.address}`)
    Connection.all.delete(this.address)
    if (this.name != null && Connection.waiting.has(this.name)) {
      Connection.waiting.delete(this.name)
    }
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
