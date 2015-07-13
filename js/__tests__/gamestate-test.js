jest.dontMock("../gamestate")

let GameState = require("../gamestate")

describe("GameState", function() {
  it("can be created", function() {
    let state = new GameState({name: "bob"})
  })

  it("can be serialized", function() {
    let state = new GameState({name: "bob"})
    let data = JSON.stringify(state)
    expect(data).toEqual('{"name":"bob","_started":false,"players":[{"name":"bob","hand":[],"board":[],"trash":[],"life":30,"mana":0,"maxMana":0},{"name":"waiting...","hand":[],"board":[],"trash":[],"life":30,"mana":0,"maxMana":0}],"winner":null,"godMode":false,"history":[]}')
  })

  it("can be deserialized", function() {
    let state = new GameState({name: "bob"})
    let data = JSON.stringify(state)
    let state2 = new GameState(JSON.parse(data))

    expect(state2.name).toEqual(state.name)
    expect(state2._started).toEqual(state._started)
    expect(state2.winner).toEqual(state.winner)
  })

  it("retains card function across reserialization", function() {
    let state = new GameState({name: "bob"})
    state.startGame(["bob", "eve"], 123)
    state.makeMove({op: "refreshCards"})
    state.makeMove({op: "refreshCards"})
    let data = JSON.stringify(state)
    let state2 = new GameState(JSON.parse(data))

    expect(state2.name).toEqual(state.name)
    expect(state2._started).toEqual(state._started)
    expect(state2.winner).toEqual(state.winner)

  })

  it("kill moves creature from board to trash", function() {
    let state = new GameState({name: "bob"})

    state.startGame(["bob", "eve"], 123)

    // draw the simplest permanent
    state.draw({"name":"bob"}, {"cost":0, "permanent": true})
    expect(state.current().hand.length == 1).toEqual(true)

    // play last card drawn
    state.selectCard(0, "hand", "bob")
    state.selectCard(0, "hand", "bob")
    expect(state.current().board.length == 1).toEqual(true)

    // go to next turn
    state.makeMove({op: "refreshCards"})

    // get a card that implements kill
    state.draw({"name":"eve"}, {"kill":true, "cost":0})    
    // play last card drawn
    state.selectCard(0, "hand", "eve")
    state.selectCard(0, "hand", "eve")

    // permanent leaves board and goes to trash
    expect(state.opponent().board.length == 0).toEqual(true)
    expect(state.opponent().trash.length == 1).toEqual(true)

  })

  it("direct damage kills appropriate sized creature", function() {
    let state = new GameState({name: "bob"})

    state.startGame(["bob", "eve"], 123)

    // draw the simplest 2/2
    state.draw({"name":"bob"}, 
               {"cost":0, "permanent": true, "attack": 2, "defense": 2})

    // play last card drawn
    state.selectCard(0, "hand", "bob")
    state.selectCard(0, "hand", "bob")
   
    // go to next turn
    state.makeMove({op: "refreshCards"})
   
    // get a card that implements direct damage
    state.draw({"name":"eve"}, {"damage":2, "cost":0})    
   
    // play last card drawn
    state.selectCard(0, "hand", "eve")
    state.selectCard(0, "opponentBoard", "eve")

    // permanent leaves board and goes to trash
    // bob
    expect(state.current().board.length == 0).toEqual(true)
    expect(state.current().trash.length == 1).toEqual(true)
    // eve
    expect(state.opponent().board.length == 0).toEqual(true)
    expect(state.opponent().trash.length == 1).toEqual(true)
  })

  it("two creatures die when colliding", function() {
    let state = new GameState({name: "bob"})

    state.startGame(["bob", "eve"], 123)

    // draw the simplest 2/2
    state.draw({"name":"bob"}, 
               {"cost":0, "permanent": true, "attack": 2, "defense": 2})

    // play last card drawn
    state.selectCard(0, "hand", "bob")
    state.selectCard(0, "hand", "bob")

    // draw the simplest 2/2
    state.draw({"name":"eve"}, 
               {"cost":0, "permanent": true, "attack": 2, "defense": 2})

    // play last card drawn
    state.selectCard(0, "hand", "eve")
    state.selectCard(0, "hand", "eve")

    // go to next turn
    state.makeMove({op: "refreshCards"})

    state.selectCard(0, "board", "eve")
    state.selectCard(0, "opponentBoard", "eve")

    // both permanents leave board and go to trash
    expect(state.current().board.length == 0).toEqual(true)
    expect(state.current().trash.length == 1).toEqual(true)
    expect(state.opponent().board.length == 0).toEqual(true)
    expect(state.opponent().trash.length == 1).toEqual(true)


  })



})
