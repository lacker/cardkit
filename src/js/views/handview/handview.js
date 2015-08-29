// React view of a PlayerState
import React, { Component } from "react";
import Card from "../cardview/cardview"
import './_handview.scss';

export default class Hand extends Component {
  render() {
    const handCards = this.props.playerState.hand.map((cardInfo, i) =>
      <Card 
      	cardInfo={cardInfo}
      	player={this.props.playerState}
        disabled={cardInfo.cost > this.props.playerState.mana}
      	key={i}
      />);
    return (
        <div className="hand-container">
          {handCards}
        </div> 
    );
  }
}

