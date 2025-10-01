import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { borderRadius, ColorPallet, TextTheme } from '../../theme/theme';
import Text from '../text/Text';

interface Props {
  title: string;
  onPress: () => void;
}

const SettingListItem: React.FC<Props> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      testID="setting-list-item"
      style={styles.container}
      onPress={onPress}
    >
      <Text style={styles.bodyText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default SettingListItem;

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius * 2,
    backgroundColor: ColorPallet.baseColors.lightBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
    marginBottom: 10,
    minHeight: 35
  },
  bodyText: {
    ...TextTheme.label,
    flexShrink: 1,
  },
});
