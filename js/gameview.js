// React view of a GameState
import React from 'react';

import Player from './playerview.js';


let GameView = React.createClass({
  render() {
    return (
        <div>
        Turn: {this.props.state.turn}
        <br />
        <Player playerState={this.props.state.players[0]} />
        <br />
        <Player playerState={this.props.state.players[1]} />
        </div>
        
    );
  }
});

module.exports = GameView;
