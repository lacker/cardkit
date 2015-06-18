// React view of the Lobby
import React from 'react';

let LobbyView = React.createClass({
    render() {
       return (
        <div className="lobby-container">
          <h1>Welcome to Open Spells</h1>
          <div className="find-game-button" onClick={this.findGame}>
            Find a Game
          </div>
          <img className="home-image" src="img/crossed-swords.svg" />
        </div>
    );
  },

  findGame() {
    window.client.register();
    window.client.forceUpdate();
  },

});

module.exports = LobbyView;
