import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import './_avatarview.scss';

export default class Avatar extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    player: PropTypes.shape({
      showDamage: PropTypes.bool,
      life: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      energy: PropTypes.number.isRequired,
    }),
  }

	render() {
		const classes = classNames(
			'avatar',
			{'avatar--damage': this.props.player.showDamage}
		);

		return(
			<div onClick={this.props.onClick} className={classes}>
        <div className="avatar__life">Life: {this.props.player.life}</div>
        <h2 className="avatar__name">{this.props.player.name}</h2>
        <div className="avatar__energy">Mana: {this.props.player.energya} / {this.props.player.maxMana}</div>
      </div>
    );
	}

}