import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'intl-pluralrules';
import 'react-native-reanimated';

AppRegistry.registerComponent(appName, () => App);
