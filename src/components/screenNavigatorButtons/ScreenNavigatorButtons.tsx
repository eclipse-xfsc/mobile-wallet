import React from 'react';
import { StyleSheet, View } from 'react-native';
import IconButton from '../iconButton/IconButton';

interface IconButtonProps {
  isLeftDisabled?: boolean;
  isRightDisabled?: boolean;
  onLeftPress: () => void;
  onRightPress: () => void;
}

const ScreenNavigatorButtons: React.FC<IconButtonProps> = ({
  isLeftDisabled = false,
  isRightDisabled = false,
  onLeftPress,
  onRightPress,
}) => {
  return (
    <View style={styles.container} testID="ScreenNavigatorButtons">
      <IconButton isDisabled={isLeftDisabled} onPress={onLeftPress} />
      <IconButton isRight isDisabled={isRightDisabled} onPress={onRightPress} />
    </View>
  );
};

export default ScreenNavigatorButtons;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
