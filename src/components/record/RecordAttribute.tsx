import { CredentialPreviewAttributeOptions } from '@credo-ts/core';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorPallet, TextTheme } from '../../theme/theme';

interface RecordAttributeProps {
  attribute: CredentialPreviewAttributeOptions;
  attributeLabel?: (
    attribute: CredentialPreviewAttributeOptions,
  ) => React.ReactElement | null;
  attributeValue?: (
    attribute: CredentialPreviewAttributeOptions,
  ) => React.ReactElement | null;
}

const RecordAttribute: React.FC<RecordAttributeProps> = ({
  attribute,
  attributeLabel = null,
  attributeValue = null,
}) => {
  const startCase = (str: string) =>
    str
      .split(' ')
      .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
      .join(' ');

  return (
    <View style={styles.container}>
      {attributeLabel ? (
        attributeLabel(attribute)
      ) : (
        <Text style={TextTheme.label} testID="AttributeName">
          {startCase(attribute.name)}
        </Text>
      )}
      <View style={styles.valueContainer}>
        {attributeValue ? (
          attributeValue(attribute)
        ) : (
          <View style={styles.valueText}>
            <Text style={styles.text} testID="AttributeValue">
              {attribute.value}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.border} />
    </View>
  );
};

export default RecordAttribute;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingTop: 16,
    backgroundColor: ColorPallet.grayscale.white,
  },
  border: {
    borderBottomColor: ColorPallet.brand.primaryBackground,
    borderBottomWidth: 2,
    paddingTop: 12,
  },
  link: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 2,
    color: ColorPallet.brand.link,
  },
  text: {
    ...TextTheme.normal,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  valueText: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 4,
  },
});
