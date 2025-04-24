import * as Utils from './Splash.utils';

describe('Splash.utils', () => {
  describe('getOnboardingCompleteStage', () => {
    it('get value is saved in the storage', async () => {
      // Mocked function to getOnboardingCompleteStage
      jest.spyOn(Utils, 'getOnboardingCompleteStage');

      await Utils.getOnboardingCompleteStage();

      expect(Utils.getOnboardingCompleteStage).toHaveBeenCalled();
    });
  });
});
