import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/app/providers';
import { RootNavigator } from '@/navigation/RootNavigator';

const App = () => (
  <AppProviders>
    <StatusBar style="light" />
    <RootNavigator />
  </AppProviders>
);

export default App;
