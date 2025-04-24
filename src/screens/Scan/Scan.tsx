import { useAgent } from '@credo-ts/react-hooks';
import { useIsFocused } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import QRScanner from '../../components/inputs/QRScanner';
import { ColorPallet } from '../../theme/theme';
import QrCodeScanError from '../../types/error';
import { ScanStackParams, Screens, TabStacks } from '../../types/navigators';
import { warningToast } from '../../utils/toast';

interface ScanProps {
  navigation: StackNavigationProp<ScanStackParams, Screens.Scan>;
}

async function fetchWithRedirect(url: string): Promise<string> {
  const response = await fetch(url, {
    redirect: 'manual',
  });

  if (response.status === 302 || response.status === 404) {
    return response.url;
  } else {
    return url;
  }
}

export async function CheckLinkType(url: string,navigation:StackNavigationProp<ScanStackParams, Screens.Scan>): Promise<string> {
  console.log("Procees Deep Link:"+url)
  if (url.startsWith('openid-credential-offer')) {
    console.log("Process openid4vc coffering!")
    navigation.navigate(Screens.CredentialOfferOid4VC,{url});
    return ""
  }

  if (url.startsWith('openid4vp')) {
      return ""
  }

  if (url.startsWith('otpauth://hotp')) {
    console.log("HOTP not supported")
    return ""
  }

  if (url.startsWith('otpauth://totp/')) {
    console.log("Process TOTP!")
    navigation.navigate(Screens.OTPGenerator, { url });
    return "";
  } else {
    console.log("Process URL!")
    return url
  }
}

const Scan: React.FC<ScanProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { agent } = useAgent();
  const isFocused = useIsFocused();

  const [qrCodeScanError, setQrCodeScanError] =
    useState<QrCodeScanError | null>(null);
  const [urlInput, setUrl] = useState('');

  const processUrl = async (url: string) => {
    setQrCodeScanError(null);
    if (url === '') {
      // TODO No translation
      return warningToast(t<string>('QRScanner.NotBlankURL'));
    }

    // OTP scan: otpauth://totp/react-keycloak:test_otp?secret=NNTUIQRXMNAVE5TUK43UKU3IKJRECVSI&digits=6&algorithm=SHA1&issuer=react-keycloak&period=30
    const link = await CheckLinkType(url,navigation)
    if (link != "") {
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
      const error = new QrCodeScanError('QRScanner.InvalidQrCode', url);
      setQrCodeScanError(error);
    }}
  };

  return (
    <View style={[styles.container]}>
      {isFocused && (
        <QRScanner
          handleCodeScan={(url) => processUrl(url)}
          error={qrCodeScanError}
          enableCameraOnError
          onChangeText={setUrl}
          textInputSubmit={() => processUrl(urlInput)}
        />
      )}
    </View>
  );
};

export default Scan;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
  },
});
