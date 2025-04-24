import { CredentialPreviewAttributeOptions } from '@credo-ts/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TextTheme, ColorPallet } from '../../theme/theme';

import RecordAttribute from './RecordAttribute';
import RecordFooter from './RecordFooter';
import RecordHeader from './RecordHeader';

interface RecordProps {
  header: () => React.ReactElement | null;
  footer: () => React.ReactElement | null;
  attributes?: CredentialPreviewAttributeOptions[];
  hideAttributeValues?: boolean;
  attribute?: (
    attribute: CredentialPreviewAttributeOptions,
  ) => React.ReactElement | null;
}

const Record: React.FC<RecordProps> = ({
  header,
  footer,
  attributes = [],
  hideAttributeValues = false,
  attribute = null,
}) => {
  const { t } = useTranslation();

  return (
    <FlatList
      testID="flat-list"
      ListHeaderComponent={
        <RecordHeader>
          {header()}
          {hideAttributeValues ? (
            <View style={styles.linkContainer}>
              <TouchableOpacity
                testID="HideAll"
                style={styles.link}
                activeOpacity={1}
                accessible
                accessibilityLabel={t<string>('Record.HideAll')}
              >
                <Text
                  style={[TextTheme.normal, { color: ColorPallet.brand.link }]}
                >
                  {t<string>('Record.HideAll')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </RecordHeader>
      }
      ListFooterComponent={<RecordFooter>{footer()}</RecordFooter>}
      data={attributes}
      keyExtractor={({ name }) => name}
      renderItem={({ item: attr, index }) =>
        attribute ? (
          attribute(attr)
        ) : (
          <RecordAttribute key={index.toString()} attribute={attr} />
        )
      }
    />
  );
};

export default Record;

const styles = StyleSheet.create({
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 25,
    paddingVertical: 16,
    background: ColorPallet.grayscale.white,
  },
  link: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 2,
    color: ColorPallet.brand.link,
    background: ColorPallet.grayscale.white,
  },
});
