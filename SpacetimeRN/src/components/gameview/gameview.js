// React view of a GameState
import React, { Component } from 'react';
import Hand from '../handview/handview';
import Card from '../cardview/cardview';
import StarryView from '../starryview/starryview';
import GameBoard from '../boardview/boardview';
import classNames from 'classnames';
import './_gameview.scss';


import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';


@DragDropContext(HTML5Backend)
export default class GameView extends Component {
    render() {

      window.client.forceUpdate = (() => this.forceUpdate());

      const homePlayer = window.game.localPlayer,
        opponent = window.game.remotePlayer;

            // <Hand playerState={opponent} />

      return (
          <div>
            <GameBoard />
            <Hand playerState={homePlayer} />
          </div>
          
      );
    }
}
