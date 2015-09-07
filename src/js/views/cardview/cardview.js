// React view of a card
import React, { Component, PropTypes } from "react";
import { CARDS } from '../../cards';
import classNames from 'classnames';
import "./_cardview.scss";
import { shieldImg, swordsImg } from '../../../assets/img'
import * as Util from '../../util';

export default class Card extends Component{

  static propTypes = {
    cardInfo: PropTypes.shape({
      canAct: PropTypes.bool.isRequired,
      warm: PropTypes.number,
      name: PropTypes.string.isRequired,
      cost: PropTypes.number.isRequired,
      permanent: PropTypes.bool.isRequired,
      description: PropTypes.string,
      flavor: PropTypes.string,
    })
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


  // return the y coordinate for where the bullet starts
  startTop() {
    if (this.props.cardInfo.playerName == window.game.localPlayer.name) {
      return Util.gameHeight / 2 + Util.cardHeight / 2
    }
    return Util.gameHeight / 2 - Util.cardHeight / 2
  }


  endTop() {
    // this branch means an in-play permanent is being attacked
    if (this.props.cardInfo.attackTarget) {
      if (this.props.cardInfo.playerName == window.game.localPlayer.name) {
        return Util.gameHeight / 2 - Util.cardHeight / 2
      } else {
        return Util.gameHeight / 2 + Util.cardHeight / 2
      }
    }
    // attack the top (remote) player
    if (this.props.cardInfo.playerName == window.game.localPlayer.name) {
        return 150
    }
    // attack the bottom (local) player
    return 500
  }

  render() {

    const localCard = game.localPlayer.selectedCard;
    let player = window.game.playerForName(this.props.cardInfo.playerName)
    let fromIndex = player.board.indexOf(this.props.cardInfo);  
    let cssPlacementClass
    if (fromIndex != -1) {
      cssPlacementClass = "card-slot-" + fromIndex;
    }
    let classes = classNames(
      'card',
      {'card--disabled': this.props.disabled},
      {'card--active': (localCard && localCard.guid == this.props.cardInfo.guid)},
      {'card--used': !this.props.cardInfo.canAct && this.props.used},
      cssPlacementClass,
      {'card--damaged': this.props.cardInfo.showDamage}
    );
    let cardBody = this.props.cardInfo.permanent ?
      (<div>
        <div className="card__attack-stat">
          {this.props.cardInfo.attack}
          <img className="card__icon" src={swordsImg} />
        </div>
        <div className="card__defense-stat">
          {this.props.cardInfo.defense}
          <img className="card__icon" src={shieldImg} />
        </div>
      </div> 
    ) : (
        <div>
          <div className="card__main-info">
            {this.props.cardInfo.description}
          </div>
          <div className="card__sub-info">
            {this.props.cardInfo.flavor}
          </div>
        </div>
    );
    let warmNumber = this.props.cardInfo.warm + .2
    if (!window.game.inPlay(this.props.cardInfo)) {
      warmNumber = 0
    }
    let divStyle = {}
    if (window.game.inPlay(this.props.cardInfo)) {
      divStyle = {
        height:60,
        borderRadius:60,
        borderTopStyle: "solid",
        borderTopWidth: "10px",
        borderTopColor: "rgba(255,0,0," + warmNumber + ")"
      }
      let maxDefense = CARDS[this.props.cardInfo.name].defense
      if (maxDefense > 1) {
        let currentDefense =  this.props.cardInfo.defense
        let ratio = parseFloat(currentDefense - 1)/(maxDefense-1)
        divStyle.boxShadow = "0 0 80px rgba(0,255,0," + ratio + ")"
      }
    }

    if (fromIndex >= 0 && 
        window.game.inPlay(this.props.cardInfo.attackTarget)) {
 
       let x1 = this.leftForIndex(fromIndex)
       let y1 = this.startTop()
        
       let opp = window.game.opponentForName(this.props.cardInfo.playerName)
       let toIndex = opp.board.indexOf(this.props.cardInfo.attackTarget);  

       let x2 = this.leftForIndex(toIndex)
       let y2 = this.endTop()
       let slopeDegrees = Math.atan2((y2-y1) , (x2-x1)) * (180/Math.PI) + 90
       divStyle.transform = 'rotate('+slopeDegrees+'deg)'; 
    } else {
       let x1 = this.leftForIndex(fromIndex)
       let y1 = this.startTop()
        
       let opp = window.game.opponentForName(this.props.cardInfo.playerName)
       let toIndex = opp.board.indexOf(this.props.cardInfo.attackTarget);  

       let x2 = 100
       let y2 = this.endTop()

       let slope = (y2-y1) / (x2-x1)
       let slopeDegrees = Math.atan2((y2-y1) , (x2-x1)) * (180/Math.PI) + 90
       divStyle.transform = 'rotate('+slopeDegrees+'deg)'; 

    }


    if (window.game.inPlay(this.props.cardInfo)) {
      let new_classes = classNames(
      'card',
      {'card--disabled': this.props.disabled},
      {'card--active': (localCard && localCard.guid == this.props.cardInfo.guid)},
      {'card--used': !this.props.cardInfo.canAct && this.props.used},
      cssPlacementClass,
      {'card--hiddenCard': true},
      {'card--damaged': this.props.cardInfo.showDamage}
    );
      let imageName = this.props.cardInfo.imageName;
      if (this.props.cardInfo.defense < CARDS[this.props.cardInfo.name].defense) {
        imageName += "-damaged"
      }
      let shipStyle = {
          backgroundImage: 'url(' + '/../../images/' + imageName + '.png)',
      };

      return (

      <div className={new_classes} onClick={this.selectCard} style={divStyle}>
        <div className="ship-sprite" style={shipStyle}> 
        </div>
      </div>
      )

    }
    return (

      <div className={classes} onClick={this.selectCard} style={divStyle}>
        <div className="card__title"> 
          <span className="card__name">{this.props.cardInfo.name}</span>
          <span className="card__energy">{this.props.cardInfo.cost}</span>
        </div>
        <div className="card__body"> 
          {cardBody}
        </div> 
      </div>
    );
  
  }

  // select cards in local player's hand or board
  selectCard = () => {
    let boardIndex = game.localPlayer.board.indexOf(this.props.cardInfo);
    if (boardIndex !== -1) {
      let selectMove = {
                    "op": "selectCard", 
                    "index": boardIndex,
                    "containerType": "board"
                 };
      client.makeLocalMove(selectMove);
    }

    let handIndex = game.localPlayer.hand.indexOf(this.props.cardInfo);
    if (handIndex !== -1) {
      let selectMove = {
                    "op":"selectCard", 
                    "index":handIndex,
                    "containerType": "hand"
                 };
      client.makeLocalMove(selectMove);
    }

    let opponentBoardIndex = game.remotePlayer.board.indexOf(this.props.cardInfo);
    if (opponentBoardIndex !== -1) {
      let selectMove = {
                    "op":"selectCard", 
                    "index":opponentBoardIndex,
                    "containerType": "opponentBoard"
                 };
      client.makeLocalMove(selectMove);
    }

  }

}
