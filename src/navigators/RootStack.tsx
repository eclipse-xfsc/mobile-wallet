import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Linking } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/core'
import Toast from 'react-native-toast-message'
import UserInactivity from 'react-native-user-inactivity'
import AgentProvider from '@credo-ts/react-hooks'
import type { Agent } from '@credo-ts/core'

import { ToastType } from '../components/toast/BaseToast'
import { MainStackContext } from '../utils/helpers'
import MainStack from './MainStack'
import OnboardingStack from './OnboardingStack'
import { Screens } from '../types/navigators'
import { CheckLinkType } from '../screens/Scan/Scan'
import { SdJwtVcRecordProvider } from '../agent/providers/SdJwtVcsProvider'
import { W3cCredentialRecordProvider } from '../agent/providers/W3cCredentialsProvider'
import { setGlobalAgent } from '../agent/agentSingleton'

const RootStack: React.FC = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()

  const [agent, setAgent] = useState<Agent | undefined>()
  const [authenticated, setAuthenticated] = useState(false)
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null)

  // 🔐 Wird aufgerufen, wenn der User inaktiv ist
  const shutDownAgent = useCallback(async () => {
    console.log('🛑 Inactivity detected → closing wallet')
    if (!agent) return

    try {
      if (agent.wallet?.isInitialized) {
        await agent.wallet.close()
        console.log('🔒 Wallet closed due to inactivity (Agent kept alive)')
      }
    } catch (e) {
      console.error('❌ Error closing wallet:', e)
    }

    setAuthenticated(false)
    Toast.show({
      type: ToastType.Info,
      text1: t<string>('Toasts.Info'),
      text2: t<string>('Global.UserInactivity'),
    })
  }, [agent, t])

  // 👀 Reaktion auf Aktivitätsänderungen
  const onActivityChange = (isActive: boolean) => {
    if (!isActive) {
      void shutDownAgent()
    }
  }

  useEffect(() => {
    const handleDeepLinking = async (url: string) => {
      setDeepLinkUrl(url)
     
      if (!agent) {
        console.warn('⚠️ Deep link received before agent init — delaying...')
        const interval = setInterval(async () => {
          if (agent) {
            clearInterval(interval)
            await CheckLinkType(url, navigation, agent,t)
          }
        }, 500)
      } else {
        console.log("Try to call ChecklinkType")
        await CheckLinkType(url, navigation, agent,t)
      }
    }

    const subscription = Linking.addEventListener('url', ({ url }) =>
      handleDeepLinking(url)
    )

    ;(async () => {
      const initialUrl = await Linking.getInitialURL()
      if (initialUrl) await handleDeepLinking(initialUrl)
    })()

    return () => subscription.remove()
  }, [agent, navigation])

  // 🔁 Context für tieferliegende Komponenten
  const mainStackProviderValue = useMemo(
    () => ({
      setAuthenticated,
      deepLinkUrl,
      resetDeepLinkUrl: () => setDeepLinkUrl(null),
    }),
    [deepLinkUrl]
  )

  // 🧠 Agent global registrieren, sobald er gesetzt ist
  useEffect(() => {
    if (agent) {
      setGlobalAgent(agent)
      console.log('🌐 Global agent registered')
    }
  }, [agent])

  // 🧭 Render
  return authenticated && agent ? (
    <AgentProvider agent={agent}>
      <W3cCredentialRecordProvider agent={agent}>
        <SdJwtVcRecordProvider agent={agent}>
          <UserInactivity
            isActive={agent.isInitialized}
            timeForInactivity={300000}
            onAction={onActivityChange}
          >
            <MainStackContext.Provider value={mainStackProviderValue}>
              <MainStack />
            </MainStackContext.Provider>
          </UserInactivity>
        </SdJwtVcRecordProvider>
      </W3cCredentialRecordProvider>
    </AgentProvider>
  ) : (
    <OnboardingStack setAgent={setAgent} setAuthenticated={setAuthenticated} />
  )
}

export default RootStack
