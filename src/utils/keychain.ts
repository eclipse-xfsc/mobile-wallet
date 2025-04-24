import Keychain from 'react-native-keychain';
import { KeychainStorageKeys } from '../constants';
import { i18n } from '../localization';

export const setValueKeychain = async (
  username: string,
  password: string,
  service: string,
) => {
  return await Keychain.setGenericPassword(username, password, {
    service,
  });
};

export const getValueKeychain = async (service: any) => {
  const credentials = await Keychain.getGenericPassword({
    service,
  });
  return credentials;
};

export const getPincode = async () => {
  return await Keychain.getGenericPassword({
    service: KeychainStorageKeys.Passcode,
  });
};

export const setPincode = async (pinCode: string) => {
  return await Keychain.setGenericPassword(
    i18n.t<string>('PinCreate.UserAuthenticationPin'),
    pinCode,
    {
      service: KeychainStorageKeys.Passcode,
    },
  );
};

export const getPassphrase = async () => {
  return await Keychain.getGenericPassword({
    service: KeychainStorageKeys.Passphrase,
  });
};

export const setPasshprase = async (passCode: string) => {
  return await Keychain.setGenericPassword(
    i18n.t<string>('Registration.MnemonicMsg'),
    passCode,
    {
      service: KeychainStorageKeys.Passphrase,
    },
  );
};

export const getAppGuid = async () => {
  return await Keychain.getGenericPassword({
    service: KeychainStorageKeys.GUID,
  });
};

export const setAppGuid = async (guid: string) => {
  return await Keychain.setGenericPassword('GUID', guid, {
    service: KeychainStorageKeys.GUID,
  });
};
