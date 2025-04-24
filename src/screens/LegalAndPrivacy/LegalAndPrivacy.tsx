import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorPallet } from '../../theme/theme';
import LegalAndPrivacyLinks from '../../components/LegalAndPrivacyLinks';

const LegalAndPrivacy = () => {
  return (
    <View style={styles.container}>
      <LegalAndPrivacyLinks />
    </View>
  );
};

export default LegalAndPrivacy;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
    margin: 20,
    flex: 1,
  },
});
