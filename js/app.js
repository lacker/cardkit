import React from "react"

import Client from "./client"
import GameState from "./gamestate"
import GameView from "./gameview"

let App = React.createClass({
  getInitialState() {
    // Stash things in window for easy debugging
    window.name = `Guest ${Math.floor(Math.random() * 100)}`
    window.game = new GameState({name: window.name})
    window.client = new Client(window.name, window.game)

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

let isDev = document.URL.match("localhost") || document.URL.match("127.0.0.1")
mixpanel.register({production: !isDev})
window.track = function(event) {
  mixpanel.track(event)
}
