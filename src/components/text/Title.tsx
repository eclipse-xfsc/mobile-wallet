import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { ColorPallet } from '../../theme/theme';

interface Props {
  children?: React.ReactNode;
  style?: TextStyle;
}

const Title: React.FC<Props> = ({ children, style }) => {
  return (
    <Text
      style={[styles.title, style]}
      testID="Title"
      accessibilityLabel="Title"
    >
      {children}
    </Text>
  );
};

export default Title;

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    color: ColorPallet.brand.primary,
  },
});
