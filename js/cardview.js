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

    // can click to play cards in hand
    var fromIndex = window.game.current().hand.indexOf(this.props.cardInfo);
    if (fromIndex != -1) {
      this.playFromHand(fromIndex, this.props.cardInfo);
      return;
    }
    
    // can click a card in play if it's in the player's board
    // and it's not summoning sick or already attacked
    fromIndex = window.game.current().board.indexOf(this.props.cardInfo);
    if (fromIndex != -1 && 
        !this.props.cardInfo.enteredPlayThisTurn &&
        !this.props.cardInfo.hasAttacked) {
      this.clickCardInPlay(fromIndex, this.props.cardInfo);
      return;
    }

    // if it's not in their hand or board, then do nothing

  },

  // highlight a card when clicked, play when double clicked
  playFromHand: function(fromIndex, card) {
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
      window.client.gameView.forceUpdate();
      card.enteredPlayThisTurn = true;
    } else {
      this.forceUpdate();
    }
  },

  // highlight a card when clicked, play when double clicked
  clickCardInPlay: function(fromIndex, card) {
    
    this.props.hasFocus = !this.props.hasFocus;
    // attack face on second click
    if (!this.props.hasFocus) {
      var move = {"op":"face", 
                  "from":fromIndex
                 };
      window.client.makeLocalMove(move);
      window.client.gameView.forceUpdate();
      card.hasAttacked = true;
    } else {
      this.forceUpdate();
    }
  }

});

module.exports = Card;
