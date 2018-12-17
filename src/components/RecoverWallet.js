import React, { Component } from 'react';
import { Button, AsyncStorage, View, ScrollView, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import ethers from 'ethers';
import {RSA, RSAKeychain} from 'react-native-rsa-native';
import Connector from './Connector.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigator } from 'react-navigation';
import HomeScreen from './HomeScreen.js';

class RecoverWalletForm extends React.Component {
	static navigationOptions = {
		title: 'Recover Wallet',
		tabBarLabel: 'Recover Wallet'
	};

	constructor(props) {
		super(props);

		this.state = {
			mnemonic: '',
			submitMessage: '',
			walletAddress: '',
			message: '',
			errorMessage: '',
			hasWallet: false,
			walletSaved: false,
			isBusy: false,
			hasSignature: false,
			createdKeys: false,
		};
	}

	componentWillMount() {
		
	}

	componentWillUnmount() {
		this.setState({walletSaved: false});
	}

	timerElapsed() {
		this.setState({isBusy: false});
	}

	emitMnemonic() {
		this.setState({isBusy: true});
		this.setState({message: ""});
		let thisMnemonic = this.state.mnemonic;
		const HDNode = ethers.HDNode;

		setTimeout(function() { this.timerElapsed(); }.bind(this), 5000);

		let isValidMnemonic = HDNode.isValidMnemonic(thisMnemonic);
		
		if (isValidMnemonic) {
			wallet = ethers.Wallet.fromMnemonic(thisMnemonic);
			wallet.provider = etherscanProvider;
			this.setState({walletAddress: wallet.address});
			AsyncStorage.setItem('mnemonic', thisMnemonic);

			this.setState({walletSaved: true});
			this.setState({isBusy: false});

			this.generateEthersSignature();
			this.generateRsaKeys();
		} else {
			this.setState({message: "Invalid mnemonic"});
			this.setState({isBusy: false});
		}
	}

	generateEthersSignature = async () => {
		let hasSigningKey = this.state.signingKey;
		const SigningKey = ethers._SigningKey;
		const privateKey = wallet.privateKey;
		let signingKey = new ethers.SigningKey(privateKey);
		let message = 'Chains of Freedom';
		let messageBytes = ethers.utils.toUtf8Bytes(message);
		let messageDigest = ethers.utils.keccak256(messageBytes);
		let signature = signingKey.signDigest(messageDigest);
		AsyncStorage.setItem('myEthersSignature', JSON.stringify(signature));
		this.setState({hasSignature: true});
	}

	generateRsaKeys = async () => {
		RSA.generateKeys(4096) // set key size
		.then(keys => {
			AsyncStorage.setItem('myRsaPrivate', keys.private);
			AsyncStorage.setItem('myRsaPublic', keys.public);
		})
		.then(() => {
			this.setState({createdKeys: true});
		})
	}

  render() {
  	const {navigate} = this.props.navigation;
    return (
		<ScrollView style={styles.container}>
			<Text style={styles.baseText}>
				<Ionicons name={'ios-color-wand'} size={26} style={styles.icon} />
				<Text style={styles.header_h4}> Recover your excisting wallet{'\n'}{'\n'}</Text>
				<Text>Enter your mnemonic  in the field below. {'\n'}</Text>
			</Text>
			<TextInput
				style={styles.input}
				defaultValue = {this.state.mnemonic}
				underlineColorAndroid = "transparent"
				multiline = {true}
				numberOfLines = {3}
				placeholder = "Your 12 word mnemonic phrase, separated with a space"
				placeholderTextColor = "#A0B5C8"
				blurOnSubmit = {true}
				onChangeText = {(mnemonic) => this.setState({mnemonic})}
			/>
			{!this.state.walletSaved && <Button 
				color="#BCB3A2"
				title="Recover"
				accessibilityLabel="CreateWallet"
				onPress = { ()=> this.emitMnemonic()}
			/>}

			<Text style={styles.baseText}>
				{this.state.walletSaved && <Text style={styles.prompt}>Mnemonic is legit: </Text>}
				{this.state.walletSaved && <Text>{this.state.walletSaved.toString()}{'\n'}</Text>}
				{this.state.walletSaved && <Text style={styles.prompt}>Signature saved: </Text>}
				{this.state.walletSaved && <Text>{this.state.hasSignature.toString()}{'\n'}</Text>}
				{this.state.walletSaved && <Text style={styles.prompt}>Keys saved: </Text>}
				{this.state.walletSaved && <Text>{this.state.createdKeys.toString()}{'\n'}</Text>}
				<Text style={styles.errorText}>{this.state.message}{this.state.errorMessage}{'\n'}</Text>
			</Text>

			{this.state.walletSaved && <Button 
				color="#BCB3A2"
				title="Go Back"
				accessibilityLabel="Go Back"
				onPress = { ()=> navigate('HomeScreen')}
			/>}
			{this.state.isBusy && <ActivityIndicator size="large" color="#8192A2" />}
		</ScrollView>

    );
  }
};

const StackNav2 = StackNavigator({
  HomeScreen: { screen: HomeScreen }
  }, {
    navigationOptions: {
      headerTintColor: '#DDD',
      headerStyle: {backgroundColor: '#8192A2'}
    }
  
});

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
		marginTop: 10,
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
		height: 80, 
		borderColor: '#D3C8B2', 
		borderWidth: 1,
		fontSize: 18,
		marginBottom: 15,
		color: '#999999',
	},
	icon: {
		color: '#2D4866',
		fontSize: 30,
	},
});

export default RecoverWalletForm;
