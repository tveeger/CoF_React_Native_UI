import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, AsyncStorage } from 'react-native';
import Connector from './Connector.js';
import ethers from 'ethers';
//import metacoin_artifacts from '../contracts/BirdlandToken.json';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import FA from 'react-native-vector-icons/FontAwesome';
wallet = '';

class BuyScreen extends React.Component {
	static navigationOptions = {
		title: 'Fetch your DET tokens',
		tabBarLabel: 'Fetch',
	};

	constructor(props) {
		super(props);

		this.state = {
			isSubmitted: false,
			isInitiated: false,
			connected: false,
			euroInputAmount: '',
			submitMessage: '',
			walletAddress: '',
			tokenId: '',
			tokenAddress: '',
			submitCode: '',
			confirmMessage: '',
			incoming: '',
			errorMessage: '',
			euroAmountFromReceipt: 0,
			detsAmountFromReceipt: 0,
			tokenCreatedStatusFromReceipt: false,
			tokenCreatorFromReceipt: '',
		};

		this.socket = new WebSocket('ws://45.32.186.169:28475');
		//this.socket = new WebSocket('ws://127.0.0.1:28475');
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
            console.log(e.message);
            
        };
        this.socket.onclose = (e) => {
            this.setState({connected:false})
            console.log(e.code, e.reason);
        };
        this.sendIbanTransferMessage = this.sendIbanTransferMessage.bind(this);
        this.generateActivationCode = this.generateActivationCode.bind(this);
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			contract = new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);
			let tokenId = 'dada';

			if(contract !== '') {
				//get Euro amount from receipt
				contract.getEuroAmountFromReceipt(daTokenId).then(function(result){
					self.setState({euroAmountFromReceipt: result.toString()});
				});
				//get DET amount from receipt
				contract.getDetsAmountFromReceipt(tokenId).then(function(result){
					self.setState({detsAmountFromReceipt: result.toString()});
				});
				//get token created from receipt
				contract.getTokenCreatedStatusFromReceipt(tokenId).then(function(result){
					self.setState({tokenCreatedStatusFromReceipt: result.toString()});
				});
				//get token creator from receipt
				contract.getTokenCreatorFromReceipt(tokenId).then(function(result){
					self.setState({tokenCreatorFromReceipt: result});
				});
			}
			let tokenCreatedStatusFromReceipt = self.state.tokenCreatedStatusFromReceipt;
			if(tokenCreatedStatusFromReceipt) {
				self.setState({euroAmountFromReceipt: 0});
			}
		}
		catch(error) {
			this.setState({hasWallet: false});
			this.setState({message: error});
		}
	}

	componentWillMount() {
		var self = this;
		wallet.provider = etherscanProvider;
		const walletAddress = wallet.address;
		self.setState({walletAddress: walletAddress});
		self.getWalletInfo();
		
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
		const tokenId = daTokenId;
		self.setState({tokenId: tokenId});
		self.setState({isInitiated:true});


	}

	componentWillUnmount() {
		this.setState({isSubmitted: false});
		this.setState({isInitiated: false});
	}

	generateActivationCode() {
		const walletAddress = wallet.address;
		let submitCode = Math.random().toString(16).slice(2);
		
		if(submitCode != '') {
			this.setState({submitCode: submitCode});
			this.sendIbanTransferMessage(submitCode);
		}
	}

	sendIbanTransferMessage(code) {
		let messageContent = '{amount: "' + this.state.euroInputAmount + '", code: "' + code + '", sender:"' + wallet.address + '"}';
		/*const SigningKey = ethers._SigningKey;
		const privateKey = wallet.privateKey;
		const signingKey = new SigningKey(privateKey);
		let messageBytes = ethers.utils.toUtf8Bytes(messageContent);
		let messageDigest = ethers.utils.keccak256(messageBytes);
		let signature = signingKey.signDigest(messageDigest);*/
		this.socket.send(messageContent);
		this.setState({submitMessage: 'Transfer the exact amount of Euros to IBAN NL52BUNQ2025415389 and add the following code you see below in the comment area.'});
		/*var recovered = SigningKey.recover(messageDigest, signature.r,
                    signature.s, signature.recoveryParam);
		this.setState({pk: messageContent});
		this.setState({errorMessage: recovered});*/
		this.setState({isSubmitted: true});
		this.setState({euroInputAmount: ''});
		this.setState({isInitiated: false});
	}

	configDataString(inputAmount) {
		let self = this;
		const functionString = "0xa9059cbb000000000000000000000000";
		let toAddressString = self.state.transferToAddress.substr(2);
		let amountBN = ethers.utils.bigNumberify(inputAmount);
		let amountHex = amountBN.toHexString();
		let s = "0000000000000000000000000000000000000000000000000000000000000000" + amountHex.substr(2);
		let newLength = s.length-64;
		let zeroString = s.substr(newLength);
		let dataString = functionString + toAddressString + zeroString;
		return dataString;
	}

	createDets(id) {
		/* ID: "dada"
		0xb702bbd900000000000000000000000000000000000000000000000000000000000000
		20000000000000000000000000000000000000000000000000000000000000000
		46461646100000000000000000000000000000000000000000000000000000000
		*/

		this.setState({errorMessage: id});
		this.getWalletInfo();
	}

	render() {
		const {coinbase, tokenAddress } = this.props;
		return (
			<ScrollView style={styles.container}>
				<Text style={styles.baseText}>
					<Ionicons name={'ios-cart-outline'} size={26} style={styles.icon} />
					<Text style={styles.header_h4}> Transfer Euros {'\n'}{'\n'}</Text>
					{this.state.isInitiated && <Text>First deposit cash (Euros) from your bank account to your CoF account. 
					{'\n'}{'\n'} 
					</Text>}
					{this.state.isInitiated && <Text style={styles.prompt}>Set the amount of Euros you want to transfer: </Text> }
				</Text>

				{this.state.isInitiated && <TextInput
					style={styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "Minimum 1 Euro"
					placeholderTextColor = "#A0B5C8"
					keyboardType={'numeric'}
					maxLength={4}
					onChangeText={(euroInputAmount) => this.setState({euroInputAmount})}
					value={this.state.euroInputAmount}
				/>}

				{this.state.isInitiated && <Button 
					color="#BCB3A2"
					title="submit"
					accessibilityLabel="Submit"
					onPress = { ()=> this.generateActivationCode()}
				/>}
				{!this.state.isSubmitted && <Text style={styles.errorText}>{'\n'}{this.state.errorMessage}</Text> }
				{this.state.isSubmitted && <Text style={styles.row}>{this.state.submitMessage}{'\n'}</Text> }
				{this.state.isSubmitted && <View style={styles.codeSpace}><Text style={styles.submitCode}> {this.state.submitCode} </Text></View>}
				<Text style={styles.baseText}>
					{this.state.isSubmitted && <Text style={styles.row}>{this.state.incoming}</Text> }
					<Text style={styles.header_h4}>{'\n'}{'\n'}Your have &euro; {this.state.euroAmountFromReceipt} in your wallet {'\n'}{'\n'}</Text>
					<Text></Text>
					{this.state.tokenCreatedStatusFromReceipt && <Text>Press the button below to convert your Euros and create your DET tokens. You will receive 100 DET for each Euro.</Text> }
				</Text>
				{this.state.tokenCreatedStatusFromReceipt && <Button 
					color="#BCB3A2"
					title="Create tokens"
					accessibilityLabel="Transfer"
					onPress = { ()=> this.createDets(daTokenId)}
				/> }

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