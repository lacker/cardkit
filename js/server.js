// This server just broadcasts all messages to all clients.

// Client protocol:
// To sign up for a game:
// { "op": "register", "name": "yourPlayerName", "seeking": true }
// To reconnect when already in a game, just say seeking = false.

// Server protocol:
// The server bounces client messages to all clients, except registers.
// When a client connects, the server sends it
// { "op": "hello" }
// When a game starts, the server sends out
// { "op": "start", "players": [...list of player names...]}

const WebSocketServer = require("ws").Server

let wss = new WebSocketServer({port: 9090})

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
    }
    Connection.all.set(this.address, this)
  }

  // Message should be JSON
  broadcast(message) {
    for (let conn of Connection.all.values()) {
      try {
        conn.ws.send(JSON.stringify(message))
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
    } else {
      // Bounce anything but registers
      this.broadcast(message)
    }

    // Consider starting a new game
    if (Connection.waiting.size == 2) {
      let players = Array.from(Connection.waiting.keys())
      let seed = Math.floor(Math.random() * 1000000)
      console.log(`starting ${players[0]} vs ${players[1]}. seed: ${seed}`)
      let start = { op: "start", players, seed }
      this.broadcast(start)
      Connection.waiting.clear()
    }
  }

  close() {
    console.log(`disconnected from ${this.address}`)
    Connection.all.delete(this.address)
    if (this.name != null && Connection.waiting.has(this.name)) {
      Connection.waiting.delete(this.name)
    }
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