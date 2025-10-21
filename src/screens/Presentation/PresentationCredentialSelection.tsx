import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { useNavigation, useRoute } from '@react-navigation/native'
import { ColorPallet } from '../../theme/theme'
import { ensureWallet } from '../../agent/agentSingleton'
import { Oid4vpRepository } from '../../storage/Oid4vpRepository'
import { Screens } from '../../types/navigators'
import CredentialCard from '../../components/misc/CredentialCard'
import { useTranslation } from 'react-i18next'

interface RouteParams {
  presentationId: string
}

const PresentationCredentialSelection: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const route = useRoute()
  const { presentationId } = route.params as RouteParams

  const [loading, setLoading] = useState(true)
  const [requirements, setRequirements] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const agent = await ensureWallet()
        const repo = new Oid4vpRepository()
        const rec = await repo.getById(presentationId, agent)
        if (!rec) throw new Error('Record not found')

        // ✅ Richtiger Pfad
        const reqs =
          rec?.resolvedRequest?.presentationExchange?.credentialsForRequest?.requirements ?? []

        console.log('📘 requirements:', JSON.stringify(reqs, null, 2))

        // 🧠 Automatische Auswahl vorbereiten
        const auto: Record<string, string[]> = {}
        reqs.forEach((req: any) => {
          req.submissionEntry?.forEach((entry: any) => {
            const groupId = entry.inputDescriptorId
            const creds = entry.verifiableCredentials || []
            if (creds.length === 1) {
              auto[groupId] = [creds[0].credentialRecord?.id]
            }
          })
        })

        setRequirements(reqs)
        setSelected(auto)
      } catch (e) {
        console.error('❌ Fehler beim Laden der Präsentation:', e)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [presentationId])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ColorPallet.brand.primary} />
        <Text style={styles.loadingText}>Lade Präsentationsdaten...</Text>
      </View>
    )
  }

  if (!requirements.length) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nachweise auswählen</Text>
        <Text style={styles.noCreds}>
          ⚠️ Keine Anforderungen oder passenden Nachweise gefunden.
        </Text>
      </ScrollView>
    )
  }

  const toggleSelect = (groupId: string, credId: string, multi: boolean) => {
    setSelected((prev) => {
      const current = prev[groupId] || []
      if (multi) {
        return current.includes(credId)
          ? { ...prev, [groupId]: current.filter((id) => id !== credId) }
          : { ...prev, [groupId]: [...current, credId] }
      } else {
        return { ...prev, [groupId]: [credId] }
      }
    })
  }

  const handleNext = () => {
    const count = Object.values(selected).flat().length
    if (count === 0) {
      Toast.show({
        type: 'info',
        text1: 'Keine Auswahl',
        text2: 'Bitte wählen Sie mindestens ein Credential aus.',
      })
      return
    }
  
    navigation.navigate(Screens.Presentation as never, {
      presentationId,
      selectedCredentials: selected,
    } as never)
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>  {t('PresentationSelection.SelectCredentials')}</Text>
      <Text style={styles.subtitle}>
        {t('PresentationSelection.SelectCredentialsHint')}
      </Text>

      {requirements.map((req: any, reqIndex: number) => {
        const multi = req.needsCount > 1
        const entries = req.submissionEntry || []

        return (
          <View key={`req-${reqIndex}`} style={styles.groupContainer}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}> {t('PresentationSelection.Request')} {reqIndex + 1}</Text>
              <Text style={styles.groupSubtitle}>
                {multi
                  ? t('PresentationSelection.MultiSelection')+` (${req.needsCount})`
                  : t('PresentationSelection.SingleSelection')}
              </Text>
            </View>

            {entries.map((entry: any, eIndex: number) => {
              const groupId = entry.inputDescriptorId || `entry-${reqIndex}-${eIndex}`
              const groupName = entry.name || `Anfrage #${eIndex + 1}`
              const creds = entry.verifiableCredentials || []

              return (
                <View key={groupId} style={styles.groupSection}>
                  <Text style={styles.groupName}>{groupName}</Text>

                  {creds.length === 0 && (
                    <Text style={styles.noCreds}>
                      {t('PresentationSelection.NoCredentialsFound')}
                    </Text>
                  )}

                  {creds.map((vc: any) => {
                    const cred = vc.credentialRecord || vc.record
                    if (!cred) return null
                    const tags = cred._tags || {}
                    const isSelected = selected[groupId]?.includes(cred.id)
                    const isSingle = creds.length === 1

                    return (
                      <View
                        key={cred.id}
                        style={[
                          styles.cardWrapper,
                          isSelected && styles.cardActive,
                          isSingle && styles.cardDisabled,
                        ]}
                      >
                        <CredentialCard
                          credential={cred}
                          name={
                            tags.displayName ||
                            cred.credential?.name ||
                            cred.type ||
                            'Unbekannter Nachweis'
                          }
                          issuerName={tags.displayIssuer || 'Unbekannter Aussteller'}
                          description={tags.displayDescription || ''}
                          backgroundColor={tags.backgroundColor || '#f8f8f8'}
                          textColor={tags.textColor || '#000'}
                          backgroundImage={
                            tags.backgroundImage ? { uri: tags.backgroundImage } : undefined
                          }
                          logo={
                            tags.displayIssuerLogo
                              ? { uri: tags.displayIssuerLogo }
                              : undefined
                          }
                        />

                        {/* 🔹 Overlay zum Anklicken */}
                        <TouchableOpacity
                          activeOpacity={0.9}
                          onPress={() => !isSingle && toggleSelect(groupId, cred.id, multi)}
                          style={[
                            styles.overlay,
                            isSelected && styles.overlayActive,
                            isSingle && styles.overlayDisabled,
                          ]}
                        >
                          {isSelected && (
                            <View style={styles.checkmarkContainer}>
                              <Text style={styles.checkmark}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>

                        {/* 🔹 Automatisch-Badge */}
                        {isSingle && (
                          <View style={styles.autoBadge}>
                            <Text style={styles.autoBadgeText}>
                              {t('PresentationSelection.AutomaticallySelected')}
                            </Text>
                          </View>
                        )}
                      </View>
                    )
                  })}
                </View>
              )
            })}
          </View>
        )
      })}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          onPress={() => navigation.navigate(Screens.PresentationList as never)}
        >
          <Text style={styles.buttonText}> {t('Global.Cancel')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            Object.keys(selected).length > 0 ? styles.primary : styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={Object.keys(selected).length === 0}
        >
          <Text style={styles.buttonText}>  {t('Global.Next')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default PresentationCredentialSelection

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: ColorPallet.grayscale.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: ColorPallet.baseColors.lightGrey },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 20 },
  groupContainer: {
    marginBottom: 28,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  groupHeader: { marginBottom: 8 },
  groupTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  groupSubtitle: { fontSize: 13, color: '#666' },
  groupSection: { marginTop: 10 },
  groupName: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  noCreds: { color: '#777', fontSize: 14 },
  cardWrapper: {
    marginVertical: 6,
    borderRadius: 18,
    borderColor: '#ddd',
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  cardActive: { borderColor: ColorPallet.brand.primary, borderWidth: 2 },
  cardDisabled: { opacity: 0.85 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  overlayActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 2,
    borderColor: ColorPallet.brand.primary,
  },
  overlayDisabled: { backgroundColor: 'transparent', pointerEvents: 'none' },
  checkmarkContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: ColorPallet.brand.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: { color: '#fff', fontWeight: 'bold' },
  autoBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: ColorPallet.brand.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 3,
  },
  autoBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primary: { backgroundColor: ColorPallet.brand.primary },
  cancel: { backgroundColor: ColorPallet.grayscale.lightGrey },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: ColorPallet.grayscale.white, fontWeight: '600' },
})
