import React, { Component } from 'react';
import { Button, Image, AsyncStorage, TouchableHighlight, View, ScrollView, Text, Modal, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { StackNavigator, TabNavigator } from 'react-navigation';
import ethers from 'ethers';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Connector from './Connector.js';
import HomeScreen from './HomeScreen.js';
import SendEth from './SendEth.js';
import SendToken from './SendToken.js';
import TxList from './TxList.js';
import CreateWalletForm from './CreateWalletForm.js';
import RecoverWalletForm from './RecoverWallet.js';
import ChatScreen from './ChatScreen.js';
import BuyScreen from './BuyScreen.js';
import AboutScreen from './AboutScreen.js';
import CharitiesScreen from './CharitiesScreen.js';
import TermsScreen from './TermsScreen.js';
import AdminScreen from './AdminScreen.js';
import RedeemScreen from './RedeemScreen.js';

class Nav extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasWallet: false,
			walletAddress: '',
			modalVisible: false,
			message: '',
			modalMessage: '',
			refreshing: false,
		}
	}

	static navigationOptions = {
		title: 'Chains of Freedom',
		tabBarLabel: 'Home'
	};

	getMnemonic = async () => {
		try {
			let mnemonic = await AsyncStorage.getItem('mnemonic');
			if (mnemonic !== null){
				wallet = ethers.Wallet.fromMnemonic(mnemonic);
				wallet.provider = etherscanProvider;
				this.setState({hasWallet: true});
				this.setState({refreshing: false});
			} else {
				this.toggleModal(true);
			}
		}
		catch(error) {
			this.toggleModal(true);
			this.setState({message: 'Error: ' + error});
		}
	}

	componentWillMount() {
		let self = this;
		self.setState({walletAddress: wallet.address});
		self.getMnemonic();
	}

	componentWillUnmount() {
		this.setState({ modalVisible: true });
	}

	toggleModal(visible) {
		this.setState({ modalVisible: visible });
	}

	unconnect() {
		AsyncStorage.removeItem('mnemonic');
		this.setState({hasWallet: false});
		this.toggleModal(true);
		this.setState({ modalMessage: 'Your wallet has been deleted but still exists on the blockchain. You can recover it by clicking Recover Wallet.' });
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getMnemonic().then(() => {
			this.setState({refreshing: false});
		});
	}

	render() {
		const {navigate} = this.props.navigation;
		return (
			<View style={{flex: 1}}>
			<ScrollView refreshControl={
				<RefreshControl
					refreshing={this.state.refreshing}
					onRefresh={this.onRefresh.bind(this)}
				/>
			}>
				<Modal animationType = {"slide"} transparent = {false}
					visible = {this.state.modalVisible}
					onRequestClose = {() => { console.log("Modal has been closed.") } }>
					<View style = {styles.modal}>
						<Text style={styles.header_h4}>Your Wallet</Text>
						<View style = {styles.textField}>
							<Text style={styles.prompt}>If there is no wallet installed. {'\n'}Choose if you want to create a new wallet or recover your existing wallet from a saved mnemonic. After deleting your wallet, you can only recover your funds and tokens with the mnemonic phrase you have saved.</Text>
						</View>
						<Button
							title="Create new Wallet"
							color="#BCB3A2"
							onPress={() => {this.toggleModal(!this.state.modalVisible), navigate('CreateWalletForm')} } 
						/>
						<Text>{'\n'}</Text>
						<Button
							title="Recover Wallet"
							color="#BCB3A2"
							onPress={() => {this.toggleModal(!this.state.modalVisible), navigate('RecoverWalletForm')} } 
						/>
						<Text>{'\n'}</Text>
						{this.state.hasWallet && <Button 
							title="Delete Wallet" 
							color="#BCB3A2" 
							onPress={() => {this.toggleModal(!this.state.modalVisible), this.unconnect()} } 
						/>}
						<View style = {styles.textField}>
							<Text style={styles.prompt}>{'\n'}{this.state.modalMessage}{'\n'}</Text>
						</View>
						<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
							this.toggleModal(!this.state.modalVisible)}}>
							<Text style = {styles.hyperLink}> Close</Text>
						</TouchableHighlight>
					</View>
				</Modal>
				
				{this.state.hasWallet && <HomeScreen/>}
				{!this.state.hasWallet && <Text>{'\n'}{'\n'}</Text>}
				{!this.state.hasWallet && <ActivityIndicator size="large" color="#8192A2" />}

				{this.state.hasWallet && <TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
					this.toggleModal(!this.state.modalVisible)}}>
					<Text style = {styles.hyperLink}> Change Wallet </Text>
				</TouchableHighlight>}
				{!this.state.hasWallet && <TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
					this.toggleModal(!this.state.modalVisible)}}>
					<Text style = {styles.hyperLink}> Create / Recover Wallet </Text>
				</TouchableHighlight>}
			</ScrollView>
			
			<View>
				<View style={styles.buttonContainer}>
					<TouchableHighlight style={styles.smallButton2} onPress = {() => {
						navigate('BuyScreen')}}>
						<Text style = {styles.hyperLink}> Fetch </Text>
					</TouchableHighlight>
					<TouchableHighlight style={styles.smallButton2} onPress = {() => {
						navigate('RedeemScreen')}}>
						<Text style = {styles.hyperLink}> Redeem </Text>
					</TouchableHighlight>
					<TouchableHighlight style={styles.smallButton2} onPress = {() => {
						navigate('TxList')}}>
						<Text style = {styles.hyperLink}> List </Text>
					</TouchableHighlight>
					<TouchableHighlight style={styles.smallButton2} onPress = {() => {
						navigate('AdminScreen')}}>
						<Text style = {styles.hyperLink}> Admin </Text>
					</TouchableHighlight>
				</View>
				<View style={styles.buttonContainer}>
					<TouchableHighlight style={styles.smallButton2} onPress = {() => {
						navigate('TermsScreen')}}>
						<Text style = {styles.hyperLink}> Terms </Text>
					</TouchableHighlight>
					<TouchableHighlight style={styles.smallButton2} onPress = {() => {
						navigate('CharitiesScreen')}}>
						<Text style = {styles.hyperLink}> Charities </Text>
					</TouchableHighlight>
					<TouchableHighlight style={styles.smallButton2} onPress = {() => {
						navigate('AboutScreen')}}>
						<Text style = {styles.hyperLink}> About </Text>
					</TouchableHighlight>
					<TouchableHighlight style={styles.smallButton2} onPress = {() => {	}}>
						<Text style = {styles.hyperLink}> Help </Text>
					</TouchableHighlight>
				</View>
			</View>
		</View>
		);
	}
}

const TabNav = TabNavigator({
	HomeScreen: {
		screen: Nav,
		navigationOptions: {
			tabBarLabel: 'Home'
			}
		},
		SendEth: { screen: SendEth },
		SendToken: { screen: SendToken },
		ChatScreen: { screen: ChatScreen }
		}, {
		tabBarOptions: {
			activeTintColor: '#666',
			inactiveTintColor: '#DDD',
			showIcon: false,
			labelStyle: {
			fontSize: 12,
		},
		style: {
			backgroundColor: '#8192A2',
		},
		indicatorStyle: {
			backgroundColor: '#DDD',
		}
	}
});

const StackNav = StackNavigator({
  Main: { screen: TabNav },
  TxList: { screen: TxList },
  CreateWalletForm: { screen: CreateWalletForm},
  RecoverWalletForm: { screen: RecoverWalletForm},
  BuyScreen: { screen: BuyScreen },
  AboutScreen: { screen: AboutScreen },
  TermsScreen: { screen: TermsScreen },
  AdminScreen: { screen: AdminScreen },
  RedeemScreen: { screen: RedeemScreen },
  CharitiesScreen: { screen: CharitiesScreen }
  }, {
    navigationOptions: {
      headerTintColor: '#DDD',
      headerStyle: {backgroundColor: '#8192A2'}
    }
  
});

const styles = StyleSheet.create({
	textField: {
		paddingLeft: 30,
		paddingRight: 30,
		paddingTop: 10,
		paddingBottom: 10,
	},
	baseText: {
		textAlign: 'left',
		color: '#999999',
		marginBottom: 5,
	},
	header_h4: {
		color: '#2D4866',
		fontSize: 20,
		padding: 10,
	},
	icon: {
		width: 26,
		height: 26,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	smallButton: {
		backgroundColor: '#BCB3A2',
		padding: 4,
		width: 150,
		margin: 20,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	smallButton2: {
		backgroundColor: '#BCB3A2',
		padding: 8,
		width: 100,
		marginLeft: 2,
		marginBottom: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	smallBlueButton: {
		backgroundColor: '#8192A2',
		padding: 4,
		width: 200,
		margin: 20,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	mediumButton: {
		backgroundColor: '#BBB',
		padding: 4,
		width: 250,
		margin: 20,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		textAlign: 'center',
		color: 'whitesmoke',
		fontSize: 16,
		fontWeight: 'bold'
	},
  prompt: {
		color: '#BCB3A2',
	},
	icon: {
		width: 30,
		height: 32,
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
		fontWeight: 'bold'
	},
	errorText: {
		marginTop: 10,
		color: 'red'
	},
});

export default StackNav;
