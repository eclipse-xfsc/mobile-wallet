import {
  CredentialExchangeRecord,
  CredentialState,
  ProofRecord,
  ProofState,
} from '@credo-ts/core';
import {
  useAgent,
  useCredentialByState,
  useProofByState,
} from '@credo-ts/react-hooks';
import { useCallback, useEffect, useState } from 'react';

interface Notifications {
  total: number;
  notifications: Array<CredentialExchangeRecord | ProofRecord>;
}

const useNotifications = (): Notifications => {
  const { agent } = useAgent();
  const offers = useCredentialByState(CredentialState.OfferReceived);
  const proofs = useProofByState(ProofState.RequestReceived);
  const [notificationsList, setNotificationsList] = useState<
    Array<CredentialExchangeRecord | ProofRecord>
  >([]);

  const deleteUnwantedRecords = useCallback(async () => {
    // Declining the credential if connection is deleted
    for await (const offer of offers) {
      if (!offer?.connectionId) {
        await agent?.credentials.declineOffer(offer.id);
      }
    }

    // Declining the proof if connection is deleted and message doesn't have ~service decorator
    for await (const proof of proofs) {
      if (!proof?.connectionId && !proof.requestMessage?.service) {
        await agent?.proofs.declineRequest(proof.id);
      }
    }
  }, [agent?.credentials, agent?.proofs, offers, proofs]);

  useEffect(() => {
    deleteUnwantedRecords();
  }, [deleteUnwantedRecords]);

  const notifications = [...offers, ...proofs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationsList(notifications);
    }, 500);

    return () => clearInterval(interval);
  }, [notifications]);

  return {
    total: notificationsList.length,
    notifications: notificationsList ?? [],
  };
};

export default useNotifications;
