import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../../models/User/index";
import { SomeThingWentWrongError } from "../../errors/something-went-wrong";
import sharp from "sharp";
import path from "path";
import Officer from "../../models/Officer";
export const createOfficer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body, "body");
    console.log("akdsnlaksndlasldnasnlkdnas");
    const { officer } = req.body;
    const v = JSON.parse(officer);
    console.log(v, "v json");
    if (req.file) {
      const processedFileName = req.file.originalname.replace(" ", "_");
      await sharp(req.file.buffer)
        .png()
        .toFile(path.join(__dirname, "..", "..", "images", processedFileName));
      const loggedUser = await Officer.create({
        ...v,
        imageURL: processedFileName,
      });
      res.status(200).send({
        status_code: 200,
        status: "OK",
        item: loggedUser,
      });
    } else {
      next(
        new SomeThingWentWrongError([
          {
            statusCode: 404,
            reason: "Officer must have an image",
          },
        ])
      );
    }
  } catch (error) {
    console.error(error);
    next(
      new SomeThingWentWrongError([
        {
          statusCode: 500,
          reason: "Officer create failed, Please check informations",
        },
      ])
    );
  }
};

export const getOfficers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const officers = await Officer.find();
    res.status(200).send({
      status_code: 200,
      status: "OK",
      item: officers,
    });
  } catch (error) {
    console.error(error);
    next(
      new SomeThingWentWrongError([
        {
          statusCode: 500,
          reason: "Officer create failed, Please check informations",
        },
      ])
    );
  }
};

export const deleteOfficer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log(id);
    const officers = await Officer.findByIdAndDelete(id);
    const allOfficers = await Officer.find();
    res.status(200).send({
      status_code: 200,
      status: "OK",
      item: allOfficers,
    });
  } catch (error) {
    console.error(error);
    next(
      new SomeThingWentWrongError([
        {
          statusCode: 500,
          reason: "Officer create failed, Please check informations",
        },
      ])
    );
  }
};

export const getScroressWithLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const scroess = await User.find().sort({ scoree: -1 });
    res.status(200).send({
      status_code: 200,
      status: "OK",
      item: scroess,
    });
  } catch (error) {
    console.error(error);
    next(
      new SomeThingWentWrongError([
        {
          statusCode: 500,
          reason: "Officer create failed, Please check informations",
        },
      ])
    );
  }
};
