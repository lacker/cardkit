// This websocket client runs in the browser and talks to the
// websocket server that's defined in server.js.
class Client {
  // game is a GameState and should start at the beginning of the game.
  constructor(name, game) {
    this.name = name
    this.game = game
    this.makeSocket()

    // Each game-move has an id on it.
    // The convention is that once you process a move with a certain
    // id, if you see it again in the future you just won't process
    // it. That means that for error-resistance we can just repeatedly
    // resend our past moves.
    this.processed = new Set()

    // Past moves that we can re-send.
    // Here we keep all moves that happened since any opponent move.
    this.buffer = []
  }

  makeSocket() {
    let url = document.URL.replace("http", "ws").replace("8080", "9090")
    console.log(`connecting to ${url}`)

    // TODO: needs a more aggressive timeout
    this.ws = new WebSocket(url)

    this.ws.onmessage = (event => this.receive(event.data))
    this.ws.onerror = (event => this.handleError())
    this.ws.onclose = (event => this.handleClose())
  }

  // When data is received from the server
  receive(messageData) {
    let message = JSON.parse(messageData)

    if (message.op == "hello") {
      // We always need to register what our name is
      this.register()
    } else if (message.op == "start") {
      this.handleStart(message)
    } else if (this.handleRemoteMove(message)) {
      // It was a remote move
    } else {
      console.log("don't know how to handle this message. dropping it")
    }
  }

  // Sends all pending message objects upstream.
  flush() {
    for (var message of this.buffer) {
      this.ws.send(JSON.stringify(message))
    }
  }
  
  // Sends a message object upstream.
  send(message) {
    this.buffer.push(message)
    this.flush()
  }

  // Send a looking-for-game message.
  register() {
    console.log("registering as " + this.name)
    if (this.game) {
      this.send({op: "register", name: this.name, seeking: !this.game.started()})
    } else {
      this.send({op: "register", name: this.name, seeking: true})
    }
  }

  forceUpdate() {
    console.log("forceUpdate on the client was not overridden")
  }

  // Handles a move being reported from the server.
  // Returns whether we knew what to do with it.
  handleRemoteMove(move) {
    if (!move.op || !move.player) {
      return false
    }
    if (move.player == this.name) {
      // This is a bounce of a move we made.
      return true
    }
    if (move.id && this.processed.has(move.id)) {
      // This is a move we have already processed.
      return true
    }

    console.log("making remote move: " + JSON.stringify(move))
    if (this.game.makeMove(move)) {
      this.processed.add(move.id)
      this.buffer = []
      this.forceUpdate()
      return true
    }
    return false
  }

  // Makes a move locally then communicates it to the server.
  makeLocalMove(move) {
    move.player = this.name
    move.id = "m" + Math.floor(Math.random() * 1000000000000)

    console.log("making local move: " + JSON.stringify(move))
    if (!this.game.makeMove(move)) {
      console.log("invalid!")
      return
    }

    this.forceUpdate();
    this.send(move)
  }

  // This is called locally when the server decides remotely that a
  // game should start.
  handleStart(message) {
    this.buffer = []
    let players = message.players
    let seed = message.seed

    console.log(`starting game: ${players[0]} vs ${players[1]}`)
    
    this.game.startGame(players, seed)
    this.forceUpdate()
  }

  handleError() {
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
