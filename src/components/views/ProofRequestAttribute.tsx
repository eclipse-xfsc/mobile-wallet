import {
  AnonCredsProofFormatService,
  AnonCredsRequestedAttributeMatch,
  LegacyIndyProofFormatService,
  V1ProofProtocol,
} from '@credo-ts/anoncreds';
import {
  GetCredentialsForProofRequestReturn,
  V2ProofProtocol,
} from '@credo-ts/core';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextTheme } from '../../theme/theme';
import DropDown from '../listItems/DropDown';
import Text from '../text/Text';

interface Props {
  credentials: GetCredentialsType;
  onSelectItem: (credentialId: string) => void;
}

type GetCredentialsType = GetCredentialsForProofRequestReturn<
  (
    | V1ProofProtocol
    | V2ProofProtocol<
        (LegacyIndyProofFormatService | AnonCredsProofFormatService)[]
      >
  )[]
>;

const extractAttributeValues = (
  attributes: Record<string, AnonCredsRequestedAttributeMatch[]>,
) => {
  return Object.entries(attributes).map(([key, value]) => ({
    attributeName: key,
    credentials: value.map((item) => item.credentialInfo),
  }));
};

const getAttributesAndValues = (proofRequest: GetCredentialsType) => {
  if (proofRequest.proofFormats.anoncreds?.attributes) {
    return extractAttributeValues(
      proofRequest.proofFormats.anoncreds.attributes,
    );
  } else if (proofRequest.proofFormats.indy?.attributes) {
    return extractAttributeValues(proofRequest.proofFormats.indy.attributes);
  }
};

const ProofRequestAttribute: React.FC<Props> = ({
  credentials,
  onSelectItem,
}: Props) => {
  const attributeRequests = getAttributesAndValues(credentials);

  return (
    <View testID="proofRequestAttribute">
      {attributeRequests?.map((attribute) => (
        <View key={attribute.attributeName} style={styles.attributeView}>
          {attribute.credentials.map((credential, index: number) => (
            <View key={credential.credentialId} style={styles.credentialView}>
              <Text style={[TextTheme.normal, styles.nameText]}>
                {attribute.attributeName} :{' '}
              </Text>
              <Text style={[TextTheme.normal, styles.valueText]}>
                {credential.attributes[attribute.attributeName]}
              </Text>
            </View>
          ))}
          {attribute.credentials.length <= 1 ? (
            <Text style={styles.credentialName}>
              {attribute.credentials[0].credentialId}
            </Text>
          ) : (
            <View style={styles.dropdownContainer}>
              <DropDown
                items={attribute.credentials.map((item) => ({
                  label: item.credentialId,
                  value: item.credentialId,
                }))}
                onSelectItem={(item) => onSelectItem(item.value as string)}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default ProofRequestAttribute;

const styles = StyleSheet.create({
  attributeView: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  credentialView: {
    flexDirection: 'row',
    width: '100%',
  },
  valueText: {
    flex: 1,
    textAlign: 'right',
  },
  nameText: {
    flex: 1,
    textAlign: 'left',
  },
  credentialName: {
    ...TextTheme.label,
    width: '100%',
    textAlign: 'left',
    marginTop: 8,
  },
  dropdownContainer: { marginTop: 8 },
});
