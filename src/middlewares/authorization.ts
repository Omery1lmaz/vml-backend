import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnAuthorizedError } from "../errors/unAuthorized";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {};

const googleHandler = (req: Request, res: Response, next: NextFunction) => {
  req.isAuthenticated()
    ? next()
    : next(
        new UnAuthorizedError([
          { reason: "unauthorized request", statusCode: 401 },
        ])
      );
};

const localHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(
      token,
      "process.env.SECRET_KEY",
      async (err, decodedToken) => {}
    );
  }
};
