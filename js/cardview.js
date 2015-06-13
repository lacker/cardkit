// React view of a card
import React from "react";
require("../scss/style.scss");

let Card = React.createClass({
  render() {

    let cssClassCanPlay = '';
    if (this.props.cardInfo.cost > this.props.player.mana) {
      cssClassCanPlay = "too-expensive";
    }

    let cssClass = this.props.cardInfo.hasFocus ? 
                   'playing-card active-card' : 'playing-card';
    let cssClassAttacked = this.props.cardInfo.hasAttacked ? 
                           'has-attacked-card' : '';
    let cssClassJustPlayed = this.props.cardInfo.enteredPlayThisTurn ? 
                             'just-played-card' : '';
    let combinedCSS = cssClass + ' ' + 
                      cssClassCanPlay + ' ' + 
                      cssClassAttacked + ' ' + 
                      cssClassJustPlayed; 
    return (
        <div className={combinedCSS} onClick={this.clickCard}>
        {this.props.cardInfo.name}
        <br />
        {this.props.cardInfo.attack}/{this.props.cardInfo.defense}
      </div>
    );
  
  },

  // click cards in current player's hand or board
  clickCard: function() {
    
    // ATTACK
    // can click opponent's in play cards
    // after player has clicked his own in play card to attack
    var hasActiveCard = false;
    var fromAttackIndex = 0;
    var attackingCard;
    for (var card of window.game.current().board) {
      if (card.hasFocus) {
        attackingCard = card;
        hasActiveCard = true;
        break;
      }
      fromAttackIndex++;
    }
    var toIndex = window.game.opponent().board.indexOf(this.props.cardInfo);
    if (toIndex != -1 && hasActiveCard) {
      this.attack(fromAttackIndex, toIndex, attackingCard)
      return;      
    }

    // PLAY CARD FROM HAND
    // can click to play cards in hand
    var fromIndex = window.game.current().hand.indexOf(this.props.cardInfo);
    if (fromIndex != -1) {
      this.playFromHand(fromIndex, this.props.cardInfo);
      return;
    }
    
    // HIGHLIGHT CARD, OR SMASH FACE IF ALREADY HIIGHLIGHTED
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
  
  // smash creature's face
  attackCreature: function(fromAttackIndex, toIndex, attackingCard) {
    var move = {"op":"attack", 
                "from":fromAttackIndex,
                "to": toIndex
               };
    window.client.makeLocalMove(move);
    window.client.gameView.forceUpdate();
    attackingCard.hasAttacked = true;
  },

  // highlight a card when clicked, play when double clicked
  playFromHand: function(fromIndex, card) {
    // card can only be highlighted and played if player has enough mana
    if (this.props.cardInfo.cost < this.props.player.mana) {
      let moveClosure = function() {
        var move = {"op":"play", 
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
      var move = {"op":"face", 
                  "from":fromIndex
                 };
      window.client.makeLocalMove(move);
      card.hasAttacked = true;      
    }
    this.highlightOrPlayMove(moveClosure);
  },

  // when a card is clicked, highlight it, play it, or attack with it
  highlightOrPlayMove: function(moveClosure) {
    this.props.cardInfo.hasFocus = !this.props.cardInfo.hasFocus;
    if (!this.props.cardInfo.hasFocus) {
      moveClosure();
      window.client.gameView.forceUpdate();
    } else {
      this.forceUpdate();
    }
  }

});

module.exports = Card;
