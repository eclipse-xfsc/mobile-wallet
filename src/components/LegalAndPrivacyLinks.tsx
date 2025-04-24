import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, View, Text, Linking } from 'react-native';
import { ColorPallet, TextTheme } from '../theme/theme';

const LegalAndPrivacyLinks = () => {
  const { t } = useTranslation();
  const openLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };
  return (
    <View>
      <View style={styles.acceptTerms}>
        <Text style={styles.termsText}>
          <Trans
            i18nKey="Terms.AcceptTerms"
            components={{
              apachelink: (
                <Text
                  onPress={() => openLink('https://gitlab.eclipse.org/eclipse/xfsc/pcm/app/-/blob/main/LICENSE')}
                  style={styles.linkText}
                />
              ),
              privacylink: (
                <Text
                  onPress={() => openLink('https://gitlab.eclipse.org/eclipse/xfsc/pcm/app/-/blob/main/GDPR.md')}
                  style={styles.linkText}
                />
              ),
            }}
          />
        </Text>
      </View>
      <View style={styles.acceptTermsContinue}>
        <Text style={styles.termsText}>
          {t<string>('Terms.AcceptTermsContinue')}
        </Text>
      </View>
    </View>
  );
};

export default LegalAndPrivacyLinks;

const styles = StyleSheet.create({
  acceptTerms: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  acceptTermsContinue: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  termsText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    textAlign: 'justify',
  },
  link: {
    marginVertical: 14,
    padding: 20,
    alignItems: 'center',
  },
  linkText: {
    ...TextTheme.normal,
    fontWeight: 'bold',
    color: ColorPallet.brand.primary,
    textDecorationLine: 'underline',
  },
});
