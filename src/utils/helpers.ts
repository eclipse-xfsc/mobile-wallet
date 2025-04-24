/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-bitwise */
import { AnonCredsCredentialOffer } from '@credo-ts/anoncreds';
import { AnonCredsCredentialDefinitionRecordMetadataKeys } from '@credo-ts/anoncreds/build/repository/anonCredsCredentialDefinitionRecordMetadataTypes';
import { CredentialExchangeRecord } from '@credo-ts/core';
import {
  useConnectionById,
  useCredentialById,
} from '@credo-ts/react-hooks';
import React from 'react';

export const connectionRecordFromId = (connectionId: string) => {
  const connection = useConnectionById(connectionId);
  return connection;
};

export function parseSchema(schemaId?: string): {
  name: string;
  version: string;
} {
  let name = 'Credential';
  let version = '';
  if (schemaId) {
    const schemaIdRegex = /(.*?):([0-9]):([a-zA-Z .\-_0-9]+):([a-z0-9._-]+)$/;
    const schemaIdParts = schemaId.match(schemaIdRegex);
    if (schemaIdParts?.length === 5) {
      name = `${schemaIdParts?.[3].replace(/_|-/g, ' ')}`
        .split(' ')
        .map(
          (schemaIdPart) =>
            schemaIdPart.charAt(0).toUpperCase() + schemaIdPart.substring(1),
        )
        .join(' ');
      version = schemaIdParts?.[4];
    }
  }
  return { name, version };
}

export function parseCredDef(credentialDefinitionId?: string): {
  credName: string;
} {
  let credName = '';
  if (credentialDefinitionId) {
    const credDefIdRegex =
      /^([a-zA-Z0-9]{21,22}):3:CL:(([1-9][0-9]*)|([a-zA-Z0-9]{21,22}:2:.+:[0-9.]+)):(.+)?$/;
    const credDefParts = credentialDefinitionId.match(credDefIdRegex);

    if (credDefParts?.length === 6) {
      credName = `${credDefParts?.[5].replace(/_|-/g, ' ')}`
        .split(' ')
        .map(
          (credDefIdPart) =>
            credDefIdPart.charAt(0).toUpperCase() + credDefIdPart.substring(1),
        )
        .join(' ');
    }
  }
  return { credName };
}

export function credentialSchema(
  credential: CredentialExchangeRecord,
): string | undefined {
  return credential.metadata.get<AnonCredsCredentialOffer>(
    AnonCredsCredentialDefinitionRecordMetadataKeys.CredentialDefinitionMetadata,
  )?.schema_id;
}

export function credentialDefinition(
  credential: CredentialExchangeRecord,
): string | undefined {
  return credential.metadata.get<AnonCredsCredentialOffer>(
    AnonCredsCredentialDefinitionRecordMetadataKeys.CredentialDefinitionMetadata,
  )?.cred_def_id;
}

export function parsedSchema(credential: CredentialExchangeRecord): {
  name: string;
  version: string;
} {
  return parseSchema(credentialSchema(credential));
}

export function parsedCredentialDefinition(
  credential: CredentialExchangeRecord,
): {
  credName: string;
} {
  return parseCredDef(credentialDefinition(credential));
}

export function hashCode(s: string): number {
  return s
    .split('')
    .reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);
}

export function hashToRGBA(i: number) {
  const colour = (i & 0x00ffffff).toString(16).toUpperCase();
  return `#${'00000'.substring(0, 6 - colour.length)}${colour}`;
}

export const credentialRecordFromId = (credentialId: string) => {
  const credential = useCredentialById(credentialId);
  return credential;
};

interface MainStackContextValue {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  deepLinkUrl: string | undefined | null;
  resetDeepLinkUrl: () => void;
}
export const MainStackContext = React.createContext<MainStackContextValue>({
  setAuthenticated: () => {},
  deepLinkUrl: null,
  resetDeepLinkUrl: () => {},
});

export const getCredDefName = (credentialDefinitionId: string) => {
  const data = credentialDefinitionId.split(':');
  return data[data.length - 1];
};

export const getSchemaNameFromSchemaId = (schemaId: string) => {
  const data = schemaId.split(':');
  return data[data.length - 1];
};
