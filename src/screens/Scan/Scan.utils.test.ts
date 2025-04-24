import * as Utils from './Scan.utils';

describe('Scan.utils', () => {
  test('should return receive message from agent response', () => {
    const testData = { current_user: 'Rahul Raj', name: 'Lafarge' };

    const response = { json: jest.fn().mockResolvedValueOnce(testData) };
    global.fetch = jest.fn().mockResolvedValueOnce(response);

    return Utils.receiveMessageAgent().then(data => {
      expect(data).toEqual(testData);
    });
  });
});
