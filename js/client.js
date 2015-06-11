// This websocket client runs in the browser and talks to the
// websocket server that's defined in server.js.

class Client {
  constructor() {
    this.ws = new WebSocket("ws://localhost:9090")

    this.ws.onmessage = function(event) {
      console.log("received: " + event.data)
    }
  }
}

module.exports = Client
