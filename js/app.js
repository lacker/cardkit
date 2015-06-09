import React from 'react';

import GameState from './gamestate';
import GameView from './gameview';

let App = React.createClass({
  getInitialState() {
    return new GameState();
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
