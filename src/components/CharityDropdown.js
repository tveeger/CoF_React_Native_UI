//https://github.com/ArnaudRinquin/react-native-radio-buttons

import React, { Component } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { RadioButtons } from 'react-native-radio-buttons';

class CharityDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOption: '',
    };

  }

  render() {
    const options = [
    'GreenPeace',
    'War Child',
    'Stichting Aap'
  ];

  function setSelectedOption(selectedOption){
    this.setState({
      selectedOption
    });
  }

  function renderOption(option, selected, onSelect, index){
    const style = selected ? { fontWeight: 'bold', fontSize: 16 } : { fontSize: 16 };

    return (
      <TouchableWithoutFeedback onPress={onSelect} key={index}>
        <View><Text style={style}>{option}</Text></View>
      </TouchableWithoutFeedback>
    );
  }

  function renderContainer(optionNodes){
    return <View>{optionNodes}</View>;
  }

      return (
        <View>
          <RadioButtons
            options={ options }
            onSelection={ setSelectedOption.bind(this) }
            selectedOption={this.state.selectedOption }
            renderOption={ renderOption }
            renderContainer={RadioButtons.getViewContainerRenderer({
              backgroundColor: '#DDDDDD',
              flexDirection: 'column',
              justifyContent: 'space-around',
            })}
          />
          <Text><Text style={styles.prompt}>Selected option: </Text><Text style={styles.selected}> {this.state.selectedOption || 'none'}{'\n'}{'\n'}</Text></Text>
      </View>);
     
    }
};

const styles = StyleSheet.create({
  prompt: {
    color: '#BCB3A2',
  },
  selected: {
    fontSize: 24,
    color: '#8192A2',
  },
});

export default CharityDropdown;