import React, { Component } from 'react';
import classNames from 'classnames';
import Card from '../cardview/cardview';
import Avatar from '../avatarview/avatarview';
import Button from '../buttonview/buttonview';
import './_boardview.scss';

export default class GameBoard extends Component {

  resign() {
    alert('You have resigned!');
    window.client.makeLocalMove({"op":"resign"});
  }

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
          <Card cardInfo={cardInfo} player={homePlayer} key={i} />);

		return(
      <div className='game-board'>
        <div className='game-board__avatars'>
          <Avatar player={opponent} onClick={this.selectOpponent} />
          <Avatar player={homePlayer} />
        </div>
            
        <div className='game-board__play-area'>
          <div className='game-board__hand'>{opponentCards}</div>
          <div className='game-board__hand'>{homeCards}</div>
        </div>
        <div className='game-board__info'>
          <span className='game-board__timer'>{currentTime}</span>
          <Button onClick={this.resign} label='Resign' />
        </div>
      </div>
		  
    );
	}

}