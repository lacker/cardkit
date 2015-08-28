import React, { Component, PropTypes } from 'react';
import Client from "../../client";
import GameState from "../../gamestate";
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
  
  playCampaign() {
    window.client.register(true);
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
        <h1 className={elm.heading}>Welcome to Spacetime</h1>
        <Button onClick={this.playCampaign} label='Campaign' />
        <Button onClick={this.showRules} label='How to Play' />
        <p>
          The BiBot factory has been hacked, and you must go reclaim it. <br />
          The hacker is churning out bibots as fast as possible, all set to KILL.
        </p>
        <img className={elm.homeImg} src={galaxyShadowImg} />
      </div>
    );
  }

}
