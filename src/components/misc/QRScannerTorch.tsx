import React, { ReactNode } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ColorPallet } from '../../theme/theme';

type Props = {
  active: boolean;
  onPress: () => void;
  children?: ReactNode;
};

const TorchButton: React.FC<Props> = ({ active, onPress, children }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: active ? ColorPallet.baseColors.white : undefined },
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

const TorchIcon: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <Icon
      name={active ? 'flash-on' : 'flash-off'}
      color={
        active ? ColorPallet.baseColors.black : ColorPallet.baseColors.white
      }
      size={24}
      style={styles.icon}
    />
  );
};

const QRScannerTorch: React.FC<Props> = ({ active, onPress }) => {
  return (
    <TorchButton active={active} onPress={onPress}>
      <TorchIcon active={active} />
    </TorchButton>
  );
};

export default QRScannerTorch;

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: ColorPallet.baseColors.white,
    borderRadius: 24,
  },
  icon: {
    marginLeft: 2,
    marginTop: 2,
  },
});
