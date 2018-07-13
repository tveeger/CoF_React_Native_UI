import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
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
		walletAddress: '',
		tokenAddress: '',
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
		};

		this.socket = new WebSocket('ws://45.32.186.169:28475');
		//this.socket = new WebSocket('ws://127.0.0.1:28475');
		//this.socket = new WebSocket('ws://echo.websocket.org'); //test
		this.socket.onopen = () => {
			this.setState({connected:true})
		};
		this.socket.onmessage = (e) => {
		    //console.log(e.data);
			this.setState({incoming:e.data});
		};
		this.socket.onerror = (e) => {
		    //console.log(e.message);
			this.setState({errorMessage:e.message});
		};
		this.socket.onclose = (e) => {
			this.setState({connected:false})
			console.log(e.code, e.reason);
		};
		this.sendRedeemEuros = this.sendRedeemEuros.bind(this);
	}

	componentWillMount() {
		var self = this;
		this.setState({walletAddress: wallet.address});
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

	sendWebsocketMessage() {
		
	}

	sendRedeemEuros() {
		const self = this;
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
			let redeemId = Math.random().toString(16).slice(2);
			self.setState({redeemId: redeemId});

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
			self.setState({isSigned: true});
			self.setState({infoMessage: "Just a minute. Your transaction will be mined now..."});
			wallet.provider.sendTransaction(signedTransaction).then(function(hash) {
				wallet.provider.waitForTransaction(hash).then(function(transaction) {
					self.socket.send(signedTransaction); //TODO
					self.setState({infoMessage: "Your DET tokens are redeemed."});
					self.setState({isSigned: false});
					self.setState({isTransferSuccess: true});
					self.setState({hash: hash.toString()});
					self.getWalletInfo();
				});
			});
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
