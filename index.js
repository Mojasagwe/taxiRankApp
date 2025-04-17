/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { clearAsyncStorage } from './ClearAsyncStorage';

// Suppress the animation warning
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);

// Add clearAsyncStorage to global scope for easier access in dev mode
if (__DEV__) {
  global.clearAsyncStorage = clearAsyncStorage;
}

AppRegistry.registerComponent(appName, () => App);
