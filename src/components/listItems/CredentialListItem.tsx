import { CredentialExchangeRecord } from '@credo-ts/core';
import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Pressable } from 'react-native';
import CredentialCard from '../misc/CredentialCard';
import { CredentialStackParams, Screens } from '../../types/navigators';
import DetailedCredentialCard from '../misc/DetailedCredentialCard';

interface CredentialListItemProps {
  credential: CredentialExchangeRecord;
}

const CredentialListItem: React.FC<CredentialListItemProps> = ({
  credential,
}) => {
  const navigation =
    useNavigation<StackNavigationProp<CredentialStackParams>>();

  return (
    <Pressable
      testID="credential-list-item"
      onPress={() =>
        navigation.navigate(Screens.CredentialDetails, {
          credentialId: credential.id,
        })
      }
    >
      {credential.credentialAttributes ? (
        <DetailedCredentialCard credential={credential} />
      ): (
        <CredentialCard credential={credential} />
      )}
    </Pressable>
  );
};

export default CredentialListItem;
