// A global style object
import React from "react";

class GameStyle {
  constructor() {

    this.padding = 20;
    
    this.cardHeight = 100;
    this.cardWidth = 80;

  }

  paddingCSS() {
    return this.padding + 'px';
  }
}

export default GameStyle;