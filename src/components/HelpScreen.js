import React, { Component } from 'react';
import { Button, Image, ScrollView, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
//import MessageEncrypt from './MessageRsaNative.js';
//import ErebosScreen from './ErebosScreen.js';

class HelpScreen extends React.Component {
  static navigationOptions = {
    title: 'Help',
  };

	constructor(props) {
		super(props);

		this.state = {

			};
	}

	componentWillMount() {
		var self = this;

	}

  	render() {
		return (
			<ScrollView style={styles.container}>
				<Text style={styles.baseText}>
					<Ionicons name={'ios-help-buoy'} size={26} style={styles.icon} />
					<Text style={styles.header_h4}> Help {'\n'}{'\n'}</Text>
				</Text>
				
			</ScrollView>
		);
    }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
  header_h4: {
    color: '#2D4866',
    fontSize: 20,
    padding: 10,
  },
  baseText: {
    textAlign: 'left',
    color: '#999999',
    marginBottom: 5,
  },
  prompt: {
    color: '#BCB3A2',
  },
  icon: {
    color: '#2D4866',
    fontSize: 30,
  },
});

export default HelpScreen;