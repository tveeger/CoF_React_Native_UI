import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, AsyncStorage, ActivityIndicator } from 'react-native';
import Connector from './Connector.js';
import ethers from 'ethers';
import metacoin_artifacts from '../contracts/EntboxContract.json';

class CreateTokensScreen extends React.Component {
	static navigationOptions = {
		title: 'Create DET tokens',
		tabBarLabel: 'Create',
	};

	constructor(props) {
		super(props);

		this.state = {
			isSigned: false,
			isTransferSuccess: false,
			hasWallet: false,
			walletAddress: '',
			tokenId: '',
			tokenAddress: '',
			tokenBalance: 0,
			errorMessage: '',
			euroAmountFromReceipt: null,
			tokenCreatedStatusFromReceipt: false,
			tokenCreatorFromReceipt: '',
			nonce: '',
			submitMessage: '',
			isBusy: false,
		};

	}

	getWalletInfo = async () => {
		try {
			const self = this;
			contract = new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);

			let tokenId = self.state.tokenId;
			walletAddress = self.state.walletAddress;
			self.setState({hasWallet: true});
			self.setState({isBusy: true});

			if (wallet !== '') {;
				//transaction number
				wallet.getTransactionCount('latest').then(function(count) {
					self.setState({nonce: count.toString()});
				});
			}

			if(contract !== '') {
				//get token created from receipt
				contract.getTokenCreatedStatusFromReceipt(tokenId).then(function(result){
					self.setState({tokenCreatedStatusFromReceipt: result});
				});
				//get Euro amount from receipt
				contract.getEuroAmountFromReceipt(tokenId).then(function(result){
					self.setState({euroAmountFromReceipt: parseInt(result)});
					self.checkEuroBalance();
				});
				//get token creator from receipt
				contract.getTokenCreatorFromReceipt(tokenId).then(function(result){
					self.setState({tokenCreatorFromReceipt: result});
				});
				//balanceOf getDetsBalance
				contract.getDetsBalance(walletAddress).then(function(result){
					self.setState({tokenBalance: parseInt(result)});
				});
			}
		}
		catch(error) {
			this.setState({hasWallet: false});
			this.setState({message: error});
		}
	}

	getTokenId = async () => {
		try {
			let daTokenId = await AsyncStorage.getItem('daTokenId');
			daTokenId = "4a4fbcf3";
			this.setState({tokenId: daTokenId});
			this.getWalletInfo();
		}
		catch(error) {
			this.setState({message: error});
		}
	}

	componentWillMount() {
		this.setState({walletAddress: wallet.address});
		//this.getWalletInfo();
		this.getTokenId();
	}

	componentWillUnmount() {
		this.setState({isSigned: false});
		this.setState({isTransferSuccess: false});
		this.setState({tokenCreatedStatus: false});
	}

	checkEuroBalance() {
		let tokenCreatedStatus = this.state.tokenCreatedStatusFromReceipt;
		if(tokenCreatedStatus) {
			this.setState({euroBalanceMessage: ""});
			this.setState({isBusy: false});
		} else {
			let euroAmountFromReceipt = this.state.getEuroAmountFromReceipt;
			this.setState({isBusy: false});
			this.setState({euroBalanceMessage: "You have transferred Euros to your wallet and may now convert it to DET tokens. Your currentbalance is: "});
		}
	}

	createDets() {
		let self = this;
		const tokenId = self.state.tokenId;

		if(wallet !== '') {
			wallet.provider = etherscanProvider;
			let nonce = self.state.nonce;
			const tokenAddress = daTokenAddress;
			let transactionHash;
			const iface = new ethers.Interface(metacoin_artifacts);
			let createDets = iface.functions.createDets(tokenId);

			let tx = {
				from: wallet.address,
				to: tokenAddress,
				value: '0x00',
				nonce: ethers.utils.bigNumberify(nonce),
				gasPrice: ethers.utils.bigNumberify(2000000000),
				gasLimit: ethers.utils.bigNumberify(185000),
				data: createDets.data,
			}

			let signedTransaction = wallet.sign(tx);

			self.setState({isSigned: true});
			wallet.provider.sendTransaction(signedTransaction).then(function(hash) {
				transactionHash = hash;
				wallet.provider.waitForTransaction(transactionHash).then(function(transaction) {
					self.setState({isSigned: false});
					self.setState({isTransferSuccess: true});
					self.setState({submitMessage: transaction.hash});
					self.getWalletInfo();
				});
			});
		}
	}

	render() {
		return (
			<View>
				<Text style={styles.baseText}>
					{!this.state.tokenCreatedStatusFromReceipt && <Text style={styles.header_h4}>{'\n'}{'\n'}Get your DETs{'\n'}</Text>}
					{!this.state.tokenCreatedStatusFromReceipt && <Text>{'\n'}{this.state.euroBalanceMessage} </Text>}
					{!this.state.tokenCreatedStatusFromReceipt && <Text style={styles.header_h4}>&euro; {this.state.euroAmountFromReceipt} {'\n'}{'\n'}</Text>}
					{!this.state.tokenCreatedStatusFromReceipt && <Text>You will receive 100 DET for each Euro.</Text> }
				</Text>
				{this.state.isBusy && <ActivityIndicator size="large" color="#8192A2" />}
				{!this.state.tokenCreatedStatusFromReceipt && <Button 
					color="#BCB3A2"
					title="Create tokens"
					accessibilityLabel="Transfer"
					onPress = { ()=> this.createDets()}
				/> }
				{this.state.isSigned && <Text> Just a minute. Your transaction will be mined now...</Text>}
				{this.state.isSigned && <ActivityIndicator size="large" color="#8192A2" />}
				{this.state.isTransferSuccess && <Text> Transfer Hash: {this.state.submitMessage}</Text>}
				<Text style={styles.errorText}>{'\n'}{this.state.errorMessage}</Text>
			</View>
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
	baseText: {
		/*textAlign: 'left',*/
		color: '#999999',
		marginBottom: 5,
	},
	header_h4: {
		color: '#2D4866',
		fontSize: 20,
		padding: 10,
	},
	prompt: {
		color: '#BCB3A2',
	},
	errorText: {
    marginTop: 10,
    color: 'red'
  },
});


export default CreateTokensScreen;