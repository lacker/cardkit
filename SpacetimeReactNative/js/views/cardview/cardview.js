// React view of a card
// require("../scss/style.scss");

var React = require('react-native');
var {
  Text,
  View,
  Image,
} = React;

let Card = React.createClass({

  // layout and style the card
  render() {
    let combinedCSS = this.cssClassesForCard();

    let attackPart;
    if (this.props.cardInfo.attack) {
      attackPart = (
        <View className="card-details">
            <Text>{this.props.cardInfo.description}</Text>
          <View className="attack-label">
            <Text>{this.props.cardInfo.attack}</Text>
            <Image className="card-icon-image" src="img/crossed-swords.svg" />
          </View>
          <View className="health-label">
            <Text>{this.props.cardInfo.defense}</Text>
            <Image className="card-icon-image" src="img/shield.svg" />
          </View>
        </View> 
)
    } else {
      attackPart = (
        <View className="card-details">
          <View className="spell-text-label">
            <Text>{this.props.cardInfo.description}</Text>
          </View>
          <View className="spell-flavor">
            <Text>{this.props.cardInfo.flavor}</Text>
          </View>
        </View>
        )
    }

    return (
      <View className={combinedCSS} onClick={this.selectCard}>
        <View className="card-top"> 
          <Text>{this.props.cardInfo.name}</Text>
          <Text className="mana-label">{this.props.cardInfo.cost}</Text>
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
    let cssClass = window.game.localPlayer().selectedCard == this.props.cardInfo ||
                   window.game.remotePlayer().selectedCard == this.props.cardInfo ? 
                   'playing-card active-card' : 'playing-card';
    let fromIndex = window.game.localPlayer().board.indexOf(this.props.cardInfo);    
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