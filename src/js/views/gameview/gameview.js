// React view of a GameState
import React, { Component } from 'react';
import Player from '../playerview/playerview';
import Card from '../cardview/cardview';
import GameBoard from '../boardview/boardview';
import classNames from 'classnames';
import './_gameview.scss';


export default class GameView extends Component {
    render() {

      window.client.forceUpdate = (() => this.forceUpdate());

      const homePlayer = window.game.localPlayer,
        opponent = window.game.remotePlayer;


      return (
          <div className="game-container">

            <Player playerState={opponent} />

            <GameBoard />

            <Player playerState={homePlayer} />

          </div>
          
      );
    }
}
