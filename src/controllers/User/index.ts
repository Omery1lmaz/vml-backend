import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../../models/User/index";
import { SomeThingWentWrongError } from "../../errors/something-went-wrong";

export const signInUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const loggedUser = await User.findOne({ name });
    if (loggedUser) {
      res.status(200).send({
        status_code: 200,
        status: "OK",
        item: loggedUser,
      });
    } else {
      const loggedUser = await User.create({ name });
      res.status(200).send({
        status_code: 200,
        status: "OK",
        item: loggedUser,
      });
    }
  } catch (error) {
    console.error(error);
    next(
      new SomeThingWentWrongError([
        {
          statusCode: 500,
          reason: "User create failed, Please check informations",
        },
      ])
    );
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("get users route");
    const response = await User.find();
    res.status(200).send({
      status_code: 200,
      status: "OK",
      item: response,
    });
  } catch (error) {
    console.error(error);
    next(
      new SomeThingWentWrongError([
        {
          statusCode: 500,
          reason: "User create failed, Please check informations",
        },
      ])
    );
  }
};

export const updateScoreByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { scoree } = req.body;
    const { id } = req.params;
    const response = await User.findByIdAndUpdate(id, { scoree });
    res.status(200).send({
      status_code: 200,
      status: "OK",
      item: response,
    });
  } catch (error) {
    console.error(error);
    next(
      new SomeThingWentWrongError([
        {
          statusCode: 500,
          reason: "User create failed, Please check informations",
        },
      ])
    );
  }
};
