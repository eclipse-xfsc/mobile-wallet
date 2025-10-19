import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import Button, { ButtonType } from '../../components/button/Button'
import { ColorPallet } from '../../theme/theme'
import { StackScreenProps } from '@react-navigation/stack'
import { PresentationStackParams, Screens } from '../../types/navigators'

type SuccessProps = StackScreenProps<
  PresentationStackParams,
  Screens.PresentationSuccess
>

const PresentationSuccess: React.FC<SuccessProps> = ({ navigation }) => {
  const { t } = useTranslation()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Image
          source={require('../../assets/img/proof-success.svg')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          {t('OID4VP.PresentationSent') || 'Presentation gesendet!'}
        </Text>
        <Text style={styles.subtitle}>
          {t('OID4VP.SuccessSubtitle') ||
            'Deine Präsentation wurde erfolgreich übermittelt.'}
        </Text>

        <View style={styles.buttons}>
          <Button
            title="Zurück zur Übersicht"
            onPress={() => navigation.navigate(Screens.PresentationList)}
            buttonType={ButtonType.Primary}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default PresentationSuccess

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ColorPallet.grayscale.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  icon: { width: 120, height: 120, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '600', color: '#111', marginBottom: 8 },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttons: { width: '100%' },
})
