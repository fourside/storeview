export class RetryableError extends Error {
  constructor(cause: Error, readonly url: string) {
    super(cause.message, { cause });
  }
}
