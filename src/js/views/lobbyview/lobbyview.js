import React, { Component, PropTypes } from 'react';
import Client from "../../client";
import GameState from "../../gamestate";
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

  render() {
    const block = this.props.name,
    elm = Util.buildElementClasses(block, [
      'heading',
      'campaign-btn',
      'home-img'
    ]);

    return (
      <div className={block}>
        <h1 className={elm.heading}>Welcome to Spacetime</h1>
        <button className={elm.campaignBtn} onClick={this.playCampaign}>
          Campaign 1: Bibot Attack
        </button>
        <img className={elm.homeImg} src={galaxyShadowImg} />
      </div>
    );
  }
  
}
