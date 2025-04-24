import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { ColorPallet, TextTheme } from '../../theme/theme';
import Images from '../../assets';

export interface TextBoxProps {
  children: string | React.ReactNode;
  showTopIcon?: boolean;
  showBottomIcon?: boolean;
  errorMsg?: string;
  mnemonicText?: boolean;
}

const InfoCard: React.FC<TextBoxProps> = ({
  children,
  showTopIcon = false,
  showBottomIcon = false,
  errorMsg,
  mnemonicText = false,
}) => {
  return (
    <View style={styles.container}>
      {showTopIcon && (
        <View>
          <Image
            source={Images.infoIcon}
            style={{ width: iconSize, height: iconSize }}
          />
        </View>
      )}
      {errorMsg ? (
        <View style={styles.bottomIconContainer}>
          <Text style={styles.headerText}>{errorMsg}</Text>
        </View>
      ) : (
        <Text
          style={mnemonicText ? styles.mnemonicText : styles.headerText}
          testID="InfoCard"
          accessibilityLabel="InfoCard"
        >
          {children}
        </Text>
      )}
      {showBottomIcon && (
        <View style={styles.bottomIconContainer}>
          <Image source={Images.termsIcon} style={styles.bottomIcon} />
        </View>
      )}
    </View>
  );
};

export default InfoCard;

const iconSize = 20;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.veryLightGrey,
    borderRadius: 20,
    padding: 20,
  },
  headerText: {
    ...TextTheme.normal,
    color: ColorPallet.baseColors.black,
    marginTop: 10,
  },
  mnemonicText: {
    ...TextTheme.caption,
    fontWeight: 'bold',
    color: ColorPallet.baseColors.black,
    marginTop: 10,
  },
  bottomIconContainer: {
    alignSelf: 'flex-start',
  },
  bottomIcon: {
    width: 60,
    height: 60,
  },
});
