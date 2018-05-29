import React, { Component } from 'react';
import { Button, AsyncStorage, View, ScrollView, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import ethers from 'ethers';
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
			hasWallet: false,
			walletSaved: false,
			isBusy: false,
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
			//this.setState({mnemonic: ''});
		} else {
			this.setState({message: "Invalid mnemonic"});
			this.setState({isBusy: false});
		}
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
		</Text>
		{this.state.isBusy && <ActivityIndicator size="large" color="#8192A2" />}
		<Text style={styles.errorText}>{this.state.message}{'\n'}</Text>
		{this.state.walletSaved && <Button 
			color="#BCB3A2"
			title="Go Back"
			accessibilityLabel="Go Back"
			onPress = { ()=> navigate('HomeScreen')}
		/>}
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
