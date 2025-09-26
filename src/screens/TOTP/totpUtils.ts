import { useCallback, useEffect, useRef, useState } from 'react'
import Keychain from 'react-native-keychain'
import * as OTPAuth from 'otpauth'

// ------------------ Typen ------------------

export type TOTPAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512'

export type OTPItem = {
  label: string
  issuer: string
  digits: number
  period: number
  secret: string
  algorithm: TOTPAlgorithm
}

// ------------------ Hilfsfunktionen ------------------

function transformAlgoString(inputString: string): TOTPAlgorithm {
  return inputString.replace(/(SHA)(\d+)/g, '$1-$2') as TOTPAlgorithm
}

const parseOtpUrl = (otpUrl: string): OTPItem => {
  const regexPattern =
    /otpauth:\/\/totp\/([^?]+)\?(?:secret=([^&]+)&)?(?:digits=([^&]+)&)?(?:algorithm=([^&]+)&)?(?:issuer=([^&]+)&)?(?:period=([^&]+))?/

  const matches = otpUrl.match(regexPattern)

  if (matches) {
    const [, label, secret, digits, algorithm, issuer, period] = matches
    return {
      label,
      secret,
      digits: parseInt(digits || '6', 10),
      algorithm: transformAlgoString(algorithm || 'SHA1'),
      issuer: issuer || '',
      period: parseInt(period || '30', 10),
    }
  }

  throw new Error('Invalid OTP URL')
}

// ------------------ Secure Storage Wrapper ------------------

class SecureStorage<T> {
  serviceKey: string
  private userStorageKey: string = 'PCMApp'

  constructor(serviceKey: string) {
    this.serviceKey = serviceKey
  }

  async get(): Promise<T | undefined> {
    return Keychain.getGenericPassword({ service: this.serviceKey }).then(
      (creds) =>
        creds && creds.username === this.userStorageKey
          ? JSON.parse(creds.password)
          : undefined
    )
  }

  async set(value: T) {
    return Keychain.setGenericPassword(
      this.userStorageKey,
      JSON.stringify(value),
      {
        service: this.serviceKey,
      }
    )
  }
}

// ------------------ OTP Manager ------------------

class OTPManager {
  private listStorageKey: string = 'otpList'
  private listStorage: SecureStorage<OTPItem[]>
  keychainUser: string = 'PCMApp'

  constructor() {
    this.listStorage = new SecureStorage<OTPItem[]>(this.listStorageKey)
  }

  async getOtpList() {
    return this.listStorage.get()
  }

  async addOtpItem(item: OTPItem) {
    const list = (await this.getOtpList()) || []
    if (list.some((i) => i.label === item.label)) {
      // replace
      const newList = list.map((i) => (i.label === item.label ? item : i))
      await this.listStorage.set(newList)
      return newList
    }
    const newList = [...list, item]
    await this.listStorage.set(newList)
    return newList
  }

  async removeOtpItem(label: string) {
    const list = (await this.getOtpList()) || []
    const newList = list.filter((item) => item.label !== label)
    await this.listStorage.set(newList)
    return newList
  }
}

// ------------------ React Hooks ------------------

export const useGetOtpList = () => {
  const [otpList, setOtpList] = useState<OTPItem[]>([])
  const [otpManager] = useState(new OTPManager())

  useEffect(() => {
    otpManager.getOtpList().then((list) => {
      if (list) setOtpList(list)
    })
  }, [otpManager])

  const addOtpItem = useCallback(
    (itemUrl: string) => {
      const item = parseOtpUrl(itemUrl)
      otpManager.addOtpItem(item).then((newList) => {
        setOtpList(newList)
      })
    },
    [otpManager]
  )

  const removeOtpItem = useCallback(
    (label: string) => {
      otpManager.removeOtpItem(label).then((newList) => {
        setOtpList(newList)
      })
    },
    [otpManager]
  )

  return {
    otpList,
    addOtpItem,
    removeOtpItem,
  }
}

export const useOtpGenerator = (OTPItem: OTPItem) => {
  const { label, secret, digits, issuer, period, algorithm } = OTPItem
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  // TOTP-Instanz erstellen
  const totp = new OTPAuth.TOTP({
    issuer,
    label,
    algorithm,
    digits,
    period,
    secret: OTPAuth.Secret.fromBase32(secret),
  })

  const [otp, setOtp] = useState(totp.generate())
  const [timeInfo, setTimeInfo] = useState({
    progress: 0,
    remainingTime: 0,
  })

  const generateNewCode = useCallback(() => {
    setOtp(totp.generate())
  }, [totp])

  const getRemainingTime = useCallback(() => {
    const now = Date.now()
    const counter = Math.floor(now / 1000 / period)
    const next = (counter + 1) * period
    return next - Math.floor(now / 1000)
  }, [period])

  const startTimer = useCallback(() => {
    timerInterval.current = setInterval(() => {
      const remainingTime = getRemainingTime()
      generateNewCode()
      const progress = 100 - (100 * remainingTime) / period
      setTimeInfo({ progress, remainingTime })
    }, 1000)
  }, [generateNewCode, getRemainingTime, period])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [startTimer])

  return {
    label,
    issuer,
    otp,
    timeInfo,
  }
}
