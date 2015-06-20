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
    window.addEventListener('turnEnded', (event) => {
      // #hax
      if (this.isMounted()) {
        this.setState({ 
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

    let attackPart;
    if (this.props.cardInfo.attack) {
      attackPart = (
        <div className="card-details">
          <div className="attack-label">
            {this.props.cardInfo.attack}
            <img className="card-icon-image" src="img/crossed-swords.svg" />
          </div>
          <div className="health-label">
            {this.props.cardInfo.defense}
            <img className="card-icon-image" src="img/shield.svg" />
          </div>
        </div> 
)
    } else {
      attackPart = (
        <div div className="card-details">
          <div className="spell-text-label">
            {this.props.cardInfo.description}
          </div>
          <div className="spell-flavor">
            {this.props.cardInfo.flavor}
          </div>
        </div>
        )
    }

    return (
      <div className={combinedCSS} onClick={this.clickCard}>
        <div className="card-top"> 
          {this.props.cardInfo.name}
          <div className="mana-label">{this.props.cardInfo.cost}</div>
        </div>
        <div className="card-bottom"> 
          {attackPart}
        </div>
        
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
      window.game.activeCard = null;
    } else if (this.playFromHand()) { 
      window.game.activeCard = null;
    } else this.clickCardInPlay();
   
    if (window.game.winner) {
      alert("WINNER");

    }
  },

  // returns true and executes attacks if click is a creature attack
  attackCreature: function() {
    let fromAttackIndex = 0;
    let toIndex = window.game.opponent().board.indexOf(this.props.cardInfo);
    if (toIndex != -1 && window.game.activeCard != null) {
      console.log(window.game.activeCard)
      this.attackCreatureFromIndex(fromAttackIndex, toIndex, window.game.activeCard);
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
    attackingCard.setState({"hasAttacked": true, hasFocus: false});
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
