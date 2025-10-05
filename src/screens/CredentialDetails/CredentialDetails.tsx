import type { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { W3cCredentialRepository } from '@credo-ts/core'
import { SdJwtVcRepository } from '@credo-ts/core/build/modules/sd-jwt-vc/repository'

import Accordion from '../../components/accordion/Accordion'
import CredentialCard from '../../components/misc/CredentialCard'
import { ColorPallet } from '../../theme/theme'
import { CredentialStackParams, Screens } from '../../types/navigators'
import { RecordHistory } from '../../types/record'
import { errorToast, warningToast, successToast } from '../../utils/toast'

type CredentialDetailsProps = StackScreenProps<
  CredentialStackParams,
  Screens.CredentialDetails
>

const CredentialDetails: React.FC<CredentialDetailsProps> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation()
  const { credentialId } = route.params
  const { agent } = useAgent()

  const [credential, setCredential] = useState<any | null>(null)
  const [history, setHistory] = useState<RecordHistory[]>([])
  const [loading, setLoading] = useState(true)

  // ---------- Lade Credential ----------
  const loadCredential = useCallback(async () => {
    if (!agent || !credentialId) return

    try {
      let record = null

      // Versuche zuerst SD-JWT
      try {
        const sdjwtRepo = agent.dependencyManager.resolve(SdJwtVcRepository)
        record = await sdjwtRepo.findById(agent.context, credentialId)
      } catch (e) {
        console.log('⚠️ SD-JWT Repo not found or record missing:', e)
      }

      // Dann Fallback: W3C Credential Repo
      if (!record) {
        const w3cRepo = agent.dependencyManager.resolve(W3cCredentialRepository)
        record = await w3cRepo.findById(agent.context, credentialId)
      }

      if (!record) {
        warningToast(t<string>('CredentialOffer.CredentialNotFound'))
        navigation.goBack()
        return
      }

      setCredential(record)
    } catch (e) {
      console.error('❌ Fehler beim Laden der Credential:', e)
      errorToast('Credential konnte nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }, [agent, credentialId, navigation, t])

  useEffect(() => {
    void loadCredential()
  }, [loadCredential])

  // ---------- Lade Credential History ----------
  const getCredentialHistory = useCallback(async () => {
    if (!agent || !credential) return
    try {
      const data = await agent.genericRecords.findAllByQuery({
        credentialRecordId: credential.id,
      })

      const allRecords: RecordHistory[] = []
      data?.forEach((record) => {
        if (record.content?.records) {
          allRecords.push(...record.content.records)
        }
      })

      const filtered = allRecords.filter((r) => r?.credentialLabel)
      const sorted = filtered.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setHistory(sorted)
    } catch (err) {
      console.error('❌ Fehler beim Laden der Credential History:', err)
      errorToast(t<string>('credential.get.error'))
    }
  }, [agent, credential, t])

  useEffect(() => {
    void getCredentialHistory()
  }, [getCredentialHistory])

  // ---------- Delete Credential ----------
  const handleDelete = async () => {
    if (!agent || !credential) return
    Alert.alert(
      'Delete Credential',
      'Are you sure you want to permanently delete this credential?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Versuche SD-JWT zu löschen
              try {
                const sdjwtRepo = agent.dependencyManager.resolve(SdJwtVcRepository)
                await sdjwtRepo.deleteById(agent.context, credential.id)
                successToast('SD-JWT Credential deleted')
              } catch (e) {
                console.log('⚠️ SD-JWT delete failed or not found:', e)
              }

              // Falls SD-JWT nicht vorhanden → versuche W3C
              try {
                const w3cRepo = agent.dependencyManager.resolve(W3cCredentialRepository)
                await w3cRepo.deleteById(agent.context, credential.id)
                successToast('W3C Credential deleted')
              } catch (e) {
                console.log('⚠️ W3C delete failed or not found:', e)
              }

              navigation.navigate(Screens.Credentials as never, {
                refresh: Date.now(),
              } as never)
            } catch (e) {
              console.error('❌ Delete failed:', e)
              errorToast('Failed to delete credential')
            }
          },
        },
      ]
    )
  }

  // ---------- Ladeanzeige ----------
  if (loading || !credential) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ColorPallet.brand.primary} />
        <Text style={styles.loadingText}>Loading credential...</Text>
      </View>
    )
  }

  // ---------- Anzeige aus Tags ----------
  const tags = credential.getTags?.() ?? {}
  const displayName = tags.displayName || 'Credential'
  const displayIssuer = tags.displayIssuer || 'Unknown'
  const description = tags.displayDescription || ''
  const backgroundColor = tags.backgroundColor || '#eee'
  const textColor = tags.textColor || '#000'
  const backgroundImage = tags.backgroundImage ? { uri: tags.backgroundImage } : undefined

  // ---------- Render ----------
  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {/* ---------- KARTENANZEIGE ---------- */}
      <View style={styles.credentialCardView}>
        <CredentialCard
          credential={credential}
          name={displayName}
          issuerName={displayIssuer}
          description={description}
          backgroundColor={backgroundColor}
          textColor={textColor}
          backgroundImage={backgroundImage}
          style={{ borderRadius: 20 }}
        />
      </View>

      {/* ---------- INFO ---------- */}
      <View style={Platform.OS === 'android' ? styles.card : styles.cardIos}>
        <Accordion title="Info" innerAccordion={false}>
          <View>
            <View style={styles.innerContainer}>
              <Text style={styles.attribute}>Credential ID</Text>
              <Text style={styles.attribute}>{credential.id}</Text>
            </View>
            <View style={styles.divider} />

            {credential?.attributes
              ? Object.entries(credential.attributes).map(([key, value]) => (
                  <View key={key} style={styles.innerContainer}>
                    <Text style={styles.attribute}>{key}</Text>
                    <Text style={styles.attribute}>{String(value)}</Text>
                  </View>
                ))
              : null}
          </View>
        </Accordion>
      </View>

      {/* ---------- AKTIVITÄTEN ---------- */}
      <View style={Platform.OS === 'android' ? styles.card : styles.cardIos}>
        <Accordion title="Activities" innerAccordion={false}>
          {history.length ? (
            history.map((item, index) => (
              <View key={index}>
                <Accordion
                  title={item.connectionLabel}
                  date={new Date(item.timestamp)}
                  status={item.status}
                  innerAccordion
                >
                  {Object.entries(item.attributes).map(([key, value]) => (
                    <View key={key} style={styles.innerContainer}>
                      <Text style={styles.attribute}>{key}</Text>
                      <Text style={styles.attribute}>{String(value)}</Text>
                    </View>
                  ))}
                </Accordion>
                {history.length - 1 !== index && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <Text style={styles.noActivitiesText}>
              {t<string>('CredentialDetails.NoActivity')}
            </Text>
          )}
        </Accordion>
      </View>

      {/* ---------- DELETE BUTTON ---------- */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Credential</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default CredentialDetails

// ---------- STYLES ----------
const styles = StyleSheet.create({
  scrollView: {
    paddingBottom: 40,
  },
  credentialCardView: {
    marginHorizontal: 15,
    marginTop: 16,
  },
  card: {
    backgroundColor: ColorPallet.baseColors.white,
    borderRadius: 10,
    elevation: 3,
    padding: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  cardIos: {
    backgroundColor: ColorPallet.baseColors.white,
    shadowColor: ColorPallet.baseColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  attribute: {
    width: '50%',
    color: ColorPallet.baseColors.black,
  },
  divider: {
    borderBottomColor: ColorPallet.baseColors.lightGrey,
    borderBottomWidth: 1,
    width: '100%',
    marginVertical: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPallet.grayscale.white,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: ColorPallet.baseColors.black,
  },
  noActivitiesText: {
    textAlign: 'center',
    color: ColorPallet.baseColors.lightGrey,
    marginVertical: 10,
  },
  deleteButton: {
    backgroundColor: '#c62828',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})
