import React, { Component } from 'react';
import { Button, Image, ScrollView, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

class CharitiesScreen extends React.Component {
  static navigationOptions = {
    title: 'Charities',
  };
  
  render() {
    const { navigate } = this.props.navigation;
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.baseText}>
          <Ionicons name={'ios-globe'} size={26} style={styles.icon} />
          <Text style={styles.header_h4}> Info for Charity Organizations</Text>
          <Text>{'\n'}If you are a charity organization and you would be on the list, please send us a mail.</Text>
        </Text>
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
  icon: {
    color: '#2D4866',
    fontSize: 30,
  },
});


export default CharitiesScreen;