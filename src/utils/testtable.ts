import { testIdPrefix } from '../constants';

const testIdWithKey = (key: string): string => {
  return `${testIdPrefix}${key}`;
};

export default testIdWithKey;
