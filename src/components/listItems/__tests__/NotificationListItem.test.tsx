import {
  CredentialExchangeRecord,
  CredentialState,
  INDY_PROOF_REQUEST_ATTACHMENT_ID,
  ProofRecord,
  ProofState,
  RequestPresentationMessage,
  CredentialPreviewAttribute,
} from '@credo-ts/core';
import {
  Attachment,
  AttachmentData,
} from '@credo-ts/core/build/decorators/attachment/Attachment';
import { useNavigation } from '@react-navigation/core';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import NotificationListItem, {
  NotificationType,
} from '../NotificationListItem';

const credentialRecord = new CredentialExchangeRecord({
  connectionId: '34da4abe-7578-464f-909c-ee19a3bdf7ac',
  threadId: 'threadId',
  state: CredentialState.OfferReceived,
  credentialAttributes: [
    new CredentialPreviewAttribute({
      name: 'age',
      value: '25',
    }),
  ],
  protocolVersion: 'v1',
});

const requestAttachment = new Attachment({
  id: INDY_PROOF_REQUEST_ATTACHMENT_ID,
  mimeType: 'application/json',
  data: new AttachmentData({
    base64:
      'eyJuYW1lIjogIlByb29mIHJlcXVlc3QiLCAibm9uX3Jldm9rZWQiOiB7ImZyb20iOiAxNjQwOTk1MTk5LCAidG8iOiAxNjQwOTk1MTk5fSwgIm5vbmNlIjogIjEiLCAicmVxdWVzdGVkX2F0dHJpYnV0ZXMiOiB7ImFkZGl0aW9uYWxQcm9wMSI6IHsibmFtZSI6ICJmYXZvdXJpdGVEcmluayIsICJub25fcmV2b2tlZCI6IHsiZnJvbSI6IDE2NDA5OTUxOTksICJ0byI6IDE2NDA5OTUxOTl9LCAicmVzdHJpY3Rpb25zIjogW3siY3JlZF9kZWZfaWQiOiAiV2dXeHF6dHJOb29HOTJSWHZ4U1RXdjozOkNMOjIwOnRhZyJ9XX19LCAicmVxdWVzdGVkX3ByZWRpY2F0ZXMiOiB7fSwgInZlcnNpb24iOiAiMS4wIn0=',
  }),
});

const requestMessage = new RequestPresentationMessage({
  comment: 'some comment',
  requestPresentationAttachments: [requestAttachment],
});

const proofRecord = new ProofRecord({
  requestMessage,
  id: 'ID',
  state: ProofState.RequestReceived,
  threadId: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
  connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
});

describe('NotificationListItem', () => {
  const navigation = useNavigation();
  it('should render notification correctly when credential record is passed as prop', () => {
    const { getByText } = render(
      <NotificationListItem
        notification={credentialRecord}
        notificationType={NotificationType.CredentialOffer}
      />,
    );
    const title = getByText('CredentialOffer.CredentialOffer');
    expect(title.props.children).toBe('CredentialOffer.CredentialOffer');

    const button = getByText('Global.View');
    fireEvent.press(button);
    expect(navigation.navigate).toHaveBeenCalledWith('CredentialOffer', {
      credentialId: credentialRecord.id,
    });
  });

  it('should render notification correctly when proof record is passed as prop', () => {
    const { getByText } = render(
      <NotificationListItem
        notification={proofRecord}
        notificationType={NotificationType.ProofRequest}
      />,
    );
    const title = getByText('ProofRequest.ProofRequest');
    expect(title.props.children).toBe('ProofRequest.ProofRequest');

    const button = getByText('Global.View');
    fireEvent.press(button);
    expect(navigation.navigate).toHaveBeenCalledWith('ProofRequest', {
      proofId: proofRecord.id,
    });
  });
});
