import React, { Component } from 'react';
import { Image, View, ScrollView, Text, StyleSheet, Modal, TouchableHighlight, ActivityIndicator } from 'react-native';
import Connector from './Connector.js';
import ethers from 'ethers';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationActions } from 'react-navigation';
import QRcodeWallet from './QRcodeWallet.js';

class HomeScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			networkName: '',
			walletAddress: '',
			modalVisible: false,
		};
	}

	componentWillMount() {
		let self = this;
		self.setState({networkName: wallet.provider.name});
		self.setState({walletAddress: wallet.address});
	}

	toggleModal(visible) {
		this.setState({ modalVisible: visible });
	}


  render() {
    return (
	<ScrollView style={styles.container}>
		<Modal animationType = {"slide"} transparent = {false}
			visible = {this.state.modalVisible}
			onRequestClose = {() => { console.log("Modal has been closed.") } }>
			<View style = {styles.modal}>
				<Text style={styles.baseText}>
					<Text style={styles.header_h4}>Wallet Info{'\n'}</Text>
					<Text style={styles.prompt}>Network: </Text>
					<Text>{this.state.networkName}{'\n'}</Text>
					<Text style={styles.prompt}>Version: </Text>
					<Text>0.52a</Text>
				</Text>
				<QRcodeWallet/>
				<Text>{'\n'}</Text>
				<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
					this.toggleModal(!this.state.modalVisible)}}>
					<Text style = {styles.hyperLink}> Close </Text>
				</TouchableHighlight>
			</View>
		</Modal>
		<View style={styles.logoSpace}>
          <Image source={require('../img/logo_dblue_transp_210x117.png')} style={{width: 210, height: 117}} />
        	<Text style={styles.prompt}>{'\n'}Make safe donations</Text>
        </View>
		<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
			this.toggleModal(!this.state.modalVisible)}}>
			<Text style = {styles.hyperLink}> Wallet Info</Text>
		</TouchableHighlight>
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
		marginBottom: 5,
		marginLeft: 10,
	},
	logoSpace: {
		flex: 1,
		alignItems: 'center',
		paddingTop: 40,
		paddingBottom: 30
	},
	prompt: {
		color: '#BCB3A2',
	},
	smallBlueButton: {
		backgroundColor: '#8192A2',
		padding: 4,
		width: 150,
		margin: 10,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hyperLink: {
		color: 'whitesmoke',
		fontSize: 16,
		fontWeight: 'bold'
	},
	modal: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: 'whitesmoke',
		paddingTop: 100
	},
});

export default HomeScreen;
