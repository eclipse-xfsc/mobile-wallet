import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { ColorPallet } from '../../theme/theme';

interface IconButtonProps {
  isRight?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({
  isRight = false,
  isDisabled = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      testID="IconButton"
      onPress={isDisabled ? undefined : onPress}
      style={isDisabled ? styles.disabledIconContainer : styles.iconContainer}
    >
      {isRight ? (
        <View>
          <Icon
            name="arrowright"
            size={iconSize}
            color={ColorPallet.baseColors.white}
          />
        </View>
      ) : (
        <View>
          <Icon
            name="arrowleft"
            size={iconSize}
            color={ColorPallet.baseColors.white}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default IconButton;

const iconSize = 30;

const styles = StyleSheet.create({
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: ColorPallet.brand.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: ColorPallet.grayscale.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
