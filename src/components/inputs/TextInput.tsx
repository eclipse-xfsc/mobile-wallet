import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
} from 'react-native';

import { ColorPallet, TextTheme, borderRadius } from '../../theme/theme';

interface Props extends TextInputProps {
  label: string;
}

const TextInput: React.FC<Props> = ({ label, ...textInputProps }) => {
  const [focused, setFocused] = useState(false);
  const ref = useRef<RNTextInput>(null);

  useEffect(() => {
    if (focused) {
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus();
        }
      }, 40);
    }
  }, [focused]);

  const focusInput = () => setFocused(true);

  return (
    <View style={styles.container}>
      <Text testID="label" style={styles.label}>
        {label}
      </Text>
      <RNTextInput
        ref={ref}
        style={[
          styles.textInput,
          focused && { borderColor: ColorPallet.brand.primary },
        ]}
        selectionColor={ColorPallet.brand.primary}
        onFocus={focusInput}
        onBlur={focusInput}
        {...textInputProps}
      />
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    ...TextTheme.label,
    marginBottom: 3,
  },
  textInput: {
    padding: 10,
    borderRadius,
    fontSize: 16,
    backgroundColor: ColorPallet.grayscale.white,
    color: ColorPallet.brand.primary,
    borderWidth: 2,
    borderColor: ColorPallet.brand.primary,
  },
});
