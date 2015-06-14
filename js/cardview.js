// React view of a card
import React from "react";
require("../scss/style.scss");

let Card = React.createClass({
  getInitialState: function() {
    return {  hasFocus: false, 
              hasAttacked: false, 
              enteredPlayThisTurn:true
           };
  },
  
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
    let cssClass = this.state.hasFocus ? 
                   'playing-card active-card' : 'playing-card';
    let cssClassAttacked = this.state.hasAttacked ? 
                           'has-attacked-card' : '';
    let cssClassJustPlayed = this.state.enteredPlayThisTurn ? 
                             'just-played-card' : '';
    let combinedCSS = cssClass + ' ' + 
                      cssClassCanPlay + ' ' + 
                      cssClassAttacked + ' ' + 
                      cssClassJustPlayed; 
    return combinedCSS;
  },

  // click cards in current player's hand or board
  clickCard: function() {
    if (this.attackCreature()) { 
    } else if (this.playFromHand()) { 
    } else this.clickCardInPlay();
   
    if (window.game.winner) {
      alert("WINNER");
    }
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
      this.attackCreatureFromIndex(fromAttackIndex, toIndex, attackingCard);
      this.unhighlightAllCards();
      return true;      
    }
    return false;
  },

  // returns true and plays card if click is a play from hand
  playFromHand: function() {
    let fromIndex = window.game.current().hand.indexOf(this.props.cardInfo);
    if (fromIndex != -1) {
      this.playFromHandIndex(fromIndex);
      return true;
    }
    return false;
  },
  
  // set all cards hasFocus to false, except currentCard
  // currentCard can be left null
  unhighlightAllCards: function(currentCard) {
    let event = new CustomEvent("unhighlight", {});
    window.dispatchEvent(event);
    if (currentCard) {
      currentCard.setState({hasFocus:true});
    }

  },

  componentDidMount: function() {
    window.addEventListener('unhighlight', this.unhighlight);
    window.addEventListener('turnEnded', this.turnEnded);
  },

  turnEnded: function() {
    this.setState({hasAttacked:false});
    this.setState({enteredPlayThisTurn:false});
    this.setState({hasFocus:false});
  },

  unhighlight: function() {
    this.setState({hasFocus:false});
  },

  // highlight card when clicked, or smash face if already highlighted
  clickCardInPlay: function() {
    let fromIndex = window.game.current().board.indexOf(this.props.cardInfo);
    if (fromIndex != -1 && 
        !this.state.enteredPlayThisTurn &&
        !this.state.hasAttacked) {
      this.clickCardInPlayFromIndex(fromIndex);
    }
  },

  // smash creature's face
  attackCreatureFromIndex: function(fromAttackIndex, toIndex, attackingCard) {
    let move = {"op":"attack", 
                "from":fromAttackIndex,
                "to": toIndex
               };
    window.client.makeLocalMove(move);
    attackingCard.setState({"hasAttacked": true});
  },

  // highlight a card when clicked, play when double clicked
  playFromHandIndex: function(fromIndex) {
    // card can only be highlighted and played if player has enough mana
    if (this.props.cardInfo.cost <= this.props.player.mana) {
      let self = this;
      let moveClosure = function() {
        let move = {"op":"play", 
                    "from":fromIndex
                   };
        window.client.makeLocalMove(move);
        self.setState({"enteredPlayThisTurn": true});
      }
      this.highlightOrPlayMove(moveClosure);    
    }
  },

  // highlight a card when clicked, attack face when double clicked
  clickCardInPlayFromIndex: function(fromIndex) {
    let self = this;
    let moveClosure = function() {
      let move = {"op":"face", 
                  "from":fromIndex
                 };
      window.client.makeLocalMove(move);
      self.setState({"hasAttacked": true});
    }
    this.highlightOrPlayMove(moveClosure);
  },

  // when a card is clicked, highlight it, play it, or attack with it
  highlightOrPlayMove: function(moveClosure) {
    let hasFocus = !this.state.hasFocus;
    if (!hasFocus) { // play or attack with card
      moveClosure();
      this.unhighlightAllCards();
    } else { // just highlight the card
      this.unhighlightAllCards(this);
    }
  }

});

module.exports = Card;
