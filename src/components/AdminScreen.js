import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, AsyncStorage, TextInput, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import ethers from 'ethers';
import Connector from './Connector.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BirdlandToken from '../contracts/BirdlandToken.json';

class AdminScreen extends React.Component {
  static navigationOptions = {
    title: 'Admin Page',
  };

	constructor(props) {
	super(props);

	this.state = {
		connected: false,
		hasWallet: false,
		walletAddress: '',
		coinbase: '',
		tokenName: '',
		tokenAddress: '',
		tokenSymbol: '',
		tokenDecimals: '',
		tokenTotalSupply: '',
		message: '',
		balanceOf: '',
		refreshing: false,
		};
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getWalletInfo().then(() => {
			this.setState({refreshing: false});
		});
	}

	componentWillMount() {
		var self = this;
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
		self.getWalletInfo();
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			contract = new ethers.Contract(daTokenAddress, BirdlandToken, etherscanProvider);
			contract.connect(etherscanProvider);

			if(contract !== '') {
				//name
				contract.name().then(function(result){
					const tokenName = result[0];
					self.setState({tokenName: tokenName});
				});
				//symbol
				contract.symbol().then(function(result){
					const tokenSymbol = result[0];
					self.setState({tokenSymbol: tokenSymbol});
				});

			}
		}
		catch(error) {
			this.setState({hasWallet: false});
			this.setState({message: error});
		}
	}

  	render() {
		return (
			<ScrollView style={styles.container} refreshControl={
				<RefreshControl
					refreshing={this.state.refreshing}
					onRefresh={this.onRefresh.bind(this)}
				/>
			}>
				<Text style={styles.baseText}>
					
					<Text style={styles.header_h4}> Admin Page {'\n'}{'\n'}</Text>
					<Text style={styles.prompt}>Token: </Text>
					<Text>info ...{'\n'}</Text>
					
					<Text style={styles.prompt}>Lookup balance of: </Text>
					<Text>{this.state.message}</Text>
				</Text>
				<TextInput
					style={styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "Address"
					placeholderTextColor = "#A0B5C8"
					maxLength = {80}
					blurOnSubmit={true}
					onChangeText={(balanceOf) => this.setState({balanceOf})}
				/>
			</ScrollView>
		);
    }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginLeft: 20,
    marginTop: 30,
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
  input: {
		height: 40, 
		borderColor: '#D3C8B2', 
		borderWidth: 1,
		fontSize: 14,
		marginBottom: 15,
		color: '#999999',
	},
});

export default AdminScreen;
