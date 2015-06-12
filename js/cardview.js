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

  // highlight a card when clicked
  clickCard: function() {
    // card can only be highlighted and played if player has enough mana
    if (this.props.cardInfo.cost <= this.props.player.mana) {
      this.props.hasFocus = !this.props.hasFocus;
      // play card on 2nd click
      if (!this.props.hasFocus) {
        window.game.play(this.props.player.hand.indexOf(this.props.cardInfo));
      }
    }
    this.forceUpdate();
  },

});

module.exports = Card;
