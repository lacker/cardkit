// React view of a GameState
import React from 'react';
import Player from './playerview.js';


let GameView = React.createClass({
    render() {
    window.client.gameView = this; 
    return (
        <div className="game-container">
          
          <Player playerState={this.props.state.players[1]} />
          <div className="player-avatar" style={this.avatarStyle(1)}>
            Computer
          </div>
          
          <div className="in-play-area">
            {this.props.state.players[1].board}
            {this.props.state.players[0].board}
          </div>
          
          <div className="end-turn-button" onClick={this.endTurn}>End Turn</div>

          <div className="player-avatar " style={this.avatarStyle(0)}>
            Me
          </div>
          <Player playerState={this.props.state.players[0]} />
        
        </div>
        
    );
  },

  // end and start a new turn when button is clicked
  endTurn() {
    window.client.makeLocalMove({"op":"endTurn"});
    window.client.makeLocalMove({"op":"beginTurn"});
    this.forceUpdate();
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
