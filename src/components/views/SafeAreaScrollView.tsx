import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ColorPallet } from '../../theme/theme';

interface Props {
  children: React.ReactNode;
}

const SafeAreaScrollView: React.FC<Props> = ({ children }) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollView} testID="safeareaview">
      {children}
    </ScrollView>
  );
};

export default SafeAreaScrollView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPallet.grayscale.white,
  },
  scrollView: {
    alignItems: 'center',
  },
});
