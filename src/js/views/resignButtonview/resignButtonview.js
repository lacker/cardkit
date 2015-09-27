import React, { Component } from 'react';
import Button from '../buttonview/buttonview';
import GameState from "../../gamestate"
import Client from "../../client"

export default class ResignButton extends Button {
  resign() {
    window.client.makeLocalMove({"op":"resign"})
    clearInterval(window.game.localTimeLoop)
    clearInterval(window.client.computerLoop)
    let rootPointer = window.client.root
    window.game = new GameState({name: window.name})
    window.client = new Client(window.name, window.game)
    window.client.root = rootPointer;
    window.client.root.forceUpdate()
  }


  render() {
    return(
          <Button onClick={this.resign} label='Resign' />          
    );
  }

}