// React view of a PlayerState
var React = require('react-native');
var {
  View,
} = React;
var Card = require('../cardview/cardview');

let Player = React.createClass({
  render() {
  	let handCards
  	if (this.props.playerState.hand) {
      handCards = this.props.playerState.hand.map((cardInfo, i) =>
      <Card cardInfo={cardInfo} player={this.props.playerState} key={i} />);

  	}
  	//  className="hand-container"
    return (
        <View>
          {handCards}
        </View> 
    );
  }
});

module.exports = Player;