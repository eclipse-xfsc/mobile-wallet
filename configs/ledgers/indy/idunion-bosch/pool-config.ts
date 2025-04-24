import {IndyVdrPoolConfig} from '@credo-ts/indy-vdr';

import genesisFile from './genesis-file';

const config: IndyVdrPoolConfig = {
  indyNamespace: 'IDunionBosch',
  genesisTransactions: genesisFile,
  isProduction: false,
  connectOnStartup: true,
};

export default config;
