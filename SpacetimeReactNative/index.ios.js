/**
 * Spacetime React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var gs = require('./js/gamestate.js');
var cl = require('./js/client.js');
var LobbyView = require('./js/views/lobbyview/lobbyview.js');
var GameView = require('./js/views/gameview/gameview.js');

var React = require('react-native');
var {
  AppRegistry,
  View,
} = React;
    
var SpacetimeReactNative = React.createClass({

  getInitialState: function() {
    // Stash things in window for easy debugging
    window.name = `Guest ${Math.floor(Math.random() * 100)}`
    window.game = new gs.GameState()
    window.game.constructor({name: window.name})
    window.client = new cl.Client()
    window.client.constructor(window.name, window.game)
    return window.game
  },

  render: function() {
    window.client.forceUpdate = (() => this.forceUpdate())
    return (
      <View>
        { window.client.registered ?
            <GameView state={this.state} />
          : <LobbyView />
        }
      </View>
    );
  },

  findGame() {
    window.client.register(true);
    window.client.forceUpdate();
  },

});

AppRegistry.registerComponent('SpacetimeReactNative', () => SpacetimeReactNative);