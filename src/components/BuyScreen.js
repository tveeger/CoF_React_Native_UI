import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, AsyncStorage } from 'react-native';
import Connector from './Connector.js';
import ethers from 'ethers';
import metacoin_artifacts from '../contracts/BirdlandToken.json';
import CreateTokensScreen from './CreateTokensScreen.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import FA from 'react-native-vector-icons/FontAwesome';

class BuyScreen extends React.Component {
	static navigationOptions = {
		title: 'Get your tokens',
		tabBarLabel: 'Fetch',
	};

	constructor(props) {
		super(props);

		this.state = {
			isSubmitted: false,
			isInitated: false,
			connected: false,
			euroInputAmount: '',
			submitMessage: '',
			walletAddress: '',
			tokenAddress: '',
			submitCode: '',
			confirmMessage: '',
			incoming: '',
			errorMessage: '',
			daTokenId: '',
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
        this.sendMessage = this.sendMessage.bind(this);
        this.createSubmitCode = this.createSubmitCode.bind(this);
	}

	componentWillMount() {
		var self = this;
		wallet.provider = etherscanProvider;
		const walletAddress = wallet.address;
		self.setState({walletAddress: walletAddress});
		
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
		self.setState({isInitated:true});
		self.getTokenId();
	}

	componentWillUnmount() {
		this.setState({isSubmitted: false});
		this.setState({isInitated: false});
	}

	createSubmitCode() {
		let submitCode = Math.random().toString(16).slice(2);
		
		if(submitCode != '') {
			this.setState({submitCode: submitCode});
			this.sendMessage(submitCode);
			this.getTokenId();
		}
	}

	getTokenId = async () => {
		try {
			let daTokenId = await AsyncStorage.getItem('daTokenId');
			if(daTokenId == null) {
				let submitCode = this.state.submitCode;
				if (submitCode != '') {
					AsyncStorage.setItem('daTokenId', this.state.submitCode);
				}
			}	
		} catch(error) {

		}
	}

	sendMessage(code) {
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
		this.setState({isInitated: false});
	}

	render() {
		const {coinbase, tokenAddress } = this.props;
		return (
			<ScrollView style={styles.container}>
				<Text style={styles.baseText}>
					<Ionicons name={'ios-cart-outline'} size={26} style={styles.icon} />
					<Text style={styles.header_h4}> Fetch some DET tokens {'\n'}{'\n'}</Text>
					{this.state.isInitated && <Text>Set the amount of Euros you want to transfer.</Text>}					
				</Text>

				{this.state.isInitated && <TextInput
					style={styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "Minimum 1 Euro"
					placeholderTextColor = "#A0B5C8"
					keyboardType={'numeric'}
					maxLength={4}
					onChangeText={(euroInputAmount) => this.setState({euroInputAmount})}
					value={this.state.euroInputAmount}
				/>}

				{this.state.isInitated && <Button 
					color="#BCB3A2"
					title="submit"
					accessibilityLabel="Submit"
					onPress = { ()=> this.createSubmitCode()}
				/>}
				{this.state.isSubmitted && <Text style={styles.row}>{this.state.submitMessage}</Text>}
				{!this.state.isSubmitted && <Text style={styles.errorText}>{this.state.errorMessage}</Text>}
				{this.state.isSubmitted && <View style={styles.codeSpace}><Text style={styles.submitCode}> {this.state.submitCode} </Text></View>}
				
				<CreateTokensScreen />
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