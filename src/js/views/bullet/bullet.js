// React view of a bullet
import React from "react";

import Animate from '../../../../node_modules/react-animate';

let Bullet = Animate.extend(class Bullet extends React.Component {
  fadeIn() {
    Animate.animate.call(this,
      'my-custom-animation', // animation name
      { borderRadius:15, left:this.props.startLeft, top:this.props.startTop, backgroundColor: '#000', width: '30px', height: '30px',position: 'absolute'}, // initial style
      { left:this.props.endLeft, top:this.props.endTop, backgroundColor: '#000', width: '30px', height: '30px',position: 'absolute' }, // final style
      1000, // animation duration (in ms)
      { easing: 'linear' } // other options
    );
  };
  

/*      let animationName = 'bullet-zing-' + i
      animations[i] = function () {
        Animate.animate.call(this,
        animationName, 
        { position:'absolute', top:tops[i], left:lefts[i] }, // initial style
        { position:'absolute', top:0, left:0  }, // final style
        1000, 
        { easing: 'linear' } 
      );
      }*/


  render() {
    this.fadeIn()
    return (
      <div style={Animate.getAnimatedStyle.call(this, 'my-custom-animation')}>
      </div>
    );
  
  }

  cssClassesForBullet() {

    let player = this.props.bullet.player;
    let fromIndex = this.props.bullet.startIndex;
    let cssPlacementClass = '';
    if (fromIndex != -1) {
      cssPlacementClass = "card-slot-" + fromIndex;
    }
    let cssClassDamage = '';
        if (this.props.bullet.attackIndex) {
      console.log("attacking index " + this.props.cardInfo.attackIndex)
      cssClassDamage = "card-slot-" + this.props.cardInfo.attackIndex;      
      if (player.name == window.game.localPlayer().name) {
        cssClassDamage = cssClassDamage + " " + "attack-up";
      } else {
        cssClassDamage = cssClassDamage + " " + "attack-down";
      }
    } else {
      cssClassDamage = "damage-player";
      if (player.name == window.game.localPlayer().name) {
        cssClassDamage = cssClassDamage + " " + "attack-top";
      } else {
        cssClassDamage = cssClassDamage + " " + "attack-bottom";
      }      
    }
    
    let combinedCSS = cssPlacementClass + ' ' + 
                      cssClassDamage; 
    return combinedCSS;
  }

});

module.exports = Bullet;
