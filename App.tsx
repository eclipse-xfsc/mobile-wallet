import AntDesignProvider from '@ant-design/react-native/lib/provider';
import { NavigationContainer } from '@react-navigation/native';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import toastConfig from './src/components/toast/ToastConfig';
import { initStoredLanguage } from './src/localization';
import RootStack from './src/navigators/RootStack';
import { ColorPallet, customTheme } from './src/theme/theme';

const navigationTheme = {
  dark: false,
  colors: {
    primary: ColorPallet.brand.primary,
    background: ColorPallet.grayscale.white,
    card: ColorPallet.brand.primary,
    text: ColorPallet.grayscale.white,
    border: ColorPallet.grayscale.white,
    notification: ColorPallet.grayscale.white,
  },
};

const App = () => {
  initStoredLanguage();

  return (
    <SafeAreaProvider>
      <AntDesignProvider theme={customTheme}>
        <NavigationContainer theme={navigationTheme}>
          <RootStack />
          <Toast
            topOffset={Platform.OS === 'android' ? 5 : 50}
            config={toastConfig}
          />
        </NavigationContainer>
      </AntDesignProvider>
    </SafeAreaProvider>
  );
};

export default App;
