// This websocket client runs in the browser and talks to the
// websocket server that's defined in server.js.
class Client {
  // game is a GameState and should start at the beginning of the game.
  constructor(name, game) {
    this.name = name
    this.game = game
    this.makeSocket()

    // The next op id we expect.
    // This is only useful after a "start" specifies which channel you
    // are listening to.
    // We skip 0 to avoid bugs. Each actual move for a game has an id,
    // starting at 1.
    this.nextID = 1
  }

  makeSocket() {
    let url = document.URL.replace("http", "ws").replace(/\/$/, "").replace(":8080", "") + ":9090"
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
      // We don't do anything on a hello right now.
      // It isn't technically necessary, it's just handy for debugging
      // because you expect a hello to come in.
      return
    }

      message.id = this.nextID
      console.log("setting message id to " + this.nextID)
    if (message.op == "start") {
      this.handleStart(message)
    } else if (message.op == "draw") {
      // in spacetime, we keep on drawing
      this.handleRemoteMove(message)
    } else if (message.id != this.nextID) {
      console.log("out of order, returning: " + message)
      // This is a dupe, or out-of-order. Ignore it
    } else if (this.handleRemoteMove(message)) {
      console.log("handle remote move: " + message)
      // It was a remote move
    } else {
      console.log("don't know how to handle this message. dropping it")
      return
    }
  }

  // Sends a message object upstream.
  send(message) {
    this.ws.send(JSON.stringify(message))
  }

  // Send a looking-for-game message.
  register() {
    this.registered = true; // UI checks this to refresh on game seek
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

    console.log("making remote move: " + JSON.stringify(move))
    if (this.game.makeMove(move)) {
      this.buffer = []
      this.forceUpdate()
      this.nextID++
      console.log("the next id after handleRemoteMove is " + this.nextID)
      return true
    }
    return false
  }

  // Sends a move to the server.
  // This does *not* display the move until the server confirms it.
  makeLocalMove(move) {
    /*if (this.game.turn != 0 && move.op == "selectCard") {
      console.log("can't select cards on opponent's turn, but this will change with timers :)")
      return
    }*/
    move.player = this.name
    move.gameID = this.gameID

    console.log("sending move to server: " + JSON.stringify(move))
    this.send(move)
  }

  // This is called locally when the server decides remotely that a
  // game should start.
  handleStart(message) {
    this.buffer = []
    let players = message.players
    this.gameID = message.gameID

    console.log(`starting game: ${players[0]} vs ${players[1]}`)
    window.track("startGame")
    
    // Just use the gameID as the seed
    this.game.startGame(players, this.gameID)

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
