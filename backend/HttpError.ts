export class HttpError extends Error {
  httpStatusCode: number;
  constructor(errorMessage: string, httpStatusCode: number) {
    super(errorMessage);
    this.httpStatusCode = httpStatusCode;
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
