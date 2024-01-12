import { CustomError } from "./custom-error";

export class ExistItemError extends CustomError {
  statusCode = 409;
  reason = "item is exist";
  field?: string | undefined;
  constructor([{ reason, field }]: [
    {
      reason: string;
      field?: string | undefined;
    }
  ]) {
    super();
    Object.setPrototypeOf(this, ExistItemError.prototype);
    this.reason = reason;
    this.field = field;
  }

  serializeErrors() {
    return [{ message: this.reason, field: this.field }];
  }
}
