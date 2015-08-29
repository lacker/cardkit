jest.dontMock("../gamestate")

let GameState = require("../gamestate")

import { TARGETS } from '../cards.js';

describe("GameState", function() {
  it("can be created", function() {
    let state = new GameState({name: "bob"})
  })

  it("can be serialized", function() {
    let state = new GameState({name: "bob"})
    let data = JSON.stringify(state)
    expect(data).toEqual('{"name":"bob","_started":false,"players":[{"name":"bob","hand":[],"board":[],"trash":[],"life":30,"mana":0,"maxMana":0},{"name":"waiting...","hand":[],"board":[],"trash":[],"life":30,"mana":0,"maxMana":0}],"winner":null,"declaredWinner":false,"history":[],"damageDuration":900,"godMode":false}')
  })

  it("can be deserialized", function() {
    let state = new GameState({name: "bob"})
    let data = JSON.stringify(state)
    let state2 = new GameState(JSON.parse(data))

    expect(state2.name).toEqual(state.name)
    expect(state2._started).toEqual(state._started)
    expect(state2.winner).toEqual(state.winner)
  })

  it("has accessible players via playerForName", function() {
    let state = new GameState({name: "bob"})
    expect(state.playerForName("bob").name).toEqual("bob")
  })

  it("retains card function across reserialization", function() {
    let state = new GameState({name: "bob"})
    state.startGame(["bob", "eve"], 123)
    state.makeMove({op: "refreshPlayers"})
    let data = JSON.stringify(state)
    let state2 = new GameState(JSON.parse(data))

    expect(state2.name).toEqual(state.name)
    expect(state2._started).toEqual(state._started)
    expect(state2.winner).toEqual(state.winner)
  })

  it("can be consistently serialized with displayString", function() {
    let state = new GameState({name: "yorp"})
    state.startGame(["yorp", "blorp"], 1212)
    let data = JSON.stringify(state)
    let state2 = new GameState(JSON.parse(data))
    expect(state.displayString()).toEqual(state2.displayString())
  })

  it("kill moves creature from board to trash", function() {
    let state = new GameState({name: "bob"})

    state.startGame(["bob", "eve"], 123)

    // draw the simplest permanent
    state.draw({name:"bob"}, {cost:0, permanent: true})
    expect(state.localPlayer.hand.length).toEqual(1)

    // play last card drawn
    state.selectCard(0, "hand", "bob")
    state.selectCard(0, "hand", "bob")
    expect(state.localPlayer.board.length).toEqual(1)

    // go to next turn
    state.makeMove({op: "refreshPlayers"})

    // get a card that implements kill
    state.draw({name:"eve"}, 
               {kill:true, cost:0, target:TARGETS.OPPONENT_PERMANENT, randomTarget:true})    
    // play last card drawn
    state.selectCard(0, "hand", "eve")
    state.selectCard(0, "hand", "eve")

    // permanent leaves board and goes to trash
    expect(state.remotePlayer.board.length).toEqual(0)
    expect(state.remotePlayer.trash.length).toEqual(1)

  })

  it("direct damage kills appropriate sized creature", function() {
    let state = new GameState({name: "bob"})

    state.startGame(["bob", "eve"], 123)

    // draw the simplest 2/2
    state.draw({name:"bob"}, 
               {cost:0, permanent: true, attack: 2, defense: 2})

    // play last card drawn
    state.selectCard(0, "hand", "bob")
    state.selectCard(0, "hand", "bob")
   
    // go to next turn
    state.makeMove({op: "refreshPlayers"})
   
    // get a card that implements direct damage
    state.draw({name:"eve"}, {damage:2, cost:0})    
   
    // play last card drawn
    state.selectCard(0, "hand", "eve")
    state.selectCard(0, "opponentBoard", "eve")

    // permanent leaves board and goes to trash
    // bob
    expect(state.localPlayer.board.length).toEqual(0)
    expect(state.localPlayer.trash.length).toEqual(1)
    // eve
    expect(state.remotePlayer.board.length).toEqual(0)
    expect(state.remotePlayer.trash.length).toEqual(1)
  })

  /* it("two creatures die when colliding", function() {
    let state = new GameState({name: "bob"})

    state.startGame(["bob", "eve"], 123)
     
    let attackRate = 5000
    // draw the simplest 2/2
    state.draw({"name":"bob"}, 
               {"cost":0, "permanent": true, "attack": 2, "defense": 2, "attackRate": attackRate})

    // play last card drawn
    state.selectCard(0, "hand", "bob")
    state.selectCard(0, "hand", "bob")

    // draw the simplest 2/2
    state.draw({"name":"eve"}, 
               {"cost":0, "permanent": true, "attack": 2, "defense": 2, "attackRate": attackRate})

    // play last card drawn
    state.selectCard(0, "hand", "eve")
    state.selectCard(0, "hand", "eve")
    
    state.selectCard(0, "board", "eve")
    state.selectCard(0, "opponentBoard", "eve")

    // both permanents leave board and go to trash
    expect(state.localPlayer.board.length).toEqual(0)
    expect(state.localPlayer.trash.length).toEqual(1)
    expect(state.remotePlayer.board.length).toEqual(0)
    expect(state.remotePlayer.trash.length).toEqual(1)

  })*/

  it("godMode is off", function() {
    let state = new GameState({name: "bob"})
    expect(state.godMode).toEqual(false)
  })

})
