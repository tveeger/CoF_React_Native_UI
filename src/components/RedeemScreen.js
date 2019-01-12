import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import ethers from 'ethers';
import Connector from './Connector.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import {RSA} from 'react-native-rsa-native';
import socketIo from 'react-native-socket.io-client';

class RedeemScreen extends React.Component {
  static navigationOptions = {
    title: 'Redeem Euros Page',
  };

	constructor(props) {
	super(props);

	this.state = {
		walletAddress: '',
		hasWallet: false,
		tokenSymbol: '',
		tokenBalance: 0,
		transferAmount: 0,
		detsDestroyer: '',
		getDetsDestroyed: 0,
		isDetsDestroyed: false,
		isTransferSuccess: false,
		hash: '',
		message: '',
		infoMessage: '',
		errorMessage: '',
		incomming: '',
		iban: '',
		refreshing: false,
		isSigned: false,
		nonce: '',
		redeemId: '',
		serverPublicRSAKey: '',
		hasServerPublicKey: false,
		};

		this.cofSocket = daRedeemSocket; //zie connector.js
		this.signRedeemTransaction = this.signRedeemTransaction.bind(this);
	}

	componentWillMount() {
		var self = this;
		wallet.provider = etherscanProvider;
		const walletAddress = wallet.address;
		self.setState({walletAddress: walletAddress});
		self.setState({hasWallet: true});

		self.cofSocket.on('connect', function() { 
			self.setState({socketId: '/redeem#' + self.cofSocket.id});
			self.setState({connected: true});
		});
		self.cofSocket.on('connect_failed', function() {
			self.setState({errorMessage: "Sorry, there seems to be an issue with the connection!"});
		});
		
		self.getWalletInfo();
		self.getServerPublicKey();
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getWalletInfo().then(() => {
			this.setState({refreshing: false});
		});
	}

	getServerPublicKey() {
		var self = this;
		return fetch(serverPublicRSAKey) //see connector.js
		.then((response) => response.json()) 
		.then((responseJson) => { 
			self.setState({serverPublicRSAKey: responseJson.result})
		})
		.then(() => {
			this.setState({hasServerPublicKey: true})
		})
		.catch((error) => { this.setState({errorMessage: 'Public key not found: ' + error});
		}); 
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			contract = await new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);
			self.setState({hasWallet: true});
			
			let redeemId = self.state.redeemId;
			walletAddress = this.state.walletAddress;
			let txCount = 0;

			if(contract !== '') {
				//symbol
				contract.symbol().then(function(result){
					self.setState({tokenSymbol: result});
				});
				//balanceOf getDetsBalance
				contract.getDetsBalance(walletAddress).then(function(result){
					self.setState({tokenBalance: parseInt(result)});
				});
				//getDetsDestroyer(redeemId)
				contract.getDetsDestroyer(redeemId).then(function(result) {
					self.setState({detsDestroyer: result});
				});
				//getDetsDestroyed(redeemId)
				contract.getDetsDestroyed(redeemId).then(function(result) {
					self.setState({getDetsDestroyed: parseInt(result)});
				});
				//transaction nonce
				wallet.getTransactionCount('latest').then(function(count) {
					self.setState({nonce: count.toString()});
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
			return 0;
		} else {
			return amount;
		}

	}

	generateRedeemId() {
		let redeemId = Math.random().toString(16).slice(2);
		this.setState({redeemId: redeemId});
		return redeemId;
	}

	signRedeemTransaction = async () => {
		const self = this;
		self.setState({isSigned: true});
		let redeemId = self.generateRedeemId();
		let tokenBalance = self.state.tokenBalance;
		let transferAmount = self.state.transferAmount;
		let checkedAmount = self.checkBalance(self.state.transferAmount);
		let transferAmountBN = ethers.utils.bigNumberify(checkedAmount);
		if (checkedAmount > 0) {
			let iban = self.state.iban;
			let walletAddress = self.state.walletAdress;
			const tokenAddress = daTokenAddress;
			wallet.provider = etherscanProvider;
			var iface = new ethers.Interface(metacoin_artifacts);
			let nonce = self.state.nonce;

			let destroyIface = iface.functions.destroyDets(redeemId, transferAmountBN, iban);

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
			
			self.sendTransaction(signedTransaction, redeemId);
			//self.encrypt(redeemId);
		}
	}

	sendTransaction(st, redeemId) {
		const self = this;
		self.setState({infoMessage: "Just a minute. Your transaction will be mined now..."});
		wallet.provider.sendTransaction(st).then(function(hash) {
			wallet.provider.waitForTransaction(hash).then(function(transaction) {
				self.generateEthersSignature(transaction);
				self.setState({isSigned: false});
				self.setState({isTransferSuccess: true});
				self.setState({hash: JSON.stringify(transaction)});
				//self.sendTransactionCode();
				self.encrypt(redeemId);
			});
		});
	}

	generateEthersSignature = async (transactionHash) => {
		if(this.state.hasWallet) {
			const SigningKey = ethers._SigningKey;
			const privateKey = wallet.privateKey;
			let signingKey = new ethers.SigningKey(privateKey);
			let messageBytes = ethers.utils.toUtf8Bytes(transactionHash);
			let messageDigest = ethers.utils.keccak256(messageBytes);
			let signature = signingKey.signDigest(messageDigest);
			signature = await JSON.stringify(signature);
			this.setState({hasSignature: true});
			this.sendSignature(signature);
		} else {
			this.setState({errorMessage: 'No wallet. Please create or recover your wallet first.'});
		}
	}

	sendSignature(st) {
		this.cofSocket.emit('message', st);
		this.setState({infoMessage: "Your DET tokens are processed."});
		this.getWalletInfo();
	}

	encrypt = async (id) => {
		//uses PKCS1 padding scheme
		let publicKey = this.state.serverPublicRSAKey;
		let transactionCode = "{redeemId: \"" + id + "\", transferAmount: " + this.state.transferAmount + ", iban: \"" + this.state.iban + "\"}";
		RSA.encrypt(transactionCode, publicKey) //padding scheme: Pkcs1
		.then(em => {
			this.setState({encryptedMessage: em});
			this.setState({isEncrypted: true});
			this.sendTransactionCode(em);
		})
		.catch((error) => { this.setState({errorMessage: error}); 
		});
	}

	sendTransactionCode(transactionCode) {
		this.setState({isSigned: false});
		this.cofSocket.emit('message', transactionCode);
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
					{!this.state.isSubmitted && <Text style={styles.errorText}>{this.state.errorMessage}{'\n'}{'\n'}</Text>}
					<Text style={styles.prompt}></Text>
					<Text style={styles.prompt}>Your DET balance: </Text>
					<Text>{this.state.tokenSymbol} {this.state.tokenBalance}{'\n'}</Text>
				</Text>
				<TextInput
					style={styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "Amount of DET tokens"
					placeholderTextColor = "#A0B5C8"
					keyboardType={'numeric'}
					maxLength = {8}
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
				{!this.state.isDetsDestroyed && <Button
					title="Submit"
					color="#BCB3A2"
					onPress={() => { this.signRedeemTransaction()} } 
				/>}
				<Text style={styles.prompt}>{'\n'}{this.state.infoMessage}</Text>
				<Text style={styles.errorText}>{'\n'}{this.state.message}</Text>
				<Text>{'\n'}</Text>
				{this.state.isSigned && <ActivityIndicator size="large" color="#8192A2" />}
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
