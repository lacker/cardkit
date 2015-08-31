// React view of a bullet
import React from "react";

// https://github.com/elierotenberg/react-animate
import Animate from '../../../../node_modules/react-animate';

import * as Util from '../../util';

let Bullet = Animate.extend(class Bullet extends React.Component {

  // set up the animation for the bullet whizzing from
  // this.startLeft(), this.startTop() to 
  // this.endLeft(), this.endTop()
  setAnimation() {    
    this.animationName = 'bullet-zing'

    let startStyle = { 
      borderRadius:'10px', 
      left: this.leftForIndex(this.props.info.startIndex), 
      top: this.startTop(), 
      backgroundColor: '#000', 
      width: '20px', 
      height: '20px',
      position: 'absolute',
      zIndex: '99999', 
    }

    let endStyle = { 
      left: this.endLeft(), 
      top: this.endTop(), 
      backgroundColor: '#FFF', 
    } 

    Animate.animate.call(this,
      this.animationName, 
      startStyle,
      endStyle,
      1000,                // animation duration (in ms)
      { easing: 'linear' } // other options
    );
  }

  // return the y coordinate for where the bullet starts
  startTop() {
    if (this.props.info.player == window.game.localPlayer) {
      return Util.gameHeight / 2 + Util.cardHeight / 2
    }
    return Util.gameHeight / 2 - Util.cardHeight / 2
  }

  // return the y coordinate for where the bullet lands
  endTop() {
    // this branch means an in-play permanent is being attacked
    if (this.props.info.attackIndex >= 0) {
      if (this.props.info.player == window.game.localPlayer) {
        return Util.gameHeight / 2 - Util.cardHeight / 2
      } else {
        return Util.gameHeight / 2 + Util.cardHeight / 2
      }
    }
    // attack the top (remote) player
    if (this.props.info.player == window.game.localPlayer) {
        return 300
    }
    // attack the bottom (local) player
    return 400
  }

  // return the x coordinate for where the bullet lands
  endLeft() {
    if (this.props.info.attackIndex >= 0) {
      console.log(this.leftForIndex(this.props.info.attackIndex))
      return this.leftForIndex(this.props.info.attackIndex)
    } else {
      return 100  // middle of avatar of player
    }
  }

  // starting or ending left pixel position given an index
  leftForIndex(index) {
    switch (index) {
      case 0:
        return Util.gameWidth*.75 - Util.cardWidth/2 - 15
      case 1:
        return Util.gameWidth*.75 - Util.cardWidth/2 - Util.cardWidth - 30
      case 2:
        return Util.gameWidth*.75 - Util.cardWidth/2 + Util.cardWidth
      case 3:
        return Util.gameWidth*.75 - Util.cardWidth/2 - Util.cardWidth * 2 - 45
      case 4:
        return Util.gameWidth*.75 - Util.cardWidth/2 + Util.cardWidth * 2 + 20
      case 5:
        return Util.gameWidth*.75 - Util.cardWidth/2 - Util.cardWidth * 3 - 60
      case 6:
        return Util.gameWidth*.75 - Util.cardWidth/2 + Util.cardWidth * 3 + 35
    }
  }

  render() {
    if (!this.animationName) {
      this.setAnimation()
    }
    return (
      <div style={Animate.getAnimatedStyle.call(this, this.animationName)}>
      </div>
    );
  }

});

module.exports = Bullet;
