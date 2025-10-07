import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Image,
} from 'react-native'
import FastImage, { Source } from 'react-native-fast-image'

interface CredentialCardProps {
  onPress?(): void
  credential: any
  name: string
  issuerName: string
  description?: string
  backgroundColor?: string
  textColor?: string
  backgroundImage?: { uri: string }
  logo?: { uri: string }
  style?: StyleProp<ViewStyle>
  showSpinner?: boolean
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  onPress,
  name,
  issuerName,
  description,
  backgroundColor = '#fff',
  textColor = '#000',
  backgroundImage,
  logo,
  style,
  showSpinner = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hasImage, setHasImage] = useState(!!backgroundImage?.uri)
  const hasEverLoaded = useRef(false) // merkt, ob das Bild schon einmal vollständig geladen wurde

  const handleImageLoad = () => {
    setImageLoaded(true)
    hasEverLoaded.current = true
  }

  const fastImageSource: Source | undefined = hasImage
    ? {
        uri: backgroundImage?.uri,
        priority: FastImage.priority.high,
        cache: FastImage.cacheControl.immutable, // dauerhaft cachen
      }
    : undefined

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={[styles.card, { backgroundColor }, style]}
    >
      {/* Hintergrund wenn kein Bild */}
      {!hasImage && (
        <View style={styles.noImageBackground}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      {/* Bild via FastImage */}
      {hasImage && fastImageSource && (
        <FastImage
          source={fastImageSource}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={() => {
            if (!hasEverLoaded.current) setImageLoaded(false)
          }}
          onError={() => {
            console.warn('⚠️ Fehler beim Laden des Hintergrundbilds')
            setHasImage(false)
          }}
          onLoadEnd={handleImageLoad}
        />
      )}

      {/* Spinner nur beim allerersten Laden */}
      {hasImage && showSpinner && !imageLoaded && !hasEverLoaded.current && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      )}

      {/* Inhalt */}
      <View style={styles.content}>
        {logo?.uri && <Image source={{ uri: logo.uri }} style={styles.logo} />}
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {name}
        </Text>
        {description && (
          <Text
            style={[styles.description, { color: textColor }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
        <Text style={[styles.issuer, { color: textColor }]} numberOfLines={1}>
          {issuerName}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default CredentialCard

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#f2f2f2',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 10,
  },
  noImageBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e5e5',
  },
  noImageText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    position: 'absolute',
    padding: 16,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    position: 'absolute',
    top: 12,
    left: 12,
  },
  name: {
    position: 'absolute',
    top: 20,
    left: 64,
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  issuer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    fontSize: 14,
    fontWeight: '500',
  },
})
