// React view of a bullet
import React from "react";

// https://github.com/elierotenberg/react-animate
import Animate from '../../../../node_modules/react-animate';

let Bullet = Animate.extend(class Bullet extends React.Component {

  animationKey() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( let i=0; i < 32; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  setAnimation() {
    let gameHeight = 768;
    let gameWidth = 1024;
    let cardWidth = 80;
    let cardHeight = 120;
    let playerHeight = 120;
    let left, top;
    switch (this.props.info.startIndex) {
      case 0:
      left = gameWidth/2 - cardWidth/2
      break;
      case 1:
      left = gameWidth/2 - cardWidth/2 - cardWidth
      break;
      case 2:
      left = gameWidth/2 - cardWidth/2 + cardWidth
      break;
      case 3:
      left = gameWidth/2 - cardWidth/2 - cardWidth * 2
      break;
      case 4:
      left = gameWidth/2 - cardWidth/2 + cardWidth * 2
      break;
      case 5:
      left = gameWidth/2 - cardWidth/2 - cardWidth * 3
      break;
      case 6:
      left = gameWidth/2 - cardWidth/2 + cardWidth * 3
      break;
      case 7:
      left = gameWidth/2 - cardWidth/2 - cardWidth * 4
      break;
    }
    let endTop;
    let endLeft = gameWidth/2 - cardWidth/2
    if (this.props.info.player == window.game.localPlayer()) {
      top = gameHeight / 2 + cardHeight / 2
      endTop = 0 + playerHeight/2
    } else {
      top = gameHeight / 2 - cardHeight / 2
      endTop = gameHeight - playerHeight/2
    }

    this.animationName = 'bullet-zing' + this.animationKey()
    let startStyle = { borderRadius:'10px', 
      left:left, 
      top:top, 
      backgroundColor: '#000', 
      width: '20px', 
      height: '20px',
      position: 'absolute'
    }

    let endStyle = { left:endLeft, 
      top:endTop, 
      backgroundColor: '#FFF', 
    } 

    Animate.animate.call(this,
      this.animationName, 
      startStyle,
      endStyle,
      1000, // animation duration (in ms)
      { easing: 'linear' } // other options
    );
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
