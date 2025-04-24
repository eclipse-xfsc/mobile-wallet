import * as Utils from './Terms.utils';

describe('Terms.utils', () => {
  describe('storeTermsCompleteStage', () => {
    it('should store a value for the app terms stage', async () => {
      // Mocked function to storeTermsCompleteStage
      jest.spyOn(Utils, 'storeTermsCompleteStage');

      await Utils.storeTermsCompleteStage();

      expect(Utils.storeTermsCompleteStage).toHaveBeenCalled();
    });
  });
});
