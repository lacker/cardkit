// React view of a starry background
// http://codepen.io/keithclark/pen/zqcEd

import React from "react";
import './_starryview.scss';

export default class StarryView extends React.Component {

  render() {
    return (
		<div id="space">
		  <div className="stars"></div>
		  <div className="stars"></div>
		  <div className="stars"></div>
		  <div className="stars"></div>
		  <div className="stars"></div>
		</div>
    );
  }
}