import * as Utils from './ProofRequest.utils';

describe('ProofRequest.utils', () => {
  describe('getRetrievedCredential', () => {
    it('should we get retrieved credential for proof', () => {
      jest.spyOn(Utils, 'getRetrievedCredential');

      Utils.getRetrievedCredential('credential');

      expect(Utils.getRetrievedCredential).toHaveBeenCalled();
    });
  });
});
