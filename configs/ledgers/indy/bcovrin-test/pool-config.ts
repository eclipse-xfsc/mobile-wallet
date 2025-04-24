import {IndyVdrPoolConfig} from '@credo-ts/indy-vdr';

import genesisFile from './genesis-file';

const config: IndyVdrPoolConfig = {
  indyNamespace: 'bcovrin:test',
  genesisTransactions: genesisFile,
  isProduction: false,
  connectOnStartup: true,
};

export default config;
