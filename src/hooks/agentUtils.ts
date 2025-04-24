import { ConnectionRecord } from '@credo-ts/core';
import { uuid } from '@credo-ts/core/build/utils/uuid';
import { AgentType } from './useInitAgent';

type SelectCredentialsType = Awaited<
  ReturnType<AgentType['proofs']['selectCredentialsForRequest']>
>;

type GetCredentialsType = Awaited<
  ReturnType<AgentType['proofs']['selectCredentialsForRequest']>
>;

export const extractCredentialIds = (credentials: SelectCredentialsType) => {
  const creds =
    credentials.proofFormats.anoncreds || credentials.proofFormats.indy;

  if (!creds) {
    throw new Error('No credentials found');
  }

  return Object.keys(creds.attributes).map(
    (attribute) => creds.attributes[attribute].credentialId,
  );
};

export const extractSelectCredentialAttributeValyues = (
  credentials: SelectCredentialsType,
) => {
  const creds =
    credentials.proofFormats.anoncreds || credentials.proofFormats.indy;

  if (!creds) {
    throw new Error('No credentials found');
  }

  const attributes: Record<string, string> = {};

  Object.keys(creds?.attributes).map((attribute) => {
    attributes[attribute] =
      creds.attributes[attribute].credentialInfo.attributes[attribute];
  });
  return attributes;
};

function removeDuplicates<T>(arr: T[]): T[] {
  return arr.filter((val, index) => arr.indexOf(val) === index);
}

export type CredentialRecord = {
  status: string;
  timestamp: number;
  connectionLabel: string;
  attributes: Record<string, string>;
};

export const logCredentialPresentation = async (
  agent: AgentType,
  creds: SelectCredentialsType,
  connection?: ConnectionRecord,
) => {
  const record: CredentialRecord = {
    status: 'presented',
    timestamp: new Date().getTime(),
    connectionLabel: connection?.theirLabel ?? 'Connection less proof',
    attributes: extractSelectCredentialAttributeValyues(creds),
  };

  const credentialIds = removeDuplicates(extractCredentialIds(creds));

  credentialIds.forEach(async (credentialId) => {
    const tags = {
      credentialRecordId: credentialId,
      connectionId: connection?.id || uuid(),
    };

    const oldRecords = await agent.genericRecords.findAllByQuery({
      credentialRecordId: credentialId,
    });

    // we assume it's only 1 record created per credential
    const firstRecord = oldRecords[0];

    if (firstRecord) {
      const recordContent = firstRecord.content[
        'records'
      ] as CredentialRecord[];

      firstRecord.content['records'] = [...recordContent, record];

      await agent.genericRecords.update(firstRecord);
    } else {
      await agent.genericRecords.save({
        tags,
        content: {
          records: [record],
        },
      });
    }
  });
};
