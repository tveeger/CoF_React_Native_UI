import React, { Component } from 'react';
import { Button, Image, View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

class TermsScreen extends React.Component {
  static navigationOptions = {
    title: 'Terms and Conditions',

  };

  constructor(props) {
    super(props);

	this.state = {
		hasWallet: false,
		walletAddress: '',
	};

  }

	componentWillMount() {
		let self = this;
		//self.setState({walletAddress: wallet.address});
	}

    render() {
        return (
          <View style={styles.container}>
            <Text style={styles.baseText}>
              <Ionicons name={'ios-radio-outline'} size={26} style={styles.icon} />
              <Text style={styles.header_h4}> Read more...{'\n'}</Text>
              <Text>
                Take notice of our general terms ....
              </Text>
            </Text>
          </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
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


export default TermsScreen;