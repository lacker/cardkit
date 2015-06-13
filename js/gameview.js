// React view of a GameState
import React from 'react';
import Player from './playerview.js';
import Card from "./cardview.js"


let GameView = React.createClass({
    render() {
    window.client.gameView = this; 
    let opponentBoardCards = this.props.state.players[1].board.map(function (cardInfo, i) {
      return (
          <Card cardInfo={cardInfo} player={this.props.state.players[1]} key={i} />
      );
    }.bind(this));
    let homePlayerBoardCards = this.props.state.players[0].board.map(function (cardInfo, i) {
      return (
          <Card cardInfo={cardInfo} player={this.props.state.players[0]} key={i} />
      );
    }.bind(this));
    return (
        <div className="game-container">
          
          <Player playerState={this.props.state.players[1]} />
          <div className="player-avatar" style={this.avatarStyle(1)}>
            Computer
          </div>
          
          <div className="in-play-area">
            <div className="player-board">
              {opponentBoardCards}
            </div>
            <div className="player-board home-player-board">
              {homePlayerBoardCards}
            </div>
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
