import { useCallback, useEffect, useRef, useState } from 'react'
import Keychain from 'react-native-keychain'
import * as OTPAuth from 'otpauth'
import { Alert } from 'react-native'

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

// ------------------ Utility Functions ------------------

function transformAlgoString(inputString: string): TOTPAlgorithm {
  const formatted = inputString.replace(/(SHA)(\d+)/g, '$1-$2').toUpperCase()
  if (['SHA-1', 'SHA-256', 'SHA-512'].includes(formatted)) {
    return formatted as TOTPAlgorithm
  }
  return 'SHA-1'
}

function isValidBase32(str?: string): boolean {
  if (!str) return false
  return /^[A-Z2-7]+=*$/i.test(str)
}

// ------------------ URL Parsing ------------------

const parseOtpUrl = (otpUrl: string): OTPItem => {
  if (!otpUrl.startsWith('otpauth://')) {
    throw new Error('Invalid OTP URL scheme')
  }

  try {
    const regex =
      /otpauth:\/\/totp\/([^?]+)\?(?:secret=([^&]+))?&?(?:digits=([^&]+))?&?(?:algorithm=([^&]+))?&?(?:issuer=([^&]+))?&?(?:period=([^&]+))?/
    const matches = otpUrl.match(regex)

    if (!matches) {
      throw new Error('Malformed OTP URL')
    }

    const [, label, secretRaw, digits, algorithm, issuer, period] = matches

    const secret = secretRaw?.trim() || ''
    if (!secret) {
      throw new Error('Missing secret in OTP URL')
    }

    if (!isValidBase32(secret)) {
      console.warn('⚠️ Invalid Base32 secret, attempting to normalize:', secret)
      // Optionally, normalize to uppercase A-Z2-7 only
      // Remove invalid chars
      const normalized = secret.replace(/[^A-Z2-7]/gi, '').toUpperCase()
      if (!normalized || !isValidBase32(normalized)) {
        throw new Error('Invalid or unfixable Base32 secret')
      }
      return {
        label: decodeURIComponent(label || 'Unknown'),
        issuer: decodeURIComponent(issuer || ''),
        secret: normalized,
        digits: parseInt(digits || '6', 10),
        period: parseInt(period || '30', 10),
        algorithm: transformAlgoString(algorithm || 'SHA-1'),
      }
    }

    return {
      label: decodeURIComponent(label || 'Unknown'),
      issuer: decodeURIComponent(issuer || ''),
      secret,
      digits: parseInt(digits || '6', 10),
      period: parseInt(period || '30', 10),
      algorithm: transformAlgoString(algorithm || 'SHA-1'),
    }
  } catch (e) {
    console.error('❌ Failed to parse OTP URL:', e)
    Alert.alert('Ungültiger OTP-Link', (e as Error).message)
    throw e
  }
}

// ------------------ Secure Storage Wrapper ------------------

class SecureStorage<T> {
  private serviceKey: string
  private readonly userStorageKey = 'PCMApp'

  constructor(serviceKey: string) {
    this.serviceKey = serviceKey
  }

  async get(): Promise<T | undefined> {
    try {
      const creds = await Keychain.getGenericPassword({ service: this.serviceKey })
      if (creds && creds.username === this.userStorageKey) {
        return JSON.parse(creds.password)
      }
    } catch (e) {
      console.error(`🔐 Error reading ${this.serviceKey}:`, e)
    }
    return undefined
  }

  async set(value: T) {
    try {
      await Keychain.setGenericPassword(
        this.userStorageKey,
        JSON.stringify(value),
        { service: this.serviceKey }
      )
    } catch (e) {
      console.error(`🔐 Error writing ${this.serviceKey}:`, e)
    }
  }
}

// ------------------ OTP Manager ------------------

class OTPManager {
  private readonly listStorage = new SecureStorage<OTPItem[]>('otpList')

  async getOtpList() {
    return this.listStorage.get()
  }

  async addOtpItem(itemUrl: string) {
    const item = parseOtpUrl(itemUrl)
    const list = (await this.getOtpList()) || []
    const existing = list.find((i) => i.label === item.label)

    const newList = existing
      ? list.map((i) => (i.label === item.label ? item : i))
      : [...list, item]

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
  const managerRef = useRef(new OTPManager())

  useEffect(() => {
    managerRef.current.getOtpList().then((list) => {
      if (list) setOtpList(list)
    })
  }, [])

  const addOtpItem = useCallback(async (itemUrl: string) => {
    try {
      const newList = await managerRef.current.addOtpItem(itemUrl)
      setOtpList(newList)
    } catch (e) {
      console.error('❌ Failed to add OTP item:', e)
    }
  }, [])

  const removeOtpItem = useCallback(async (label: string) => {
    try {
      const newList = await managerRef.current.removeOtpItem(label)
      setOtpList(newList)
    } catch (e) {
      console.error('❌ Failed to remove OTP item:', e)
    }
  }, [])

  return {
    otpList,
    addOtpItem,
    removeOtpItem,
  }
}

export const useOtpGenerator = (otpItem: OTPItem) => {
  const { label, secret, digits, issuer, period, algorithm } = otpItem
  const [otp, setOtp] = useState<string>('------')
  const [timeInfo, setTimeInfo] = useState({ progress: 0, remainingTime: 0 })
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!secret || !isValidBase32(secret)) {
      console.error('❌ Invalid or missing OTP secret for', label)
      Alert.alert('Ungültiges Secret', `Secret für ${label} ist ungültig.`)
      return
    }

    let totp: OTPAuth.TOTP
    try {
      totp = new OTPAuth.TOTP({
        issuer,
        label,
        algorithm,
        digits,
        period,
        secret: OTPAuth.Secret.fromBase32(secret),
      })
    } catch (e) {
      console.error('❌ Fehler beim Erstellen der TOTP-Instanz:', e)
      return
    }

    const updateOtp = () => {
      try {
        const newCode = totp.generate()
        const now = Date.now()
        const counter = Math.floor(now / 1000 / period)
        const next = (counter + 1) * period
        const remaining = next - Math.floor(now / 1000)
        const progress = 100 - (100 * remaining) / period

        setOtp(newCode)
        setTimeInfo({ progress, remainingTime: remaining })
      } catch (e) {
        console.error('⚠️ OTP generation failed:', e)
      }
    }

    updateOtp()
    timerRef.current = setInterval(updateOtp, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [secret, label, issuer, digits, period, algorithm])

  return { label, issuer, otp, timeInfo }
}
