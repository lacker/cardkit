// React view of a card
// require("../scss/style.scss");

var React = require('react-native');
var {
  View,
} = React;

let Card = React.createClass({

  // layout and style the card
  render() {
    let combinedCSS = this.cssClassesForCard();

    let attackPart;
    if (this.props.cardInfo.attack) {
      attackPart = (
        <View className="card-details">
            {this.props.cardInfo.description}
          <View className="attack-label">
            {this.props.cardInfo.attack}
            <img className="card-icon-image" src="img/crossed-swords.svg" />
          </View>
          <View className="health-label">
            {this.props.cardInfo.defense}
            <img className="card-icon-image" src="img/shield.svg" />
          </View>
        </View> 
)
    } else {
      attackPart = (
        <View className="card-details">
          <View className="spell-text-label">
            {this.props.cardInfo.description}
          </View>
          <View className="spell-flavor">
            {this.props.cardInfo.flavor}
          </View>
        </View>
        )
    }

    return (
      <View className={combinedCSS} onClick={this.selectCard}>
        <View className="card-top"> 
          {this.props.cardInfo.name}
          <View className="mana-label">{this.props.cardInfo.cost}</View>
        </View>
        <View className="card-bottom"> 
          {attackPart}
        </View>
        
      </View>
    );
  
  },

  // style the card based on if it has attacked, is castable, etc
  cssClassesForCard: function() {
    let cssClassCanPlay = '';
    if (this.props.cardInfo.cost > this.props.player.mana) {
      cssClassCanPlay = "too-expensive";
    }
    let cssClass = window.game.current().selectedCard == this.props.cardInfo ||
                   window.game.opponent().selectedCard == this.props.cardInfo ? 
                   'playing-card active-card' : 'playing-card';
    let fromIndex = window.game.current().board.indexOf(this.props.cardInfo);    
    let cssClassCanAct = !this.props.cardInfo.canAct && fromIndex != -1 ? 
                           'has-attacked-card' : '';

    let combinedCSS = cssClass + ' ' + 
                      cssClassCanPlay + ' ' + 
                      cssClassCanAct; 
    return combinedCSS;
  },
  
  // select cards in current player's hand or board
  selectCard: function() {
    let boardIndex = window.game.current().board.indexOf(this.props.cardInfo);
    if (boardIndex != -1) {
      let selectMove = {
                    "op": "selectCard", 
                    "index": boardIndex,
                    "containerType": "board"
                 };
      window.client.makeLocalMove(selectMove);
    }

    let handIndex = window.game.current().hand.indexOf(this.props.cardInfo);
    if (handIndex != -1) {
      let selectMove = {
                    "op":"selectCard", 
                    "index":handIndex,
                    "containerType": "hand"
                 };
      window.client.makeLocalMove(selectMove);
    }

    let opponentBoardIndex = window.game.opponent().board.indexOf(this.props.cardInfo);
    if (opponentBoardIndex != -1) {
      let selectMove = {
                    "op":"selectCard", 
                    "index":opponentBoardIndex,
                    "containerType": "opponentBoard"
                 };
      window.client.makeLocalMove(selectMove);
    }

    if (window.game.winner) {
      alert("WINNER");

    }
  },

});

module.exports = Card;
