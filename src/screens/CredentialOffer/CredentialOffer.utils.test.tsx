import * as Utils from './CredentialOffer.utils';

describe('CredentialOffer', () => {
  describe('CredentialOffer.utils', () => {
    describe('acceptcredential', () => {
      it('should we get retrieved credential for proof', () => {
        jest.spyOn(Utils, 'acceptCredential');

        Utils.acceptCredential('credential');

        expect(Utils.acceptCredential).toHaveBeenCalled();
      });
    });
  });
});
