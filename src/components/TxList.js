import React, { Component } from 'react';
import { Button, Image, View, ScrollView, Text, StyleSheet, FlatList } from 'react-native';

import ethers from 'ethers';
import Ionicons from 'react-native-vector-icons/Ionicons';
const extractKey = ({hash}) => hash;

class TxList extends React.Component {
  static navigationOptions = {
    title: 'Transactions',
  };

  constructor(props) {
    super(props);

    this.state = {
        connected: false,
        msg:"",
        incoming: [],
        txAmt: 0,
        offset: '20',
        message: ''
    };
  }

  getTxList = async () => {
  	let self = this;
    let offset = self.state.offset;
    const walletAddress = "0x37779Fb61a1d24bEE94Ca8fd2268Eb0ed72d9dB5";// self.state.walletAddress;
    const etherscanUrl = "http://rinkeby.etherscan.io/api?module=account&action=txlist&address=" + wallet.address + "&startblock=0&endblock=99999999&sort=asc&apikey=I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV";
    //return fetch('http://rinkeby.etherscan.io/api?module=account&action=txlist&address=0x83fb0a6537f5ad53742aa6bf86e54db369bbd0f6&startblock=0&endblock=99999999&page=1&offset=99&sort=asc&apikey=I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV') //with pagination
    return fetch(etherscanUrl) 
      .then((response) => response.json()) 
      .then((responseJson) => { 
        self.setState({incoming: responseJson.result});
        self.setState({txAmt: responseJson.result.length});
      }) 
      .catch((error) => { 
        self.setState({message: "! " + error});
    }); 
  }

  componentWillMount() {
  	let self = this;

  	self.setState({walletAddress: wallet.address});
    self.getTxList();
  }


    renderItem = ({item}) => {
		let inputString = item.input;
		const walletAddress = this.state.walletAddress;
		//const fromAddress = this.state.walletAddress;
		const fromAddress = walletAddress;//"0x83fb0a6537f5ad53742aa6bf86e54db369bbd0f6";
		let filteredTo = '0x' + inputString.substring(34,74);
		let filteredAmt = '0x' + inputString.substring(74,138);

		//if(inputString.substring(0,10) == '0xa9059cbb' && item.from == fromAddress && item.to == daTokenAddress.toLowerCase()) {
		if(inputString.substring(0,2) == '0x' ) {
		//if(inputString.length > 2) {
			let filteredAmtInt = ethers.utils.bigNumberify(filteredAmt).toString();
		// if (filteredAmtInt.length < 6) {
			return (
				<Text style={styles.row}><Text style={styles.prompt}>to:</Text> {filteredTo}{'\n'}<Text style={styles.prompt}>amount:</Text> {filteredAmtInt} tokens</Text>
				//<Text style={styles.row}>{inputString.substring(0,138)}</Text>
			)
		//}
    }
  }

	render() {
		const { navigate } = this.props.navigation;
		return (
			<ScrollView style={styles.container} stickyHeaderIndices={[0]}>
			<View style={styles.stickyHeader}>
				<Text style={styles.baseText}>
					<Ionicons name={'ios-shuffle-outline'} size={26} style={styles.icon} />
					<Text style={styles.header_h4}> Your Transfer History{'\n'}</Text>
					<Text>{this.state.txAmt} transactions</Text>
				</Text>
			</View>
			<FlatList
					style={styles.postItem}
					data={this.state.incoming}
					renderItem={this.renderItem}
					keyExtractor={extractKey}
					inverse={true}
				/>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		marginTop: 10,
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 0,
		backgroundColor: 'whitesmoke',
	},
	stickyHeader: {
		backgroundColor: 'whitesmoke',
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
	postItem: {
		paddingTop: 10,
	},
	prompt: {
		color: '#BCB3A2',
	},
	row: {
		padding: 15,
		marginBottom: 5,
		color: '#8192A2',
		backgroundColor: '#eee',
		fontSize: 14,
	},
	errorText: {
		marginTop: 10,
		color: 'red'
	},
	icon: {
		color: '#2D4866',
		fontSize: 30,
	},
});


export default TxList;