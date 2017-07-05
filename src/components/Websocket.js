/*
websocket: 85.144.198.84:28475 (wss://echo.websocket.org/)
nodejs-websocket
*/
import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, TextInput, FlatList } from 'react-native';

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
            fruit: [{id:'1',payload:'apples'}, {id:'2',payload:'bananas'}, {id:'3',payload:'oranges'}],
            postsAmount: 0
        };

        this.socket = new WebSocket('ws://45.32.186.169:28475');
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
            const self = this;
            let posts = self.state.posts;
            let postsAmount = posts.length + 1;
            this.socket.send(this.state.msg)
            posts = self.state.posts.slice();
            posts.push({'id': postsAmount, 'payload': this.state.msg});
            self.setState({ posts: posts });
            self.setState({postsAmount: postsAmount});
            self.setState({msg: ''});
        }
    }

    onMsgChange(event) {
        this.setState({msg:event.target.value});
    }

    componentWillMount() {
        const self = this;
        let posts = self.state.posts;
        
    }

    renderItem = ({item}) => {
        return (
          <Text style={styles.row}>{item.payload}</Text>
        )
      }

    render() {
        return (
            <View style = {styles.container}>
              <Text>connected:{this.state.connected ? "true":"false"}</Text>
              <TextInput style = {styles.input}
                 underlineColorAndroid = "transparent"
                 placeholder = "your message"
                 placeholderTextColor = "#A0B5C8"
                 autoCapitalize = "none"
                 onChangeText = {(text)=>{this.setState({msg:text})}}
                 value={this.state.msg}
              />
              <Button 
                  title="submit" 
                  color="#BCB3A2" 
                  accessibilityLabel="submit"
                  onPress = { ()=> this.emit()}
              />
              <Text>lastMsg:{this.state.incoming}, amount: {this.state.postsAmount}</Text>
              <FlatList
                style={styles.postItem}
                data={this.state.posts}
                renderItem={this.renderItem}
                keyExtractor={extractKey}
               />
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    backgroundColor: 'whitesmoke',
  },
  header_h4: {
    color: '#8192A2',
    fontSize: 20,
    padding: 10,
  },
  input: {
    height: 40, 
    borderColor: '#D3C8B2', 
    backgroundColor: 'whitesmoke',
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 15,
  },
  postItem: {
    paddingTop: 10,
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: 'blanchedalmond',
    fontSize: 14,
  },
});

export default Websocket;