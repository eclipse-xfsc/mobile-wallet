// configs/features.ts
import { MediatorPickupStrategy } from '@credo-ts/core'

export type FeatureConfig = {
  indy?: {
    enabled: boolean
    askar?: boolean
    anoncreds?: boolean
    indyVdr?: boolean
    mediatorUrl?: string
    mediatorPickupStrategy?: MediatorPickupStrategy
  }
  oid4vc?: {
    holder?: boolean
  }
}

export const features: FeatureConfig = {
  indy: {
    enabled: true,
    askar: true,
    anoncreds: false,
    indyVdr: false,
    mediatorUrl: process.env.MEDIATOR_URL,
    mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
  },
  oid4vc: {
    holder: true,
  },
}
