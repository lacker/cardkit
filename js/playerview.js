// React view of a PlayerState
import React from "react";
import Card from "./cardview.js"

let Player = React.createClass({
  render() {
    let handCards = this.props.playerState.hand.map((cardInfo, i) =>
      <Card cardInfo={cardInfo} player={this.props.playerState} key={i} />);
    return (
        <div className="hand-container">
          {handCards}
        </div> 
    );
  }
});

module.exports = Player;
