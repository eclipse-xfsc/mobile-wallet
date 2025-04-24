import { ConnectionRecord } from '@credo-ts/core';

export const searchConnectionList = (
  connectionsList: ConnectionRecord[],
  searchText: string,
) => {
  if (!searchText) {
    return connectionsList;
  }
  const filteredData = connectionsList.filter((item) => {
    if (!item.theirLabel) {
      return false;
    }

    const label = item.theirLabel.toUpperCase();
    const text = searchText.toUpperCase();
    return label.includes(text);
  });
  return filteredData;
};

export default searchConnectionList;
