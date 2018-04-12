import React, { Component } from 'react';
import { View, Text, AsyncStorage } from 'react-native';
import ethers from 'ethers';

global.daNetwork = ethers.providers.networks.rinkeby;
global.daTokenAddress = '0x492b5F5Eb71c56df81A0E92DAC653d3f0Bdfb896'; //Chains of Freedom Token
global.daTokenId = 'dada5';
const etherscanApiKey = 'I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV';
global.etherscanProvider = new ethers.providers.EtherscanProvider(daNetwork, etherscanApiKey);

global.wallet = '';
global.contract = '';
//wallet address: 0x37779Fb61a1d24bEE94Ca8fd2268Eb0ed72d9dB5


class Connector extends React.Component {
	render() {}
}

export default Connector;