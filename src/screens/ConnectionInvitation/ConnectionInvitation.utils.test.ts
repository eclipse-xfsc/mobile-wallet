import * as Utils from './ConnectionInvitation.utils';

describe('ConnectionInvitation.utils', () => {
  describe('getInvitationFromUrl', () => {
    it('we have to get invitation url', async () => {
      const getInvitationUrl = {
        data: {
          uri: 'uri',
          autoAcceptConnection: true,
        },
      };

      // Mocked getInvitationFromUrl
      jest
        .spyOn(Utils, 'getInvitationFromUrl')
        .mockResolvedValueOnce(getInvitationUrl);

      const response = await Utils.getInvitationFromUrl('email', 'otpId');

      expect(Utils.getInvitationFromUrl).toHaveBeenCalledWith('email', 'otpId');
      expect(response).toStrictEqual(getInvitationUrl);
    });
  });
});
