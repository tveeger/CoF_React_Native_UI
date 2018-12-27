import React, { Component } from 'react';
import { View, Text} from 'react-native';
import ethers from 'ethers';
import socketIOClient from 'socket.io-client';

global.daNetwork = ethers.providers.networks.rinkeby;
global.daTokenAddress = '0x492b5F5Eb71c56df81A0E92DAC653d3f0Bdfb896'; //Chains of Freedom Token
const etherscanApiKey = 'I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV';
global.etherscanProvider = new ethers.providers.EtherscanProvider('rinkeby', etherscanApiKey);
global.serverPublicRSAKey = 'http://www.chainsoffreedom.org/js/cofPublicKey.json';
global.wallet = '';
global.contract = '';
//global.daSocket = new WebSocket('ws://192.168.1.9:28475'); //server: ws://45.32.186.169:28475
global.daChatSocket = socketIOClient("http://192.168.1.9:28475/chat")
global.daAcquireSocket = socketIOClient("http://192.168.1.9:28475/acquire")
global.daRedeemSocket = socketIOClient("http://192.168.1.9:28475/redeem")

class Connector extends React.Component {
	render() {}
}

export default Connector;