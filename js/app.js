import React from "react"

import Client from "./client"
import GameState from "./gamestate"
import GameView from "./gameview"

let App = React.createClass({
  getInitialState() {
    // Stash things in window for easy debugging
    window.game = new GameState()

    // TODO: only beginTurn after matchmaking
    window.game.beginTurn()

    window.client = new Client(window.game)
    return window.game
  },

  render() {
    return (
      <div className="app">
        <GameView state={this.state} />
      </div>
    );
  }
});

React.render(<App/>, document.body)

