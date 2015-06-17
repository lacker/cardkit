jest.dontMock("../gamestate")

let GameState = require("../gamestate")

describe("GameState", function() {
  it("can be created", function() {
    let state = new GameState({name: "bob"})
  })

  it("can be serialized", function() {
    let state = new GameState({name: "bob"})
    let data = JSON.stringify(state)
    expect(data).toEqual('{"name":"bob","_started":false,"turn":1,"players":[{"name":"bob","hand":[],"board":[],"life":30,"mana":0,"maxMana":0},{"name":"waiting for opponent...","hand":[],"board":[],"life":30,"mana":0,"maxMana":0}],"winner":null}')
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
})
