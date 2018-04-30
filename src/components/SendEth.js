import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, AsyncStorage, TextInput, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import ethers from 'ethers';
import Connector from './Connector.js';
import Ionicons from 'react-native-vector-icons/Ionicons';

class SendEth extends React.Component {
	static navigationOptions = {
		title: 'Transfer Ethers',
		tabBarLabel: 'ETHER'
	};

	constructor(props) {
		super(props);

		this.state = {
			hasWallet: false,
			toAddress: '0x2b39Ba3dD043F46bb859Afd37522d6Be717BbafE',
			ethAmount: '0.00001',
			ethBalance: '',
			ethRate: '',
			nonce: '',
			submitMessage: '',
			walletAddress: '',
			message: '',
			isSigned: false,
			isTransferSuccess: false,
			refreshing: false
		};
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			let mnemonic = await AsyncStorage.getItem('mnemonic');

			let etherAmount = '';
			walletAddress = this.state.walletAddress;
			this.setState({hasWallet: true});

			//transaction number
			if (wallet !== '') {
				//transaction number (nonce)
				wallet.getTransactionCount('latest').then(function(count) {
					self.setState({nonce: count.toString()});
				});

				etherscanProvider.getBalance(wallet.address, 'latest').then(function(balance) {
					etherAmount = ethers.utils.formatEther(balance);
					if (balance > 0) {
						self.setState({ethBalance: etherAmount.toString()});
					} else {
						self.setState({message: "Your balance is too low. Please send some Eths to this wallet account."});
						self.setState({ethBalance: etherAmount.toString()});
					}
				});
			}
		}
		catch(error) {
			this.setState({hasWallet: false});
			this.setState({message: error});
		}
	}

	componentWillMount() {
		let self = this;
		this.setState({walletAddress: wallet.address});
		self.getWalletInfo();
	}

	emitSend() {
		let self = this;
		if(wallet) {
			wallet.provider = etherscanProvider;
			let nonce = self.state.nonce;
			let ethAmount = self.state.ethAmount;
			let transactionHash;

			const transaction = {
				nonce: ethers.utils.bigNumberify(nonce),
				gasLimit: 21000,
				gasPrice: ethers.utils.bigNumberify("20000000000"),
				to: self.state.toAddress,
				value: ethers.utils.parseEther(ethAmount),
				data: "0x",
			};
			//sign transaction
			let signedTransaction = wallet.sign(transaction);
			let parsedTransaction = ethers.Wallet.parseTransaction(signedTransaction);
			self.setState({isSigned: true});
			//send Ethers transaction
			wallet.provider.sendTransaction(signedTransaction).then(function(hash) {
				transactionHash = hash;
				etherscanProvider.waitForTransaction(transactionHash).then(function(transaction) {
					self.setState({isSigned: false});
					self.setState({isTransferSuccess: true});
					self.setState({submitMessage: hash.toString()});
					self.getWalletInfo();
				});
			});
		}
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getWalletInfo().then(() => {
			this.setState({refreshing: false});
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
			<Ionicons name={'md-share-alt'} size={26} style={styles.icon} />
			<Text style={styles.header_h4}> Send Ethers{'\n'}{'\n'}</Text>
			<Text style={styles.prompt}>Eth Balance: </Text>
			<Text>Ξ {this.state.ethBalance}{'\n'}{'\n'}</Text>
		<Text style={styles.prompt}>Send tokens to address: </Text>
		<Text>{'\n'}</Text>
		</Text>
		{this.state.hasWallet &&<TextInput
			style={styles.input}
			defaultValue = {this.state.toAddress}
			underlineColorAndroid = "transparent"
			autoFocus = {true}
			selectable = {true}
			selectTextOnFocus = {true}
			maxLength = {80}
			placeholderTextColor = "#A0B5C8"
			onChangeText = {(toAddress) => this.setState({toAddress})}
			/*value = {}*/
		/>}
		<TextInput
			style={styles.input}
			underlineColorAndroid = "transparent"
			placeholder = "Amount of Ethers (max 12 decimals)"
			placeholderTextColor = "#A0B5C8"
			keyboardType={'numeric'}
			blurOnSubmit={true}
			onChangeText={(ethAmount) => this.setState({ethAmount})}
			defaultValue = {this.state.ethAmount} 
		/>
		<Button 
			color="#BCB3A2"
			title="Submit"
			accessibilityLabel="Submit"
			onPress = { ()=> this.emitSend()}
		/>
		<Text style={styles.baseText}>{'\n'}
			{this.state.isSigned && <Text><Ionicons name={'ios-cog-outline'} size={26} style={styles.icon} /> Just a minute. Your transaction will be mined now...</Text>}
			{this.state.isTransferSuccess && <Text style={styles.prompt}>Hash is mined:{'\n'} </Text>}
			{this.state.isTransferSuccess && <Text>{this.state.submitMessage}{'\n'}</Text>}
			<Text style={styles.errorText}>{this.state.message}{'\n'}</Text>
		</Text>
      </ScrollView>

    );
  }
};

const styles = StyleSheet.create({
	container: {
		marginTop: 30,
		marginLeft: 20,
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
		marginLeft: 10,
	},
	prompt: {
		color: '#BCB3A2',
	},
	errorText: {
		marginTop: 10,
		color: 'red'
	},
	input: {
		height: 40, 
		borderColor: '#D3C8B2', 
		borderWidth: 1,
		fontSize: 14,
		marginBottom: 15,
		color: '#999999',
	},
	icon: {
		color: '#2D4866',
		fontSize: 30,
	},
});

export default SendEth;
