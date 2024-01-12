import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class SomeThingWentWrongError extends CustomError {
  statusCode = 400;
  reason: string = "Something went wrong";
  constructor(public errors: [{ statusCode: number; reason: string }]) {
    super();
    // Only because we are extending a built in class
    Object.setPrototypeOf(this, SomeThingWentWrongError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err: any) => {
      return { message: err.reason };
    });
  }
}
