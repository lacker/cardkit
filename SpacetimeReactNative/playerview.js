// React view of a PlayerState
var Card = require('./cardview.js');

var React = require('react-native');
var {
  View,
} = React;

let Player = React.createClass({
  render() {
    let handCards = this.props.playerState.hand.map((cardInfo, i) =>
      <Card cardInfo={cardInfo} player={this.props.playerState} key={i} />);
    return (
        <View className="hand-container">
          {handCards}
        </View> 
    );
  }
});

module.exports = Player;
