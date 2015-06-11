const WebSocketServer = require("ws").Server

let wss = new WebSocketServer({port: 9090})

wss.on("connection", function(ws) {
  ws.on("message", function(message) {
    console.log("received: %s", message)
  })
  ws.send("ack");
})

console.log("server running...")
