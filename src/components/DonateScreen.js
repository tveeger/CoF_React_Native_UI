import React, { Component } from 'react';
import { Button, Image, View, Text, TextInput, StyleSheet } from 'react-native';
import CharityDropdown from './CharityDropdown.js';


class DonateScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      detInputAmount: '',
      submitMessage: '',
      tokenBalance: '',
    };

  }

  emit() {
    const self = this;

    self.setState({submitMessage: 'Congratulations, You just donated ' + self.state.detInputAmount + ' DETs'});
  }

  static navigationOptions = {
    title: 'Make a donation',
    tabBarLabel: 'Donate',
  };
    render() {
        return (
          <View style={styles.container}>
            <Text style={styles.baseText}>
              <Text style={styles.header_h4}>Donate DETs to a charity{'\n'}{'\n'}</Text>
              <Text style={styles.prompt}>DET Balance: </Text>
              <Text>this.state.tokenBalance{'\n'}{'\n'}</Text>
              <Text>Choose the charity and fill in the amount of DETs you want to donate</Text>
            </Text>
            <CharityDropdown/>
            <TextInput
              style={styles.input}
              underlineColorAndroid = "transparent"
              placeholder = "Minimum 1 DET"
              placeholderTextColor = "#A0B5C8"
              keyboardType={'numeric'}
              maxLength={4}
              onChangeText={(detInputAmount) => this.setState({detInputAmount})}
              value={this.state.detInputAmount}
            />
            <Button 
              color="#BCB3A2"
              title="submit"
              accessibilityLabel="Submit"
              onPress = { ()=> this.emit()}
            />
            <Text style={styles.row}>{this.state.submitMessage}</Text>
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
  baseText: {
    textAlign: 'left',
    color: '#999999',
    marginBottom: 5,
  },
  input: {
    height: 40, 
    borderColor: '#D3C8B2', 
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 15,
  },
  row: {
    color: '#2D4866',
    marginTop: 12,
    fontSize: 16,
  },
});


export default DonateScreen;