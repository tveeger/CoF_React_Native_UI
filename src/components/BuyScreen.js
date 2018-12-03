import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, AsyncStorage, RefreshControl } from 'react-native';
import Connector from './Connector.js';
import ethers from 'ethers';
//import metacoin_artifacts from '../contracts/BirdlandToken.json';
import CreateTokensScreen from './CreateTokensScreen.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
//import {RSA, RSAKeychain} from 'react-native-rsa-native';
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
		};

		//this.socket = new WebSocket('ws://45.32.186.169:28475');
		this.socket = new WebSocket('ws://192.168.1.10:28475');
        //this.socket = new WebSocket('ws://echo.websocket.org'); //test
        this.socket.onopen = () => {
            this.setState({connected:true})
        };
        this.socket.onmessage = (e) => {
            console.log(e.data);
            this.setState({incoming:e.data});
        };
        this.socket.onerror = (e) => {
            this.setState({errorMessage:e.message});
            //console.log(e.message);
        };
        this.socket.onclose = (e) => {
            this.setState({connected:false})
            console.log(e.code, e.reason);
        };
        this.sendSignature = this.sendSignature.bind(this);
        this.generateSubmitCode = this.generateSubmitCode.bind(this);
        //this.getSigningKey = this.getSigningKey.bind(this);
	}

	componentWillMount() {
		var self = this;
		wallet.provider = etherscanProvider;
		const walletAddress = wallet.address;
		self.setState({walletAddress: walletAddress});
		
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
		self.setState({isInitated:true});
		//self.getSigningKey();
		self.getReceiptId();
	}

	componentWillUnmount() {
		this.setState({isSubmitcodeCreated: false});
		this.setState({isInitated: false});
		this.setState({isEncryptedSent: false});
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getContactList().then(() => {
			this.setState({refreshing: false});
		});
	}

	getReceiptId = async () => {
		try {
			await AsyncStorage.getItem('daReceiptId').then( (value) =>
				this.setState({submitCodeList: JSON.parse(value)})
			)
		}
		catch(error) {
			this.setState({errorMessage: 'daReceiptId error: ' + error});
		}
	}

	generateSubmitCode =  async () => {
		try {
			let submitCode = Math.random().toString(16).slice(2); //create random code
			let submitCodeList = this.state.submitCodeList;
			if(submitCodeList !== null) {
				submitCodeList = this.state.submitCodeList.concat({id: submitCode}); //add code to array
				AsyncStorage.setItem('daReceiptId', JSON.stringify(submitCodeList)); //write to async storage
			this.setState({submitCodeList: submitCodeList}); //write to status
			} else {
				submitCodeList = [{id: submitCode}];
				AsyncStorage.setItem('daReceiptId', JSON.stringify(submitCodeList)); //write to async storage
				this.setState({submitCodeList: submitCodeList}); //write to status
			}

			this.setState({submitCode: submitCode});
			this.setState({isSubmitcodeCreated: true});
			this.setState({isInitated: false});
			this.setState({submitMessage: 'Now make a bank transfer in Euros to IBAN NL52BUNQ2025415389 and dont forget to add the request code in the comment area.'});
			this.createSignature(submitCode);
		}
		catch(error) {
			this.setState({errorMessage: 'generateSubmitCode: ' + error});
		}
	}

	createSignature(message) {
		const SigningKey = ethers._SigningKey;
		const privateKey = wallet.privateKey;
		let signingKey = new ethers.SigningKey(privateKey);
		let messageBytes = ethers.utils.toUtf8Bytes(message);
		let messageDigest = ethers.utils.keccak256(messageBytes);
		let signature = signingKey.signDigest(messageDigest);
		//this.setState({errorMessage: 'Encryption: ' + JSON.stringify(signature)});
		return this.sendSignature(JSON.stringify(signature));
	}

	sendSignature = async (signature) => {
		//TODO let signedSignature = RSA.encrypt(signature, publicKey);
		this.socket.send(signature); //TODO send(signedSignature)
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
						{this.state.isInitated && <Text style={styles.prompt}>Click this one to get your DET request code.</Text>}
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