import React, { Component, PropTypes, View, Text, Image, StyleSheet } from 'react-native';
//import Client from "../../controllers/client";
//import GameState from "../../controllers/gamestate";
import Button from '../buttonview/buttonview';
//import * as Util from '../../util/util';
import * as Campaign from "../../data/campaign";
// import "_lobby.scss";
import { galaxyShadowPng } from '../../img';

let styles = StyleSheet.create({
  galaxyImage: {
    height: 264,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#000',
    flex: 1 // 100% height
  },
  campaignTable: {
    backgroundColor:'#f66',
    flexDirection:'row',
  },
  descriptionText: {
    fontSize: 12,
    color: '#fff',
    margin: 10
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20
  },
  campaignBox: {
    width:160, 
    height:200,
    flex: 1,

  },
  campaignButton: {
    bottom: 0,
    left:0,
    right:0,
    position:'absolute',
  }
});


class Lobby extends Component {

  showRules() {
    alert("* You start with 1 card, and 3 energy to play cards. \
          \n\n* Every few seconds, you draw, and get more energy. \
          \n\n* Each creature you play attacks every few seconds. \
          \n\n* Creatures attack players, unless you retarget them. Click a creature and then a target to retarget. \
          \n\n* First player to lose all life loses."
         )
  }

  render() {

    return (
      <Image source={require('image!galaxy-color-shadow')} style={styles.galaxyImage} >
        <Text style={styles.titleText}>
          Welcome to Spacetime
        </Text>
        <View style={styles.campaignTable}>
          {Campaign.LEVELS.map(function(level, index){
              return <CampaignRow key={index} index={index} level={level} />
            })}
        </View>
      </Image>
    );
  }
}

module.exports = Lobby;


// a row in the lobby describing a campaign level
class CampaignRow extends Component {

  render() {
      let levelNumber = this.props.index + 1
      let buttonTitle = 'Campaign' + ' ' + levelNumber
      return (
        <View style={styles.campaignBox}>
          <Text style={styles.descriptionText}>
            {this.props.level.description}
          </Text>
          <Button action={this.playCampaign.bind(levelNumber)} label={buttonTitle} style={styles.campaignButton} />
        </View>
      );
  }

  playCampaign(levelNumber) {
    console.log("Hai")
    window.client.register(true, levelNumber);
    window.client.forceUpdate();
  }

}
