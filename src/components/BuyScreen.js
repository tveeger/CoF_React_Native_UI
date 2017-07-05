import React, { Component } from 'react';
import { Button, Image, View, Text, TextInput, StyleSheet } from 'react-native';
import Connector from './Connector.js';

import HttpProvider from 'ethjs-provider-http';
import EthRPC from 'ethjs-rpc';
import Unit from 'ethjs-unit';
import Util from 'ethjs-util';
//const provider = 'http://192.168.1.7:8545';
//const provider = 'https://rinkeby.infura.io/';
const ethRPC = new EthRPC(new HttpProvider(testnetProvider));

class BuyScreen extends React.Component {
  static navigationOptions = {
    title: 'Receive DET tokens',
    tabBarLabel: 'Buy',
  };

  constructor(props) {
    super(props);

    this.state = {
      euroInputAmount: '',
      submitMessage: '',
      coinbase: '',
      tokenAddress: '',
      coinbaseBalance: '',
      tokenBalance: '',
      submitCode: '',
    };

  }

  componentWillMount() {
    var self = this;
    const coinbase = daCoinbase;
    self.setState({coinbase: coinbase});
    const tokenAddress = daTokenAddress;
    self.setState({tokenAddress: tokenAddress});

    ethRPC.sendAsync({
      method: 'eth_getBalance',
      params: [coinbase, 'latest'],
    }, (err, coinbaseBalance) => {
        var balEth = Unit.fromWei(coinbaseBalance, 'ether');
        self.setState({coinbaseBalance: balEth.toString() + ' ETH'});
    });

    ethRPC.sendAsync({
      method: 'eth_getBalance',
      params: [tokenAddress, 'latest'],
    }, (err, tokenBalance) => {
        var balTokenEth = Unit.fromWei(tokenBalance, 'ether');
        self.setState({tokenBalance: balTokenEth.toString() + ' ETH'});
    });

  }

  emit() {
    const self = this;
    let myEuros = Util.intToHex(self.state.euroInputAmount);

    ethRPC.sendAsync({
      method: 'web3_sha3',
      params: [myEuros]
    }, (err, loadValue) => {
      self.setState({submitCode: loadValue.toString()});
    });
    self.setState({submitMessage: 'Transfer the exact amount of Euros to IBAN 123456789 and add the following code you see below in the comment area.'});
    self.setState({euroInputAmount: ''});
  }

  render() {
    const {coinbase, tokenAddress } = this.props;
      return (
          <View style={styles.container}>
            <Text style={styles.baseText}>
              <Text style={styles.header_h4}>Transfer some Euros for DET tokens {'\n'}{'\n'}</Text>
              <Text style={styles.prompt}>Balance Eth account: </Text>
              <Text>{this.state.coinbaseBalance}{'\n'}</Text>
              <Text style={styles.prompt}>DET Balance: </Text>
              <Text>{this.state.tokenBalance}{'\n'}{'\n'}</Text>
              <Text>Set the amount of Euros</Text>
            </Text>
            <TextInput
              style={styles.input}
              underlineColorAndroid = "transparent"
              placeholder = "Minimum 1 Euro"
              placeholderTextColor = "#A0B5C8"
              keyboardType={'numeric'}
              maxLength={4}
              onChangeText={(euroInputAmount) => this.setState({euroInputAmount})}
              value={this.state.euroInputAmount}
            />

            <Button 
              color="#BCB3A2"
              title="submit"
              accessibilityLabel="Submit"
              onPress = { ()=> this.emit()}
            />
            <Text style={styles.row}>{this.state.submitMessage}</Text>
            <Text style={styles.submitCode}>{this.state.submitCode}</Text>
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
  baseText: {
    textAlign: 'left',
    color: '#999999',
    marginBottom: 5,
  },
  header_h4: {
    color: '#8192A2',
    fontSize: 20,
    padding: 10,
  },
  prompt: {
    color: '#BCB3A2',
  },
  input: {
    height: 40, 
    borderColor: '#D3C8B2', 
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 15,
  },
  row: {
    color: '#8192A2',
    padding: 10,
    marginBottom: 5,
    fontSize: 16,
  },
  submitCode: {
    color: '#8192A2',
    padding: 10,
    fontSize: 20,
  },
});


export default BuyScreen;