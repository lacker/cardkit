// React view of a bullet
import React from "react";

// https://github.com/elierotenberg/react-animate
import Animate from 'react-animate';

let Bullet = Animate.extend(class Bullet extends React.Component {

  // set up the animation for the bullet whizzing from
  // this.startLeft(), this.startTop() to 
  // this.endLeft(), this.endTop()
  setAnimation() {    
    this.animationName = 'laser'
    
    let x1 = this.leftForIndex(this.props.info.startIndex)
    let x2 = -150
    if (this.props.info.attackIndex >= 0) {
      x1 = this.leftForIndex(this.props.info.startIndex) + 180
      x2 = this.leftForIndex(this.props.info.attackIndex) + 180
    } 
    let centerX = (x1 + x2) / 2
    centerX = centerX + 'px'

    let y1 = this.startTop()
    let y2 = this.endTop()
    let centerY = (y1 + y2) / 2
    centerY = centerY + 'px'

    let angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
    let transform = 'rotate('+angle+'deg)'; 

    let distance = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
    distance = Math.floor(distance) + 'px'

    let startStyle = { 
      padding: '0px', 
      margin: '0px', 
      height: '2px', 
      backgroundColor:'red',
      lineHeight: '1px', 
      position: 'absolute', 
      opacity: 1,
      zIndex: '99999', 
      width: distance, 
      left: centerX, 
      top: centerY,
      transform: transform
    }

    let endStyle = { 
      opacity: 0,
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
      return document.body.offsetHeight / 2 + this.cardHeight / 2 - 200
    }
    return document.body.offsetHeight / 2 - this.cardHeight / 2 - 250
  }

  // return the y coordinate for where the bullet lands
  endTop() {
    // this branch means an in-play permanent is being attacked
    if (this.props.info.attackIndex >= 0) {
      if (this.props.info.player == window.game.localPlayer) {
        return document.body.offsetHeight / 2 - this.cardHeight / 2 - 200
      } else {
        return document.body.offsetHeight / 2 + this.cardHeight / 2 - 200
      }
    }
    // attack the top (remote) player
    if (this.props.info.player == window.game.localPlayer) {
        return 100
    }
    // attack the bottom (local) player
    return 300
  }

  // starting or ending left pixel position given an index
  leftForIndex(index) {
    let baseWidth = document.body.offsetWidth*.75/2 - this.cardWidth/2
    switch (index) {
      case 0:
        return baseWidth - 90
      case 1:
        return baseWidth - this.cardWidth - 60
      case 2:
        return baseWidth + this.cardWidth - 60
      case 3:
        return baseWidth - this.cardWidth * 2 - 60
      case 4:
        return baseWidth + this.cardWidth * 2 - 60
      case 5:
        return baseWidth - this.cardWidth * 3 - 60
      case 6:
        return baseWidth + this.cardWidth * 3 - 60
    }
  }

  componentDidMount() {
    // this.cardWidth = React.findDOMNode(this.props.cardInfo).offsetWidth;
    // this.cardHeight = React.findDOMNode(this.props.cardInfo).offsetHeight;
  }

  render() {
    this.cardWidth = 92
    this.cardHeight = 120

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
