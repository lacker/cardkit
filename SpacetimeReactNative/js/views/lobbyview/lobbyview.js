'use strict';
//import React, { Component, PropTypes } from 'react';
//import Client from "../../client";
// var GameState = require("../../gamestate");
//import "_lobbyview.scss";
//import { galaxyShadowImg } from '../../../assets/img';
// var Util = require('../../util.js');

var Button = require('react-native-button');
var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
} = React;

var LobbyView = React.createClass({

  render: function() {
    /*let block = this.props.name,
    elm = Util.buildElementClasses(block, [
      'heading',
      'basic-btn',
      'float-right',
      'home-img'
    ]);*/

    return ( 
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to Spacetime
        </Text>
        <Button style={styles.findGameButton} onPress={this.playCampaign}>
          Find Game
        </Button>
      </View>
    );

  },

  findGame() {
    window.client.register(false);
    window.client.forceUpdate();
  },
  
  playCampaign() {
    window.client.register(true);
    window.client.forceUpdate();
  },

  showRules() {
    alert("* You start with 1 card, and 3 energy to play cards. \
          \n\n* Every few seconds, you draw, and get more energy. \
          \n\n* Each creature you play attacks every few seconds. \
          \n\n* Creatures attack players, unless you retarget them. Click a creature and then a target to retarget. \
          \n\n* First player to lose all life loses."
         )
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