//http://www.reactnativeexpress.com/asyncstorage
import React, { Component } from 'react';
import { Button, Image, View, Text, StyleSheet, TextInput } from 'react-native';


class TextinputTest extends React.Component {
  constructor(props) {
        super(props);

        this.state = {
            connected: false,
            msg:"",
        };

    }

  render() {
    return (
      <View style={styles.container}>
         <TextInput 
          style = {styles.input} 
            underlineColorAndroid = "transparent"
           placeholder = "your message"
           placeholderTextColor = "#A0B5C8"
           autoCapitalize = "none"
           onChangeText = {(text)=>{this.setState({msg:text})}}
           value={this.state.msg}
         />
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
  input: {
    height: 40, 
    borderColor: '#D3C8B2', 
    backgroundColor: '#FFF',
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 15,
    color: '#999999',
  },
});

export default TextinputTest;