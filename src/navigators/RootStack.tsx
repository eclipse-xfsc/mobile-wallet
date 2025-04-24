import { Agent } from '@credo-ts/core';
import AgentProvider from '@credo-ts/react-hooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import UserInactivity from 'react-native-user-inactivity';
import { ToastType } from '../components/toast/BaseToast';
import { MainStackContext } from '../utils/helpers';
import MainStack from './MainStack';
import OnboardingStack from './OnboardingStack';
import { useNavigation } from '@react-navigation/core';
import { Screens } from '../types/navigators';
import  {CheckLinkType} from '../screens/Scan/Scan.tsx';

const RootStack: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [authenticated, setAuthenticated] = useState(false);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>();

  const [agent, setAgent] = useState<Agent | undefined>();

  const onActivityChange = (isActive: boolean) => {
    if (!isActive) {
      shutDownAgent();
    }
  };

  const shutDownAgent = useCallback(async () => {
    if (agent === undefined || !agent.isInitialized) {
      return;
    }

    setAuthenticated(false);
    await agent.shutdown();
    Toast.show({
      type: ToastType.Info,
      text1: t<string>('Toasts.Info'),
      text2: t<string>('Global.UserInactivity'),
    });
  }, [agent, t]);

  useEffect(() => {
    (async () => {
      const handleDeepLinking = async (url: string) => {
        setDeepLinkUrl(url);
        await CheckLinkType(url,navigation)  
      };

      Linking.addEventListener('url', ({ url }) => handleDeepLinking(url));
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLinking(initialUrl);
      }
    })();
  }, []);

  const mainStackProviderValue = useMemo(
    () => ({
      setAuthenticated,
      deepLinkUrl,
      resetDeepLinkUrl: () => setDeepLinkUrl(null),
    }),
    [setAuthenticated, deepLinkUrl, setDeepLinkUrl],
  );

  return authenticated && agent ? (
    <AgentProvider agent={agent}>
      <UserInactivity
        isActive={agent.isInitialized}
        timeForInactivity={300000}
        onAction={onActivityChange}
      >
        <MainStackContext.Provider value={mainStackProviderValue}>
          <MainStack />
        </MainStackContext.Provider>
      </UserInactivity>
    </AgentProvider>
  ) : (
    <OnboardingStack setAgent={setAgent} setAuthenticated={setAuthenticated} />
  );
};

export default RootStack;
