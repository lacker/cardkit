// React view of a GameState
//import React from 'react';
//import Player from './playerview.js';
//import Card from "./cardview.js"

var Button = require('react-native-button');
var Player = require('./playerview.js');
var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;


let GameView = React.createClass({
    render: function() {
    window.client.forceUpdate = (() => this.forceUpdate())

    let opponent = this.props.state.players[1];
    let homePlayer = this.props.state.players[0];
    
    let opponentBoardCards = opponent.board.map((cardInfo, i) =>
          <Card cardInfo={cardInfo} player={opponent} key={i} />);
    let homePlayerBoardCards = homePlayer.board.map((cardInfo, i) =>
          <Card cardInfo={cardInfo} player={homePlayer} key={i} />);

    let cssEndTurn = window.game.turn == 0 ? 'active-player' : '';
    cssEndTurn = 'end-turn-button'  + ' ' + cssEndTurn;

    return (
        <View className="game-container">
          
          {/* OPPONENT */}
          <Player playerState={opponent} />
          <View onClick={this.selectOpponent} className="player-avatar" style={this.avatarStyle(1)}>
            <Text className="vital-stats-container life-container">Life: {opponent.life}</Text>
            <Text className="player-name">{opponent.name}</Text>
            <Text className="vital-stats-container">Mana: {opponent.mana} / {opponent.maxMana}</Text>
          </View>
          
          {/* MIDDLE OF BOARD */}
          <View className="in-play-area">
            <View className="player-board">
              {opponentBoardCards}
            </View>
            <View className="player-board home-player-board">
              {homePlayerBoardCards}
            </View>
          </View>
          
          <Button className={cssEndTurn} onClick={this.endTurn}>End Turn</Button>
          <Button className="resign-button" onClick={this.resign}>Resign</Button>

          {/* HOME PLAYER */}
          <View className="player-avatar home-avatar" style={this.avatarStyle(0)}>
            <Text className="vital-stats-container">Life: {homePlayer.life}</Text>
            <Text>{homePlayer.name}</Text>
            <Text className="vital-stats-container">Mana: {homePlayer.mana} / {homePlayer.maxMana}</Text>
          </View>
          <Player playerState={homePlayer} />
        
        </View>
        
    );
  },

  resign() {
    window.client.makeLocalMove({"op":"resign"});
  },

  // end and start a new turn when button is activated
  endTurn() {
    let event = new CustomEvent("turnEnded", {});
    window.dispatchEvent(event);
    window.client.makeLocalMove({"op":"refreshCards"});
  },

  // highlight the active player
  avatarStyle(playerNumber) {
    let color = "lightgray";
    let fontWeight = 400;  
    if (playerNumber == this.props.state.turn) {
      color = "black";        
      fontWeight =  800;        
    }
    return {  
             color:color,
             fontWeight:fontWeight,
           };
  },

  selectOpponent() {
    let selectMove = {
                    "op":"selectOpponent"
                 };
    window.client.makeLocalMove(selectMove);
  }

});

module.exports = GameView;