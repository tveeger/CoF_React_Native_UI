import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, TextInput, StyleSheet, AsyncStorage, ActivityIndicator, TouchableHighlight, Modal, FlatList } from 'react-native';
import Connector from './Connector.js';
import ethers from 'ethers';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Ionicons from 'react-native-vector-icons/Ionicons';

class CreateTokensScreen extends React.Component {
	static navigationOptions = {
		title: 'Create DET tokens',
		tabBarLabel: 'Create',
	};

	constructor(props) {
		super(props);

		this.state = {
			isSigned: false,
			isTransferSuccess: false,
			hasWallet: null,
			walletAddress: '',
			tokenId: '',
			tokenAddress: '',
			tokenBalance: 0,
			errorMessage: '',
			euroAmountFromReceipt: null,
			detsAmountFromReceipt: null,
			receiptCreated: false,
			receiptCreatedText: '',
			tokenCreatorFromReceipt: '',
			nonce: '',
			submitMessage: '',
			isBusy: false,
			modalVisible: false,
			isEmptyReceipts: false,
			tokenIdList: [],
			newTokenIdList: [],
			test:'',
		};

	}

	componentWillMount() {
		this.setState({walletAddress: wallet.address});
		//this.setState({newTokenId: JSON.parse(this.props.newTokenId)});
		this.getWalletInfo();
		this.getTokenId();
	}

	componentWillUnmount() {
		this.setState({isSigned: false});
		this.setState({isTransferSuccess: false});
		this.setState({tokenCreatedStatus: false});
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			contract = new ethers.Contract(daTokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);
			let tokenId = self.state.tokenId;

			if (wallet !== '') {
				self.setState({hasWallet: true});
				//transaction number
				wallet.getTransactionCount('latest').then(function(count) {
					self.setState({nonce: count.toString()});
				});
			}

			if(contract !== '') {
				//get token created from receipt
				contract.getTokenCreatedStatusFromReceipt(tokenId).then(function(result){
					self.setState({receiptCreated: result});
				});
				//get Euro amount from receipt
				contract.getEuroAmountFromReceipt(tokenId).then(function(result){
					self.setState({euroAmountFromReceipt: parseInt(result)});
					self.checkEuroBalance();
				});
				//get DET amount from receipt
				contract.getDetsAmountFromReceipt(tokenId).then(function(result){
					self.setState({detsAmountFromReceipt: parseInt(result)});
				});
				//get token creator from receipt
				contract.getTokenCreatorFromReceipt(tokenId).then(function(result){
					self.setState({tokenCreatorFromReceipt: result});
				});
				//balanceOf getDetsBalance
				contract.getDetsBalance(wallet.address).then(function(result){
					self.setState({tokenBalance: parseInt(result)});
				});
			}
		}
		catch(error) {
			this.setState({hasWallet: true});
			this.setState({errorMessage: 'getWalletInfo-error: ' + error.toString()});
		}
	}

	getTokenId = async () => {
		const self = this;
		
		try {
			let newTokenIdList = [];
			await AsyncStorage.getItem('daTokenId').then( (value) =>
				self.setState({tokenIdList: JSON.parse(value), hasData: true, objectCount: Object.keys(JSON.parse(value)).length})
			)
			let tokenIdList = self.state.tokenIdList;
			if(tokenIdList !== null) {
				//loop through tokenIdList and check if token is created or destroyed
				let tokenCreated = null;
				let tokensDestroyed = 1;
				for (var i=0; i < tokenIdList.length; i++) {
					tokenCreated = await self.getTokenCreatedStatus(tokenIdList[i].id);
					tokensDestroyed = await self.getTokenDestroyedStatus(tokenIdList[i].id);
					if(tokenCreated === false && tokensDestroyed === 0) {
						newTokenIdList.push({'id': tokenIdList[i].id, 'created': tokenCreated, 'destroyd': tokensDestroyed });
					}

				}
				self.setState({newTokenIdList: newTokenIdList});
				self.setState({isEmptyReceipts: true}); //hide .2
			}
		}
		catch(error) {
			self.setState({errorMessage: 'getTokenID-error: ' + error.toString()});
		}
	}

	getTokenCreatedStatus = async (id) => {
		return await contract.getTokenCreatedStatusFromReceipt(id);
	}

	getTokenDestroyedStatus = async (id) => {
		const self = this;
		try {
			let tokensDestroyed = await contract.getDetsDestroyed(id);
			return parseInt(tokensDestroyed);
		}
		catch(error) {
			self.setState({errorMessage: 'getTokenDestroyedStatus-error: ' + error.toString()});
		}
	}

	changeTokenCreatedStatus(tokenId) {
		const self = this;
		self.setState({receiptCreated: false});
//		let isCreatedToken = self.getTokenCreatedStatus(tokenId);
		self.setState({tokenId: tokenId});
		contract.getTokenCreatedStatusFromReceipt(tokenId).then(function(result){
			self.setState({receiptCreated: true});
		});
		self.toggleModal(false);
		self.setState({receiptCreatedText: ""});
		self.checkTokenCreatedStatus();//getWalletInfo();
	}

	checkTokenCreatedStatus() {
		this.setState({receiptCreatedText: "No receipts found"});
		this.setState({isSigned: false});
		this.setState({isTransferSuccess: false});
		this.getWalletInfo();
	}

	checkEuroBalance() {
		let tokenCreatedStatus = this.state.receiptCreated;
		if(!tokenCreatedStatus) {
			let euroAmountFromReceipt = this.state.euroAmountFromReceipt;
			if (euroAmountFromReceipt > 0) {
				this.setState({receiptCreated: true});
			}
		}
	}

	getReceiptList() {

	}

	toggleModal(visible) {
		this.setState({ modalVisible: visible });
	}

	createDets() {
		let self = this;
		const tokenId = self.state.tokenId;

		if(wallet !== '') {
			wallet.provider = etherscanProvider;
			let nonce = self.state.nonce;
			const tokenAddress = daTokenAddress;
			let transactionHash;
			const iface = new ethers.Interface(metacoin_artifacts);
			let createDets = iface.functions.createDets(tokenId);

			let tx = {
				from: wallet.address,
				to: tokenAddress,
				value: '0x00',
				nonce: ethers.utils.bigNumberify(nonce),
				gasPrice: ethers.utils.bigNumberify(2000000000),
				gasLimit: ethers.utils.bigNumberify(185000),
				data: createDets.data,
			}

			let signedTransaction = wallet.sign(tx);

			self.setState({isSigned: true});
			wallet.provider.sendTransaction(signedTransaction).then(function(hash) {
				transactionHash = hash;
				wallet.provider.waitForTransaction(transactionHash).then(function(transaction) {
					self.setState({isSigned: false});
					self.setState({isTransferSuccess: true});
					self.setState({receiptCreated:false});
					self.setState({submitMessage: transaction.hash});
					self.getWalletInfo();
				});
			});
		}
	}

	extractKey = (item, index) => item.id.toString();

	renderItem = ({item}) => {
		return (
			<View style={styles.contact_list}>
				<TouchableHighlight onPress = {() => {this.changeTokenCreatedStatus(item.id)}}>
					<Text style={{color:'#CCC'}}>{item.id}</Text>
				</TouchableHighlight>
			</View>
		)
	}

	render() {
		return (
			<View style={styles.container}>
				<Modal animationType = {"slide"} 
					transparent = {false}
					visible = {this.state.modalVisible}
					onRequestClose = {() => {} }>
					<View style = {styles.modal}>
						<Text style={styles.container}>
							<Text style={styles.header_h4}>{'\n'}Receipts waiting for you</Text>
							<Text style={styles.prompt}>{'\n'}Select one of the request codes</Text>
						</Text>
						<FlatList
							numColumns={1}
							data={this.state.newTokenIdList}
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
					{this.state.isEmptyReceipts && <Ionicons name={'ios-thermometer'} size={26} style={styles.icon} />}
					{this.state.isEmptyReceipts && <Text style={styles.header_h4}> 2. Check if funds are ready{'\n'}</Text>}
				</Text>
				{this.state.isEmptyReceipts && <TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
					this.toggleModal(!this.state.modalVisible)}}>
					<Text style = {styles.hyperLink}>Select from list</Text>
				</TouchableHighlight>}
				
				{this.state.isEmptyReceipts && <Text style={styles.prompt}>Check if Euro transfer has succeeded</Text>}
				{this.state.isEmptyReceipts && <TextInput style = {styles.input}
					underlineColorAndroid = "transparent"
					placeholder = "your request code"
					placeholderTextColor = "#A0B5C8"
					autoCapitalize = "none"
					onChangeText = {(text)=>{this.changeTokenCreatedStatus(text)}}
					value={this.state.tokenId}
				/>}
				{this.state.isEmptyReceipts && <TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
					this.checkTokenCreatedStatus()}}>
					<Text style = {styles.hyperLink}>Check now</Text>
				</TouchableHighlight>}

				<Text style={styles.baseText}>
					{!this.state.receiptCreated && <Text>{this.state.receiptCreatedText}{'\n'}</Text>}
					{this.state.receiptCreated && <Ionicons name={'ios-hammer'} size={26} style={styles.icon} />}
					{this.state.receiptCreated && <Text style={styles.header_h4}> 3. Create your DET tokens{'\n'}</Text>}
					{this.state.receiptCreated && <Text style={styles.prompt}>Your budget for this receipt is{'\n'} </Text>}
					{this.state.receiptCreated && <Text style={styles.header_h4}>DET {this.state.detsAmountFromReceipt} (&euro; {this.state.euroAmountFromReceipt},-) {'\n'}{'\n'}</Text>}
				</Text>
				{this.state.isBusy && <ActivityIndicator size="large" color="#8192A2" />}
				{this.state.receiptCreated && <Button 
					color="#BCB3A2"
					title="Create tokens"
					accessibilityLabel="Transfer"
					onPress = { ()=> this.createDets()}
				/> }
				{this.state.isSigned && <Text> Just a minute. Your transaction will be mined now...</Text>}
				{this.state.isSigned && <ActivityIndicator size="large" color="#8192A2" />}
				{this.state.isTransferSuccess && <Text style={styles.prompt}> Transfer Hash: {this.state.submitMessage}</Text>}
				{!this.state.hasWallet && <Text style={styles.errorText}>No wallet found. Please make or recover a wallet first</Text>}
				<Text style={styles.errorText}>
					{'\n'}{this.state.errorMessage}
				</Text>
				<Text style={styles.prompt}>
					{'\n'}{this.state.test}
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
		backgroundColor: '#FFF',
		borderWidth: 1,
		fontSize: 14,
		marginBottom: 15,
		color: '#999999',
	},
	errorText: {
   		marginTop: 10,
    	color: 'red'
  	},smallBlueButton: {
		backgroundColor: '#8192A2',
		paddingTop: 4,
		paddingBottom: 4,
		width: 210,
		marginLeft: 100,
		marginBottom: 10,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hyperLink: {
		color: 'whitesmoke',
		fontSize: 16,
		fontWeight: 'normal'
	},
	smallGreyButton: {
		backgroundColor: '#BBB',
		padding: 4,
		width: 140,
		marginLeft: 100,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
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
	},
	icon: {
		color: '#2D4866',
		fontSize: 30,
	},
});


export default CreateTokensScreen;