import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, AsyncStorage, RefreshControl } from 'react-native';
import Connector from './Connector.js';
import ethers from 'ethers';
//import metacoin_artifacts from '../contracts/BirdlandToken.json';
import CreateTokensScreen from './CreateTokensScreen.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RSA, RSAKeychain} from 'react-native-rsa-native';
import socketIOClient from 'socket.io-client';
//import Octicons from 'react-native-vector-icons/Octicons';
//import FA from 'react-native-vector-icons/FontAwesome';

class BuyScreen extends React.Component {
	static navigationOptions = {
		title: 'Fetch your DET tokens'
	};

	constructor(props) {
		super(props);

		this.state = {
			isSubmitcodeCreated: false,
			isInitated: false,
			connected: false,
			refreshing: false,
			submitMessage: '',
			hasWallet: false,
			walletAddress: '',
			tokenAddress: '',
			submitCode: '',
			confirmMessage: '',
			incoming: '',
			errorMessage: '',
			testCode: 'test12345',
			submitCodeList: null,
			signature: null,
			isEncryptedSent: false,
			hasSignature: false,
			myEthersSignature: null,
			endpoint: "http://192.168.1.10:8000", //45.32.186.169:28475
			myRsaPublic: '',
			hasRsaPublic: false,
			serverPublicRSAKey: null,
			hasServerPublicRSAKey: false,
			isEncrypted: false,
		};

		this.cofSocket = socketIOClient(this.state.endpoint + "/acquire");
		
		this.sendConfirmationCode = this.sendConfirmationCode.bind(this);
		this.generateSubmitCode = this.generateSubmitCode.bind(this);
	}

	componentWillMount() {
		var self = this;
		wallet.provider = etherscanProvider;
		const walletAddress = wallet.address;
		self.setState({walletAddress: walletAddress});
		self.setState({hasWallet: true})
		
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
		self.setState({isInitated:true});

		self.cofSocket.on('connect', function() { 
			self.setState({socketId: self.cofSocket.id});
			self.setState({connected:true});
		} );
		self.getSubmitCodeList();
		self.recoverEthersSignature();
	}

	componentWillUnmount() {
		this.setState({isSubmitcodeCreated: false});
		this.setState({isInitated: false});
		this.setState({isEncryptedSent: false});
		this.setState({hasRsaPublic: false});
		this.setState({hasWallet: false});
		this.setState({myRsaPublic: ''});
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

	generateSubmitCode() {
			let submitCode = Math.random().toString(16).slice(2);
			
			this.setState({submitCode: submitCode});
			this.setState({isSubmitcodeCreated: true});
			//this.assableConfirmationCode(submitCode);

			this.setState({isInitated: false});
			this.setState({submitMessage: 'Now make a bank transfer in Euros to IBAN NL52BUNQ2025415389 and dont forget to add the request code in the comment area.'});
			//this.assableConfirmationCode(submitCode);
			this.saveSubmitCodeList(submitCode);
	}
 
	tst = async (sc) => {
		let submitCode = sc;
		this.setState({errorMessage: 'submitCode: ' + submitCode});
	}

	saveSubmitCodeList = async (submitCode) => {
		try {
			let submitCodeList = this.state.submitCodeList;
			if(submitCodeList !== null) {
				submitCodeList = this.state.submitCodeList.concat({id: submitCode}); //add code to array
				AsyncStorage.setItem('submitCodeList', JSON.stringify(submitCodeList)); //write to async storage
				this.setState({submitCodeList: submitCodeList}); //write to status
				this.assableConfirmationCode(submitCode);
			} else {
				submitCodeList = [{id: submitCode}];
				AsyncStorage.setItem('submitCodeList', JSON.stringify(submitCodeList)); //write to async storage
				this.setState({submitCodeList: submitCodeList}); //write to status
				this.assableConfirmationCode(submitCode);
			}
		}
		catch(error) {
			this.setState({errorMessage: 'SubmitCodeList: ' + error});
		}
	}

	recoverEthersSignature = async () => {
		const self = this;
		await AsyncStorage.getItem('myEthersSignature')
		.then( (value) => {
			self.setState({myEthersSignature: value});
			self.setState({hasSignature: true});
		})
		.then( () => {
			this.recoverRsaPublic();
		})
		.catch((error) => { 
			self.setState({errorMessage: 'myPrivateKey: ' + error}); 
		});
	}

	recoverRsaPublic = async () => {
		const self = this;
		await AsyncStorage.getItem('myRsaPublic')
		.then( (value) => {
			self.setState({myRsaPublic: value});
			self.setState({hasRsaPublic: true});
		})
		.then( () => {
			this.recoverServerPublicRSAKey();
		})
		.catch((error) => { 
			self.setState({errorMessage: 'myPublicKey: ' + error}); 
		});
	}

	recoverServerPublicRSAKey = async () => {
		const self = this;
		return fetch(serverPublicRSAKey) //see connector.js
		.then((response) => response.json()) 
		.then((responseJson) => { 
			self.setState({serverPublicRSAKey: responseJson.result});
			this.setState({hasServerPublicRSAKey: true});
		})
		.catch((error) => { this.setState({errorMessage: 'Public key not found: ' + error});
		}); 
	}

	assableConfirmationCode(sc) {
		//let submitCode = this.state.submitCode;
		let submitCode = sc;
		let walletAddress = this.state.walletAddress;
		let myPublicRsaKey = this.state.myRsaPublic;
		let ethersSignature = this.state.myEthersSignature;

		if(this.state.hasWallet && this.state.hasRsaPublic && this.state.hasSignature && this.state.hasServerPublicRSAKey) {
			let confirmationCode = "{\"submitCode\": \"" + submitCode + "\", \"walletAddress\": \"" + walletAddress + "\", \"myPublicRsaKey\": \"" + myPublicRsaKey + "\", \"ethersSignature\": " + ethersSignature + "}";
			this.encryptConfirmationCode(confirmationCode);
			//this.setState({errorMessage: confirmationCode});
		} else {
			this.setState({errorMessage: 'No confirmationCode'});
		}
	}

	encryptConfirmationCode(cc) {
		//let confirmationCodeString = JSON.stringify(cc);
		let conf = "maak me blij";
		let serverPublicRSAKey = this.state.serverPublicRSAKey;
		let signedConfirmationCode = RSA.encrypt(conf, serverPublicRSAKey)
		.then(encodedMessage => {
			this.setState({isEncrypted: true});
			//this.setState({errorMessage: encodedMessage});
			this.sendConfirmationCode(encodedMessage);
		})
		.catch((error) => { this.setState({errorMessage: error}); 
		});
	}

	sendConfirmationCode(em) {
		this.cofSocket.emit('message', em);
		this.setState({isEncryptedSent: true});
	}

	render() {
		const {coinbase, tokenAddress } = this.props;
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
						<Text style={styles.prompt}>hasPublicRSAKey: {this.state.hasRsaPublic.toString()}, hasSignature: {this.state.hasSignature.toString()}, serverPublicKey: {this.state.hasServerPublicRSAKey.toString()}, submitCode: {this.state.isSubmitcodeCreated.toString()}, encrypted: {this.state.isEncrypted.toString()}}</Text>
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
					{this.state.isEncryptedSent && <Text style={styles.prompt}>Your code has been sent to server.{'\n'}</Text>}
					{this.state.isSubmitcodeCreated && <Text>{this.state.submitMessage} {this.state.submitCode}{'\n'}</Text>}
					<Text style={styles.errorText}>{this.state.errorMessage}{'\n'}</Text>
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