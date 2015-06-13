// This server just broadcasts all messages to all clients.

// Client protocol:
// To sign up for a game:
// { "op": "register", "name": "yourPlayerName"}

// Server protocol:
// The server bounces any client messages to all clients.
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
    console.logVerbose(`hello ${this.address()}`)

    if (Connection.all === undefined) {
      // Connection.all maps client addresses to connected clients
      Connection.all = new Map()

      // Connection.waiting is a map of clients that have sent a
      // register operation, keyed by name.
      Connection.waiting = new Map()
    }
    Connection.all.set(this.address(), this)
  }

  address() {
    return `${this.ws._socket.remoteAddress}:${this.ws._socket.remotePort}`
  }
    

  // Message should be JSON
  broadcast(message) {
    for (let conn of Connection.all.values()) {
      try {
        conn.ws.send(JSON.stringify(message))
      } catch(err) {
        console.logVerbose("caught websocket send error: " + err)
      }
    }
  }

  receive(messageData) {
    let message = JSON.parse(messageData)
    if (message.op == "register") {
      this.name = message.name
      Connection.waiting.set(this.name, this)
    } else {
      // Bounce anything but registers
      this.broadcast(message)
    }

    // Consider starting a new game
    if (Connection.waiting.size == 2) {
      let players = Array.from(Connection.waiting.keys())
      console.logVerbose(`starting ${players[0]} vs ${players[1]}`)
      let seed = 1337
      let start = { op: "start", players, seed }
      this.broadcast(start)
      Connection.waiting.clear()
    }
  }

  close() {
    console.logVerbose(`goodbye ${this.address()}`)
    Connection.all.delete(this.address())
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

console.logVerbose("server running...")
