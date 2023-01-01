export class RemovedError extends Error {
  constructor() {
    super(`item is removed`);
  }
}
