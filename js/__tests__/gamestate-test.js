jest.dontMock("../gamestate")

let GameState = require("../gamestate")

describe("GameState", function() {
  it("can be created", function() {
    let state = new GameState({name: "bob"})
  })

  it("can be serialized", function() {
    let state = new GameState({name: "bob"})
    let data = JSON.stringify(state)
    expect(data).toEqual('{"name":"bob","_started":false,"turn":1,"players":[{"name":"bob","hand":[],"board":[],"trash":[],"life":30,"mana":0,"maxMana":0},{"name":"waiting...","hand":[],"board":[],"trash":[],"life":30,"mana":0,"maxMana":0}],"winner":null,"godMode":false}')
  })

  it("can be deserialized", function() {
    let state = new GameState({name: "bob"})
    let data = JSON.stringify(state)
    let state2 = new GameState(JSON.parse(data))

    expect(state2.name).toEqual(state.name)
    expect(state2._started).toEqual(state._started)
    expect(state2.turn).toEqual(state.turn)
    expect(state2.winner).toEqual(state.winner)
  })

  it("retains card function across reserialization", function() {
    let state = new GameState({name: "bob"})
    state.startGame(["bob", "eve"], 123)
    state.makeMove({op: "endTurn"})
    state.makeMove({op: "beginTurn"})
    state.makeMove({op: "endTurn"})
    state.makeMove({op: "beginTurn"})
    let data = JSON.stringify(state)
    let state2 = new GameState(JSON.parse(data))

    expect(state2.name).toEqual(state.name)
    expect(state2._started).toEqual(state._started)
    expect(state2.turn).toEqual(state.turn)
    expect(state2.winner).toEqual(state.winner)

    expect(
      state2.current().getHand(0).name).toEqual(state.current().getHand(0).name)

  })

  it("playing a creature and opponent killing it works", function() {
    let state = new GameState({name: "bob"})

    // start game with plenty of mana so we can cast arbitrary
    state.godMode = true;
    state.startGame(["bob", "eve"], 123)

    // a simple creature
    state.drawCardWithName("BiBot")
    // play last card drawn
    state.play(state.current().hand.length-1)
    expect(state.current().board.length == 1).toEqual(true)

    // go to next turn
    state.makeMove({op: "endTurn"})
    state.makeMove({op: "beginTurn"})

    // get the card that implements kill
    state.drawCardWithName("Errant Blast")    
    // play last card drawn
    state.play(state.current().hand.length-1)

    // permanent leaves board and goes to trash
    expect(state.opponent().board.length == 0).toEqual(true)
    expect(state.opponent().trash.length == 1).toEqual(true)

  })

})
