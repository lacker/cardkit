import React, { Component } from 'react';
import classNames from 'classnames';
import './_avatarview.scss';

export default class Avatar extends Component {
	render() {
		const classes = classNames(
			'avatar',
			{'avatar--damage': this.props.player.showDamage}
		);

		return(
			<div onClick={this.props.onClick} className={classes}>
        <div className="avatar__life">Life: {this.props.player.life}</div>
        <h2 className="avatar__name">{this.props.player.name}</h2>
        <div className="avatar__mana">Mana: {this.props.player.mana} / {this.props.player.maxMana}</div>
      </div>
    );
	}

}