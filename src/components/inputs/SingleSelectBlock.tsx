import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  borderRadius,
  ColorPallet,
  SingleSelectBlockTheme,
} from '../../theme/theme';
import Text from '../text/Text';

export interface BlockSelection {
  value: string;
  id: string;
}

interface Props {
  selection: BlockSelection[];
  onSelect: (selected: BlockSelection) => void;
  initialSelect?: BlockSelection;
}

const SingleSelectBlock: React.FC<Props> = ({
  selection,
  onSelect,
  initialSelect,
}) => {
  const [selected, setSelected] = useState(initialSelect ?? selection[0]);

  const handleSelect = (selected: BlockSelection) => {
    setSelected(selected);
    onSelect(selected);
  };

  return (
    <View style={styles.container} testID="SingleSelectBlock">
      {selection.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.row}
          onPress={() => handleSelect(item)}
        >
          <Text>{item.value}</Text>
          {item.id === selected.id ? (
            <Icon name="check" size={25} color={ColorPallet.brand.primary} />
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SingleSelectBlock;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  row: {
    borderRadius: borderRadius * 2,
    backgroundColor: SingleSelectBlockTheme.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
  },
});
