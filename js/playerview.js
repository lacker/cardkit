// React view of a PlayerState
import React from "react";

import Card from "./cardview.js"

let Player = React.createClass({
  render() {
    var handCards = this.props.playerState.hand.map(function (card, i) {
      return (
          <Card state={card} key={i} />
      );
    });

    return (
        <div style={this.getStyle()}>
        {handCards}
      </div>

    );
  },

  getStyle() {
    return {clear:"both"};
  }
});

module.exports = Player;
