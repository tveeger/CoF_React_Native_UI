import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, AsyncStorage, TextInput, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import ethers from 'ethers';
import Connector from './Connector.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import metacoin_artifacts from '../contracts/EntboxContract.json';
let mnemonic;

class RedeemScreen extends React.Component {
  static navigationOptions = {
    title: 'Redeem Euros Page',
  };

	constructor(props) {
	super(props);

	this.state = {
		hasWallet: false,
		walletAddress: '',
		tokenAddress: '',
		tokenSymbol: '',
		tokenBalance: 0,
		transferAmount: 0,
		walletEuroAmount: 0,
		totalDetsAmount: 0,
		tokenCreatorFromReceipt: '',
		tokenCreatedStatusFromReceipt: false,
		detsDestroyer: '',
		getDetsDestroyed: 0,
		isDetsDestroyed: false,
		isTransferSuccess: false,
		hash: '',
		message: '',
		infoMessage: '',
		iban: '',
		refreshing: false,
		isSigned: false,
		nonce: '',
		redeemId: '',
		};
	}

	componentWillMount() {
		var self = this;
		self.setState({walletAddress: wallet.address});
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
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
			let mnemonic = await AsyncStorage.getItem('mnemonic');

			self.setState({hasWallet: true});
			contract = new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);
			let tokenId = daTokenId;
			let redeemId = self.state.redeemId;
			walletAddress = this.state.walletAddress;
			let txCount = 0;

			if(contract !== '') {
				//symbol
				contract.symbol().then(function(result){
					self.setState({tokenSymbol: result});
				});
				//get token creator from receipt
				contract.getTokenCreatorFromReceipt(tokenId).then(function(result){
					self.setState({tokenCreatorFromReceipt: result});
				});
				//balanceOf getDetsBalance
				contract.getDetsBalance(walletAddress).then(function(result){
					self.setState({tokenBalance: parseInt(result)});
				});
				//token created status
				contract.getTokenCreatedStatusFromReceipt(tokenId).then(function(result){
					self.setState({tokenCreatedStatusFromReceipt: result});
				});
				//nonce
				wallet.getTransactionCount('latest').then(function(count) {
					txCount = count;
					self.setState({nonce: txCount.toString()});
				});
				//getDetsDestroyer(redeemId)
				contract.getDetsDestroyer(redeemId).then(function(result) {
					self.setState({detsDestroyer: result});
				});
				//getDetsDestroyed(redeemId)
				contract.getDetsDestroyed(redeemId).then(function(result) {
					self.setState({getDetsDestroyed: parseInt(result)});
				});

			}
		}
		catch(error) {
			this.setState({message: error});
		}
	}

	checkBalance(amount) {
		let tokenBalance = this.state.tokenBalance;
		this.setState({transferAmount: amount});
		 
		if(amount > tokenBalance) {
			this.setState({message: "DETs amount too large "});
		} else {
			this.setState({message: ""});
		}
	}

	sendRedeemEuros() {
		let tokenBalance = this.state.tokenBalance;
		let transferAmount = this.state.transferAmount;
		let iban = this.state.iban;
		let walletAddress = this.state.tokenCreatorFromReceipt;
		const tokenAddress = daTokenAddress;
		wallet.provider = etherscanProvider;
		var iface = new ethers.Interface(metacoin_artifacts);
		let nonce = this.state.nonce;
		let redeemId = Math.random().toString(16).slice(2);
		this.setState({redeemId: redeemId});

		let destroyIface = iface.functions.destroyDets(redeemId, transferAmount, iban);

		var tx = {
			from: walletAddress,
			to: tokenAddress,
			value: '0x00',
			nonce: ethers.utils.bigNumberify(nonce),
			gasPrice: ethers.utils.bigNumberify(2000000000),
			gasLimit: ethers.utils.bigNumberify(185000),
			data: destroyIface.data,
		}

		let signedTransaction = wallet.sign(tx);
		this.setState({isSigned: true});
		this.setState({infoMessage: "Just a minute. Your transaction will be mined now..."});
		wallet.provider.sendTransaction(signedTransaction).then(function(hash) {
			wallet.provider.waitForTransaction(hash).then(function(transaction) {
				this.setState({infoMessage: "Your DET tokens are redeemed."});
				this.setState({isSigned: false});
				this.setState({isTransferSuccess: true});
				this.setState({hash: hash.toString()});
				this.getWalletInfo();
			});
		});

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
					<Text>{this.state.tokenSymbol} {this.state.tokenBalance} Nonce: {this.state.nonce}{'\n'}</Text>
					<Text style={styles.prompt}></Text>
				</Text>
				<TextInput
					style={styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "Amount of DET tokens"
					placeholderTextColor = "#A0B5C8"
					keyboardType={'numeric'}
					maxLength = {4}
					//onChangeText={(transferAmount) => this.setState({transferAmount})}
					onChangeText={(transferAmount) => this.checkBalance({transferAmount})}
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
				{!this.state.isDetsDestroyed && <Button
					title="Submit"
					color="#BCB3A2"
					onPress={() => { this.sendRedeemEuros()} } 
				/>}
				{this.state.isSigned && <ActivityIndicator size="large" color="#8192A2" />}
				{this.state.isTransferSuccess && <Text style={styles.infoText}>{'\n'}Transaction hash: {this.state.hash}</Text>}
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
