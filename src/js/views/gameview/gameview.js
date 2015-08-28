// React view of a GameState
import React, { Component } from 'react';
import Player from '../playerview/playerview';
import Card from '../cardview/cardview';
import Avatar from '../avatarview/avatarview';
import classNames from 'classnames';
import './_gameview.scss';


export default class GameView extends Component {
    render() {
   
    window.client.forceUpdate = (() => this.forceUpdate())

    let opponent = this.props.state.players[1];
    let homePlayer = this.props.state.players[0];
    
    let opponentBoardCards = opponent.board.map((cardInfo, i) =>
          <Card cardInfo={cardInfo} player={opponent} key={i} />);
    let homePlayerBoardCards = homePlayer.board.map((cardInfo, i) =>
          <Card cardInfo={cardInfo} player={homePlayer} key={i} />);

    let homePlayerDamageCSS = homePlayer.showDamage ? 'player-avatar damage-player' : 'player-avatar';
    let opponentClasses = classNames(
      'avatar'
    )

    opponent.showDamage ? 'player-avatar damage-player' : 'player-avatar';
    let currentTime = window.game.currentGameSecond ? window.game.currentGameSecond : 10;
    return (
        <div className="game-container">

          {/* OPPONENT */}
          <Player playerState={opponent} />

          <Avatar player={game.remotePlayer} onClick={this.selectOpponent} />
          
          {/* MIDDLE OF BOARD */}
          <div className="in-play-area">
            <div className="player-board">
              {opponentBoardCards}
            </div>
            <div className="player-board home-player-board">
              {homePlayerBoardCards}
            </div>
          </div>
          <span className="turn-timer">{currentTime}</span>
          <div className="resign-button" onClick={this.resign}>Resign</div>

          {/* HOME PLAYER */}
          <Avatar player={game.localPlayer} />

          <Player playerState={homePlayer} />
        </div>
        
    );
  }

  resign() {
    window.client.makeLocalMove({"op":"resign"});
  }

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

  selectOpponent() {
    let selectMove = {
                    "op":"selectOpponent"
                 };
    window.client.makeLocalMove(selectMove);
  }

}
