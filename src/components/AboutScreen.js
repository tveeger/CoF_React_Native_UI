import React, { Component } from 'react';
import { Button, Image, View, Text, StyleSheet } from 'react-native';

class AboutScreen extends React.Component {
  static navigationOptions = {
    title: 'About Chains of Freedom',
  };
    render() {
        return (
          <View style={styles.container}>
            <Text style={styles.header_h4}>more here...</Text>
          </View>
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
    color: '#8192A2',
    fontSize: 20,
    padding: 10,
  },
});


export default AboutScreen;