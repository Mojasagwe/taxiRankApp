import React from 'react';
import {
  StatusBar,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import TestScreen from './src/screens/Testscreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <TestScreen />
    </SafeAreaView>
  );
}

export default App;
