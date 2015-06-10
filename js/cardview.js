// React view of a card
import React from "react";

let Card = React.createClass({
  render() {
    return (
        <div style={this.getStyle()}>
        {this.props.state.name}
        <br />
        {this.props.state.attack}/{this.props.state.defense}
      </div>

    );
  },

  getStyle() {
    return { display: "inline",
             float: "left",
             padding: 5,
             backgroundColor: "gray", 
             width: 100, 
             height: 100, 
             border: "solid",
           };
  },
});

module.exports = Card;
