// React view of a PlayerState
import React from "react";
import Card from "./cardview.js"

let Player = React.createClass({
  render() {
    let mana = this.props.playerState.mana;  
    let maxMana = this.props.playerState.maxMana;  
    let handCards = this.props.playerState.hand.map(function (cardInfo, i) {
      return (
          <Card cardInfo={cardInfo} player={this.props.playerState} key={i} />
      );
    }.bind(this));

    return (
        <div>
          {handCards}
          Mana: {mana} / {maxMana}
        </div> 

    );
  }

});

module.exports = Player;
