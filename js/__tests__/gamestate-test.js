jest.dontMock("../gamestate")

describe("GameState", function() {
  it("can be created", function() {
    let GameState = require("../gamestate")
    let state = new GameState("bob")
  })
})
