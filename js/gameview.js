// React view of a GameState
import React from 'react';

import Player from './playerview.js';
import GameStyle from "./style";


let GameView = React.createClass({
  render() {
    return (
        <div style={this.gameContainerStyle()}>
          
          <Player playerState={this.props.state.players[1]} />
          <div style={this.avatarStyle(1)}>
            Computer
          </div>
          
          <div style={this.liveCardsStyle()}>
          </div>
          
          <div style={this.avatarStyle(0)}>
            Me
          </div>
          <Player playerState={this.props.state.players[0]} />
        
        </div>
        
    );
  },

  avatarStyle(playerNumber) {
    var gameStyle = new GameStyle();
    var color = "lightgray";
    var fontWeight = 400;  
    // highlight the active player
    if (playerNumber == this.props.state.turn) {
      color = "black";        
      fontWeight =  800;        
    }
    return {  
              padding:gameStyle.paddingCSS(), 
              margin:gameStyle.paddingCSS() + " auto", 
              width:gameStyle.cardWidth + gameStyle.padding*2,
              color:color,
              "fontWeight":fontWeight, 
              "borderRadius":"6px",
              "backgroundColor":"white"
           };
  },

  // color and center the game
  gameContainerStyle() {
    return {
              "textAlign":"center", 
              "backgroundColor":"green", 
              "width":"1024px"
           };
  },


  // area for cards to be played in center
  liveCardsStyle() {
    var gameStyle = new GameStyle();
    var padding = gameStyle.padding;
    var cardHeight = gameStyle.cardHeight;
    var height = padding*3 + cardHeight*2; 
    var width = gameStyle.cardWidth * 8 + padding*2;
    height = height + "px"
    return {
              "textAlign":"center", 
              "backgroundColor":"black", 
              "height":height,
              "width":"900px",
              "margin": "0 auto"
           };
  }


});

module.exports = GameView;
