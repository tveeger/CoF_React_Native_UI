//http://www.reactnativeexpress.com/asyncstorage
import React, { Component } from 'react';
import { Button, Image, View, Text, StyleSheet } from 'react-native';
import Websocket from './Websocket.js';

class ChatScreen extends React.Component {
  static navigationOptions = {
    title: 'Connect with others',
    tabBarLabel: 'Chat',
  };

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
         <Websocket />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    backgroundColor: 'whitesmoke',
  },
});

export default ChatScreen;