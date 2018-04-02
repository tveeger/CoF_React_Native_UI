import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, AsyncStorage, TextInput, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import ethers from 'ethers';
import Connector from './Connector.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import metacoin_artifacts from '../contracts/EntboxContract.json';

class RedeemScreen extends React.Component {
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
		tokenBalance: 0,
		transferAmount: 0,
		walletEuroAmount: 0,
		totalDetsAmount: 0,
		tokenCreatorFromReceipt: '',
		message: '',
		infoMessage: '',
		iban: '',
		refreshing: false,
		};
	}

	componentWillMount() {
		var self = this;
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});

		wallet.provider = etherscanProvider;
		const walletAddress = wallet.address;
		self.setState({walletAddress: walletAddress});

		self.getWalletInfo();
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getWalletInfo().then(() => {
			this.setState({refreshing: false});
		});
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			contract = new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);
			let tokenId = 'dada';
			let walletAddress = "0x37779Fb61a1d24bEE94Ca8fd2268Eb0ed72d9dB5";//this.state.walletAddress;

			if(contract !== '') {
				//name
				contract.name().then(function(result){
					self.setState({tokenName: result});
				});
				//symbol
				contract.symbol().then(function(result){
					self.setState({tokenSymbol: result});
				});
				//get token creator from receipt
				contract.getTokenCreatorFromReceipt(tokenId).then(function(result){
					self.setState({tokenCreatorFromReceipt: result});
				});
				//get total dets amount
				contract.getTotalDetsAmount().then(function(result){
					self.setState({totalDetsAmount: result})
				});
				//balanceOf getDetsBalance
				contract.getDetsBalance(walletAddress).then(function(result){
					self.setState({tokenBalance: result.toString()})
				});
			}
		}
		catch(error) {
			this.setState({hasWallet: false});
			this.setState({message: error});
		}
	}

	sendRedeemEuros() {
		let totalDetsAmount = this.state.totalDetsAmount;
		let transferAmount = this.state.transferAmount;
		let iban = this.state.iban;
		let walletAddress = this.state.tokenCreatorFromReceipt;
		const tokenId = daTokenId;

		if(transferAmount <= totalDetsAmount) {

			this.setState({message: tokenId + ", " + transferAmount + ", " + iban + ", " + walletAddress });
			this.setState({infoMessage: "Your DET tokens will be redeemed. This process is irreversible"});
		} else {
			this.setState({infoMessage: ""});
			this.setState({message: "Not enough resources to redeem this amount"});
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
					<Text style={styles.header_h4}> Redeem Euros {'\n'}{'\n'}</Text>
					<Text style={styles.prompt}>Your DET balance: </Text>
					<Text>{this.state.tokenSymbol} {this.state.tokenBalance}{'\n'}</Text>
					<Text style={styles.prompt}>Redeem Euros: </Text>
					
				</Text>
				<TextInput
					style={styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "Amount of DET tokens"
					placeholderTextColor = "#A0B5C8"
					keyboardType={'numeric'}
					maxLength = {4}
					onChangeText={(transferAmount) => this.setState({transferAmount})}
				/>
				<TextInput
					style={styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "Your IBAN"
					placeholderTextColor = "#A0B5C8"
					maxLength={34}
					autoCapitalize= "characters"
					onChangeText={(iban) => this.setState({iban})}
				/>
				<Button
					title="Submit"
					color="#BCB3A2"
					onPress={() => { this.sendRedeemEuros()} } 
				/>
				<Text style={styles.infoText}>{'\n'}{this.state.infoMessage}</Text>
				<Text style={styles.errorText}>{this.state.message}</Text>
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
	infoMessage: {
	    color: '#2D4866',
	    fontSize: 10
	  },
	errorText: {
		marginTop: 10,
		color: 'red'
	},
});

export default RedeemScreen;
