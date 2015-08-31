// React view of a card
import React, { Component, PropTypes } from "react";
import classNames from 'classnames';
import "./_cardview.scss";
import { shieldImg, swordsImg } from '../../../assets/img'

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

    let divStyle = {
      opacity: this.props.cardInfo.warm + .2
    }

    if (!window.game.inPlay(this.props.cardInfo)) {
      divStyle = {
        opacity: 1
      }
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

      return (

      <div className={new_classes} onClick={this.selectCard} style={divStyle}>
        <div className="ship-sprite"> 
        </div>
      </div>
      )

    }
// http://gamedevelopment.tutsplus.com/articles/enjoy-these-totally-free-space-based-shoot-em-up-sprites--gamedev-2368
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
