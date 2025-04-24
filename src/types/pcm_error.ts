class PCMError extends Error {
  public title: string;

  public code: number;

  public constructor(title: string, message: string, code: number) {
    super(message);
    this.title = title;
    this.code = code;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, PCMError.prototype);
  }
}

export default PCMError;
