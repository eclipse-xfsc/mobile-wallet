import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Images from '../../assets';

import { ColorPallet, TextTheme } from '../../theme/theme';

interface Props {
  title: string;
  accessibilityLabel?: string;
  checked: boolean;
  onPress: () => void;
}

const CheckBoxRow: React.FC<Props> = ({
  title,
  accessibilityLabel,
  checked,
  onPress,
}) => {
  const accessible = !!(accessibilityLabel && accessibilityLabel !== '');

  return (
    <View style={styles.container} testID="checkBoxRowView">
      <TouchableOpacity
        style={styles.container}
        testID="checkBoxRow"
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
      >
        {checked ? (
          <Image source={Images.termsAcceptedIcon} style={styles.bottomIcon} />
        ) : (
          <Icon
            name="check-box-outline-blank"
            size={36}
            color={ColorPallet.brand.secondary}
          />
        )}
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckBoxRow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  text: {
    flexShrink: 1,
    ...TextTheme.normal,
    marginLeft: 10,
    color: ColorPallet.baseColors.black,
  },
  bottomIcon: {
    width: 60,
    height: 60,
  },
});
