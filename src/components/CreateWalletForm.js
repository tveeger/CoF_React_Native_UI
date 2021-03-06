import React, { Component } from 'react';
import { Button, AsyncStorage, View, ScrollView, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import ethers from 'ethers';
import {RSA, RSAKeychain} from 'react-native-rsa-native';
import Connector from './Connector.js';
import HomeScreen from './HomeScreen.js';
import { StackNavigator } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
const extractKey = ({value}) => value;


class CreateWalletForm extends React.Component {
	static navigationOptions = {
		title: 'Create New Wallet',
		tabBarLabel: 'Create Wallet'
	};

	constructor(props) {
		super(props);

		this.state = {
			mnemonicList: [],
			mnemonic: '',
			walletAddress: '',
			message: '',
			hasWallet: false,
			mnemonicCreated: false,
			walletSaved: false,
			mnemonicCreatedAndSaved: false,
			isBusy: false,
			savedMnemonic: '',
		};
	}

	componentWillMount() {
		let self = this;
	}

	componentWillUnmount() {
		this.setState({mnemonicList: ''});	
		this.setState({mnemonicCreated: false});
		this.setState({walletSaved: false});
	}

	createMnemonic() {
		const HDNode = ethers.HDNode;
		let newMnemonic =  ethers.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
		this.setState({ 'mnemonic': newMnemonic });

		mnemonicArray = newMnemonic.replace(/ /g, ',').split(',');
		this.setState({mnemonicList: mnemonicArray});
		this.setState({mnemonicCreated: true});
	}

	saveMnemonicWallet() {
		self = this;
		self.setState({isBusy: true});
		const HDNode = ethers.HDNode;
		let newMnemonic =  self.state.mnemonic;
		let isValidMnemonic = HDNode.isValidMnemonic(newMnemonic);
		
		if (isValidMnemonic) {
			wallet = ethers.Wallet.fromMnemonic(newMnemonic);
			wallet.provider = etherscanProvider;
			AsyncStorage.setItem('mnemonic', newMnemonic);
			
			self.setState({walletAddress: wallet.address});
			self.setState({walletSaved: true});
			self.setState({isBusy: false});
			self.generateKeys();
		} else {
			self.setState({message: "Could not save " + newMnemonic});
		}
	}

	generateKeys = async () => {
		RSA.generateKeys(4096) // set key size
		.then(keys => {
			AsyncStorage.setItem('myRsaPrivate', keys.private);
			AsyncStorage.setItem('myRsaPublic', keys.public);
		})
	}

	renderItem = ({item}) => {
		return (<Text style={styles.row}>{item}</Text>)
	}

  render() {
  	const {navigate} = this.props.navigation;
    return (
      <ScrollView style={styles.container}>
		<Text style={styles.baseText}>
			<Ionicons name={'ios-color-wand'} size={26} style={styles.icon} />
			<Text style={styles.header_h4}> Your Wallet{'\n'}{'\n'}</Text>
			<Text>The mnemonic will be created, after you press the button below. This is the passphrase of your new wallet. {'\n'}</Text>
			<Text>You can recover your wallet with this mnemonic on any other device. {'\n'}</Text>
		</Text>
		{!this.state.walletSaved && <Button 
			color="#BCB3A2"
			title="create Mnemonic phrase"
			accessibilityLabel="CreateWallet"
			onPress = { ()=> this.createMnemonic()}
		/>}

		<View style={{marginTop:10, marginBottom:10}}>
			{this.state.mnemonicCreated && <Text style={styles.errorText}>
				Write these words in the same order on a paper and keep it on a save place.
				Loosing this passphrase will cause you will loose your tokens and funds forever!{'\n'}
			</Text>}
			<FlatList
				numColumns={4}
				data={this.state.mnemonicList}
				renderItem={this.renderItem}
				keyExtractor={extractKey}
			/>
		</View>
		<Button 
			color="#BCB3A2"
			title="Save new Wallet"
			accessibilityLabel="SaveWallet"
			onPress = { ()=> this.saveMnemonicWallet()}
		/>
		
		{this.state.isBusy && <ActivityIndicator size="large" color="#8192A2" />}
		{this.state.walletSaved && <Button 
			color="#BCB3A2"
			title="Go Back"
			accessibilityLabel="Go Back"
			onPress = { ()=> navigate('HomeScreen')}
		/>}
		<Text style={styles.baseText}>
			{this.state.walletSaved && <Text style={styles.prompt}>Wallet address: {this.state.walletAddress}{'\n'}</Text>}
			<Text>{this.state.message}{'\n'}</Text>
		</Text>
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
		height: 40, 
		borderColor: '#D3C8B2', 
		borderWidth: 1,
		fontSize: 14,
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

export default CreateWalletForm;
