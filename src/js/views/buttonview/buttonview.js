import React, { Component, PropTypes } from 'react';
import './_buttonview.scss';

export default class Button extends Component {
	static propTypes = {
    onClick: PropTypes.func,
    label: PropTypes.string,
  }

  render() {
		return(
      <button className='st-btn' onClick={this.props.onClick}>
        <span className='st-btn__label'>{this.props.label}</span>
      </button>
		);
	}
}