import React from "react";

import GameState from "./gamestate";
import GameView from "./gameview";

let App = React.createClass({
  getInitialState() {
    // Stash it here for easy debugging
    window.game = new GameState()

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

React.render(<App/>, document.body);
