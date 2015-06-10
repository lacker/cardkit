// React view of a card
import React from "react";
import GameStyle from "./style";

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
    var gameStyle = new GameStyle();
    return { display: "inline-block",
             backgroundColor: "gray", 
             border: "1px solid",
             borderRadius: "6px",
             padding: gameStyle.paddingCSS(),
             width: gameStyle.cardWidth, 
             height: gameStyle.cardHeight, 
           };
  },
});

module.exports = Card;
