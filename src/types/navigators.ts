import { Agent } from '@credo-ts/core';
import { NavigatorScreenParams } from '@react-navigation/core';

export enum Screens {
  Onboarding = 'Onboarding',
  Terms = 'Terms',
  CreatePin = 'CreatePin',
  Splash = 'Splash',
  EnterPin = 'EnterPin',
  Initialization = 'Initialization',
  Home = 'Home',
  Connect = 'Connect',
  Consent = 'Consent',
  ListContacts = 'ListContacts',
  Scan = 'Scan',
  ChangePin = 'ChangePin',
  Credentials = 'Credentials',
  CredentialDetails = 'Credential Details',
  Settings = 'Settings',
  Notifications = 'Notifications',
  CredentialOffer = 'CredentialOffer',
  CredentialOfferOid4VC = 'CredentialOfferOid4VC',
  ProofRequest = 'ProofRequest',
  Language = 'Language',
  ConnectionInvitation = 'ConnectionInvitation',
  ProofRequestAttributeDetails = 'ProofRequestAttributeDetails',
  ExportWallet = 'ExportWallet',
  ImportWallet = 'ImportWallet',
  LegalAndPrivacy = 'LegalAndPrivacy',
  ContactDetails = 'ConnectionDetails',
  ViewMnemonic = 'ViewMnemonic',
  CreateWallet = 'CreateWallet',
  Biometric = 'Biometric',
  WalletInitialized = 'WalletInitialized',
  SetupDelay = 'SetupDelay',
  OTPGenerator = 'OTPGenerator',
  Presentation = 'Presentation',
  PresentationList = 'PresentationList',
  PresentationRequest="PresentationRequest",
  PresentationDisclosure="PresentationDisclosure",
  PresentationSuccess="PresentationSuccess",
  PresentationCredentialSelection="PresentationCredentialSelection"
}

export type OnboardingStackParams = {
  [Screens.Splash]: undefined;
  [Screens.Onboarding]: undefined;
  [Screens.Terms]: undefined;
  [Screens.Initialization]: undefined;
  [Screens.CreatePin]: undefined;
  [Screens.Biometric]: undefined;
  [Screens.ImportWallet]:
    | {
        setAgent: React.Dispatch<React.SetStateAction<Agent<any> | undefined>>;
        setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
      }
    | undefined;
  [Screens.EnterPin]:
    | {
        setAgent: React.Dispatch<React.SetStateAction<Agent<any> | undefined>>;
        setAuthenticated?: React.Dispatch<React.SetStateAction<boolean>>;
      }
    | undefined;
  [Screens.CreateWallet]:
    | {
        setAgent: React.Dispatch<React.SetStateAction<Agent<any> | undefined>>;
      }
    | undefined;
  [Screens.WalletInitialized]:
    | {
        setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
      }
    | undefined;
  [Screens.SetupDelay]: undefined;
};

export type MainStackParams = {
  [Stacks.TabStack]: undefined;
  [Screens.Home]: undefined;
  [Screens.Scan]: undefined;
  [Screens.ListContacts]: undefined;
  [Screens.ConnectionInvitation]: undefined;
  [Screens.OTPGenerator]: {
    url?: string;
  };
};

export type AuthenticateStackParams = {
  [Screens.EnterPin]: {
    initAgent: (walletPin: string) => void;
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  };
};

export type ContactStackParams = {
  [Screens.ListContacts]: undefined;
  [Screens.ContactDetails]: { connectionId: string };
};

export type CredentialStackParams = {
  [Screens.Credentials]: undefined
  [Screens.CredentialDetails]: {
    credentialId: string
    mode?: 'view' | 'disclosure'
    descId?: string
    isPresentationMode?: boolean
    enableDisclosure?: boolean
  }
  [Screens.CredentialOfferOid4VC]: {
    url: string
  }
  [Screens.Home]: undefined
  [Screens.Presentation]: {
    url?: string
  }
}

export type HomeStackParams = {
  [Screens.Home]: undefined;
  [Screens.Notifications]: undefined;
  [Screens.CredentialOffer]: { credentialId: string };
  [Screens.ProofRequest]: { proofId: string };
  [Screens.ProofRequestAttributeDetails]: {
    proofId: string;
    attributeName: string;
  };
  [Screens.CredentialOfferOid4VC]: {
    url: string;
  };
  [Screens.Presentation]: {
    url?: string;
  };
};

export type ScanStackParams = {
  [Screens.ConnectionInvitation]: {
    connectionRecordId: string;
  };
  [Screens.ListContacts]: undefined;
  [Screens.OTPGenerator]: {
    url?: string;
  };
  [Screens.CredentialOfferOid4VC]: {
    url?: string;
  };
  [Screens.Presentation]: {
    url?: string;
  };
  [Screens.Scan]: { mode?: 'camera' | 'file' } | undefined;
};

export type OtpStackParams = {
  [Screens.OTPGenerator]: {
    url?: string;
  };
};

export interface DisclosureField {
  path: string
  purpose?: string
  value?: any
  disclose: boolean
}


export type PresentationStackParams = {
  [Screens.PresentationList]: undefined
  [Screens.PresentationRequest]: { presentationId?: string }
  [Screens.PresentationCredentialSelection]: { presentationId?: string }
   [Screens.Presentation]: {
    presentationId: string
    selectedCredentials: Record<string, any>
    selectedDisclosures?: Record<string, any>
  }
  [Screens.PresentationDisclosure]: {
    presentationId: string
    disclosureOptions: Record<string, DisclosureField[]>
  }
  [Screens.PresentationSuccess]: {
     presentationId: string 
  }

}



export type SettingStackParams = {
  [Screens.Settings]: undefined;
  [Screens.Language]: undefined;
  [Screens.ChangePin]: undefined;
  [Screens.ExportWallet]: undefined;
  [Screens.ViewMnemonic]: undefined;
  [Screens.LegalAndPrivacy]: undefined;
};

export enum TabStacks {
  HomeStack = 'Tab Home Stack',
  ConnectionStack = 'Tab Connection Stack',
  ScanStack = 'Tab Scan Stack',
  CredentialStack = 'Tab Credential Stack',
  SettingsStack = 'Tab Settings Stack',
  OtpStack = 'Tab Otp Stack',
  PresentationStack="Tab Presentation"
}

export type TabStackParams = {
  [TabStacks.HomeStack]: NavigatorScreenParams<HomeStackParams>;
  [TabStacks.ConnectionStack]: NavigatorScreenParams<ContactStackParams>;
  [TabStacks.ScanStack]: NavigatorScreenParams<ScanStackParams>;
  [TabStacks.CredentialStack]: NavigatorScreenParams<CredentialStackParams>;
  [TabStacks.SettingsStack]: NavigatorScreenParams<SettingStackParams>;
  [TabStacks.OtpStack]: NavigatorScreenParams<ScanStackParams>;
  [TabStacks.PresentationStack]: NavigatorScreenParams<PresentationStackParams>;
};

export enum Stacks {
  TabStack = 'Tab Stack',
  HomeStack = 'Home Stack',
  ConnectStack = 'Connect Stack',
  CredentialStack = 'Credentials Stack',
  ScanStack = 'Scan Stack',
  SettingStack = 'Settings Stack',
  ConnectionStack = 'Connection Stack',
  PresentationStack = 'Presentation Stack',
}
