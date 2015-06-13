// This websocket client runs in the browser and talks to the
// websocket server that's defined in server.js.
class Client {
  // game is a GameState and should start at the beginning of the game.
  constructor(game) {
    this.game = game
    this.name = `Guest ${Math.floor(Math.random() * 100)}`
    this.makeSocket()
  }

  makeSocket() {
    let url = "ws://localhost:9090"
    console.log_verbose(`connecting to ${url}`)

    // TODO: needs a more aggressive timeout
    this.ws = new WebSocket(url)

    this.ws.onmessage = (event => this.receive(event.data))
    this.ws.onerror = (event => this.handleError())
    this.ws.onclose = (event => this.handleClose())
  }

  // When data is received from the server
  receive(messageData) {
    console.log_verbose("received: " + messageData)

    if (messageData == "hello") {
      // First thing we do when the server says hi is we register for
      // a game
      this.register()
    } else {
      let message = JSON.parse(messageData)
      if (message.op == "start") {
        this.handleStart(message.players)
      } else if (this.handleRemoteMove(message)) {
        // It was a remote move
      } else {
        console.log_verbose("don't know how to handle this message. dropping it")
      }
    }

  }
  
  // Sends a message object upstream.
  send(message) {
    this.ws.send(JSON.stringify(message))
  }

  // Send a looking-for-game message.
  register() {
    console.log_verbose("registering as " + this.name)
    this.send({op: "register", name: this.name})
  }

  // Handles a move being reported from the server.
  // Returns whether it could be handled.
  handleRemoteMove(move) {
    if (!move.op || !move.player) {
      return false
    }
    if (move.player == this.name) {
      // This is a bounce of a move we made.
      return true
    }

    return this.game.makeMove(move)
  }

  // Makes a move locally then communicates it to the server.
  makeLocalMove(move) {
    move.player = this.name

    if (!window.game.makeMove(move)) {
      console.log_verbose("invalid local move: " + JSON.stringify(move))
      return
    }

    this.send(move)
    console.log_verbose("sending upstream: " + JSON.stringify(move))
  }

  // This is called locally when the server decides remotely that a
  // game should start.
  handleStart(players) {
    console.log_verbose(`${players[0]} should start versus ${players[1]}`)
  }

  handleError() {
    console.log_verbose("socket error. closing dirty socket")
    this.ws.close()
  }

  // Whenever the socket closes we just make a new one
  handleClose() {
    console.log_verbose("the socket closed")
    
    // Wait 2 seconds to reconnect
    setTimeout(() => this.makeSocket(), 2000)
  }
}

module.exports = Client