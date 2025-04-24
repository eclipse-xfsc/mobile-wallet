import React from 'react';
import { Text as T, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { ColorPallet } from '../../theme/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

const Text: React.FC<Props> = ({ children, style }) => {
  return (
    <T style={[styles.text, style]} testID="Text" accessibilityLabel="Text">
      {children}
    </T>
  );
};

export default Text;

const styles = StyleSheet.create({
  text: {
    color: ColorPallet.brand.primary,
  },
});
