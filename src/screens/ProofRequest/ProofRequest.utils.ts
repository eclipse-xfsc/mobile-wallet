import { ProofExchangeRecord } from '@credo-ts/core';
import { useCreateAgent } from '../../hooks/useInitAgent';

type AgentType = Awaited<ReturnType<typeof useCreateAgent>>;

export const getRetrievedCredential = async (
  agent: AgentType,
  proof: ProofExchangeRecord,
) => {
  const retrievedCredentials = await agent.proofs.getCredentialsForRequest({
    proofRecordId: proof.id,
  });
  return retrievedCredentials;
};

export default { getRetrievedCredential };
