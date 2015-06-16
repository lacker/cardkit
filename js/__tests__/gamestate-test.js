jest.dontMock("../gamestate")

let GameState = require("../gamestate")

describe("GameState", function() {
  it("can be created", function() {
    let state = new GameState("bob")
  })

  it("can be serialized", function() {
    let state = new GameState("bob")
    let messageData = JSON.stringify(state)
    expect(messageData).toEqual('{"name":"bob","_started":false,"turn":1,"players":[{"name":"bob","hand":[],"board":[],"life":30,"mana":0,"maxMana":0},{"name":"waiting for opponent...","hand":[],"board":[],"life":30,"mana":0,"maxMana":0}],"winner":null}')
  })
})
