import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Connector from './Connector.js';
import ethers from 'ethers';
import metacoin_artifacts from '../contracts/BirdlandToken.json'
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
			connected: false,
			isSubmitted: false,
			euroInputAmount: '',
			submitMessage: '',
			walletAddress: '',
			tokenName: '',
			tokenAddress: '',
			coinbaseTokenBalance: '',
			submitCode: '',
			confirmMessage: '',
		};
	}

	componentWillMount() {
		var self = this;
		wallet.provider = etherscanProvider;
		const walletAddress = wallet.address;
		self.setState({walletAddress: walletAddress});
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
		//const MetaCoin = web3.eth.contract(metacoin_artifacts);
		//contractInstance = MetaCoin.at(web3.currentProvider);

	}

	emit() {
		const walletAddress = wallet.address;
		let myEuros = this.state.euroInputAmount;
		let submitCode = Math.random().toString(16).slice(2);
		this.setState({submitCode: submitCode.toString()});
		this.setState({isSubmitted: true});
		this.setState({confirmMessage: '{amount: "' + myEuros + '", code: "' + submitCode + '", sender:"' + walletAddress + '"}'});
		this.setState({submitMessage: 'Transfer the exact amount of Euros to IBAN 123456789 and add the following code you see below in the comment area.'});
		this.setState({euroInputAmount: ''});
	}

	render() {
		const {coinbase, tokenAddress } = this.props;
		return (
			<ScrollView style={styles.container}>
				<Text style={styles.baseText}>
					<Ionicons name={'ios-cart-outline'} size={26} style={styles.icon} />
					<Text style={styles.header_h4}> Fetch some DET tokens {'\n'}{'\n'}</Text>
					<Text style={styles.prompt}>{'\n'}DET Balance: </Text>
					<Text>{this.state.coinbaseTokenBalance}{'\n'}{'\n'}</Text>
					<Text>Set the amount of Euros you want to transfer</Text>
				</Text>
				<TextInput
					style={styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "Minimum 1 Euro"
					placeholderTextColor = "#A0B5C8"
					keyboardType={'numeric'}
					maxLength={4}
					onChangeText={(euroInputAmount) => this.setState({euroInputAmount})}
					value={this.state.euroInputAmount}
				/>

				<Button 
					color="#BCB3A2"
					title="submit"
					accessibilityLabel="Submit"
					onPress = { ()=> this.emit()}
				/>
				<Text style={styles.row}>{'\n'}{'\n'}{this.state.submitMessage}</Text>
				{this.state.isSubmitted && <View style={styles.codeSpace}><Text style={styles.submitCode}> {this.state.submitCode} </Text></View>}
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
});


export default BuyScreen;