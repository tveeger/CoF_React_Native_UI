import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, AsyncStorage, TextInput, StyleSheet, RefreshControl, ActivityIndicator,TouchableHighlight, Modal, FlatList } from 'react-native';
import ethers from 'ethers';
import Connector from './Connector.js';
import { NavigationActions } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

class SendEth extends React.Component {
	static navigationOptions = {
		title: 'Transfer Ethers',
		tabBarLabel: 'ETHER'
	};

	constructor(props) {
		super(props);

		this.state = {
			hasWallet: false,
			toAddress: '0xdF1f27cfb692E7A6a34739eC276a0A965C425b9b',
			ethAmount: '0.00001',
			ethBalance: '',
			ethRate: '',
			nonce: '',
			submitMessage: '',
			walletAddress: '',
			message: '',
			isSigned: false,
			isTransferSuccess: false,
			refreshing: false,
			focus: false,
			contactList: [],
			modal2Visible: false,
		};
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			let mnemonic = await AsyncStorage.getItem('mnemonic');

			let etherAmount = '';
			walletAddress = this.state.walletAddress;
			this.setState({hasWallet: true});

			//transaction number
			if (wallet !== '') {
				//transaction number (nonce)
				wallet.getTransactionCount('latest').then(function(count) {
					self.setState({nonce: count.toString()});
				});

				etherscanProvider.getBalance(wallet.address, 'latest').then(function(balance) {
					etherAmount = ethers.utils.formatEther(balance);
					if (balance > 0) {
						self.setState({ethBalance: etherAmount.toString()});
						self.setState({message: ""});
					} else {
						self.setState({message: "Your balance is too low. Please send some Eths to this wallet account."});
						self.setState({ethBalance: etherAmount.toString()});
					}
				});
			}
		}
		catch(error) {
			this.setState({hasWallet: false});
			this.setState({message: error});
		}
	}

	componentWillMount() {
		let self = this;
		this.setState({walletAddress: wallet.address});
		self.getWalletInfo();
		self.getContactList();
	}

	componentWillUnmount() {
		let self = this;

	}

	getFocus() {
		let isFocused = this.props.navigation.isFocused();
		this.setState({focus: isFocused});
	}

	emitSend() {
		let self = this;
		if(wallet) {
			wallet.provider = etherscanProvider;
			let nonce = self.state.nonce;
			let ethAmount = self.state.ethAmount;
			let transactionHash;

			const transaction = {
				nonce: ethers.utils.bigNumberify(nonce),
				gasLimit: 21000,
				gasPrice: ethers.utils.bigNumberify("20000000000"),
				to: self.state.toAddress,
				value: ethers.utils.parseEther(ethAmount),
				data: "0x",
			};
			//sign transaction
			let signedTransaction = wallet.sign(transaction);
			let parsedTransaction = ethers.Wallet.parseTransaction(signedTransaction);
			self.setState({isSigned: true});
			//send Ethers transaction
			wallet.provider.sendTransaction(signedTransaction).then(function(hash) {
				transactionHash = hash;
				etherscanProvider.waitForTransaction(transactionHash).then(function(transaction) {
					self.setState({isSigned: false});
					self.setState({isTransferSuccess: true});
					self.setState({submitMessage: hash.toString()});
					self.getWalletInfo();
				});
			});
		}
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getWalletInfo().then(() => {
			this.setState({refreshing: false});
		});
		this.getFocus()
	}

	getContactList = async () => {
		AsyncStorage.getItem('contactList').then( (value) =>
			this.setState({contactList: JSON.parse(value)})
		)
	}

	toggleModal2(visible) {
		this.setState({ modal2Visible: visible });
	}

	selectContact(item) {
		this.setState({toAddress: item});
		this.toggleModal2(false);
	}

	extractKey = (item, index) => item.id.toString();

	renderItem = ({item}) => {
		return (
			<View style={styles.contact_list}>
				<TouchableHighlight onPress = {() => {this.selectContact(item.address)}}>
					<Text style={{color:'#CCC'}}>{item.name}</Text>
				</TouchableHighlight>
			</View>
		)
	}

  render() {
  	const {navigate} = this.props.navigation;
    return (
      <ScrollView style={styles.container} refreshControl={
			<RefreshControl
				refreshing={this.state.refreshing}
				onRefresh={this.onRefresh.bind(this)}
			/>
		}>
		<Modal animationType = {"slide"} 
			transparent = {false}
			visible = {this.state.modal2Visible}
			onRequestClose = {() => {} }>
			<View style = {styles.modal}>
				<Text style={styles.header_h4}>My Contacts</Text>
				<FlatList
					numColumns={1}
					data={this.state.contactList}
					renderItem={this.renderItem}
					keyExtractor={this.extractKey}
				/>
				<Text>{'\n'}</Text>
				<TouchableHighlight style={styles.smallGreyButton} onPress = {() => {
					this.toggleModal2(!this.state.modal2Visible)}}>
					<Text style = {styles.hyperLink}> Close Modal</Text>
				</TouchableHighlight>
			</View>
		</Modal>
		<Text style={styles.baseText}>
			<Ionicons name={'md-share-alt'} size={26} style={styles.icon} />
			<Text style={styles.header_h4}> Send Ethers{'\n'}{'\n'}</Text>
			<Text style={styles.prompt}>Eth Balance: </Text>
			<Text>Ξ {this.state.ethBalance}{'\n'}{'\n'}</Text>
		</Text>
		<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
			this.toggleModal2(!this.state.modal2Visible)}}>
			<Text style = {styles.hyperLink}> My Contacts </Text>
		</TouchableHighlight>
		<Text style={styles.prompt}>Send tokens to address: {'\n'}</Text>
		{this.state.hasWallet &&<TextInput
			style={styles.input}
			defaultValue = {this.state.toAddress}
			underlineColorAndroid = "transparent"
			autoFocus = {true}
			selectable = {true}
			selectTextOnFocus = {true}
			maxLength = {80}
			placeholderTextColor = "#A0B5C8"
			onChangeText = {(toAddress) => this.setState({toAddress})}
		/>}
		<TextInput
			style={styles.input}
			underlineColorAndroid = "transparent"
			placeholder = "Amount of Ethers (max 12 decimals)"
			placeholderTextColor = "#A0B5C8"
			keyboardType={'numeric'}
			blurOnSubmit={true}
			onChangeText={(ethAmount) => this.setState({ethAmount})}
			defaultValue = {this.state.ethAmount} 
		/>
		<Button 
			color="#BCB3A2"
			title="Submit"
			accessibilityLabel="Submit"
			onPress = { ()=> this.emitSend()}
		/>
		<Text style={styles.baseText}>{'\n'}
			{this.state.isSigned && <Text><Ionicons name={'ios-cog-outline'} size={26} style={styles.icon} /> Just a minute. Your transaction will be mined now...</Text>}
			{this.state.isTransferSuccess && <Text style={styles.prompt}>Hash is mined:{'\n'} </Text>}
			{this.state.isTransferSuccess && <Text>{this.state.submitMessage}{'\n'}</Text>}
			<Text style={styles.errorText}>{this.state.message}{'\n'}</Text>
		</Text>
      </ScrollView>

    );
  }
};

const styles = StyleSheet.create({
	container: {
		marginTop: 30,
		marginLeft: 20,
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
	icon: {
		color: '#2D4866',
		fontSize: 30,
	},
	smallBlueButton: {
		backgroundColor: '#8192A2',
		paddingTop: 4,
		paddingBottom: 4,
		width: 160,
		marginBottom: 10,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
  	smallGreyButton: {
		backgroundColor: '#BBB',
		padding: 4,
		width: 240,
		margin: 20,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hyperLink: {
		color: 'whitesmoke',
		fontSize: 16,
		fontWeight: 'normal'
	},
	contact_list: {
		marginLeft:10,
		marginRight:10,
		marginBottom:2,
		paddingLeft:20,
		paddingTop:10,
		paddingBottom:10,
		width:320,
		borderRadius:4,
		backgroundColor:'#8192A2'
	}
});

export default SendEth;
