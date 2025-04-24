import { CredentialExchangeRecord } from '@credo-ts/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {Image} from 'react-native';
import { Card, View, Text } from '@ant-design/react-native';

import { Title } from '..';

import { dateFormatOptions } from '../../constants';
import { ContactTheme, TextTheme } from '../../theme/theme';

import { useHasInternetConnection } from '../../hooks'
import type { DisplayImage } from '../../agent'
import { FileBadge } from 'lucide-react-native';
import { hexColors } from './config/config';
interface CredentialCardProps {
  onPress?(): void
  credential: any;
  name: string
  issuerName: string
  subtitle?: string
  bgColor?: string
  textColor?: string
  issuerImage?: DisplayImage
  backgroundImage?: DisplayImage
  shadow?: boolean
}

export function getTextColorBasedOnBg(bgColor: string) {
  return Number.parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2 ? '#1F1F1F' : '#1F1F1F'
}

/**
 * Darken the shade of a custom color based on the hex color and a percentage
 * used to dynamically create onPress styling for custom colors
 */
export function darken(color: string, percent: number): string {
  const hexColor = color.startsWith('#')
    ? color
    : ((hexColors as Record<string, string>)[color.startsWith('$') ? color.slice(1) : color] as string)
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
  issuerImage,
  backgroundImage,
  textColor,
  name,
  issuerName,
  subtitle,
  bgColor,
  shadow = true,
}) => {

  console.log(credential)
  
  const hasInternet = useHasInternetConnection()

  textColor = textColor ? textColor : getTextColorBasedOnBg(bgColor ?? '#000')

  const icon = issuerImage?.url ? (
    <Image src={issuerImage.url} alt={issuerImage.altText} width={64} height={48} />
  ) : (
    <View width={48} height={48} bg="$lightTranslucent" ai="center" br="$12" pad="md">
      <FileBadge color={hexColors['grey-100']} />
    </View>
  )

  const getPressStyle = () => {
    if (!onPress) return {}
    if (backgroundImage?.url) return { opacity: 0.9 }
    return { backgroundColor: darken(bgColor ?? hexColors['grey-100'], 0.1) }
  }

  const bgColorValue = backgroundImage?.url ? 'transparent' : bgColor ?? hexColors['grey-100']

  console.log(hasInternet)
  console.log(backgroundImage?.url)
  console.log(bgColorValue)


  return (
        <View style={[styles.container]}>
        <Card
          style={styles.card}
          bodyStyle={styles.bodyStyle}
          onPress={onPress}
        >
          <Card.Header
            style={styles.header}
            thumb={icon}
            thumbStyle={styles.iconStyle}
            extra={
              <View style={styles.headerRight}>
                <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
                  {issuerName}
                </Text>
                <Text style={[styles.subtitle, { color: textColor, opacity: 0.8 }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
            }
          />
          <Card.Footer
            content={
              <View>
                <Text style={[styles.footerText, { color: textColor, opacity: 0.8 }]}>
                  Issuer
                </Text>
                <Text style={[styles.issuerName, { color: textColor }]} numberOfLines={2}>
                  {name}
                </Text>
              </View>
            }
          />
          {backgroundImage && backgroundImage.url ? (
            <View style={[styles.backgroundContainer, { backgroundColor: bgColorValue ?? hexColors['grey-100'] }]}>
              {hasInternet ? (
                <Image
                  source={{ uri: backgroundImage.url }}
                  style={styles.backgroundImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.backgroundPlaceholder} />
              )}
            </View>
          ) : <View style={styles.backgroundContainer}/>}
        </Card>
      </View>
    );
};

export default CredentialCard;
const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  card: {
    borderRadius: 12,
    backgroundColor: 'transparent',
    width: '100%',
  },
  bodyStyle: {
    height: 64,
    padding: 0,
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
});