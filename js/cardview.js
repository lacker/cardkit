// React view of a card
import React from "react";
require("../scss/style.scss");

let Card = React.createClass({
  render() {
    
    let cssClassForCard = this.props.hasFocus ? 'playing-card active-card' : 'playing-card';

    if (this.props.cardInfo.hover) {
      cssClassForCard += ' hovered-card';
    }

    return (
        <div className={cssClassForCard} 
             onClick={this.clickCard}
             onMouseOver={this.mouseOver}
             onMouseOut={this.mouseOut}
        >
        {this.props.cardInfo.name}
        <br />
        {this.props.cardInfo.attack}/{this.props.cardInfo.defense}
      </div>
    );
  
  },

  getInitialState: function() {
    return {};
  },

  // Highlight a card onMouseOver if it has any legal plays
  mouseOver: function() {
    var move = {"op":"hover", 
                "from":this.props.fromIndex,
                "active": true,
                 };
    window.client.makeLocalMove(move);
  },
  mouseOut: function() {
    var move = {"op":"hover", 
                "from":this.props.fromIndex,
                "active": false,
                 };
    window.client.makeLocalMove(move);
  },

  // highlight a card when clicked
  clickCard: function() {
    // card can only be highlighted and played if player has enough mana
    if (this.props.cardInfo.cost > this.props.player.mana) {
      return;
    }
    
    this.props.hasFocus = !this.props.hasFocus;
    // play card on 2nd click
    if (!this.props.hasFocus) {
      var move = {"op":"play", 
                  "from":this.props.fromIndex,
                 };
      window.client.makeLocalMove(move);
    } else {
      this.forceUpdate();
    }
  },

});

module.exports = Card;
