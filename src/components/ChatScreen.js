//http://www.reactnativeexpress.com/asyncstorage
import React, { Component } from 'react';
import { Image, View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import Websocket from './Websocket.js';

class ChatScreen extends React.Component {
  static navigationOptions = {
    title: 'Connect with otheres',
    tabBarLabel: 'Chat',
  };

  render() {
      return (
        <View>
           <Websocket />
        </View>
      );
    }
};

export default ChatScreen;