import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button, { ButtonType } from '../../components/button/Button'
import { ColorPallet } from '../../theme/theme'
import { StackScreenProps } from '@react-navigation/stack'
import { PresentationStackParams, Screens } from '../../types/navigators'

export interface DisclosureField {
  path: string
  purpose?: string
  value?: any
  disclose: boolean
}

type DisclosureProps = StackScreenProps<
  PresentationStackParams,
  Screens.PresentationDisclosure
>

const PresentationDisclosure: React.FC<DisclosureProps> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { credentialId, disclosureOptions, onConfirm } = route.params || {}

  if (!disclosureOptions || typeof disclosureOptions !== 'object') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noData}>Keine Disclosure-Daten verfügbar.</Text>
          <Button title="OK" onPress={() => navigation.goBack()} buttonType={ButtonType.Primary} />
        </View>
      </SafeAreaView>
    )
  }

  // Flatten für Anzeige
  const allDisclosures = Object.entries(disclosureOptions).flatMap(([credId, fields]) =>
    (fields || []).map((field) => ({ credentialId: credId, field }))
  )

  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(
      allDisclosures.map(
        (d) => [`${d.credentialId}:${d.field.path}`, d.field.disclose]
      )
    )
  )

  const toggle = (key: string) =>
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleConfirm = () => {
    // Für jedes Credential seine Disclosure-Felder mit aktuellem Status zurückgeben
    const filteredOptions: Record<string, DisclosureField[]> = {}
    for (const [credId, fields] of Object.entries(disclosureOptions)) {
      filteredOptions[credId] = (fields || []).map((f) => ({
        ...f,
        disclose: selected[`${credId}:${f.path}`],
      }))
    }

    // ✅ Rückgabe per Callback an Presentation
    if (onConfirm) {
      onConfirm(filteredOptions[credentialId] ?? [])
    }

    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {t('OID4VP.DisclosureSelection') || 'Offenlegung auswählen'}
        </Text>
        <Text style={styles.subtitle}>
          {t('OID4VP.SelectClaims') ||
            'Wählen Sie, welche Datenfelder Sie offenlegen möchten:'}
        </Text>

        {allDisclosures.length === 0 ? (
          <Text style={styles.noData}>
            Keine selektiven Offenlegungen erforderlich.
          </Text>
        ) : (
          Object.entries(disclosureOptions).map(([credId, fields]) => (
            <View key={credId} style={styles.section}>
              <Text style={styles.sectionTitle}>{credId}</Text>
              {(fields || []).map((field) => {
                const key = `${credId}:${field.path}`
                return (
                  <View key={key} style={styles.item}>
                    <View style={styles.itemText}>
                      <Text style={styles.fieldPath}>{field.path}</Text>
                      {field.purpose && (
                        <Text style={styles.fieldPurpose}>{field.purpose}</Text>
                      )}
                      {field.value !== undefined && (
                        <Text style={styles.fieldValue}>{String(field.value)}</Text>
                      )}
                    </View>

                    <View style={styles.switchBox}>
                      <Switch
                        style={{ width: 51, height: 31 }} // ✅ iOS Touch Fix
                        value={!!selected[key]}
                        onValueChange={() => toggle(key)}
                        trackColor={{ false: '#ccc', true: ColorPallet.brand.primary }}
                        thumbColor={'#fff'}
                      />
                    </View>
                  </View>
                )
              })}
            </View>
          ))
        )}

        <View style={styles.buttonContainer}>
          <Button title="OK" onPress={handleConfirm} buttonType={ButtonType.Primary} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PresentationDisclosure

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ColorPallet.grayscale.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scroll: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#555', marginBottom: 16 },
  section: {
    marginBottom: 20,
    backgroundColor: '#fafafa',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderColor: '#eee',
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: ColorPallet.baseColors.black,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  itemText: {
    flex: 1,
    paddingRight: 12,
  },
  switchBox: {
    width: 52,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldPath: { fontSize: 14, fontWeight: '500', color: '#333' },
  fieldPurpose: { fontSize: 12, color: '#666', marginTop: 2 },
  fieldValue: { fontSize: 13, color: '#444', marginTop: 4 },
  buttonContainer: { marginTop: 30 },
  noData: { color: '#777', textAlign: 'center', marginVertical: 40 },
})
