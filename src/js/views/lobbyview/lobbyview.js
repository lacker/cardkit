// React view of the Lobby
import React from 'react';
import Client from "../../client"
import GameState from "../../gamestate"
import "./_lobbyview.scss"
import { galaxyShadow } from '../../../assets/img'

let LobbyView = React.createClass({
    render() {
       return (
        <div className="lobby-container">
          <h1>Welcome to Spacetime</h1>
          <div className="find-game-button" onClick={this.findGame}>
            Find a Game
          </div>
          <img className="home-image" src={galaxyShadow} />
        </div>
    );
  },

  findGame() {
    window.client.register();
    window.client.forceUpdate();
  },

});

module.exports = LobbyView;
