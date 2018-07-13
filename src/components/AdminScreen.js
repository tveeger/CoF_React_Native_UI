import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, AsyncStorage, Modal, TextInput, StyleSheet, RefreshControl, ActivityIndicator, TouchableHighlight, FlatList } from 'react-native';
import { RadioButtons, SegmentedControls } from 'react-native-radio-buttons';
import ethers from 'ethers';
import Connector from './Connector.js';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Ionicons from 'react-native-vector-icons/Ionicons';

class AdminScreen extends React.Component {
  static navigationOptions = {
    title: 'Admin Page',
  };

	constructor(props) {
	super(props);

	this.state = {
		hasWallet: false,
		walletAddress: '',
		coinbase: '',
		tokenName: '',
		tokenAddress: '',
		tokenSymbol: '',
		tokenDecimals: '',
		tokenTotalSupply: '',
		tokenBalance: 0,
		hasPositiveBalance: false,
		message: '',
		balanceOf: '',
		refreshing: false,
		modalVisible: false,
		searchAddress: '',
		charityList:[],
		contactList: [],
		};
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getWalletInfo().then(() => {
			this.setState({refreshing: false});
		});
	}

	componentWillMount() {
		var self = this;
		self.setState({walletAddress: wallet.address});
		const tokenAddress = daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
		self.getCharityList();
		self.getContactList();
	}

	componentWillUnmount() {
		this.setState({tokenAddress: ''});
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			let searchAddress = self.state.searchAddress;
			self.setState({hasWallet: true});
			contract = new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);

			if(contract !== '') {
				//name
				contract.name().then(function(result){
					self.setState({tokenName: result});
				});
				//symbol
				contract.symbol().then(function(result){
					self.setState({tokenSymbol: result});
				});
				//balanceOf getDetsBalance
				if(searchAddress !== '') {
					self.setState({hasPositiveBalance: true});
					contract.getDetsBalance(searchAddress).then(function(result){
						self.setState({tokenBalance: parseInt(result)});
					});
				}
			}
		}
		catch(error) {
			this.setState({hasWallet: false});
			this.setState({message: error});
		}
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
		await AsyncStorage.getItem('contactList').then( (value) =>
			this.setState({contactList: JSON.parse(value)})
		)
	}

	selectContact(item) {
		this.setState({searchAddress: item});
		this.setState({hasPositiveBalance: false});
		this.toggleModal(false);
	}

	toggleModal(visible) {
		this.setState({ modalVisible: visible });
	}

	isAddress(address) {
		if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
			return false;
			} else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
			// If it's all small caps or all all caps, return true
				this.setState({isValidAddress: true});
				return true;
			} else {
			this.setState({message: "This is not a valid address"});
			return false;
		}
	}

	emitSearch() {
		let searchAddress = this.state.searchAddress;
		this.getWalletInfo();
		//this.setState({message: searchAddress});
		//contract = new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
		//contract.connect(etherscanProvider);
		/*contract.getDetsBalance(searchAddress).then(function(result){
			this.setState({tokenBalance: parseInt(result)});
		});*/
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
			this.setState({searchAddress: option.value});
			this.setState({hasPositiveBalance: false});
			this.toggleModal(false);
		}
		return (
			<ScrollView style={styles.container} refreshControl={
				<RefreshControl
					refreshing={this.state.refreshing}
					onRefresh={this.onRefresh.bind(this)}
				/>
			}>
				<Modal animationType = {"slide"} transparent = {false}
					visible = {this.state.modalVisible}
					onRequestClose = {() => { console.log("Modal has been closed.") } }>
					<View style = {styles.modal}>
						<Text style={styles.header_h4}>List of Charities</Text>
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
								selectedOption={ this.state.searchAddress }
								extractText={ (option) => option.label }
								testOptionEqual={ (a, b) => {
								if (!a || !b) {
									return false;
								}
								return a.label === b.label
								}}
							/>
						</View>
						<Text style={styles.header_h4}>My Contacts</Text>
						<FlatList
							numColumns={1}
							data={this.state.contactList}
							renderItem={this.renderItem}
							keyExtractor={this.extractKey}
						/>
						<Text>{'\n'}</Text>
						<TouchableHighlight style={styles.smallGreyButton} onPress = {() => {
							this.toggleModal(!this.state.modalVisible)}}>
							<Text style = {styles.hyperLink}> Close Modal</Text>
						</TouchableHighlight>
					</View>
				</Modal>
				
				<Text style={styles.baseText}>
					<Text style={styles.header_h4}> Admin Page {'\n'}{'\n'}</Text>
					<Text style={styles.prompt}>Lookup the DET balance: {'\n'}</Text>
				</Text>
				<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
					this.toggleModal(!this.state.modalVisible)}}>
					<Text style = {styles.hyperLink}> Get Address </Text>
				</TouchableHighlight>
				<Text style={styles.baseText}>
					<Text style={styles.prompt}>Address: </Text>
				</Text>
				<TextInput
					style={styles.input}
					defaultValue = {this.state.searchAddress}
					underlineColorAndroid = "transparent"
					autoCapitalize = "none"
					maxLength = {80}
					placeholderTextColor = "#A0B5C8"
					onChangeText = {(searchAddress) => this.setState({searchAddress})}
				/>
				<Button 
					color="#BCB3A2"
					title="Submit"
					accessibilityLabel="Submit"
					onPress = { ()=> this.emitSearch()}
				/>
				<Text style={styles.baseText}>
					<Text>{this.state.message} </Text>
					{this.state.hasPositiveBalance && <Text style={styles.prompt}>Balance: </Text>}
					{this.state.hasPositiveBalance && <Text style={styles.header_h4}>{'\n'}{this.state.tokenBalance.toString()} {this.state.tokenSymbol} </Text>}
				</Text>
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
  input: {
		height: 40, 
		borderColor: '#D3C8B2', 
		borderWidth: 1,
		fontSize: 14,
		marginBottom: 15,
		color: '#999999',
	},
	smallBlueButton: {
		backgroundColor: '#8192A2',
		padding: 4,
		width: 320,
		marginBottom: 10,
		marginLeft: 20,
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

export default AdminScreen;
