import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, StyleSheet } from 'react-native';
import Connector from './Connector.js';
import metacoin_artifacts from '../contracts/BirdlandToken.json'
import Ionicons from 'react-native-vector-icons/Ionicons';

class AboutScreen extends React.Component {
  static navigationOptions = {
    title: 'About Chains of Freedom',
  };

    constructor(props) {
    super(props);

    this.state = {
      connected: false,
      web3Version: '',
      web3DefaultAccount: '',
      web3PeerCount: '',
      web3Shh: '',
      web3EthBalance: '',
      submitMessage: '',
      coinbase: '',
      tokenName: '',
      tokenAddress: '',
      tokenSymbol: '',
      tokenDecimals: '',
      tokenTotalSupply: '',
      message: '',
    };
  }

    componentWillMount() {
    var self = this;
    const tokenAddress = daTokenAddress;
    self.setState({tokenAddress: tokenAddress});
    
  }

  render() {
      return (
        <ScrollView style={styles.container}>
          <Text style={styles.baseText}>
            <Image source={require('../img/beeldmerk_30x32.png')} style={{width: 120, height: 128}} />
            <Text style={styles.header_h4}> The Foundation {'\n'}{'\n'}</Text>
              Chains of Freedom is a foundation, registered in The Netherlands. CoF aims to give everyone 
              the opportunity to make transparent and secure donations to charities. 
              We use the latest blockchain technology.{'\n'}{'\n'}
            <Text style={styles.header_h4}>How do I use this app?{'\n'}</Text>
            <Text>
              You can order your DET-totkens by clicking on the "Fetch"-tab. Fill in the amount of Euros you want to transfer. 
              After Submitting the amount of Euros, you will get a code and an IBAN account number. Within two days you will 
              receive the equivalent amount of tokens to the amount of Euros you have transferred 
              to your app to donate to the charities.{'\n'}{'\n'}
            </Text>
            <Text style={styles.header_h4}>About the Token{'\n'}</Text>
            <Text style={styles.prompt}>Token: </Text>
            <Text>{'\n'}</Text>
            <Text style={styles.prompt}>Symbol: </Text>
            <Text>{'\n'}</Text>
            <Text style={styles.prompt}>Decimals: </Text>
            <Text>{'\n'}</Text>
            <Text style={styles.prompt}>Total Supply: </Text>
            <Text>{'\n'}{'\n'}</Text>
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

export default AboutScreen;