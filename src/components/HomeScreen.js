//TabNavigator: https://reactnavigation.org/docs/navigators/tab

import React, { Component } from 'react';
import { Button, Image, View, Text, StyleSheet } from 'react-native';
import { StackNavigator, TabNavigator } from "react-navigation";
import AboutScreen from './AboutScreen.js';
import TermsScreen from './TermsScreen.js';
import CharitiesScreen from './CharitiesScreen.js';
import BuyScreen from './BuyScreen.js';
import DonateScreen from './DonateScreen.js';
import ChatScreen from './ChatScreen.js';
import TokenInfo from './TokenInfo.js';


import Icon from 'react-native-vector-icons/FontAwesome';
const rocket = (<Icon name="rocket" size={30} color="#900" />);
const android = (<Icon name="android" size={30} color="#900" />);
const google = (<Icon name="google" size={30} color="#900" />);

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Chains of Freedom',
    tabBarLabel: 'Home',
  };
  render() {
    const {navigate} = this.props.navigation;
      return (
        <View style={styles.container}>
          
          <TokenInfo/>
          <Button
            onPress={() => navigate('About')}
            title="About CoF"
            color='#BCB3A2'
            icon={{
              name: 'android',
              color: styles.roundButton.backgroundColor
          }}
          borderRadius={styles.roundButton.borderRadius}
        />
        <Button
          onPress={() => navigate('Terms')}
          title="Terms"
          color='#BCB3A2'
          icon={{
            name: 'rocket',
            color: styles.roundButton.backgroundColor
          }}
          borderRadius={styles.roundButton.borderRadius}
        />
        <Button
          onPress={() => navigate('Charities')}
          title="Charities"
          color='#BCB3A2'
          icon={{
            name: 'google',
            color: styles.roundButton.backgroundColor
          }}
          borderRadius={styles.roundButton.borderRadius}
        />
        <Text> </Text>
        
      </View>
      );
  }
}

const MainScreenNavigator = TabNavigator({
  Home: { screen: HomeScreen },
  Buy: { screen: BuyScreen },
  Donate: { screen: DonateScreen },
  Chat: { screen: ChatScreen } }, {
  tabBarOptions: {
    activeTintColor: '#666',
    inactiveTintColor: '#DDD',
      labelStyle: {
        fontSize: 14,
      },
      style: {
        backgroundColor: '#8192A2',
      }
    }
});

const DaStackNavigator = StackNavigator({
  Main: { screen: MainScreenNavigator },
  About: { screen: AboutScreen },
  Terms: { screen: TermsScreen },
  Charities: { screen: CharitiesScreen } }, {
    navigationOptions: {
      headerTintColor: '#8192A2',
      headerStyle: {backgroundColor: '#DDD'}
    }
  
});

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    backgroundColor: 'whitesmoke',
  },
  icon: {
    width: 26,
    height: 26,
  },
  roundButton: {
    borderRadius:30,
    backgroundColor: 'green'
  },
});


export default DaStackNavigator;