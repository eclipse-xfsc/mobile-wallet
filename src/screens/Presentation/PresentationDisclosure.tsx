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
  const { presentationId, disclosureOptions } = route.params || {}

  // ✅ Verhindert Crash, falls disclosureOptions fehlt
  if (!disclosureOptions || typeof disclosureOptions !== 'object') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noData}>
            Keine Disclosure-Daten verfügbar.
          </Text>
          <Button
            title="OK"
            onPress={() => navigation.goBack()}
            buttonType={ButtonType.Primary}
          />
        </View>
      </SafeAreaView>
    )
  }

  // 🔹 Flatten für Anzeige
  const allDisclosures: { descriptorId: string; field: DisclosureField }[] = Object.entries(
    disclosureOptions
  ).flatMap(([descId, fields]) =>
    (fields || []).map((field) => ({ descriptorId: descId, field }))
  )

  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(
      allDisclosures.map(
        (d) => [`${d.descriptorId}:${d.field.path}`, d.field.disclose]
      )
    )
  )

  const toggle = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleConfirm = () => {
    const filteredOptions: Record<string, DisclosureField[]> = {}
    for (const [descId, fields] of Object.entries(disclosureOptions)) {
      filteredOptions[descId] = (fields || []).map((f) => ({
        ...f,
        disclose: selected[`${descId}:${f.path}`],
      }))
    }

    navigation.navigate(Screens.Presentation as never, {
      presentationId,
      selectedDisclosures: filteredOptions,
    } as never)
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

        {allDisclosures.length === 0 && (
          <Text style={styles.noData}>Keine selektiven Offenlegungen erforderlich.</Text>
        )}

        {Object.entries(disclosureOptions).map(([descId, fields]) => (
          <View key={descId} style={styles.section}>
            <Text style={styles.sectionTitle}>{descId}</Text>
            {(fields || []).map((field) => {
              const key = `${descId}:${field.path}`
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
                  <View style={styles.switchContainer}>
                    <Switch
                      value={!!selected[key]}
                      onValueChange={() => toggle(key)}
                      trackColor={{ false: '#ccc', true: ColorPallet.brand.primary }}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        ))}

        {/* ✅ Nur "OK"-Button */}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scroll: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#555', marginBottom: 16 },
  section: {
    marginBottom: 20,
    backgroundColor: '#fafafa',
    padding: 12,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  itemText: {
    flex: 1,
    paddingRight: 12,
  },
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldPath: { fontSize: 14, fontWeight: '500', color: '#333' },
  fieldPurpose: { fontSize: 12, color: '#666', marginTop: 2 },
  fieldValue: { fontSize: 13, color: '#444', marginTop: 4 },
  buttonContainer: { marginTop: 30 },
  noData: { color: '#777', textAlign: 'center', marginVertical: 40 },
})
