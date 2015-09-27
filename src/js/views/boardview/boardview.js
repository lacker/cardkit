import React, { Component } from 'react';
import classNames from 'classnames';
import Card from '../cardview/cardview';
import Avatar from '../avatarview/avatarview';
import ResignButton from '../resignButtonview/resignButtonview';
import Bullet from "../bullet/bullet";
import './_boardview.scss';

export default class GameBoard extends Component {
  
  selectOpponent() {
    let selectMove = {
      "op":"selectOpponent"
    };
    window.client.makeLocalMove(selectMove);
  }

	render() {
    const opponent = window.game.remotePlayer,
      homePlayer = window.game.localPlayer,
      currentTime = window.game.currentGameSecond ? window.game.currentGameSecond : 10,

      opponentCards = opponent.board.map((cardInfo, i) =>
          <Card cardInfo={cardInfo} player={opponent} key={i} />),

      homeCards = homePlayer.board.map((cardInfo, i) =>
          <Card
            cardInfo={cardInfo}
            used={homePlayer.board.indexOf(this.props.cardInfo) !== -1}
            key={i} />),
      bullets = window.game.bullets.map((info, i) =>
                  <Bullet key={i} info={info} />);

  	return(
      <div className='game-board'>
        <div className='game-board__avatars'>
          <Avatar player={opponent} onClick={this.selectOpponent} />
          <Avatar player={homePlayer} />
        </div>
            
        <div className='game-board__play-area'>
          <div className='game-board__hand'>{opponentCards}</div>
          {bullets}
          <div className='game-board__hand'>{homeCards}</div>
        </div>
        <div className='game-board__info'>
          <span className='game-board__timer'>{currentTime}</span>
          <ResignButton onClick={this.returnToLobby} label='Resign' />
        </div>
      </div>
		  
    );
	}

}