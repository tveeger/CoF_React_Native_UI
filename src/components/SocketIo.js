//http://www.reactnativeexpress.com/asyncstorage
//https://npm.taobao.org/package/react-native-socket.io-client
import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, TouchableHighlight, TextInput, FlatList, AsyncStorage, Modal } from 'react-native';
import socketIo from 'react-native-socket.io-client';

import Ionicons from 'react-native-vector-icons/Ionicons';
import {RSA, RSAKeychain} from 'react-native-rsa-native';
import ethers from 'ethers';

class SocketIo extends React.Component {
constructor(props) {
	super(props);

	this.state = {
		connected: false,
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
		hasNickname: false,
		socketId: '',
		modalVisible: false,
		contactModalVisible: false,
		onlineUsers: null,
		newName: '',
	};
	this.sendMessage = this.sendMessage.bind(this);
	//this.cofSocket = daChatSocket; //zie connector.js
	this.cofSocket = socketIo.connect('http://45.32.186.169:28475/chat');
	//this.cofSocket = socketIOClient.connect('http://192.168.1.9:28475/chat');
	//this.cofSocket = socketIo.connect('http://45.32.186.169:28475/chat', { jsonp: false, transports: ['websocket'] });
}

	componentWillMount() {
		const self = this;
		
		self.cofSocket.on('connect', function() {
			self.setState({socketId: '/chat#' + self.cofSocket.id});
			self.setState({connected:true});
		} );
		
		self.cofSocket.on('connect_error', function() {
			self.setState({connected:false})
		});
		self.cofSocket.on('message', function(message) { self.handleIncommingMessage(message) } );
		self.cofSocket.on('users', function(users) { self.setState({onlineUsers: JSON.stringify(users)}) } );
		
	}

	componentWillUnmount() {
		var self = this;
		self.cofSocket.emit('disconnect', self.state.newName);
	}

	handleIncommingMessage(message) {
		const self = this;
		//this.setState({incomingMessage: JSON.stringify(message)});
		let posts = self.state.posts;
		let postsAmount = posts.length + 1;
		posts = self.state.posts.slice();
		posts.push({'datetime': self.makeDate(), 'id': postsAmount.toString(), 'payload': message.data, 'row_style': 'left'});
		self.setState({ posts: posts });
	}

	registerUser(user) {
		const self = this;
		self.cofSocket.emit('users', {'username': user, 'id': self.state.socketId});
		this.setState({modalVisible: false});
		this.setState({hasNickname: true});
	}

	selectContact(item) {
		this.setState({inputSocketId: item});
		this.toggleContactModal(false);
	}

	makeDate() {
		let currentdate = new Date();
			let datetime = currentdate.getDay() + "/"+currentdate.getMonth() 
				+ "/" + currentdate.getFullYear() + " @ " 
				+ currentdate.getHours() + ":" 
				+ currentdate.getMinutes();
		return datetime;
	}

/*	recoverEthersSignature = async () => {
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
	}*/

	sendMessage(message) {
		if( this.state.connected ) {
			let inputSocketId = this.state.inputSocketId;
			//let inputSocketId = this.state.socketId;
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
			this.setState({inputMessssage: ''});
		}
	}

	toggleModal(visible) {
		this.setState({ modalVisible: visible });
	}

	toggleContactModal(visible) {
		this.setState({ contactModalVisible: visible });
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

	extractContactKey = (item, index) => index.toString();

	renderContactItem = ({item}) => {
		return (
			<View style={styles.contact_list}>
				<TouchableHighlight onPress = {() => {this.selectContact(item.id)}}>
					<Text style={{color:'#CCC'}}>{item.username}</Text>
				</TouchableHighlight>
			</View>
		)
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
				
					<Modal animationType = {"slide"} transparent = {false}
						visible = {this.state.modalVisible}
						onRequestClose = {() => { console.log("Modal has been closed.") } }>
						<View style = {styles.modal}>
							<Text style={styles.header_h4}>Register Your Nickname</Text>
							<View style = {styles.textField}>
								<Text style={styles.prompt}>You nickname is only for this session</Text>
							</View>
							<TextInput
								style={styles.input}
								underlineColorAndroid = "transparent"
								placeholder = "Max. 80 characters"
								autoCapitalize = "none"
								autoFocus = {true}
								selectable = {true}
								selectTextOnFocus = {true}
								maxLength = {80}
								placeholderTextColor = "#A0B5C8"
								onChangeText = {(newName) => this.setState({newName})}
							/>
							<Button 
								title="submit" 
								color="#BCB3A2" 
								accessibilityLabel="submit"
								onPress = { ()=> this.registerUser(this.state.newName)}
							/>
							<Text>{'\n'}</Text>
							<View style = {styles.textField}>
								<Text style={styles.prompt}>{'\n'}{this.state.modalMessage}{'\n'}</Text>
							</View>
							<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
								this.toggleModal(!this.state.modalVisible)}}>
								<Text style = {styles.hyperLink}> Close</Text>
							</TouchableHighlight>
						</View>
					</Modal>
	
					<Modal animationType = {"slide"} 
						transparent = {false}
						visible = {this.state.contactModalVisible}
						onRequestClose = {() => {} }>
						<View style = {styles.modal}>
							<Text style={styles.header_h4}>My Contacts</Text>
							<FlatList
								numColumns={1}
								data={JSON.parse(this.state.onlineUsers)}
								renderItem={this.renderContactItem}
								keyExtractor={this.extractContactKey}
							/>
							<Text>{'\n'}</Text>
							
							<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
								this.toggleContactModal(!this.state.contactModalVisible)}}>
								<Text style = {styles.hyperLink}> Close</Text>
							</TouchableHighlight>
						</View>
					</Modal>

					<Text style={styles.baseText}>
						<Ionicons name={'ios-pulse'} size={26} style={styles.icon} />
						<Text style={styles.header_h4}> CoF Chat Channel {'\n'}{'\n'}</Text>
						<Text style={styles.prompt}>Nickname:</Text>
						<Text>{this.state.newName}, {this.state.socketId}</Text>
						<Text></Text>
					</Text>

					<View style={{flexDirection:'row', width: window.width}}>
						<View style={{flex:2}}>
							{!this.state.hasNickname && <TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
								this.toggleModal(!this.state.modalVisible)}}>
								<Text style = {styles.hyperLink}> Register </Text>
							</TouchableHighlight>}
						</View>
						<View style={{flex:2}}>
							{this.state.hasNickname && <TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
								this.toggleContactModal(!this.state.contactModalVisible)}}>
								<Text style = {styles.hyperLink}> Find Person </Text>
							</TouchableHighlight>}
						</View>
					</View>

					{this.state.hasNickname && <TextInput style = {styles.input}
						underlineColorAndroid = "transparent"
						placeholder = "User ID"
						placeholderTextColor = "#A0B5C8"
						autoCapitalize = "none"
						defaultValue = {this.state.inputSocketId}
						onChangeText = {(text)=>{this.setState({inputSocketId:text})}}
					/>}
					
					{this.state.hasNickname && <TextInput style = {styles.input}
						underlineColorAndroid = "transparent"
						placeholder = "your message"
						placeholderTextColor = "#A0B5C8"
						autoCapitalize = "none"
						onChangeText = {(text)=>{this.setState({inputMessssage:text})}}
						value = {this.state.inputMessssage}
					/>}
					{this.state.hasNickname && <Button 
					    title="submit" 
					    color="#BCB3A2" 
					    accessibilityLabel="submit"
					    onPress = { ()=> this.sendMessage(this.state.inputMessssage)}
					/>}
					<Text style={styles.baseText}>
					  {this.connected && <Text style={styles.prompt}>, amount: </Text>}
					  {this.connected && <Text>{this.state.postsAmount}</Text>}
					</Text>
					{!this.state.connected && <Text style={styles.errorText}>{'\n'}The chat socket is probably down.</Text>}
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
	smallBlueButton: {
		backgroundColor: '#8192A2',
		padding: 4,
		width: 200,
		margin: 5,
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
	}
});

export default SocketIo;