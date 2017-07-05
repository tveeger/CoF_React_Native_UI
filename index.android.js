import React, { Component } from 'react';
import { AppRegistry, StyleSheet, View} from 'react-native';
import HomeScreen from './src/components/HomeScreen.js';

export default class Entbox3 extends Component {
  render() {
    return (
      <View style={styles.mainContainer}>
        <HomeScreen/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer:{
      flex:1,                  //Step 1
      backgroundColor: '#F5FCAA',
  },
});

AppRegistry.registerComponent('Entbox3', () => Entbox3);
