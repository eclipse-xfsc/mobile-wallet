export const authenticateUser = (inputPass: string, referencePass: string) => {
  return inputPass.trim() === referencePass.trim();
};

export default authenticateUser;
