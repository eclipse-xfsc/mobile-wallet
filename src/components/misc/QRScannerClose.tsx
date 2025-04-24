import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ColorPallet } from '../../theme/theme';

interface Props {
  onPress?: () => void;
}

const CloseButton: React.FC<Props> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="closeButton"
        style={styles.button}
        onPress={onPress}
      >
        <Icon name="close" size={24} color={ColorPallet.baseColors.white} />
      </TouchableOpacity>
    </View>
  );
};

const QRScannerClose: React.FC<Props> = ({ onPress }) => {
  return <CloseButton onPress={onPress} />;
};

export default QRScannerClose;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  button: {
    padding: 0,
  },
});
