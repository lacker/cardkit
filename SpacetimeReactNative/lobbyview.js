'use strict';
var Button = require('react-native-button');
var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
} = React;

var LobbyView = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to Spacetime
        </Text>
        <Button style={styles.findGameButton} onPress={this._findGame}>
          Find Game
        </Button>
      </View>
    );
  },

  _findGame() {
    window.client.register();
    window.client.forceUpdate();
  },

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  findGameButton: {
    margin: 20,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    color: '#FF0',
    borderColor: '#FF0',
  },
  welcome: {
    color: '#FFF',
    fontSize: 20,
    textAlign: 'center',
    margin: 20,
  },
});

module.exports = LobbyView;
