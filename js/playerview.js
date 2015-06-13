// React view of a PlayerState
import React from "react";
import Card from "./cardview.js"

let Player = React.createClass({
  render() {
    let life = this.props.playerState.life;  
    let mana = this.props.playerState.mana;  
    let maxMana = this.props.playerState.maxMana;  
    let handCards = this.props.playerState.hand.map((cardInfo, i) =>
      <Card cardInfo={cardInfo} player={this.props.playerState} key={i} />);
    return (
        <div>
          {handCards}
          <div className="life-container">Life: {life}</div>
          <div className="life-container">Mana: {mana} / {maxMana}</div>
        </div> 

    );
  }

});

module.exports = Player;
