// React view of a card
import React from "react";
require("../scss/style.scss");

let Card = React.createClass({
  render() {
    
    let cssClassForCard = this.props.hasFocus ? 'playing-card active-card' : 'playing-card';
    return (
        <div className={cssClassForCard} onClick={this.clickCard}>
        {this.props.cardInfo.name}
        <br />
        {this.props.cardInfo.attack}/{this.props.cardInfo.defense}
      </div>
    );
  
  },

  // click cards in current player's hand or board
  clickCard: function() {
    var fromIndex = window.game.current().hand.indexOf(this.props.cardInfo);
    if (fromIndex != -1) {
      playFromHand(fromIndex);
      return;
    }
    
    fromIndex = window.game.current().board.indexOf(this.props.cardInfo);
    if (fromIndex != -1) {
      clickCardInPlay(fromIndex);
      return;
    }

    // if it's not in their hand or board, then do nothing

  },

  // highlight a card when clicked, play when double clicked
  playFromHand: function(fromIndex) {
    // card can only be highlighted and played if player has enough mana
    if (this.props.cardInfo.cost > this.props.player.mana) {
      return;
    }
    
    this.props.hasFocus = !this.props.hasFocus;
    // play card on 2nd click
    if (!this.props.hasFocus) {
      var move = {"op":"play", 
                  "from":fromIndex
                 };
      window.client.makeLocalMove(move);
    } else {
      this.forceUpdate();
    }
  },

  // highlight a card when clicked, play when double clicked
  clickCardInPlay: function(fromIndex) {
    
    this.props.hasFocus = !this.props.hasFocus;
    // attack face on second click
    if (!this.props.hasFocus) {
      var move = {"op":"face", 
                  "from":fromIndex
                 };
      window.client.makeLocalMove(move);
    } else {
      this.forceUpdate();
    }
  }

});

module.exports = Card;
