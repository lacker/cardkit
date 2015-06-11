// React view of a GameState
import React from 'react';
import Player from './playerview.js';


let GameView = React.createClass({
  render() {
    return (
        <div className="game-container">
          
          <Player playerState={this.props.state.players[1]} />
          <div className="player-avatar" style={this.avatarStyle(1)}>
            Computer
          </div>
          
          <div className="in-play-area">
          </div>
          
          <div className="player-avatar " style={this.avatarStyle(0)}>
            Me
          </div>
          <Player playerState={this.props.state.players[0]} />
        
        </div>
        
    );
  },

  // highlight the active player
  avatarStyle(playerNumber) {
    let color = "lightgray";
    let fontWeight = 400;  
    if (playerNumber == this.props.state.turn) {
      color = "black";        
      fontWeight =  800;        
    }
    return {  
             color:color,
             fontWeight:fontWeight,
           };
  }

});

module.exports = GameView;
