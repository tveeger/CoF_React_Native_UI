import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import QRCode from 'react-native-qrcode';

class QRcodeWallet extends Component {
	state = {
		walletAddress: '0x54817cFEB229B7ABf8190E8E4AA4eD5E3181f712',
	};

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
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center'
	}
});

export default QRcodeWallet;