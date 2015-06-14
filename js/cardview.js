// React view of a card
import React from "react";
require("../scss/style.scss");

let Card = React.createClass({
  render() {

    let combinedCSS = this.cssClassesForCard();
    return (
      <div className={combinedCSS} onClick={this.clickCard}>
        {this.props.cardInfo.name}
        <br />
        {this.props.cardInfo.attack}/{this.props.cardInfo.defense}
      </div>
    );
  
  },

  // style the card based on if it has attacked, is castable, etc
  cssClassesForCard: function() {
    let cssClassCanPlay = '';
    if (this.props.cardInfo.cost > this.props.player.mana) {
      cssClassCanPlay = "too-expensive";
    }
    let cssClass = this.hasFocus ? 
                   'playing-card active-card' : 'playing-card';
    let cssClassAttacked = this.hasAttacked ? 
                           'has-attacked-card' : '';
    let cssClassJustPlayed = this.enteredPlayThisTurn ? 
                             'just-played-card' : '';
    let combinedCSS = cssClass + ' ' + 
                      cssClassCanPlay + ' ' + 
                      cssClassAttacked + ' ' + 
                      cssClassJustPlayed; 
    return combinedCSS;
  },

  // click cards in current player's hand or board
  clickCard: function() {
    if (this.attackCreature()) { }
    else if (this.playFromHand()) { }
    else this.clickCardInPlay()
  },

  // returns true and executes attacks if click is a creature attack
  attackCreature: function() {
    let fromAttackIndex = 0;
    let attackingCard;
    for (let card of window.game.current().board) {
      if (card.hasFocus) {
        attackingCard = card;
        break;
      }
      fromAttackIndex++;
    }
    
    let toIndex = window.game.opponent().board.indexOf(this.props.cardInfo);
    if (toIndex != -1 && attackingCard) {
      this.attackCreature(fromAttackIndex, toIndex, attackingCard);
      this.unhighlightAllCards();
      return true;      
    }
    return false;
  },

  // returns true and plays card if click is a play from hand
  playFromHand: function() {
    let fromIndex = window.game.current().hand.indexOf(this.props.cardInfo);
    if (fromIndex != -1) {
      this.playFromHand(fromIndex, this.props.cardInfo);
      return true;
    }
    return false;
  },
  
  // set all cards hasFocus to false, except currentCard
  // currentCard can be left null
  unhighlightAllCards: function(currentCard) {
    for (let card of window.game.current().board) {
      if (card != currentCard) {
        card.setState({hasFocus: false});
      }
    }
    for (let card of window.game.current().hand) {
      if (card != currentCard) {
        card.setState({hasFocus: false});
      }
    }

  },

  // highlight card when clicked, or smash face if already highlighted
  clickCardInPlay: function() {
    fromIndex = window.game.current().board.indexOf(this.props.cardInfo);
    if (fromIndex != -1 && 
        !this.enteredPlayThisTurn &&
        !this.hasAttacked) {
      this.clickCardInPlay(fromIndex, this.props.cardInfo);
    }
  },

  // smash creature's face
  attackCreature: function(fromAttackIndex, toIndex, attackingCard) {
    let move = {"op":"attack", 
                "from":fromAttackIndex,
                "to": toIndex
               };
    window.client.makeLocalMove(move);
    attackingCard.hasAttacked = true;
  },

  // highlight a card when clicked, play when double clicked
  playFromHand: function(fromIndex, card) {
    // card can only be highlighted and played if player has enough mana
    if (card.cost <= this.props.player.mana) {
      let moveClosure = function() {
        let move = {"op":"play", 
                    "from":fromIndex
                   };
        window.client.makeLocalMove(move);
        card.enteredPlayThisTurn = true;
      }
      this.highlightOrPlayMove(moveClosure);    
    }
  },

  // highlight a card when clicked, attack face when double clicked
  clickCardInPlay: function(fromIndex, card) {
    let moveClosure = function() {
      let move = {"op":"face", 
                  "from":fromIndex
                 };
      window.client.makeLocalMove(move);
      card.hasAttacked = true;      
    }
    this.highlightOrPlayMove(moveClosure);
  },

  // when a card is clicked, highlight it, play it, or attack with it
  highlightOrPlayMove: function(moveClosure) {
    this.setState({hasFocus: !this.hasFocus});
    if (!this.hasFocus) { // play or attack with card
      moveClosure();
      this.unhighlightAllCards();
    } else { // just highlight the card
      this.unhighlightAllCards(this);
    }
  }

});

module.exports = Card;
