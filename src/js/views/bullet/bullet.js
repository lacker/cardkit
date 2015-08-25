// React view of a bullet
import React from "react";

let Bullet = React.createClass({

  render() {
    
    let divStyle = {
      backgroundColor: '#000',
      width: '30px',
      height: '30px',
      position: 'absolute'
    }

    let combinedCSS = this.cssClassesForBullet();

    return (
      <div className={combinedCSS} style={divStyle}>
      </div>
    );
  
  },

  cssClassesForBullet: function() {

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
  },

});

module.exports = Bullet;
