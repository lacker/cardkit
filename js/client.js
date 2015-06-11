// This websocket client runs in the browser and talks to the
// websocket server that's defined in server.js.

class Client {
  constructor() {
    this.makeSocket()
  }

  makeSocket() {
    let url = "ws://localhost:9090"
    console.log(`connecting to ${url}`)

    // TODO: needs a more aggressive timeout
    this.ws = new WebSocket(url)

    this.ws.onmessage = (event => this.receive(event.data))
    this.ws.onerror = (event => this.handleError())
    this.ws.onclose = (event => this.handleClose())
  }

  // When data is received from the server
  receive(data) {
    console.log("received: " + data)
  }

  handleError() {
    console.log("socket error. closing dirty socket")
    this.ws.close()
  }

  // Whenever the socket closes we just make a new one
  handleClose() {
    console.log("the socket closed")
    
    // Wait 2 seconds to reconnect
    setTimeout(() => this.makeSocket(), 2000)
  }
}

module.exports = Client
