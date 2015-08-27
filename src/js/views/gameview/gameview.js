// React view of a GameState
import React from 'react';

import Player from '../playerview/playerview';
import Card from "../cardview/cardview";
import Bullet from "../bullet/bullet";
import './_gameview.scss';


let GameView = React.createClass({

    render() {
   
    window.client.forceUpdate = (() => this.forceUpdate())

    let opponent = this.props.state.players[1];
    let homePlayer = this.props.state.players[0];
    
    let opponentBoardCards = opponent.board.map((cardInfo, i) =>
          <Card cardInfo={cardInfo} player={opponent} key={i} />);
    let homePlayerBoardCards = homePlayer.board.map((cardInfo, i) =>
          <Card cardInfo={cardInfo} player={homePlayer} key={i} />);

    let bullets = []
    let gameHeight = 768;
    let gameWidth = 1024;
    let cardWidth = 80;
    let cardHeight = 120;
    let lefts = [];
    let tops = [];
    for (let i=0;i<this.props.state.bullets.length;i++) {
      let b = this.props.state.bullets[i]
      switch (b.startIndex) {
        case 0:
          lefts[i] = gameWidth/2 - cardWidth/2
          break;
        case 1:
          lefts[i] = gameWidth/2 - cardWidth/2 - cardWidth
          break;
        case 2:
          lefts[i] = gameWidth/2 - cardWidth/2 + cardWidth
          break;
        case 3:
          lefts[i] = gameWidth/2 - cardWidth/2 - cardWidth * 2
          break;
        case 4:
          lefts[i] = gameWidth/2 - cardWidth/2 + cardWidth * 2
          break;
        case 5:
          lefts[i] = gameWidth/2 - cardWidth/2 - cardWidth * 3
          break;
        case 6:
          lefts[i] = gameWidth/2 - cardWidth/2 + cardWidth * 3
          break;
        case 7:
          lefts[i] = gameWidth/2 - cardWidth/2 - cardWidth * 4
          break;
      }
      let endTop;
      let endLeft = gameWidth/2 - cardWidth/2
      if (b.player == window.game.localPlayer()) {
        tops[i] = gameHeight / 2 + cardHeight / 2
        endLeft = gameWidth/2
        endTop = 0
      } else {
        tops[i] = gameHeight / 2 - cardHeight / 2
        endTop = gameHeight
      }
      bullets[i] = <Bullet bullet={b} key={i} startLeft={lefts[i]} startTop={tops[i]} endLeft={endLeft} endTop={endTop} />;
    }

    let homePlayerDamageCSS = homePlayer.showDamage ? 'player-avatar damage-player' : 'player-avatar';
    let opponentDamageCSS = opponent.showDamage ? 'player-avatar damage-player' : 'player-avatar';
    let currentTime = window.game.currentGameSecond ? window.game.currentGameSecond : 10;
    return (
        <div className="game-container">
          
          {/* OPPONENT */}
          <div className="resign-button" onClick={this.resign}>Resign</div>
          <div onClick={this.selectOpponent} className={opponentDamageCSS} style={this.avatarStyle(1)}>
            <div className="vital-stats-container life-container">Life: {opponent.life}</div>
            <h2 className="player-name">{opponent.name}</h2>
            <div className="vital-stats-container">Energy: {opponent.energy} / {opponent.maxEnergy}</div>
          </div>
          <Player playerState={opponent} />
          
          {/* MIDDLE OF BOARD */}
          <div className="in-play-area">
            <div className="player-board">
              {opponentBoardCards}
            </div>
            {bullets}
            <div className="player-board home-player-board">
              {homePlayerBoardCards}
            </div>
          </div>

          {/* HOME PLAYER */}
          <Player playerState={homePlayer} />
          <div className="turn-timer">{currentTime}</div>
          <div className={homePlayerDamageCSS} style={this.avatarStyle(0)}>
            <div className="vital-stats-container">Life: {homePlayer.life}</div>
            <h2>{homePlayer.name}</h2>
            <div className="vital-stats-container">Energy: {homePlayer.energy} / {homePlayer.maxEnergy}</div>
          </div>
        
        </div>
        
    );
  },

  resign() {
    window.client.makeLocalMove({"op":"resign"});
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

  selectOpponent() {
    let selectMove = {
                    "op":"selectOpponent"
                 };
    window.client.makeLocalMove(selectMove);
  }

});

module.exports = GameView;
