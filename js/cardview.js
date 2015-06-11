// React view of a card
import React from "react";
require("../scss/style.scss");

let Card = React.createClass({
  render() {
    var cardState = this.props.active ? 'playing-card active-card' : 'playing-card';
    console.log(cardState)
    return (
        <div className={cardState} onClick={this.handleClick}>
        {this.props.state.name}
        <br />
        {this.props.state.attack}/{this.props.state.defense}
      </div>

    );
  },
  handleClick: function() {
    this.props.active = !this.props.active;
    this.forceUpdate();
  },

});

module.exports = Card;
