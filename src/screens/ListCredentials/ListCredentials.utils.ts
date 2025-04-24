import { CredentialExchangeRecord } from '@credo-ts/core';
import { parsedSchema } from '../../utils/helpers';

const searchCredentialsList = (
  credentialsList: CredentialExchangeRecord[],
  searchText: string,
) => {
  const filteredData = credentialsList.filter(item => {
    const orgLabel = parsedSchema(item).name.toUpperCase();
    const textData = searchText.toUpperCase();
    return orgLabel.indexOf(textData) > -1;
  });
  return filteredData;
};

export default searchCredentialsList;
