export async function receiveMessageAgent(url: string) {
  return fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(response => {
    return response.json();
  });
}
export default { receiveMessageAgent };
