import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ColorPallet, TextTheme } from '../../theme/theme';
import Images from '../../assets';

export interface TextBoxProps {
  children?: React.ReactNode;
  showIcon?: boolean;
}

const InfoTextBox: React.FC<TextBoxProps> = ({
  children,
  showIcon = false,
}) => {
  return (
    <View style={styles.container}>
      {showIcon && (
        <View style={styles.icon}>
          <Image source={Images.infoIcon} style={styles.infoIcon} />
        </View>
      )}
      <Text
        style={styles.headerText}
        testID="InfoTextBox"
        accessibilityLabel="InfoTextBox"
      >
        {children}
      </Text>
    </View>
  );
};

export default InfoTextBox;

const iconSize = 30;
const offset = 10;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: ColorPallet.grayscale.veryLightGrey,
    borderRadius: 5,
    padding: 10,
  },
  headerText: {
    ...TextTheme.normal,
    color: ColorPallet.baseColors.black,
    flexShrink: 1,
    alignSelf: 'center',
  },
  icon: {
    marginRight: offset,
    alignSelf: 'center',
  },
  infoIcon: {
    width: iconSize,
    height: iconSize,
  },
});
