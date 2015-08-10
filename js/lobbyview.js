// React view of the Lobby
import React from 'react';
import Client from "./client"
import GameState from "./gamestate"

let LobbyView = React.createClass({
    render() {
       return (
        <div className="lobby-container">
          <h1>Welcome to Spacetime</h1>
          <div className="find-game-button" onClick={this.findGame}>
            Find a Game
          </div>
          <div className="find-game-button campaign-button" onClick={this.playCampaign}>
            Campaign 1: Bibot Attack
          </div>
          <img className="home-image" src="img/galaxy-color-shadow.svg" />
        </div>
    );
  },

  findGame() {
    window.client.register();
    window.client.forceUpdate();
  },

  
  playCampaign() {
     window.client.register();
     setTimeout(function() {
       window.computerName = 'cpu'
       window.computerGame = new GameState({name: 'cpu'})
       window.computerClient = new Client('cpu', window.computerGame, 9091)
       window.computerClient.register()
      }, 3000)
     window.client.forceUpdate();
  },

});

module.exports = LobbyView;
