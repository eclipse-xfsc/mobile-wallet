import React, { useState } from 'react';
import { StyleSheet, View, Alert, Button} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useIsFocused } from '@react-navigation/core';
import { useAgent } from '@credo-ts/react-hooks';
import QRScanner from '../../components/inputs/QRScanner';
import { ColorPallet } from '../../theme/theme';
import QrCodeScanError from '../../types/error';
import { warningToast } from '../../utils/toast';
import { ScanStackParams, Screens, TabStacks } from '../../types/navigators';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import jsQR from 'jsqr';
import jpeg from 'jpeg-js';
import * as UPNG from "upng-js";
import type { NavigationProp } from '@react-navigation/native'

interface ScanProps {
  navigation: StackNavigationProp<ScanStackParams, Screens.Scan>;
  route: RouteProp<ScanStackParams, Screens.Scan>;

}

async function fetchWithRedirect(url: string): Promise<string> {
  const response = await fetch(url, { redirect: 'manual' });
  if (response.status === 302 || response.status === 404) {
    return response.url;
  } else {
    return url;
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = global.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function CheckLinkType(
  url: string,
  navigation: NavigationProp<any>
): Promise<string> {
  console.log('Process Deep Link:' + url);
  if (url.startsWith('openid-credential-offer') || url.includes("credential_offer")) {
    navigation.navigate(Screens.CredentialOfferOid4VC, { url });
    return '';
  }
  if (url.startsWith('openid4vp')) return '';
  if (url.startsWith('otpauth://hotp')) return '';
  if (url.startsWith('otpauth://totp/')) {
    navigation.navigate(Screens.OTPGenerator, { url });
    return '';
  }
  return url;
}

const Scan: React.FC<ScanProps> = ({ navigation,route }) => {
  const { agent } = useAgent();
  const isFocused = useIsFocused();

  const mode = route.params?.mode ?? 'camera'; // 👈 Default = Kamera

  const [qrCodeScanError, setQrCodeScanError] =
    useState<QrCodeScanError | null>(null);
  const [urlInput, setUrl] = useState('');

  const processUrl = async (url: string) => {
    setQrCodeScanError(null);
    if (url === '') {
      return warningToast('QR darf nicht leer sein');
    }

    const link = await CheckLinkType(url, navigation);
    if (link !== '') {
      try {
        const invitationUrl = await fetchWithRedirect(url);
        const { connectionRecord } =
          await agent.oob.receiveInvitationFromUrl(invitationUrl);

        if (!connectionRecord) {
          navigation.navigate(TabStacks.HomeStack);
        } else {
          navigation.navigate(Screens.ConnectionInvitation, {
            connectionRecordId: connectionRecord.id,
          });
        }
      } catch (e: unknown) {
        console.error(e);
        setQrCodeScanError(new QrCodeScanError('QRScanner.InvalidQrCode', url));
      }
    }
  };

  // 📂 Galerie öffnen & QR aus Bild lesen
  const pickImageAndScan = async () => {
  const result = await launchImageLibrary({ mediaType: 'photo', includeBase64: true });
  if (!result.assets || !result.assets[0]?.base64) {
    Alert.alert('Kein Bild ausgewählt');
    return;
  }

  try {
    const { base64, type } = result.assets[0];
    const buffer = base64ToBytes(base64!);

    let width: number;
    let height: number;
    let rgba: Uint8ClampedArray;

    if (type?.includes("jpeg") || type?.includes("jpg")) {
      const rawImageData = jpeg.decode(buffer, { useTArray: true });
      width = rawImageData.width;
      height = rawImageData.height;
      rgba = rawImageData.data;
    } else if (type?.includes("png")) {
      const img = UPNG.decode(buffer);
      const frames = UPNG.toRGBA8(img);
      width = img.width;
      height = img.height;
      rgba = new Uint8ClampedArray(frames[0]);
    } else {
      Alert.alert("Nur JPG und PNG unterstützt");
      return;
    }

    const code = jsQR(rgba, width, height);

    if (code) {
      processUrl(code.data); // 👈 direkt deine URL-Verarbeitung
    } else {
      Alert.alert("Kein QR-Code erkannt");
    }
  } catch (e) {
    console.error(e);
    Alert.alert("Fehler beim Verarbeiten des Bildes");
  }
};

  return (
      <View style={styles.container}>
          {isFocused && mode === 'camera' && (
            <QRScanner
              handleCodeScan={(url) => processUrl(url)}
              error={qrCodeScanError}
              enableCameraOnError
              onChangeText={setUrl}
              textInputSubmit={() => processUrl(urlInput)}
            />
          )}

          {isFocused && mode !== 'camera' && (
            <View style={styles.container}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button title="Bild aus Galerie wählen" onPress={pickImageAndScan} />
              </View>
            </View>
          )}
        </View>
    );
};

export default Scan;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    flex: 1,
  },
});
