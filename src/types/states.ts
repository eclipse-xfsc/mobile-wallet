import PCMError from './pcm_error';

export interface Onboarding {
  DidCompleteTutorial: boolean;
  DidAgreeToTerms: boolean;
  DidCreatePIN: boolean;
}

export interface Notifications {
  ConnectionPending: boolean;
}

export interface State {
  onboarding: Onboarding;
  notifications: Notifications;
  error: PCMError | null;
}

export interface WalletExportImportConfig {
  key: string;
  path: string;
}
