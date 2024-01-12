import { CustomError } from "./custom-error";

export class UnAuthorizedError extends CustomError {
  statusCode = 401;
  reason: string = "Unathorized request";
  constructor(
    public errors: [
      { statusCode: number | 401; reason: string | "Unathorized request" }
    ]
  ) {
    super();
    // Only because we are extending a built in class
    Object.setPrototypeOf(this, UnAuthorizedError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err: any) => {
      return { message: err.reason };
    });
  }
}
