import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, StyleSheet, AsyncStorage } from 'react-native';
import ethers from 'ethers';
import Connector from './Connector.js';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Ionicons from 'react-native-vector-icons/Ionicons';

class AboutScreen extends React.Component {
  static navigationOptions = {
    title: 'About Chains of Freedom',
  };

	constructor(props) {
	super(props);

	this.state = {
		tokenName: '',
		tokenId: '',
		tokenAddress: '',
		tokenSymbol: '',
		tokenDecimals: '',
		tokenVersion: '',
		totalDetsAmount: 0,
		totalDetsSupply: 0,
		message: '',
		};
	}

	componentWillMount() {
		var self = this;
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
		self.getWalletInfo();
		self.getTokenId();
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			contract = new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);

			if(contract !== '') {
				//name
				contract.name().then(function(result){
					self.setState({tokenName: result});
				});
				//symbol
				contract.symbol().then(function(result){
					self.setState({tokenSymbol: result});
				});
				//decimals
				contract.decimals().then(function(result){
					self.setState({tokenDecimals: result.toString()});
				});
				//version
				contract.version().then(function(result){
					self.setState({tokenVersion: result});
				});
				//my total amount
				contract.getTotalDetsAmount().then(function(result){
					self.setState({totalDetsAmount: result.toString()});
				});
				//total DETs supply
				contract.totalSupply().then(function(result){
					self.setState({totalDetsSupply: result.toString()});
				});
			}
		}
		catch(error) {
			this.setState({message: error});
		}
	}

	getTokenId = async () => {
		try {
			let daTokenId = await AsyncStorage.getItem('daTokenId');
			this.setState({tokenId: daTokenId});
		}
		catch(error) {
			this.setState({message: error});
		}
	}

  	render() {
		return (
			<ScrollView style={styles.container}>
				<Text style={styles.baseText}>
					<Image source={require('../img/beeldmerk_30x32_darkblue.png')} style={{width: 30}} />
					<Text style={styles.header_h4}> The Foundation 123 {'\n'}{'\n'}</Text>
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
					<Text>{this.state.tokenName}{'\n'}</Text>
					<Text style={styles.prompt}>Token ID: </Text>
					<Text>{this.state.tokenId}{'\n'}</Text>
					<Text style={styles.prompt}>Symbol: </Text>
					<Text>{this.state.tokenSymbol}{'\n'}</Text>
					<Text style={styles.prompt}>Decimals: </Text>
					<Text>{this.state.tokenDecimals}{'\n'}</Text>
					<Text style={styles.prompt}>Version: </Text>
					<Text>{this.state.tokenVersion}{'\n'}</Text>
					<Text style={styles.prompt}>Current / Total Supply: </Text>
					<Text>DET {this.state.totalDetsAmount} / {this.state.totalDetsSupply} {'\n'}{'\n'}</Text>
					<Text>{this.state.message}</Text>
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
