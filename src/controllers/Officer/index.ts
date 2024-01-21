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
    // console.log(v, "v json");
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
