import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, AsyncStorage, RefreshControl } from 'react-native';
import Connector from './Connector.js';
import ethers from 'ethers';
import CreateTokensScreen from './CreateTokensScreen.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RSA, RSAKeychain} from 'react-native-rsa-native';
import socketIo from 'react-native-socket.io-client';

class BuyScreen extends React.Component {
	static navigationOptions = {
		title: 'Fetch your DET tokens'
	};

	constructor(props) {
		super(props);

		this.state = {
			isSubmitcodeCreated: false,
			isInitated: false,
			refreshing: false,
			submitMessage: '',
			hasWallet: false,
			walletAddress: '',
			submitCode: '',
			errorMessage: '',
			submitCodeList: null,
			isSignatureSent: false,
			hasSignature: false,
			//serverPublicRSAKey: null,
			//hasServerPublicRSAKey: false,
			//isEncrypted: false,
		};

		this.cofSocket = daAcquireSocket;
	}

	componentWillMount() {
		var self = this;
		wallet.provider = etherscanProvider;
		const walletAddress = wallet.address;
		self.setState({walletAddress: walletAddress});
		self.setState({hasWallet: true});
		self.setState({isInitated:true});

		self.cofSocket.on('connect', function() { 
			self.setState({socketId: '/acquire#' + self.cofSocket.id});
		});
		this.cofSocket.on('connect_failed', function() {
			this.setState({errorMessage: "Sorry, there seems to be an issue with the connection!"});
		});
		
		self.getSubmitCodeList();
	}

	componentWillUnmount() {
		this.setState({isSubmitcodeCreated: false});
		this.setState({isInitated: false});
		this.setState({isSignatureSent: false});
		this.setState({hasWallet: false});
		this.setState({submitMessage: ''});
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getContactList().then(() => {
			this.setState({refreshing: false});
		});
	}

	getSubmitCodeList = async () => {
		try {
			await AsyncStorage.getItem('submitCodeList')
			.then( (value) => {
				if (value !== null) {
					this.setState({submitCodeList: JSON.parse(value)})
				}
			})
		}
		catch(error) {
			this.setState({errorMessage: 'submitCodeList error: ' + error});
		}
	}

	/*recoverServerPublicRSAKey = async () => {
		const self = this;
		return fetch(serverPublicRSAKey) //see connector.js
		.then((response) => response.json()) 
		.then((responseJson) => { 
			self.setState({serverPublicRSAKey: responseJson.result});
			this.setState({hasServerPublicRSAKey: true});
		})
		.catch((error) => { this.setState({errorMessage: 'Public key not found: ' + error});
		}); 
	}*/

	generateSubmitCode() {
		let submitCode = Math.random().toString(16).slice(2);
		this.setState({submitCode: submitCode});
		this.setState({isSubmitcodeCreated: true});
		this.setState({isInitated: false});
		this.setState({submitMessage: 'Now make a bank transfer in Euros to IBAN NL52BUNQ2025415389 and dont forget to add the request code in the comment area.'});
		this.saveSubmitCodeList(submitCode);
	}

	saveSubmitCodeList = async (submitCode) => {
		try {
			let submitCodeList = this.state.submitCodeList;
			if(submitCodeList !== null) {
				submitCodeList = this.state.submitCodeList.concat({id: submitCode}); //add code to array
				AsyncStorage.setItem('submitCodeList', JSON.stringify(submitCodeList)); //write to async storage
				this.setState({submitCodeList: submitCodeList}); //write to status
				this.generateEthersSignature(submitCode);
			} else {
				submitCodeList = [{id: submitCode}];
				AsyncStorage.setItem('submitCodeList', JSON.stringify(submitCodeList)); //write to async storage
				this.setState({submitCodeList: submitCodeList}); //write to status
				this.generateEthersSignature(submitCode);
			}
		}
		catch(error) {
			this.setState({errorMessage: 'SubmitCodeList: ' + error});
		}
	}

	/*encryptSubmitCode(sc) {
		let serverPublicRSAKey = this.state.serverPublicRSAKey;
		let signedConfirmationCode = RSA.encrypt(sc, serverPublicRSAKey)
		.then(encodedMessage => {
			this.setState({isEncrypted: true});
			this.generateEthersSignature(encodedMessage);
		})
		.catch((error) => { this.setState({errorMessage: error}); 
		});
	} */

	generateEthersSignature = async (submitCode) => {
		if(this.state.hasWallet) {
			const SigningKey = ethers._SigningKey;
			const privateKey = wallet.privateKey;
			let signingKey = new ethers.SigningKey(privateKey);
			let messageBytes = ethers.utils.toUtf8Bytes(submitCode);
			let messageDigest = ethers.utils.keccak256(messageBytes);
			let signature = signingKey.signDigest(messageDigest);
			signature = await JSON.stringify(signature);
			this.setState({hasSignature: true});
			this.sendSignature(signature);
		} else {
			this.setState({errorMessage: 'No wallet. Please create or recover your wallet first.'});
		}
	}
	
	sendSignature(sig) {
		this.cofSocket.emit('message', sig);
		this.setState({isSignatureSent: true});
	}

	render() {
		//const {coinbase, tokenAddress } = this.props;
		return (
			<ScrollView style={styles.container} refreshControl={
			<RefreshControl
						refreshing={this.state.refreshing}
						onRefresh={this.onRefresh.bind(this)}
					/>
				}>
				<View style={styles.container}>
					<Text style={styles.baseText}>
						<Ionicons name={'ios-flask'} size={26} style={styles.icon} />
						<Text style={styles.header_h4}> 1. Generate request code {'\n'}</Text>
						{this.state.isInitated && <Text style={styles.prompt}>Click this one to get your DET request code.{'\n'}</Text>}
						<Text style={styles.prompt}>hasSignature: {this.state.hasSignature.toString()}</Text>
					</Text>

					{this.state.isInitated && <Button 
						color="#BCB3A2"
						title="Create code"
						accessibilityLabel="Submit"
						onPress = { ()=> this.generateSubmitCode()}
					/>}
					{this.state.isSubmitcodeCreated && <View style={styles.codeSpace}><Text style={styles.submitCode}> {this.state.submitCode} </Text></View>}
				</View>
				{!this.state.isSubmitcodeCreated && <CreateTokensScreen newReceiptId={JSON.stringify(this.state.submitCodeList)} />}
				<Text style={styles.baseText}>
					{this.state.isSubmitcodeCreated && <Text>{this.state.submitMessage} {this.state.submitCode}{'\n'}</Text>}
					<Text style={styles.errorText}>{this.state.errorMessage}{'\n'}</Text>
					{this.state.isSignatureSent && <Text style={styles.prompt}>Your code has been sent to server.{'\n'}</Text>}
					<Text>{'\n'}</Text>
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
		backgroundColor: 'whitesmoke',
	},
	baseText: {
		/*textAlign: 'left',*/
		color: '#999999',
		marginBottom: 5,
		marginLeft: 5,
	},
	header_h4: {
		color: '#2D4866',
		fontSize: 20,
		padding: 10,
	},
	prompt: {
		color: '#BCB3A2',
	},
	input: {
		height: 40, 
		borderColor: '#D3C8B2', 
		borderWidth: 1,
		fontSize: 14,
		marginBottom: 15,
		color: '#999999',
	},
	row: {
		color: '#8192A2',
		padding: 10,
		marginBottom: 5,
		fontSize: 16,
	},
	submitCode: {
		color: '#8192A2',
		padding: 10,
		fontSize: 28,
		color: 'red',
	},
	postItem: {
		paddingTop: 4,
	},
	codeSpace: {
		height: 100,
		padding: 20,
		backgroundColor: '#CCC', 
		flex: 0.3,		
		alignItems: 'center'
	},
	icon: {
		color: '#2D4866',
		fontSize: 30,
	},
	errorText: {
    marginTop: 10,
    color: 'red'
  },
});


export default BuyScreen;