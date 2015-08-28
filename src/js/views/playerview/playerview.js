// React view of a PlayerState
import React, { Component } from "react";
import Card from "../cardview/cardview"
import './_playerview.scss';

export default class Player extends Component {
  render() {
    let handCards = this.props.playerState.hand.map((cardInfo, i) =>
      <Card cardInfo={cardInfo} player={this.props.playerState} key={i} />);
    return (
        <div className="hand-container">
          {handCards}
        </div> 
    );
  }
}

