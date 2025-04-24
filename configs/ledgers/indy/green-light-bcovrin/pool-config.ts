import {IndyVdrPoolConfig} from '@credo-ts/indy-vdr';

import genesisFile from './genesis-file';

const config: IndyVdrPoolConfig = {
  indyNamespace: 'BCovrinTest',
  genesisTransactions: genesisFile,
  isProduction: false,
  connectOnStartup: true,
};

export default config;
