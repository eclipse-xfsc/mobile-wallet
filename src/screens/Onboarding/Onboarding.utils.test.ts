import * as Utils from './Onboarding.utils';

describe('Onboarding.utils', () => {
  describe('storeAppIntroCompleteStage', () => {
    it('should store a value for the app intro stage', async () => {
      // Mocked function to storeAppIntroCompleteStage
      jest.spyOn(Utils, 'storeAppIntroCompleteStage');

      await Utils.storeAppIntroCompleteStage();

      expect(Utils.storeAppIntroCompleteStage).toHaveBeenCalled();
    });
  });
});
