/*
websocket: 85.144.198.84:28475 (wss://echo.websocket.org/)
websocket chainsoffreedom.org: 45.32.186.169:28475
nodejs-websocket
*/
import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, TouchableHighlight, TextInput, FlatList, AsyncStorage } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RSA, RSAKeychain} from 'react-native-rsa-native';

// import {Server as PeerUpServer}  from 'peer-up/dist/index';
// const fs = require('fs-extra');
//
// const server:PeerUpServer = new PeerUpServer();
// server.listen();

const extractKey = ({id}) => id;

class Websocket extends Component {

constructor(props) {
	super(props);

	this.state = {
		connected: false,
		msg: '',
		incoming: '',
		posts: [],
		postsAmount: 0,
		errorMessage: '',
		hasKeys: false,
		hasPeerPublicKey: false,
		myRsaPrivate: '',
		myRsaPublic: '',
		peerRsaPublic: '',
		encryptedMessage: '',
		decryptedMessage: '',
	};

	//this.socket = new WebSocket('ws://45.32.186.169:28475');
	//this.socket = new WebSocket('ws://127.0.0.1:28475');
	this.socket = new WebSocket('ws://echo.websocket.org'); //test
	this.socket.onopen = () => {
		this.setState({connected:true})
	};
	this.socket.onmessage = (e) => {
	    //console.log(e.data);
		this.setState({incoming:e.data});
	};
	this.socket.onerror = (e) => {
	    //console.log(e.message);
		this.setState({errorMessage:e.message});
	};
	this.socket.onclose = (e) => {
		this.setState({connected:false})
		console.log(e.code, e.reason);
	};
	this.emit = this.emit.bind(this);

}

    componentWillMount() {
        const self = this;
        self.recoverKeyPair();
        //let posts = self.state.posts;
    }

    recoverKeyPair = async () => {
		var self = this;
		await AsyncStorage.getItem('myRsaPublic').then( (value) =>
			self.setState({myRsaPublic: value})
		).catch((error) => { self.setState({errorMessage: 'myPublicKey-Error: ' + error}); 
		});

		await AsyncStorage.getItem('myRsaPrivate').then( (value) =>
			self.setState({myRsaPrivate: value})
		).then( () =>
			this.setState({hasKeys: true})
		).catch((error) => { self.setState({errorMessage: 'myPrivateKey-error: ' + error}); 
		});

		await fetch(serverPublicRSAKey) //see connector.js is test with serverpublic key
		.then((response) => response.json()) 
		.then((responseJson) => { 
			self.setState({peerRsaPublic: responseJson.result})
		})
	}

	sendMyRsaPublic = async () => {
		const myRsaPublic = this.state.myRsaPublic;
		this.socket.send(myRsaPublic);
	}

	savePeerRsaPublic = async () => {
		
	}

	encrypt = async () => {
		let message = this.state.msg;
		let publicKey = this.state.peerRsaPublic; //this.state.myRsaPublic; //this.state.peerRsaPublic
		RSA.encrypt(message, publicKey)
		.then(encodedMessage => {
			this.setState({encryptedMessage: encodedMessage});
		})
		.then(() => {
			this.decrypt()
		})
		.catch((error) => { this.setState({errorMessage: 'Encrypt: ' + error}); 
		});
	}

	decrypt = async () => {
		let encodedMessage = this.state.encryptedMessage;
		let privateKey = this.state.myRsaPrivate;
		RSA.decrypt(encodedMessage, privateKey)
		.then(message => {
			this.setState({decryptedMessage: message});
		})
		.catch((error) => { this.setState({errorMessage: 'Decrypt: ' + error}); 
		});
	}

	emit() {
		if( this.state.connected ) {
			let posts = this.state.posts;
			let postsAmount = posts.length + 1;
			let currentdate = new Date();
			let datetime = currentdate.getDay() + "/"+currentdate.getMonth() 
			+ "/" + currentdate.getFullYear() + " @ " 
			+ currentdate.getHours() + ":" 
			+ currentdate.getMinutes();

			this.socket.send(this.state.msg);
			posts = this.state.posts.slice();
			posts.push({'datetime': datetime, 'id': postsAmount, 'payload': this.state.msg});
			this.setState({ posts: posts });
			this.setState({postsAmount: postsAmount});
			this.setState({msg: ''});
			this.encrypt();
		}
	}


    renderItem = ({item}) => {
        return (
          <Text style={styles.row}>{item.datetime} {'\n'}{item.payload}</Text>
        )
      }

	render() {
		return (
			<ScrollView style={styles.container} stickyHeaderIndices={[0]}>
				<View style={styles.container}>
					<Text style={styles.baseText}>
				  <Ionicons name={'ios-pulse'} size={26} style={styles.icon} />
				  <Text style={styles.header_h4}> CoF Chat Channel {'\n'}{'\n'}</Text>
				  <Text style={styles.prompt}>connected:</Text>
				  <Text>{this.state.connected ? "true":"false"}</Text>
				  <Text style={styles.prompt}>, my keys:</Text>
				  <Text>{this.state.hasKeys ? "true":"false"}</Text>
				  <Text style={styles.prompt}>, peer key:</Text>
				  <Text>{this.state.hasPeerPublicKey ? "true":"false"}</Text>
				</Text>
				<TouchableHighlight style={styles.smallGreyButton} onPress = {() => {
					this.sendMyRsaPublic()}}>
					<Text style = {styles.hyperLink}> Send my Public Key</Text>
				</TouchableHighlight>
				{this.state.connected && <TextInput style = {styles.input}
				   underlineColorAndroid = "transparent"
				   placeholder = "your message"
				   placeholderTextColor = "#A0B5C8"
				   autoCapitalize = "none"
				   onChangeText = {(text)=>{this.setState({msg:text})}}
				   value={this.state.msg}
				/>}
				{this.state.connected && <Button 
				    title="submit" 
				    color="#BCB3A2" 
				    accessibilityLabel="submit"
				    onPress = { ()=> this.emit()}
				/>}
				<Text style={styles.baseText}>
				  {this.connected && <Text style={styles.prompt}>, amount: </Text>}
				  {this.connected && <Text>{this.state.postsAmount}</Text>}
				</Text>
				<Text style={styles.prompt}>Decrypted: {this.state.decryptedMessage}</Text>
				<Text style={styles.errorText}>{'\n'}{this.state.errorMessage}</Text>
				</View>

				<FlatList
					style={styles.postItem}
					data={this.state.posts}
					renderItem={this.renderItem}
					keyExtractor={extractKey}
					inverted={true}
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
    paddingTop: 10,
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
  input: {
    height: 40, 
    borderColor: '#D3C8B2', 
    backgroundColor: '#FFF',
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 15,
    color: '#999999',
  },
  postItem: {
    paddingTop: 10,
  },
  row: {
    padding: 15,
    marginBottom: 5,
    borderColor: '#D3C8B2',
    borderWidth: 1,
    backgroundColor: 'whitesmoke',
    fontSize: 14,
    color: '#2D4866',
  },
  prompt: {
    color: '#BCB3A2',
  },
  icon: {
    color: '#2D4866',
    fontSize: 30,
  },
  errorText: {
    marginTop: 10,
    color: 'red'
  },
  hyperLink: {
		color: '#BCB3A2',
		fontSize: 16,
		fontWeight: 'normal'
	},
});

export default Websocket;