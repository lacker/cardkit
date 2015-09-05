import React, { Component, PropTypes } from 'react';
import Client from "../../client";
import GameState from "../../gamestate";
import * as Campaign from "../../campaign";
import Button from '../buttonview/buttonview';
import "./_lobbyview.scss";
import { galaxyShadowImg } from '../../../assets/img';
import * as Util from '../../util';

export default class LobbyView extends Component {

  static defaultProps = {
    name: 'lobby'
  }

  findGame() {
    window.client.register(false);
    window.client.forceUpdate();
  }
  
  showRules() {
    alert("* You start with 1 card, and 3 energy to play cards. \
          \n\n* Every few seconds, you draw, and get more energy. \
          \n\n* Each creature you play attacks every few seconds. \
          \n\n* Creatures attack players, unless you retarget them. Click a creature and then a target to retarget. \
          \n\n* First player to lose all life loses."
         )
  }

  render() {
    const block = this.props.name,
    elm = Util.buildElementClasses(block, [
      'heading',
      'home-img'
    ]);
    return (
      <div className={block}>
        <h1 className={elm.heading}>
          <img className={elm.homeImg} src={galaxyShadowImg} />
          Welcome to Spacetime
        </h1>
        <table>
          <tbody>
            {Campaign.LEVELS.map(function(level, index){
              return <CampaignRow key={index} index={index} level={level} />
            })}
              <tr>
                <td colSpan="2">
                  <Button onClick={this.showRules} label='How to Play' />
                </td>
              </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

// a row in the lobby describing a campaign level
class CampaignRow extends Component {

  static defaultProps = {
    name: 'lobby_row'
  }

  static propTypes = {
      index: PropTypes.number,
      levelDescription: PropTypes.string.isRequired,
  }
  
  playCampaign(levelNumber) {
    window.client.register(true, levelNumber);
    window.client.forceUpdate();
  }

  render() {
      const block = this.props.name,
        elm = Util.buildElementClasses(block, [
          'button-cell',
          'description-cell'
      ]);
      let levelNumber = this.props.index + 1
      let buttonTitle = 'Campaign' + ' ' + levelNumber
      return (
        <tr>
          <td className={elm.descriptionCell}>
            {this.props.level.description}
          </td>
          <td className={elm.buttonCell}>
            <Button onClick={this.playCampaign.bind(this, this.props.index)} label={buttonTitle} />
          </td>
        </tr>
      );
  }
}
