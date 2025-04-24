import { CredentialExchangeRecord } from '@credo-ts/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Title } from '..';

import { dateFormatOptions } from '../../constants';
import { ContactTheme, TextTheme } from '../../theme/theme';
import AvatarView from './AvatarView';

interface CredentialCardProps {
  credential: CredentialExchangeRecord;
  style?: ViewStyle;
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  style = {},
}) => {
  const { t } = useTranslation();
  const { id, createdAt } = credential;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <AvatarView name={id} />
        <View style={styles.details}>
          <Title>{id}</Title>
          <Text style={[{ ...TextTheme.caption }]}>
            {t<string>('CredentialDetails.Issued')}:{' '}
            {createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CredentialCard;

const styles = StyleSheet.create({
  container: {
    minHeight: 125,
    justifyContent: 'center',
    borderRadius: 15,
    padding: 10,
    overflow: 'hidden',
    backgroundColor: ContactTheme.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: { flexShrink: 1 },
});
