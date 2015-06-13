// This websocket client runs in the browser and talks to the
// websocket server that's defined in server.js.
class Client {
  // game is a GameState and should start at the beginning of the game.
  constructor(name, game) {
    this.name = name
    this.game = game
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
  receive(messageData) {
    console.log("received: " + messageData)
    let message = JSON.parse(messageData)

    if (message.op == "hello") {
      // First thing we do when the server says hi is we register for
      // a game
      this.register()
    } else if (message.op == "start") {
      this.handleStart(message.players)
    } else if (this.handleRemoteMove(message)) {
      // It was a remote move
    } else {
      console.log("don't know how to handle this message. dropping it")
    }
  }
  
  // Sends a message object upstream.
  send(message) {
    this.ws.send(JSON.stringify(message))
  }

  // Send a looking-for-game message.
  register() {
    console.log("registering as " + this.name)
    this.send({op: "register", name: this.name})
  }

  forceUpdate() {
    console.log("forceUpdate on the client was not overridden")
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

    if (this.game.makeMove(move)) {
      this.forceUpdate()
      return true
    }
    return false
  }

  // Makes a move locally then communicates it to the server.
  makeLocalMove(move) {
    move.player = this.name

    if (!this.game.makeMove(move)) {
      console.log("invalid local move: " + JSON.stringify(move))
      return
    }

    this.forceUpdate()
    this.send(move)
    console.log("sending upstream: " + JSON.stringify(move))
  }

  // This is called locally when the server decides remotely that a
  // game should start.
  handleStart(players) {
    console.log(`${players[0]} should start versus ${players[1]}`)
    
    this.game.startGame(players)
    this.forceUpdate()
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
