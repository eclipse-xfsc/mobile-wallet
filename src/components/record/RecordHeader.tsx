import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorPallet } from '../../theme/theme';

const RecordHeader: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <View style={styles.container} testID="recordHeader">
      {children}
    </View>
  );
};

export default RecordHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.grayscale.white,
  },
});
