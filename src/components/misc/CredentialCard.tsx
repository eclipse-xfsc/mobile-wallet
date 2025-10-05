import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  Animated,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native'

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
  const fadeAnim = useState(new Animated.Value(0))[0]

  const onImageLoad = () => {
    setImageLoaded(true)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start()
  }

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={[styles.card, { backgroundColor }, style]}
    >
      {/* Hintergrund bei fehlendem Bild */}
      {!hasImage && (
        <View style={styles.noImageBackground}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      {/* Sanfter heller Placeholder während Bild lädt */}
      {hasImage && !imageLoaded && (
        <View style={styles.placeholderBackground} />
      )}

      {/* Spinner während Bild lädt */}
      {hasImage && showSpinner && !imageLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      )}

      {/* Fade-in Background Image */}
      {hasImage && (
        <Animated.Image
          source={{ uri: backgroundImage?.uri }}
          style={[styles.image, { opacity: fadeAnim }]}
          resizeMode="cover"
          onLoadStart={() => {
            setImageLoaded(false)
          }}
          onError={() => setHasImage(false)}
          onLoadEnd={onImageLoad}
        />
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
  placeholderBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8f8f8',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
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
