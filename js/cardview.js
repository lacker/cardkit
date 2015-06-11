// React view of a card
import React from "react";
require("../scss/style.scss");

let Card = React.createClass({
  render() {
    return (
        <div className="playing-card">
        {this.props.state.name}
        <br />
        {this.props.state.attack}/{this.props.state.defense}
      </div>

    );
  }

});

module.exports = Card;
