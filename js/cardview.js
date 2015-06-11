// React view of a card
import React from "react";
require("../scss/style.scss");

let Card = React.createClass({
  render() {
    
    var cssClassForCard = this.props.hasFocus ? 'playing-card active-card' : 'playing-card';
    
    return (
        <div className={cssClassForCard} onClick={this.clickCard}>
        {this.props.state.name}
        <br />
        {this.props.state.attack}/{this.props.state.defense}
      </div>
    );
  
  },

  // highlight a card when clicked
  clickCard: function() {
    this.props.hasFocus = !this.props.hasFocus;
    this.forceUpdate();
  },

});

module.exports = Card;
