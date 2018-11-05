import React, { Component } from 'react';
import { Button, Image, View, Text, StyleSheet, ScrollView, TextInput, FlatList , TouchableHighlight, TouchableOpacity, AsyncStorage, Modal, RefreshControl, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RadioButtons, SegmentedControls } from 'react-native-radio-buttons';


class ContactsScreen extends React.Component {
	static navigationOptions = {
		title: 'Manage your contacts',

	};

	constructor(props) {
		super(props);

		this.state = {
		hasData: false,
		modalVisible: false,
		refreshing: false,
		walletAddress: '',
		newAddress: '',
		newName: '',
		contactList: [],
		newContactList: [],
		newContact: '',
		objectCount: 0,
		errorMessage: '',
		};

	}

	componentWillMount() {
		let self = this;
		this.setState({message: ""});
		self.getContactList();
	}

	componentWillUnmount() {
		let self = this;
		let contactList = self.state.contactList;
		AsyncStorage.setItem('contactList', JSON.stringify(contactList));
	}

	onRefresh() {
		this.setState({refreshing: true});
		this.getContactList().then(() => {
			this.setState({refreshing: false});
		});
	}

	getContactList = async () => {
		const self = this;
		AsyncStorage.getItem('contactList')
		.then( (value) => 
			self.setState({contactList: JSON.parse(value), objectCount: JSON.parse(value).length})
		)
		.catch(function(error){
			self.setState({errorMessage: 'getContactList: ' + error.toString()});
		})
	}

	addContact =  async () => {
		const self = this;
		let newName = self.state.newName;
		let newAddress = self.state.newAddress;
		let contactcount = self.state.objectCount;
		let newContactList = [];
		self.setState({objectCount: contactcount+1});
		self.setState({message: ""});
		let contactList = self.state.contactList;
		newContactList.push({'id': contactcount+1, 'name': newName, 'address': newAddress});
		contactList = contactList.concat(newContactList);
		self.setState({newContactList: contactList});
		self.setState({contactList: contactList});
		AsyncStorage.setItem('contactList', JSON.stringify(contactList));
		self.toggleModal(false);
	}

	deleteContact= async (id) => {
		let contactList = this.state.contactList;
		let contactCount = Object.keys(contactList).length;
		let selectedContact = contactList.map(function(o) { return o.id; }).indexOf(id);
		
		this.setState({contactList: contactList.splice(selectedContact,1)});
		this.setState({message: 'just deleted ' + selectedContact.toString() + ', count: ' + contactCount.toString()});
		this.setState({objectCount: contactCount-1});
		AsyncStorage.setItem('contactList', JSON.stringify(contactList));
		//TODO create new contactList object with new id
		this.onRefresh();
	}

	toggleModal(visible) {
		this.setState({ modalVisible: visible });
	}

	extractKey = (item, index) => item.id.toString();

	renderItem = ({item}) => {
		return (
			<View style={{flexDirection:'row', width: window.width}}>
				<View style={{flex:4}}>
					<Text style={styles.row}>{item.name} <Text style={styles.small_address}>{item.address}</Text></Text>
				</View>
				<View style={{flex:1}}>
					<TouchableHighlight onPress = {() => {this.deleteContact(item.id)}}>
						<Ionicons name={'ios-close'} size={18} style={styles.icon} />
					</TouchableHighlight>
				</View>
			</View>
		)
	}

	render() {
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
					<View style = {styles.textField}>
						<Text style={styles.header_h4}>Add a new contact</Text>
						<Text style={styles.prompt}>Name{'\n'}</Text>
						<TextInput
							style={styles.input}
							defaultValue = {this.state.transferToAddress}
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
						<Text style={styles.prompt}>Address{'\n'}</Text>
						<TextInput
							style={styles.input}
							defaultValue = {this.state.transferToAddress}
							underlineColorAndroid = "transparent"
							placeholder = "0x..."
							autoCapitalize = "none"
							autoFocus = {false}
							selectable = {true}
							selectTextOnFocus = {true}
							maxLength = {43}
							placeholderTextColor = "#A0B5C8"
							onChangeText = {(newAddress) => this.setState({newAddress})}
						/>
					</View>
					<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
						this.addContact()}}>
						<Text style = {styles.hyperLink}>Submit</Text>
					</TouchableHighlight>
					<Text>{'\n'}{'\n'}{'\n'}</Text>
					<TouchableHighlight style={styles.smallGreyButton} onPress = {() => {
						this.toggleModal(!this.state.modalVisible)}}>
						<Text style = {styles.hyperLink}>Close</Text>
					</TouchableHighlight>
				</View>
			</Modal>
		
			<View style={styles.container}>
				<Text style={styles.baseText}>
					<Ionicons name={'ios-contact'} size={26} style={styles.icon} />
					<Text style={styles.header_h4}> Contacts{'\n'}</Text>
					<Text>{'\n'}</Text>
				</Text>
				
				<TouchableHighlight style={styles.smallBlueButton} onPress = {() => {
					this.toggleModal(!this.state.modalVisible)}}>
					<Text style = {styles.hyperLink}>Add new Contact</Text>
				</TouchableHighlight>

				<Text>{'\n'}</Text>
				<Text style={styles.prompt}>count: {this.state.objectCount.toString()}</Text>
				<FlatList
					numColumns={1}
					data={this.state.contactList}
					renderItem={this.renderItem}
					keyExtractor={this.extractKey}
				/>
				<Text style={styles.baseText}>{this.state.message}</Text>
				<Text style={styles.errorText}>{'\n'}{this.state.errorMessage}</Text>
			</View>
		</ScrollView>
	);
    }
}

const styles = StyleSheet.create({
	container: {
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
		textAlign: 'left',
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
		marginRight: 12,
		color: '#999999',
	},
	textField: {
		marginLeft: 30,
		marginRight: 30,
	},
	row: {
		padding: 10,
		marginBottom: 5,
		marginRight: 5,
		color: '#2D4866',
		backgroundColor: '#BCB3A2',
		fontSize: 16,
	},
	small_address: {
		fontSize: 12,	
		color: '#917c55'
	},
  	smallBlueButton: {
		backgroundColor: '#8192A2',
		paddingTop: 4,
		paddingBottom: 4,
		width: 320,
		marginLeft: 30,
		marginBottom: 10,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
  	smallGreyButton: {
		backgroundColor: '#BBB',
		padding: 4,
		width: 240,
		marginLeft: 30,
		marginBottom: 10,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modal: {
		flex: 1,
		backgroundColor: 'whitesmoke',
		paddingTop: 100
	},
	hyperLink: {
		color: 'whitesmoke',
		fontSize: 16,
		fontWeight: 'normal'
	},
	icon: {
		color: '#2D4866',
		fontSize: 30,
  	},
  	errorText: {
   		marginTop: 10,
    	color: 'red'
  	}
});


export default ContactsScreen;