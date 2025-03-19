/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Suppress the animation warning
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);

AppRegistry.registerComponent(appName, () => App);
