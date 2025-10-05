import React, { useCallback, useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  FlatList,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useCredentialsForDisplay } from '../../agent/hooks'
import CredentialCard from '../../components/misc/CredentialCard'
import SearchBar from '../../components/inputs/SearchBar'
import { Screens } from '../../types/navigators'
import { ColorPallet } from '../../theme/theme'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width * 0.9
const CARD_HEIGHT = CARD_WIDTH * 0.6
const CARD_OFFSET = 550 // Abstand zwischen Karten

const ListCredentials: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { credentials } = useCredentialsForDisplay()

  const [searchPhrase, setSearchPhrase] = useState('')
  const [clicked, setClicked] = useState(false)

  useFocusEffect(
  useCallback(() => {
    console.log('🔄 Screen refocused → Credentials refreshed')
    // Dieser State-Change triggert einen Re-Render und aktualisiert Hooks
    setClicked(false)
  }, [])
)

  const animatedScales = useMemo(
    () =>
      credentials.reduce<Record<string, Animated.Value>>((acc, item) => {
        acc[item.id] = new Animated.Value(1)
        return acc
      }, {}),
    [credentials]
  )

  const filteredCredentials = useMemo(() => {
    if (!searchPhrase) return credentials
    return credentials.filter((item) => {
      const name =
        item.tags?.displayName ||
        item.display?.name ||
        'Credential'
      return name.toLowerCase().includes(searchPhrase.toLowerCase())
    })
  }, [searchPhrase, credentials])

  const handlePress = (id: string) => {
    console.log('✅ Pressed card:', id)
    const scale = animatedScales[id]

    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, speed: 100, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 500, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate(Screens.CredentialDetails as never, {
        credentialId: id,
      } as never)
    })
  }

  const renderCard = ({ item, index }: { item: any; index: number }) => {
    const tags = item.tags || {}
    const scale = animatedScales[item.id] || new Animated.Value(1)

    return (
      <View
        key={item.id}
        style={[
          styles.cardWrapper,
          { marginTop: index === 0 ? 0 : -CARD_OFFSET * 0.3 }, // leicht überlappend
          { zIndex: filteredCredentials.length - index },
        ]}
      >
        <Pressable
          pointerEvents="box-only"
          onPress={() => handlePress(item.id)}
          android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
          style={({ pressed }) => [
            styles.pressable,
            pressed && { opacity: 0.95, transform: [{ scale: 1.02 }] },
          ]}
        >
          <Animated.View style={[styles.cardFrame, { transform: [{ scale }] }]}>
            <CredentialCard
              credential={item}
              name={tags.displayName || item.display?.name || 'Credential'}
              issuerName={tags.displayIssuer || item.display?.issuer?.name || 'Unknown'}
              description={tags.displayDescription || ''}
              backgroundColor={tags.backgroundColor || '#eee'}
              textColor={tags.textColor || '#000'}
              backgroundImage={
                tags.backgroundImage
                  ? { uri: tags.backgroundImage }
                  : undefined
              }
              logo={
                tags.displayIssuerLogo
                  ? { uri: tags.displayIssuerLogo }
                  : undefined
              }
              style={styles.card}
            />
          </Animated.View>
        </Pressable>
      </View>
    )
  }

  if (!credentials?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t<string>('Global.ZeroRecords')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <SearchBar
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        clicked={clicked}
        setClicked={setClicked}
      />

      <FlatList
        data={filteredCredentials.slice().reverse()}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={filteredCredentials.length > 6}
      />
    </View>
  )
}

export default ListCredentials

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPallet.grayscale.white,
  },
  scrollContainer: {
    paddingTop: 10,
    paddingBottom: 100,
    alignItems: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  cardFrame: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#777',
    fontSize: 16,
  },
})
