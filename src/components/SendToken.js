import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, AsyncStorage, FlatList, Modal, StyleSheet, RefreshControl, ActivityIndicator, TouchableHighlight } from 'react-native';
import { RadioButtons, SegmentedControls } from 'react-native-radio-buttons';
import ethers from 'ethers';
import Connector from './Connector.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import metacoin_artifacts from '../contracts/EntboxContract.json';

class SendToken extends React.Component {
  static navigationOptions = {
	title: 'Transfer DET Tokens',
	tabBarLabel: 'DET'
  };

	constructor(props) {
	    super(props);

		this.state = {
			hasWallet: false,
			walletAddress: '',
			ethBalance: '',
			tokenBalance: '',
			tokenSymbol: '',
			tokenAddress: '',
			detInputAmount: '',
			nonce: '',
			submitMessage: '',
			toAddress: '0xd9415fa2285D8fAE7BCC9C9EA0603edA66f5D0C9',
			message: '',
			isSigned: false,
			isTransferSuccess: false,
			refreshing: false,
			modalVisible: false,
			modal2Visible: false,
			isValidAddress: false,
			selectedCustomSegment: '',
			transferToAddress: '',
			charityList: [],
			contactList: [],
		};
  	}

  	getWalletInfo = async () => {
		try {
			const self = this;
			contract = new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);


			walletAddress = self.state.walletAddress;
			self.setState({hasWallet: true});
			self.setState({isBusy: true});

			if (wallet !== '') {
				//transaction number
				wallet.getTransactionCount('latest').then(function(count) {
					self.setState({nonce: count.toString()});
				});
			}
			
			if(contract !== '') {
				//symbol
				contract.symbol().then(function(result){
					self.setState({tokenSymbol: result});
				});
				//balanceOf getDetsBalance
				contract.getDetsBalance(wallet.address).then(function(result){
					self.setState({tokenBalance: parseInt(result)});
				});
			}
		}
		catch(error) {
			this.setState({hasWallet: false});
			//this.setState({message: error});
		}
	}

	componentWillMount() {
		let self = this;
		this.setState({walletAddress: wallet.address});
		self.getWalletInfo();
		const tokenAddress = daTokenAddress;
		this.setState({tokenAddress: tokenAddress});
		self.getCharityList();
		self.getContactList();
	}

	componentWillUnmount() {
		this.setState({transferToAddress: ''});
		this.setState({detInputAmount: ''});
	}

	getCharityList() {
		return fetch('http://www.chainsoffreedom.org/js/cof_charities.json') 
		.then((response) => response.json()) 
		.then((responseJson) => { 
		this.setState({charityList: responseJson.result})
		}) 
		.catch((error) => { console.error(error); 
		}); 
	}

	getContactList = async () => {
		AsyncStorage.getItem('contactList').then( (value) =>
			this.setState({contactList: JSON.parse(value)})
		)
	}

	selectContact(item) {
		this.setState({transferToAddress: item});
		this.toggleModal2(false);
	}

	isAddress(address) {
		if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
			return false;
			} else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
			// If it's all small caps or all all caps, return true
				this.setState({isValidAddress: true});
				return true;
			} else {
			
			return false;
		}
	};

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

	emitSend() {
		let self = this;
		if(wallet !== '') {
			wallet.provider = etherscanProvider;
			let nonce = self.state.nonce;
			let amount = self.state.detInputAmount;
			const tokenAddress = daTokenAddress;
			let transactionHash;
			self.setState({isSigned: false});
			self.setState({isTransferSuccess: false});

			const transaction = {
				from: wallet.address,
				to: tokenAddress,
				value: '0x00',
				nonce: ethers.utils.bigNumberify(nonce),
				gasPrice: ethers.utils.bigNumberify(20000000000),
				gasLimit: ethers.utils.bigNumberify(100000),
				data: this.configDataString(amount),
			}
			let signedTransaction = wallet.sign(transaction);
			//let parsedTransaction = ethers.Wallet.parseTransaction(signedTransaction);
			self.setState({isSigned: true});
			wallet.provider.sendTransaction(signedTransaction).then(function(hash) {
				transactionHash = hash;
				etherscanProvider.waitForTransaction(transactionHash).then(function(transaction) {
					self.setState({isSigned: false});
					self.setState({isTransferSuccess: true});
					self.setState({submitMessage: transaction.hash});
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
	}

	toggleModal(visible) {
		this.setState({ modalVisible: visible });
	}

	toggleModal2(visible) {
		this.setState({ modal2Visible: visible });
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
	const options = this.state.charityList;

	function setSelectedOption(option){
		this.setState({transferToAddress: option.value});
		this.toggleModal(false);
		this.toggleModal2(false);
	}

    return (
      <ScrollView style={styles.container} refreshControl={
			<RefreshControl
				refreshing={this.state.refreshing}
				onRefresh={this.onRefresh.bind(this)}
			/>
		}>
		
		<Modal animationType = {"slide"} 
			transparent = {false}
			visible = {this.state.modalVisible}
			onRequestClose = {() => { console.log("Modal has been closed.") } }>
			<View style = {styles.modal}>
				<Text style={styles.header_h4}>List of Charities</Text>
				<View style = {styles.textField}>
					<Text style={styles.prompt}>Pick one of the charities below to make a donation to. Or scan a QR-code of an address with your camera.</Text>
				</View>

				<Text>{'\n'}</Text>
				<View style={{marginTop: 10, marginBottom: 10}}>
					<SegmentedControls
						direction= {'column'}
						tint= {'#DDD'}
						selectedTint= {'#666'}
						backTint= {'#8192A2'}
						optionStyle= {{fontSize: 16, fontWeight: 'normal', fontFamily: 'Snell Roundhand'}}
						containerStyle= {{marginLeft: 10, marginRight: 10, width: 320}}
						options={ options }
						onSelection={ setSelectedOption.bind(this) }
						selectedOption={ this.state.transferToAddress }
						extractText={ (option) => option.label }
						testOptionEqual={ (a, b) => {
						if (!a || !b) {
							return false;
						}
						return a.label === b.label
						}}
					/>
				</View>
				<Text>{'\n'}</Text>
				<TouchableHighlight style={styles.smallGreyButton} onPress = {() => {
					this.toggleModal(!this.state.modalVisible)}}>
					<Text style = {styles.hyperLink}> Close Modal</Text>
				</TouchableHighlight>
			</View>
		</Modal>
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
			<Image source={require('../img/beeldmerk_30x32_darkblue.png')} style={{width: 120, height: 128}} />
			<Text style={styles.header_h4}> Send DETs{'\n'}{'\n'}</Text>
			<Text style={styles.prompt}>Balance: </Text>
			<Text>{this.state.tokenSymbol} {this.state.tokenBalance}{'\n'}</Text>
			<Text style={styles.prompt}>Nonce: </Text>
			<Text>{this.state.nonce}{'\n'}</Text>
		</Text>
		<View style={{flexDirection:'row', width: window.width}}>
			<View style={{flex:2}}>
				<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
					this.toggleModal(!this.state.modalVisible)}}>
					<Text style = {styles.hyperLink}> Charities </Text>
				</TouchableHighlight>
			</View>
			<View style={{flex:2}}>
				<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
					this.toggleModal2(!this.state.modal2Visible)}}>
					<Text style = {styles.hyperLink}> My Contacts </Text>
				</TouchableHighlight>
			</View>
		</View>
		<Text style={styles.baseText}>
			<Text style={styles.prompt}>{'\n'}Send tokens to address: {'\n'}</Text>
		</Text>
		<View>
			<TextInput
				style={styles.input}
				defaultValue = {this.state.transferToAddress}
				placeholder = "0x..."
				underlineColorAndroid = "transparent"
				autoCapitalize = "none"
				autoFocus = {true}
				selectable = {true}
				selectTextOnFocus = {true}
				maxLength = {43}
				placeholderTextColor = "#A0B5C8"
				onChangeText = {(transferToAddress) => this.setState({transferToAddress})}
			/>
		</View>
		<View>
			<TextInput
				style={styles.input}
				underlineColorAndroid = "transparent"
				placeholder = "Minimum 1 token"
				placeholderTextColor = "#A0B5C8"
				keyboardType={'numeric'}
				maxLength={10}
				blurOnSubmit={true}
				onChangeText={(detInputAmount) => this.setState({detInputAmount})}
				value={this.state.detInputAmount} 
			/>
		</View>
		<Button 
			color="#BCB3A2"
			title="Submit"
			accessibilityLabel="Submit"
			onPress = { ()=> this.emitSend()}
		/>
		{this.state.isSigned && <Text>Just a minute. Your transaction will be mined now...</Text>}
		{this.state.isSigned && <ActivityIndicator size="large" color="#8192A2" />}
		{this.state.isTransferSuccess && <Text style={styles.prompt}>Hash is mined:{'\n'} </Text>}
		{this.state.isTransferSuccess && <Text>{this.state.submitMessage}{'\n'}</Text>}
		{this.state.isValidAddress && <Text style={styles.errorText}>Not a valid address{'\n'}</Text>}
		<Text style={styles.errorText}>{this.state.message}{'\n'}</Text>		
      </ScrollView>

    );
  }
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginLeft: 20,
    marginTop: 30,
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
  input: {
    height: 40, 
    borderColor: '#D3C8B2', 
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 15,
    marginRight: 12,
    color: '#999999',
  },
  input_narrow: {
    height: 40, 
    borderColor: '#D3C8B2', 
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 15,
    marginRight: 70,
    color: '#999999',
  },
  prompt: {
    color: '#BCB3A2',
  },
  errorText: {
    marginTop: 10,
    color: 'red'
  },
  icon: {
    color: '#2D4866',
    fontSize: 30,
  },
  textField: {
		paddingLeft: 30,
		paddingRight: 30,
		paddingTop: 10,
		paddingBottom: 10,
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
	modal: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: 'whitesmoke',
		paddingTop: 100
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

export default SendToken;