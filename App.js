import React, { Component } from 'react';
import {
  Platform,
  Text,
  View
} from 'react-native';
import Nav from './src/components/Nav.js';

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <Nav/>
    );
  }
}