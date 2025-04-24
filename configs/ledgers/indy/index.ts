import { IndyVdrPoolConfig } from '@credo-ts/indy-vdr';
import BCovrinTest from './bcovrin-test/pool-config';
import IDunionTest from './idunion-test/pool-config';

export const indyVdrLedgers: [IndyVdrPoolConfig, ...IndyVdrPoolConfig[]] = [
  IDunionTest,
  BCovrinTest,
];
