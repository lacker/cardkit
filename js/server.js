// This server just broadcasts all messages to all clients.

const WebSocketServer = require("ws").Server

let wss = new WebSocketServer({port: 9090})

wss.on("connection", function(ws) {
  console.log(`hello ${ws.address}`)

  ws.on("message", function(message) {
    console.log("bouncing: %s", message)

    for (let client of wss.clients) {
      client.send(message);
    }
  })

  ws.on("close", function() {
    console.log(`goodbye ${ws.address}`)
  })

  ws.send("hello");
})

console.log("server running...")
