import express, { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

import {
  resetPasswordEmail,
  resetPasswordVerify,
  setCookieForUser,
  userDetails,
  userLogin,
  userRegister,
  verifyUser,
} from "../../controllers/User";
// import { ObjectId } from "mongoose";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import passport, { session } from "passport";
import { SomeThingWentWrongError } from "../../errors/something-went-wrong";
import { createToken } from "../../utils/jwt";
import { CustomError } from "../../errors/custom-error";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Session } from "inspector";
import User from "../../models/User";
import { DecodedToken } from "../../types";
import { UnAuthorizedError } from "../../errors/unAuthorized";
import mongoose from "mongoose";
import { parse } from "path";

// Google OAuth 2.0 stratejisini kullanarak Passport konfigürasyonu
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "129555816996-djdki4b02q43jck11s3b9le03k7sn118.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/api/auth/google/callback",
    },
    async function (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) {
      try {
        const queryUser = await User.findOne({ email: profile?._json.email });
        if (!queryUser) {
          const user = new User({
            name: profile.displayName,
            email: profile?._json.email,
            isActive: true,
            accountType: "google",
          });
          user.save();
          profile.id = user._id;
          profile.displayName = user.name;
        } else {
          profile.id = queryUser._id;
          profile.displayName = queryUser.name;
        }

        done(null, profile, accessToken);
      } catch (error) {
        console.log(error);
      }
      // Burada kullanıcı profili ile ne yapmak istiyorsanız onu gerçekleştirebilirsiniz.
      // Örneğin, kullanıcı veritabanına kaydedilebilir.
    }
  )
);
// const CLIENT_URL = "http://localhost:3001";
const router = express.Router();
// @POST /sign-up
// @PUBLIC
// @Register
router.post(
  "/sign-up",
  body("user.name")
    .isLength({ min: 3, max: 20 })
    .withMessage("Name must be between 3 and 20 characters"),
  body("user.email").isEmail().withMessage("Email must be valid"),
  body("user.password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 4 and 20 characters"),
  userRegister
);
router.get("/user/details", userDetails);

router.get(
  "/login/succes",
  (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      // @ts-ignore
      const token = createToken(req.user?.id as string);
      let minute = 60 * 1000;
      // res.cookie("token", token, {
      //   // sameSite: "none",
      //   secure: false,
      //   path: "/",
      //   // domain: "http://localhost:3000",
      //   httpOnly: false,
      //   maxAge: 900000000,
      // });
      res.writeHead(200, {
        // @ts-ignore
        "Set-Cookie": `test=${createToken(req.user.id)}`,
      });
    } else {
      next(
        new SomeThingWentWrongError([
          {
            statusCode: 401,
            reason: "Something went wrong",
          },
        ])
      );
    }
  }
);

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     successRedirect: CLIENT_URL,
//     failureRedirect: "/login/failed",

//   })
// );

const CLIENT_URL = "http://localhost:3001/";

router.get("/user-details-google", (req: Request, res: Response) => {
  let minute = 60 * 1000;
  // console.log(req.user, "user");
  // res.cookie("cookie_name", "cookie_value", { maxAge: minute });
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: req.user,
      // cookies: req.cookies,
    });
  } else {
    throw new SomeThingWentWrongError([
      { statusCode: 401, reason: "User not found" },
    ]);
  }
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/api/auth/setCookie",
    failureRedirect: "/login/failed",
  })
);

router.get("/setCookie", (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      // @ts-ignore
      const token = createToken(req.user?.id);
      // @ts-ignore
      console.log(token, req.user.id);
      res.cookie("auth", token, {
        // sameSite: "none",
        secure: false,
        path: "/",
        // domain: "http://localhost:3000",
        httpOnly: false,
        maxAge: 900000000,
      });
      res.redirect("http://localhost:3001/login/success");
    }
  } catch (error) {
    throw new UnAuthorizedError([
      {
        statusCode: 401,
        reason: "Something went wrong while logging in please try again",
      },
    ]);
  }
  // res.cookie("token-node-js", token, { maxAge: minute });
});
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @POST /sign-in
// @PUBLIC
// @LOGIN
router.post(
  "/sign-in",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  userLogin
);
// @POST /users/:id/verify/:token
// @PRIVATE
// @VERIFY USER
router.post("/users/:id/verify/:token", verifyUser);

// @POST /reset-password
// @PUBLIC
// @SEND USER TO RESET PASSWORD MAIL
router.post(
  "/reset-password",
  [body("email").isEmail().withMessage("Email must be valid")],
  resetPasswordEmail
);
router.post(
  "/reset-password/:id/:token",
  [
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  resetPasswordVerify
);

export default router;
