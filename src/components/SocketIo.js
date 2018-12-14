//http://www.reactnativeexpress.com/asyncstorage
import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, TouchableHighlight, TextInput, FlatList, AsyncStorage } from 'react-native';
import socketIOClient from 'socket.io-client';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RSA, RSAKeychain} from 'react-native-rsa-native';
import ethers from 'ethers';

class SocketIo extends React.Component {
constructor(props) {
	super(props);

	this.state = {
		connected: false,
		endpoint: "http://192.168.1.10:8000",
		incoming: '',
		incomingMessage: '',
		inputMessssage: '',
		inputSocketId: '',
		posts: [],
		postsAmount: 0,
		errorMessage: '',
		response: false,
		hasKeys: false,
		hasPeerPublicKey: false,
		mySigningKeyAddress: '',
		hasSignature: false,
		myEthersSignature: null,
		myRsaPrivate: '',
		myRsaPublic: '',
		peerRsaPublic: '',
		socketId: '',
		toSocketId: '',

	};
	this.sendMessage = this.sendMessage.bind(this);
	this.cofSocket = socketIOClient(this.state.endpoint + "/chat");
}

	componentWillMount() {
		const self = this;
		//example: /chat#KwIHnDgVqXSj4JLaAAAL
		self.cofSocket.on('connect', function() { 
			self.setState({socketId: self.cofSocket.id});
			self.setState({connected:true});
		} );
		self.cofSocket.on('message', function(message) { self.handleIncommingMessage(message) } );
		self.recoverEthersSignature();
	}

	componentWillUnmount() {
		var self = this;
		self.cofSocket.on('disconnect', true);
	}

	handleIncommingMessage(message) {
		const self = this;
		let posts = self.state.posts;
		if (posts !== '') {
			this.setState({incomingMessage: JSON.stringify(message)});
			let postsAmount = posts.length + 1;
			posts = self.state.posts.slice();
			posts.push({'datetime': self.makeDate(), 'id': postsAmount.toString(), 'payload': message.data, 'row_style': 'left'});
			self.setState({ posts: posts });
		}
	}

	makeDate() {
		let currentdate = new Date();
			let datetime = currentdate.getDay() + "/"+currentdate.getMonth() 
				+ "/" + currentdate.getFullYear() + " @ " 
				+ currentdate.getHours() + ":" 
				+ currentdate.getMinutes();
		return datetime;
	}

	recoverEthersSignature = async () => {
		const self = this;
		await AsyncStorage.getItem('myEthersSignature')
		.then( (value) => {
			self.setState({myEthersSignature: value});
			if(value !== null) {
				self.setState({hasSignature: true});
			}
		})
		.catch((error) => { 
			self.setState({errorMessage: 'myPrivateKey: ' + error}); 
		});
	}

	sendSignature = async () => {
		const self = this;  
		let signature = self.state.myEthersSignature;
		self.cofSocket.emit('message', signature);
		let posts = self.state.posts;
		let postsAmount = posts.length + 1;
		posts = self.state.posts.slice();
		posts.push({'datetime': self.makeDate(), 'id': postsAmount.toString(), 'payload': 'Signature has been delivered', 'row_style': 'right'});
		self.setState({ posts: posts });
	}

	sendMessage(message) {
		if( this.state.connected ) {
			//let inputSocketId = this.state.inputSocketId;
			let inputSocketId = this.state.socketId;
			let inputMessssage = this.state.inputMessssage;
			let messageObject = {'user': inputSocketId, 'data': inputMessssage};
			this.cofSocket.emit('message', messageObject);
			this.setState({errorMessage: ''});
			let posts = this.state.posts;
			let postsAmount = posts.length + 1;
			posts = this.state.posts.slice();
			posts.push({'datetime': this.makeDate(), 'id': postsAmount.toString(), 'payload': message, 'row_style': 'right'});
			this.setState({ posts: posts });
			this.setState({postsAmount: postsAmount});
			this.setState({msg: ''});
		}
	}

	setStyle(direction) {
		return { paddingLeft: 10,
			paddingRight: 10,
			marginBottom: 5,
			borderColor: '#D3C8B2',
			borderWidth: 1,
			backgroundColor: 'whitesmoke',
			fontSize: 14,
			textAlign: direction }
	}

	extractKey = (item, index) => item.id;

    renderItem = ({item}) => {
        return (
          <Text id={item.id} style={this.setStyle(item.row_style)}><Text style={{color:'#D3C8B2'}}>{item.datetime}</Text> {'\n'}{item.payload}</Text>
        )
      }

	render() {
		return (
			<ScrollView style={styles.container} stickyHeaderIndices={[0]}>
				<View style={styles.container}>
					<Text style={styles.baseText}>
						<Ionicons name={'ios-pulse'} size={26} style={styles.icon} />
						<Text style={styles.header_h4}> CoF Chat Channel {'\n'}{'\n'}</Text>
						<Text style={styles.prompt}>signature:</Text>
						<Text>{this.state.hasSignature ? "true":"false"}</Text>
						<Text style={styles.prompt}>, peer key:</Text>
						<Text>{this.state.hasPeerPublicKey ? "true":"false"}</Text>
						<Text style={styles.prompt}>, connected:</Text>
						<Text>{this.state.connected ? "true":"false"}</Text>
					</Text>
					{this.state.hasSignature && <TouchableHighlight style={styles.smallGreyButton} onPress = {() => {
						this.sendSignature()}}>
						<Text style = {styles.hyperLink}> Send signature</Text>
					</TouchableHighlight>}

					{this.state.connected && <TextInput style = {styles.input}
						underlineColorAndroid = "transparent"
						placeholder = "User ID"
						placeholderTextColor = "#A0B5C8"
						autoCapitalize = "none"
						onChangeText = {(text)=>{this.setState({toSocketId:text})}}
					/>}
					
					{this.state.connected && <TextInput style = {styles.input}
						underlineColorAndroid = "transparent"
						placeholder = "your message"
						placeholderTextColor = "#A0B5C8"
						autoCapitalize = "none"
						onChangeText = {(text)=>{this.setState({inputMessssage:text})}}
						value = {this.state.inputMessssage}
					/>}
					{this.state.connected && <Button 
					    title="submit" 
					    color="#BCB3A2" 
					    accessibilityLabel="submit"
					    onPress = { ()=> this.sendMessage(this.state.inputMessssage)}
					/>}
					<Text style={styles.baseText}>
					  {this.connected && <Text style={styles.prompt}>, amount: </Text>}
					  {this.connected && <Text>{this.state.postsAmount}</Text>}
					</Text>
				<Text style={styles.errorText}>{'\n'}{this.state.errorMessage}</Text>
				</View>

				<FlatList
					style={styles.postItem}
					data={this.state.posts}
					renderItem={this.renderItem}
					keyExtractor={this.extractKey}
					inverted={true}
				/>
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
  left_row: {
    padding: 15,
    marginBottom: 5,
    borderColor: '#D3C8B2',
    borderWidth: 1,
    backgroundColor: 'whitesmoke',
    fontSize: 14,
    color: '#2D4866',
    textAlign: 'left',
  },
  right_row: {
    padding: 15,
    marginBottom: 5,
    borderColor: '#D3C8B2',
    borderWidth: 1,
    backgroundColor: 'whitesmoke',
    fontSize: 14,
    color: '#2D4866',
    textAlign: 'right',
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

export default SocketIo;