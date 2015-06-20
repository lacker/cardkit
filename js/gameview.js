// React view of a GameState
import React from 'react';
import Player from './playerview.js';
import Card from "./cardview.js"


let GameView = React.createClass({
    render() {
   
    window.client.forceUpdate = (() => this.forceUpdate())

    let opponent = this.props.state.players[1];
    let homePlayer = this.props.state.players[0];
    let opponentBoardCards = opponent.board.map((cardInfo, i) =>
          <Card cardInfo={cardInfo} player={opponent} key={i} />);
    let homePlayerBoardCards = homePlayer.board.map((cardInfo, i) =>
          <Card cardInfo={cardInfo} player={homePlayer} key={i} />);

    let cssEndTurn = window.game.turn == 0 ? 'active-player' : '';
    cssEndTurn = 'end-turn-button'  + ' ' + cssEndTurn;

    return (
        <div className="game-container">
          
          {/* OPPONENT */}
          <Player playerState={opponent} />
          <div onClick={this.clickOpponent} className="player-avatar" style={this.avatarStyle(1)}>
            <div className="vital-stats-container life-container">Life: {opponent.life}</div>
            <h2 className="player-name">{opponent.name}</h2>
            <div className="vital-stats-container">Mana: {opponent.mana} / {opponent.maxMana}</div>
          </div>
          
          {/* MIDDLE OF BOARD */}
          <div className="in-play-area">
            <div className="player-board">
              {opponentBoardCards}
            </div>
            <div className="player-board home-player-board">
              {homePlayerBoardCards}
            </div>
          </div>
          
          <div className={cssEndTurn} onClick={this.endTurn}>End Turn</div>

          {/* HOME PLAYER */}
          <div className="player-avatar " style={this.avatarStyle(0)}>
            <div className="vital-stats-container">Life: {homePlayer.life}</div>
            <h2>{homePlayer.name}</h2>
            <div className="vital-stats-container">Mana: {homePlayer.mana} / {homePlayer.maxMana}</div>
          </div>
          <Player playerState={homePlayer} />
        
        </div>
        
    );
  },

  // end and start a new turn when button is clicked
  endTurn() {
    let event = new CustomEvent("turnEnded", {});
    window.dispatchEvent(event);
    window.client.makeLocalMove({"op":"endTurn"});
    window.client.makeLocalMove({"op":"beginTurn"});
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
  },

  clickOpponent() {
    let clickMove = {
                    "op":"clickOpponent" 
                 };
    window.client.makeLocalMove(clickMove);
  }

});

module.exports = GameView;
