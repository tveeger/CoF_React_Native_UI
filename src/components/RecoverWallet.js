import React, { Component } from 'react';
import { Button, AsyncStorage, View, ScrollView, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import ethers from 'ethers';
import Connector from './Connector.js';
import Ionicons from 'react-native-vector-icons/Ionicons';


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
			hasWallet: false,
			walletSaved: false,
			isBusy: false,
		};
	}

	getMnemonic = async () => {
		try {
			let mnemonic = await AsyncStorage.getItem('mnemonic');
			wallet = ethers.Wallet.fromMnemonic(mnemonic);
			wallet.provider = etherscanProvider;
		}
		catch(error) {
			this.setState({message: 'Error: ' + error});
		}
	}

	componentWillMount() {

	}

	componentWillUnmount() {
		this.setState({walletSaved: false});
	}

	emitMnemonic() {
		const self = this;
		self.setState({isBusy: true});
		let thisMnemonic = self.state.mnemonic;
		const HDNode = ethers.HDNode;

		let isValidMnemonic = HDNode.isValidMnemonic(thisMnemonic);
		if (isValidMnemonic) {
			self.setState({walletSaved: true});
			wallet = ethers.Wallet.fromMnemonic(thisMnemonic);
			wallet.provider = etherscanProvider;

			AsyncStorage.setItem('mnemonic', thisMnemonic);
			self.setState({walletAddress: wallet.address});
			self.setState({isBusy: false});
			self.setState({mnemonic: ''});
			//self.getMnemonic();
		}
	}
	
	renderItem = ({item}) => {
		return (<Text style={styles.row}>{item}</Text>)
	}

  render() {
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
		<Button 
			color="#BCB3A2"
			title="Recover"
			accessibilityLabel="CreateWallet"
			onPress = { ()=> this.emitMnemonic()}
		/>

		<Text style={styles.baseText}>
			<Text style={styles.prompt}>Your wallet address:{'\n'}</Text>
			<Text>{this.state.walletAddress}{'\n'}</Text>
			<Text style={styles.prompt}>Mnemonic is legit: </Text>
			{this.state.walletSaved && <Text>{this.state.walletSaved.toString()}{'\n'}</Text>}
		</Text>
		{this.state.isBusy && <ActivityIndicator size="large" color="#8192A2" />}
      </ScrollView>

    );
  }
};

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
	row: {
		padding: 10,
		marginBottom: 5,
		marginRight: 5,
		color: '#eee',
		backgroundColor: '#8192A2',
		fontSize: 16,
	},
	icon: {
		color: '#2D4866',
		fontSize: 30,
	},
});

export default RecoverWalletForm;
