import * as Utils from './ImportWallet.utils';

describe('ImportWallet.utils', () => {
  describe('storeOnboardingCompleteStage', () => {
    it('should store a value for onboarding complete stage', async () => {
      jest.spyOn(Utils, 'storeOnboardingCompleteStage');

      await Utils.storeOnboardingCompleteStage();

      expect(Utils.storeOnboardingCompleteStage).toHaveBeenCalled();
    });
  });

  describe('createMD5HashFromString', () => {
    it.each([
      ['kevin@gmail.com1234566', '31a8cc6fdfd91bd25e777cd928cca890'],
      [
        'kevin.durant@gmail.comThisisateststring',
        '01b8b1108447e196002c12f27c2388b6',
      ],
    ])(
      'should return a hash value for the given string',
      (initialValue, expectedValue) => {
        const result = Utils.createMD5HashFromString(initialValue);
        expect(result).toEqual(expectedValue);
      },
    );
  });
});
