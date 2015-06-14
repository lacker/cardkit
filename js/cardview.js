// React view of a card
import React from "react";
require("../scss/style.scss");

let Card = React.createClass({

  // it's a little weird that enteredPlayThisTurn is true
  // even for cards in your hand
  // this is maybe because I don't understand setState well
  getInitialState: function() {
    return {  
              hasFocus: false, 
              hasAttacked: false, 
              enteredPlayThisTurn:true
           };
  },

  // cards blank their state at end of turn  
  componentDidMount: function() {
    var self = this;
    window.addEventListener('turnEnded', function() {
      // #hax
      if (self.isMounted()) {
        self.setState({ 
                        hasAttacked:false, 
                        enteredPlayThisTurn:false, 
                        hasFocus:false
                     });        
      }

    });
  },
  
  // layout and style the card
  render() {
    let combinedCSS = this.cssClassesForCard();

    let handIndex = window.game.current().hand.indexOf(this.props.cardInfo);
    let boardIndex = window.game.current().board.indexOf(this.props.cardInfo);
    let oponnentBoard = window.game.opponent().board.indexOf(this.props.cardInfo);
    // not this player's card or in play
    if (handIndex + boardIndex + oponnentBoard == -3) {
      return (
        <div className={combinedCSS}>
        </div>
      );
    }

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
    let fromIndex = window.game.current().board.indexOf(this.props.cardInfo);
    let cssClassJustPlayed = this.state.enteredPlayThisTurn && fromIndex != -1? 
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
    if (window.game.activeCard) {
      attackingCard = window.game.activeCard;
    }
    let toIndex = window.game.opponent().board.indexOf(this.props.cardInfo);
    if (toIndex != -1 && attackingCard) {
      this.attackCreatureFromIndex(fromAttackIndex, toIndex, attackingCard);
      return true;      
    }
    return false;
  },
  
  // smash creature's face
  attackCreatureFromIndex: function(fromAttackIndex, toIndex, attackingCard) {
    let move = {
                  "op":"attack", 
                  "from":fromAttackIndex,
                  "to": toIndex
               };
    window.client.makeLocalMove(move);
    attackingCard.setState({"hasAttacked": true});
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
  
  // highlight a card when clicked, play when double clicked
  playFromHandIndex: function(fromIndex) {
    // card can only be highlighted and played if player has enough mana
    if (this.props.cardInfo.cost > this.props.player.mana) {
      return;
    }    
    let hasFocus = !this.state.hasFocus;
    if (!hasFocus) { // play or attack with card
      window.client.makeLocalMove({"op":"play", "from":fromIndex});
      this.setState({hasFocus: false, enteredPlayThisTurn: true});
    } else { // just highlight the card
      this.setState({hasFocus: true});
      window.game.activeCard = this;
    }    
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

 // highlight a card when clicked, attack face when double clicked
  clickCardInPlayFromIndex: function(fromIndex) {
    let hasFocus = !this.state.hasFocus;
    if (!hasFocus) {  // play or attack with card
      this.setState({hasFocus: false, hasAttacked: true});
      window.client.makeLocalMove({"op":"face", "from":fromIndex});
    } else {  // just highlight the card
      this.setState({hasFocus: true});
      window.game.activeCard = this;
    }
  }

});

module.exports = Card;
