export const defaultLanguage = 'en';

export const testIdPrefix = 'com.pcm:id/';

export const salt =
  '1234567891011121314151617181920212223242526272829303132333435363';

export enum LocalStorageKeys {
  Language = 'language',
  OnboardingCompleteStage = 'onboardingCompleteStage',
}

export enum KeychainStorageKeys {
  GUID = 'email',
  Passphrase = 'passphrase',
  Passcode = 'passcode',
}

export const dateFormatOptions: {
  year: 'numeric';
  month: 'short';
  day: 'numeric';
} = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};
