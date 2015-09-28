import React, { Component, PropTypes, View, Text, StyleSheet, TouchableHighlight } from 'react-native';
//import './_buttonview.scss';

let styles = StyleSheet.create({
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign:'center',
  },
  buttonBG: {
    height:30,
    backgroundColor: '#f00',
    textAlign:'center',
    margin:5,
    padding:5,
    marginTop:0,
    borderRadius:6,
    overflow:'hidden',
    borderColor: 'black',
    borderWidth: 1
  },
});

export default class Button extends Component {
  render() {
		return(
      <View style={this.props.style}>
        <TouchableHighlight onPress={this.action} style={styles.buttonBG}>
          <Text onClick={this.props.onClick} style={styles.buttonText}>{this.props.label}</Text>
        </TouchableHighlight>
      </View>
		);
	}
}

