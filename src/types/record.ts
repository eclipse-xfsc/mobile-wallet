export interface RecordHistory {
  timestamp: string;
  connectionLabel: string;
  status: string;
  attributes: Record<string, string>;
}

export interface CredentialDisplay {
  key: string;
  names: string[];
  values: string[];
  credentials: CredentialList[];
}

export interface CredentialList {
  isSelected: boolean;
  label: string;
  value: string;
}
