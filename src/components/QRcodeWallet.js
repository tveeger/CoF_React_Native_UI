import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import QRCode from 'react-native-qrcode';
import Connector from './Connector.js';

class QRcodeWallet extends Component {
	constructor(props) {
		super(props);
			
		this.state = {
			walletAddress: '',
		};
	}

	componentWillMount() {
		var self = this;
		wallet.provider = etherscanProvider;
		const walletAddress = wallet.address;
		self.setState({walletAddress: walletAddress});
	}

	render() {
		return (
			<View style={styles.container}>
				<Text>{this.state.walletAddress}{'\n'}{'\n'}</Text>
				<QRCode
					value={this.state.walletAddress}
					size={200}
					bgColor='#2D4866'
					fgColor='#FFF'/>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'whitesmoke',
		alignItems: 'center',
		justifyContent: 'center'
	}
});

export default QRcodeWallet;