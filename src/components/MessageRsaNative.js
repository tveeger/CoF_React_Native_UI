import React, { Component } from 'react';
import { Clipboard, Button, TouchableHighlight, Image, View, ScrollView, Text, TextInput, StyleSheet, AsyncStorage, RefreshControl } from 'react-native';
import ethers from 'ethers';
import Connector from './Connector.js';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Ionicons from 'react-native-vector-icons/Ionicons';
//https://github.com/amitaymolko/react-native-rsa-native
import {RSA, RSAKeychain} from 'react-native-rsa-native';
//https://github.com/Minds for more use cases

class MessageRsaNative extends React.Component {
  static navigationOptions = {
    title: 'Message RSA',
  };

	constructor(props) {
		super(props);

		this.state = {
			connected: '',
			incoming: '',
			message: '',
			myRsaPublic: '',
			myRsaPrivate: '',
			serverPublicRSAKey: '',
			inputMessage: '',
			encryptedMessage: '',
			decryptedMessage: '',
			errorMessage: '',
			signature: null,
			messageDigest: '',
			hasKeys: false,
			hasMyKeys: false,
			isSigned: false,
			isEncrypted: false,
			isRecovered: false,
			hasServerPublicKey: false,
			refreshing: false,
			isVerified: '',
			t1: 'gslkjghklsjdfhg',
			t2: '',
			clipboardContent: '',
		};
		//this.encrypt = this.encrypt.bind(this);

		//this.socket = new WebSocket('ws://45.32.186.169:28475'); //CoF website
		//this.socket = new WebSocket('ws://127.0.0.1:28475');	//test local
		this.socket = new WebSocket('ws://echo.websocket.org'); //test
		this.socket.onopen = () => {
			this.setState({connected:true})
		};
		this.socket.onmessage = (e) => {
			this.setState({incoming:e.data});
		};
		this.socket.onerror = (e) => {
			this.setState({errorMessage: e.message});
		};
		this.socket.onclose = (e) => {
			this.setState({connected:false})
			//this.setState({errorMessage: e.code + ', ' + e.reason});
		};
		this.emitSignature = this.emitSignature.bind(this);
		this.emitMessage = this.emitMessage.bind(this);
	}

	componentWillMount() {
		var self = this;
		wallet.provider = etherscanProvider;
		let hasKeys = self.state.hasKeys;
		if(!hasKeys) {
			self.recoverKeyPair();
		}
		let hasServerPublicKey = self.state.hasServerPublicKey;
		if(!hasServerPublicKey) {
			self.getServerPublicKey();
		}
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.recoverKeyPair().then(() => {
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

	recoverKeyPair = async () => {
		var self = this;
		await AsyncStorage.getItem('myRsaPublic').then( (value) =>
			self.setState({myRsaPublic: value})
		).catch((error) => { self.setState({errorMessage: 'Error: ' + error}); 
		});
		await AsyncStorage.getItem('myRsaPrivate').then( (value) =>
			self.setState({myRsaPrivate: value})
		).then( () =>
			this.setState({hasKeys: true})
		).catch((error) => { self.setState({errorMessage: 'Error: ' + error}); 
		}); 
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			const walletAddress = wallet.address;
		}
		catch(error) {
			self.setState({errorMessage: error});
		}
	}

	generateKeys = async () => {
		RSA.generateKeys(4096) // set key size
		.then(keys => {
			AsyncStorage.setItem('myRsaPrivate', keys.private);
			AsyncStorage.setItem('myRsaPublic', keys.public);
			this.setState({myRsaPrivate: keys.private});
			this.setState({myRsaPublic: keys.public});
			this.setState({hasKeys: true});
		})
	}

	encrypt = async () => {
		let message = this.state.inputMessage;
		let publicKey = this.state.myRsaPublic;
		RSA.encrypt(message, publicKey)
		.then(encodedMessage => {
			this.setState({encryptedMessage: encodedMessage});
			this.setState({isEncrypted: true});
		})
	}

	decrypt = async () => {
		let encodedMessage = this.state.encryptedMessage;
		let privateKey = this.state.myRsaPrivate;
		RSA.decrypt(encodedMessage, privateKey)
		.then(message => {
			this.setState({decryptedMessage: message});
			this.setState({isRecovered: true});
		})
	}

	sign = async () => {
		let message = this.state.inputMessage;
		let privateKey = this.state.myRsaPrivate;
		RSA.sign(message, privateKey)
		.then(signature => {
			this.setState({signature: signature});
			this.setState({isSigned: true});
		})
	}

	verify = async () => {
		let signature = this.state.signature;
		let publicKey = this.state.myRsaPublic;
		let message = this.state.inputMessage;
		RSA.verify(signature, message, publicKey)
		.then(valid => {
			this.setState({isVerified: valid.toString()});
		})
	}

	emitSignature = async () => {
		if( this.state.connected ) {
			let message = this.state.inputMessage;
			let privateKey = this.state.myRsaPrivate;
			RSA.sign(message, privateKey)
			.then(signature => {
				this.setState({signature: signature});
				this.setState({isSigned: true});
				this.socket.send(signature);
			})
			.catch((error) => { this.setState({errorMessage: error}); 
			});
		}
	}

	emitMessage = async () => {
		if( this.state.connected ) {
			let message = this.state.inputMessage;
			let publicKey = this.state.serverPublicRSAKey;
			RSA.encrypt(message, publicKey)
			.then(encodedMessage => {
				this.setState({encryptedMessage: encodedMessage});
				this.setState({isEncrypted: true});
				this.socket.send(message);
			})
			.catch((error) => { this.setState({errorMessage: error}); 
			}); 
		}
	}

	readFromClipboard = async () => {
		const clipboardContent = await Clipboard.getString();
		this.setState({ clipboardContent });
	};

  	writePubKeyToClipboard = async () => {
		await Clipboard.setString(this.state.myRsaPublic);
	};

	writePrivKeyToClipboard = async () => {
		await Clipboard.setString(this.state.myRsaPrivate);
	};
	writeKeysToClipboard = async () => {
		await Clipboard.setString(this.state.myRsaPublic + this.state.myRsaPrivate);
	};

  	render() {
		return (
			<View refreshControl={
				<RefreshControl
						refreshing={this.state.refreshing}
						onRefresh={this.onRefresh.bind(this)}
					/>
				}>

				<Text style={styles.baseText}>
					<Text style={styles.header_h4}>RSA-Encryption{'\n'}</Text>
					<Text>{this.state.message} </Text>
					<Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
				</Text>
				<Text style={styles.baseText}>
					<Text style={styles.prompt}>Recovered key pair: </Text>
					<Text>{this.state.hasKeys.toString()}</Text>
				</Text>
				{!this.state.hasKeys && <Button 
					color="#BCB3A2"
					title="create keypair"
					accessibilityLabel="Create"
					onPress = { ()=> this.generateKeys()}
				/>}
				{this.state.hasKeys && <TextInput
					style={styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "Your message here"
					placeholderTextColor = "#A0B5C8"
					maxLength = {80}
					onChangeText={(inputMessage) => this.setState({inputMessage})}
				/>}				
				<View style={styles.buttonContainer}>
					{this.state.hasKeys && <TouchableHighlight style={styles.smallButton} onPress = {() => {
						this.encrypt()}}>
						<Text style = {styles.hyperLink}> Encrypt </Text>
					</TouchableHighlight>}
					{this.state.hasKeys && <TouchableHighlight style={styles.smallButton} onPress = {() => {
						this.decrypt()}}>
						<Text style = {styles.hyperLink}> Decrypt </Text>
					</TouchableHighlight>}
					{this.state.hasKeys && <TouchableHighlight style={styles.smallButton} onPress = {() => {
						this.sign()}}>
						<Text style = {styles.hyperLink}> Sign </Text>
					</TouchableHighlight>}
					{this.state.hasKeys && <TouchableHighlight style={styles.smallButton} onPress = {() => {
						this.verify()}}>
						<Text style = {styles.hyperLink}> Verify </Text>
					</TouchableHighlight>}
				</View>
				<View style={styles.buttonContainer}>
					{this.state.hasKeys && <TouchableHighlight style={styles.midSizeButton} onPress={this.writeKeysToClipboard}>
						<Text style = {styles.hyperLink}> Copy keys</Text>
					</TouchableHighlight>}
					{this.state.hasKeys && <TouchableHighlight style={styles.midSizeButton} onPress = {() => {
						this.emitSignature()}}>
						<Text style = {styles.hyperLink}> Send Signature</Text>
					</TouchableHighlight>}
					{this.state.hasKeys && <TouchableHighlight style={styles.midSizeButton} onPress = {() => {
						this.emitMessage()}}>
						<Text style = {styles.hyperLink}> Send Message</Text>
					</TouchableHighlight>}
				</View>
				<Text style={styles.baseText}>
					{this.state.hasKeys && <Text style={styles.prompt}>encrypted: </Text>}
					{this.state.hasKeys && <Text>{this.state.isEncrypted? "true":"false"}{'\n'}</Text>}
					{this.state.hasKeys && <Text style={styles.prompt}>decrypted: </Text>}
					{this.state.hasKeys && <Text>{this.state.decryptedMessage}{'\n'}</Text>}
					{this.state.hasKeys && <Text style={styles.prompt}>signature: </Text>}
					{this.state.hasKeys && <Text>{this.state.isSigned? "true":"false"}{'\n'}</Text>}
					{this.state.hasKeys && <Text style={styles.prompt}>verified: </Text>}
					{this.state.hasKeys && <Text>{this.state.isVerified? "true":"false"}{'\n'}</Text>}
					{this.state.hasKeys && <Text style={styles.prompt}>Server Public Key: </Text>}
					{this.state.hasKeys && <Text>{this.state.hasServerPublicKey? "true":"false"} </Text>}
				</Text>
				
			</View>
		);
    }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
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
  errorMessage: {
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
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	smallButton: {
		backgroundColor: '#BCB3A2',
		padding: 8,
		width: 100,
		marginLeft: 2,
		marginBottom: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	midSizeButton: {
		backgroundColor: '#BCB3A2',
		padding: 8,
		width: 135,
		marginLeft: 2,
		marginBottom: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hyperLink: {
		color: 'whitesmoke',
		fontSize: 16,
		fontWeight: 'bold'
	},
});

export default MessageRsaNative;
