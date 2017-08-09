import React, { Component } from 'react';
import { Button, Image, View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Connector from './Connector.js';

import HttpProvider from 'ethjs-provider-http';
import EthRPC from 'ethjs-rpc';
import Unit from 'ethjs-unit';
import Util from 'ethjs-util';
import Websocket from './Websocket.js';
const ethRPC = new EthRPC(new HttpProvider(testnetProvider));
const extractKey = ({id}) => id;

class BuyScreen extends React.Component {
  static navigationOptions = {
    title: 'Receive DET tokens',
    tabBarLabel: 'Buy',
  };

  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      euroInputAmount: '',
      incoming: '',
      submitMessage: '',
      coinbase: '',
      tokenAddress: '',
      tokenBalance: '',
      submitCode: '',
      confirmMessage: '',
      posts: [],
      postsAmount: 0
    };

    //this.socket = new WebSocket('ws://45.32.186.169:28475');
    this.socket = new WebSocket('ws://echo.websocket.org'); //testing
        this.socket.onopen = () => {
          this.setState({connected:true})
        };
        this.socket.onmessage = (e) => {
          console.log(e.data);
          this.setState({incoming:e.data});
        };
        this.socket.onerror = (e) => {
          console.log(e.message);
        };
        this.socket.onclose = (e) => {
          this.setState({connected:false})
          console.log(e.code, e.reason);
        };
        this.emit = this.emit.bind(this);

  }

  componentWillMount() {
    var self = this;
    const coinbase = daCoinbase;
    self.setState({coinbase: coinbase});
    const tokenAddress = daTokenAddress;
    self.setState({tokenAddress: tokenAddress});

    ethRPC.sendAsync({
      method: 'eth_getBalance',
      params: [tokenAddress, 'latest'],
    }, (err, tokenBalance) => {
        var balTokenEth = Unit.fromWei(tokenBalance, 'ether');
        self.setState({tokenBalance: balTokenEth.toString() });
    });

  }
    
  renderItem = ({item}) => {
    return (
      <Text style={styles.row}>{item.payload}</Text>
    )
  }

  emit() {
    if( this.state.connected ) {
      let posts = this.state.posts;
      let postsAmount = posts.length + 1;

      let myEuros = Util.intToHex(this.state.euroInputAmount);
      let submitCode = Math.random().toString(16).slice(2);
      this.setState({submitCode: submitCode.toString()});
      /*
      ethRPC.sendAsync({
        method: 'web3_sha3',
        params: [myEuros]
      }, (err, loadValue) => {
        //this.setState({submitCode: loadValue.toString()});  
      });
      */
      this.setState({confirmMessage: '{amount: "' + myEuros + '", code: "' + submitCode + '", sender:"' + daCoinbase + '"}'});
      this.socket.send(this.state.confirmMessage);
      
      posts = this.state.posts.slice();
      posts.push({'id': postsAmount, 'payload': this.state.confirmMessage});
      this.setState({ posts: posts });

      this.setState({submitMessage: 'Transfer the exact amount of Euros to IBAN 123456789 and add the following code you see below in the comment area.'});
      this.setState({euroInputAmount: ''});
    }
  }

  render() {
    const {coinbase, tokenAddress } = this.props;
      return (
          <View style={styles.container}>
            <Text style={styles.baseText}>
              <Text style={styles.header_h4}>Transfer some Euros for DET tokens {'\n'}{'\n'}</Text>
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
            <Text style={styles.prompt}>Last submits</Text>
            <Text style={styles.row}>{this.state.confirmMessage}</Text>
            <Text style={styles.prompt}>Recent submits</Text>
            <FlatList
                style={styles.postItem}
                data={this.state.posts}
                renderItem={this.renderItem}
                keyExtractor={extractKey}
               />
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
  postItem: {
    paddingTop: 4,
  },
});


export default BuyScreen;