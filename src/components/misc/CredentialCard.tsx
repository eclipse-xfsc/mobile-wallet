import React from 'react'
import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native'
import { Card } from '@ant-design/react-native'
import { FileBadge } from 'lucide-react-native'

import { useHasInternetConnection } from '../../hooks'
import type { DisplayImage } from '../../agent'
import { hexColors } from './config/config'

interface CredentialCardProps {
  onPress?(): void
  credential: any
  name: string
  title: string
  issuerName: string
  subtitle?: string
  backgroundColor?: string
  textColor?: string
  logo?: DisplayImage
  backgroundImage?: DisplayImage
  shadow?: boolean
  style?: StyleProp<ViewStyle>
}

export function getTextColorBasedOnBg(bgColor: string) {
  return Number.parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2
    ? '#1F1F1F'
    : '#FFFFFF'
}

export function darken(color: string, percent: number): string {
  const hexColor = color.startsWith('#')
    ? color
    : ((hexColors as Record<string, string>)[
        color.startsWith('$') ? color.slice(1) : color
      ] as string)

  const f = Number.parseInt(hexColor.slice(1), 16)
  const t = percent < 0 ? 0 : 255
  const p = percent < 0 ? percent * -1 : percent
  const R = f >> 16
  const G = (f >> 8) & 0x00ff
  const B = f & 0x0000ff

  return `#${(
    0x1000000 +
    (Math.round((t - R) * p) + R) * 0x10000 +
    (Math.round((t - G) * p) + G) * 0x100 +
    (Math.round((t - B) * p) + B)
  )
    .toString(16)
    .slice(1)}`
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  onPress,
  credential,
  logo,
  backgroundImage,
  textColor,
  name,
  issuerName,
  subtitle,
  backgroundColor,
  shadow = true,
  style,
}) => {
  const hasInternet = useHasInternetConnection()

  const bgColor = backgroundColor ?? hexColors['grey-100']
  const textColorValue = textColor ?? getTextColorBasedOnBg(bgColor)

  const icon = logo?.uri ? (
    <Image
      source={{ uri: logo.uri }}
      style={{ width: 64, height: 48, resizeMode: 'contain' }}
    />
  ) : (
    <View
      style={{
        width: 48,
        height: 48,
        backgroundColor: '#EEE',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
      }}
    >
      <FileBadge color={hexColors['grey-100']} />
    </View>
  )

  const content = (
    <Card style={[styles.card, style]}>
      <Card.Header
        style={styles.header}
        thumb={icon}
        thumbStyle={styles.iconStyle}
        extra={
          <View style={styles.headerRight}>
            <Text
              style={[styles.name, { color: textColorValue }]}
              numberOfLines={2}
            >
              {issuerName}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  { color: textColorValue, opacity: 0.8 },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        }
      />
      <Card.Footer
        content={
          <View>
            <Text
              style={[
                styles.footerText,
                { color: textColorValue, opacity: 0.8 },
              ]}
            >
              Issuer
            </Text>
            <Text
              style={[styles.issuerName, { color: textColorValue }]}
              numberOfLines={2}
            >
              {name}
            </Text>
          </View>
        }
      />
      {backgroundImage?.uri ? (
        <View
          style={[
            styles.backgroundContainer,
            { backgroundColor: bgColor ?? hexColors['grey-100'] },
          ]}
        >
          {hasInternet ? (
            <Image
              source={{ uri: backgroundImage.uri }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.backgroundPlaceholder} />
          )}
        </View>
      ) : (
        <View style={styles.backgroundContainer} />
      )}
    </Card>
  )

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
  }

  return content
}

export default CredentialCard

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'transparent',
    elevation: 6,
  },
  header: {
    padding: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconStyle: {
    marginRight: 16,
  },
  headerRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'right',
  },
  footerText: {
    fontSize: 12,
  },
  issuerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1F1F1F',
  },
})
