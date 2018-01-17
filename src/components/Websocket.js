/*
websocket: 85.144.198.84:28475 (wss://echo.websocket.org/)
nodejs-websocket
*/
import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
            msg:"",
            incoming:"",
            posts: [],
            postsAmount: 0
        };

        //this.socket = new WebSocket('ws://45.32.186.169:28475');
        this.socket = new WebSocket('ws://echo.websocket.org'); //test
        this.socket.onopen = () => {
            this.setState({connected:true})
        };
        this.socket.onmessage = (e) => {
            console.log(e.data);
            this.setState({incoming:e.data});
        };
        this.socket.onerror = (e) => {
            console.log(e.message);
        };
        this.socket.onclose = (e) => {
            this.setState({connected:false})
            console.log(e.code, e.reason);
        };
        this.emit = this.emit.bind(this);

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
		}
	}

    componentWillMount() {
        const self = this;
        //let posts = self.state.posts;
        
    }

    renderItem = ({item}) => {
        return (
          <Text style={styles.row}>{item.id}. {item.datetime} {'\n'}{item.payload}</Text>
        )
      }

    render() {
        return (
            <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
              <View style={styles.container}>
                <Text style={styles.baseText}>
                  <Ionicons name={'ios-pulse-outline'} size={26} style={styles.icon} />
                  <Text style={styles.header_h4}> CoF Chat Channel {'\n'}{'\n'}</Text>
                  <Text style={styles.prompt}>connected:</Text>
                  <Text>{this.state.connected ? "true":"false"}</Text>
                </Text>
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
              </View>
            
              <FlatList
                style={styles.postItem}
                data={this.state.posts}
                renderItem={this.renderItem}
                keyExtractor={extractKey}
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
});

export default Websocket;