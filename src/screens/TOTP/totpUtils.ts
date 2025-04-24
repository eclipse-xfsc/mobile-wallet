import { useCallback, useEffect, useRef, useState } from 'react';
import Keychain from 'react-native-keychain';
import { TOTP } from 'totp-generator';
// TOTP: otpauth://totp/react-keycloak:test_otp?secret=NNTUIQRXMNAVE5TUK43UKU3IKJRECVSI&digits=6&algorithm=SHA1&issuer=react-keycloak&period=30

type ParametersOfGenerate = Parameters<typeof TOTP.generate>;

type TOTPAlgorithm = NonNullable<
  NonNullable<ParametersOfGenerate[1]>['algorithm']
>;

export type OTPItem = {
  label: string;
  issuer: string;
  digits: number;
  period: number;
  secret: string;
  algorithm: TOTPAlgorithm;
};

function transformAlgoString(inputString: string) {
  console.log("New OTP Link is:")
  console.log(inputString)
  return inputString.replace(/(SHA)(\d+)/g, '$1-$2') as TOTPAlgorithm;
}

const parseOtpUrl = (otpUrl: string): OTPItem => {
  const regexPattern =
    /otpauth:\/\/totp\/([^?]+)\?(?:.*?issuer=([^&]+).*?)?(?:.*?secret=([^&]+).*?)?(?:.*?digits=([^&]+).*?)?(?:.*?period=([^&]+).*?)?(?:.*?algorithm=([^&]+).*?)?/;
  console.log("Try to parse TOTP URL: "+otpUrl)

  const matches = otpUrl.match(regexPattern);

  if (matches) {
    const [, label, issuer, secret, digits, period, algorithm] = matches;

    if (algorithm == undefined) {
      throw new Error("Invalid OTP URL. Algorithm is missing")
    }

    return {
      label,
      issuer,
      secret,
      digits: parseInt(digits),
      period: parseInt(period),
      algorithm: transformAlgoString(algorithm),
    };
  }

  throw new Error('Invalid OTP URL');
};

class SecureStorage<T> {
  serviceKey: string;

  private userStorageKey: string = 'PCMApp';
  constructor(serviceKey: string) {
    this.serviceKey = serviceKey;
  }
  async get(): Promise<T | undefined> {
    return Keychain.getGenericPassword({ service: this.serviceKey }).then(
      (creds) =>
        creds && creds.username === this.userStorageKey
          ? JSON.parse(creds.password)
          : undefined,
    );
  }

  async set(value: T) {
    return Keychain.setGenericPassword(
      this.userStorageKey,
      JSON.stringify(value),
      {
        service: this.serviceKey,
      },
    );
  }
}

class OTPManager {
  private listStorageKey: string = 'otpList';

  private listStorage: SecureStorage<OTPItem[]>;

  keychainUser: string = 'PCMApp';
  constructor() {
    this.listStorage = new SecureStorage<OTPItem[]>(this.listStorageKey);
  }

  async getOtpList() {
    return this.listStorage.get();
  }

  async addOtpItem(item: OTPItem) {
    const list = (await this.getOtpList()) || [];
    console.log("Added Label: "+item.label)
    if (list.some((i) => i.label === item.label)) {
      // replace
      const newList = list.map((i) => (i.label === item.label ? item : i));
      await this.listStorage.set(newList);
      return newList;
    }
    await this.listStorage.set([...list, item]);
    return list;
  }

  async removeOtpItem(label: string) {
    console.log("Removed Label: "+label)
    const list = (await this.getOtpList()) || [];
    const newList = list.filter((item) => item.label !== label);
    await this.listStorage.set(newList);
    return newList;
  }
}

export const useGetOtpList = () => {
  const [otpList, setOtpList] = useState<OTPItem[]>([]);

  const [otpManager] = useState(new OTPManager());

  useEffect(() => {
    otpManager.getOtpList().then((list) => {
      if (list) setOtpList(list);
    });
  }, []);

  const addOtpItem = useCallback(
    (itemUrl: string) => {
      const item = parseOtpUrl(itemUrl);

      otpManager.addOtpItem(item).then((newlist) => {
        setOtpList(newlist);
      });
    },
    [otpList],
  );

  const removeOtpItem = useCallback(
    (label: string) => {
      otpManager.removeOtpItem(label).then((newList) => {
        setOtpList(newList);
      });
    },
    [otpList],
  );

  return {
    otpList,
    addOtpItem,
    removeOtpItem,
  };
};

export const useOtpGenerator = (OTPItem: OTPItem) => {
  const { label, secret, digits, issuer, period, algorithm } = OTPItem;

  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const [otp, setOtp] = useState(
    TOTP.generate(secret, {
      digits,
      algorithm,
      period: period,
      timestamp: Date.now(),
    }),
  );
  const [timeInfo, setTimeInfo] = useState({
    progress: 0,
    remainingTime: 0,
  });

  const generateNewCode = useCallback(() => {
    const OTP = TOTP.generate(secret, {
      digits,
      algorithm,
      period: period,
      timestamp: Date.now(),
    });
    setOtp(OTP);
  }, [OTPItem]);

  const getRemainingTime = useCallback(() => {
    return Math.floor(
      period + (period - (new Date().getTime() % (period * 1000))) / 1000,
    );
  }, [OTPItem]);

  const startTimer = useCallback(() => {
    timerInterval.current = setInterval(() => {
      let remainingTime = getRemainingTime();
      generateNewCode();

      let progress = 100 - (100 * remainingTime) / period;
      setTimeInfo({ progress, remainingTime });
    }, 1000);
  }, [OTPItem]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return {
    label,
    issuer,
    otp,
    timeInfo,
  };
};
