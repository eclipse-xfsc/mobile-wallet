import * as Utils from './PinCreate.utils';

describe('PinCreate.utils', () => {
  describe('storeOnboardingCompleteStage', () => {
    it('should store a value for onboarding complete stage', async () => {
      jest.spyOn(Utils, 'storeOnboardingCompleteStage');

      await Utils.storeOnboardingCompleteStage();

      expect(Utils.storeOnboardingCompleteStage).toHaveBeenCalled();
    });
  });
});
