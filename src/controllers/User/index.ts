import { Request, Response, NextFunction } from "express";
import User, { IUser, UserType } from "../../models/User/index";
import { createToken } from "../../utils/jwt";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { RequestValidationError } from "../../errors/request-validation-error";
import { DatabaseConnectionError } from "../../errors/database-connection-error";
import { ExistItemError } from "../../errors/exist-item";
import { SomeThingWentWrongError } from "../../errors/something-went-wrong";
export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, confirmPassword } = req.body.user;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new RequestValidationError(errors.array()));
      return;
    }
    const user = await User.findOne({ email }).catch((err) => {
      next(new DatabaseConnectionError());
    });
    if (user) {
      return next(
        new ExistItemError([
          { reason: "user is already exist", field: "email" },
        ])
      );
    } else {
      try {
        if (password == confirmPassword) {
          const newUser = new User({
            name,
            password,
            email,
            accountType: "email",
          });
          newUser
            .save()
            .then((user) => {
              const token = createToken(user._id);
              const url = `http://localhost:3000/api/auth/users/${newUser._id}/verify/${token}`;
              const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "omery020040@gmail.com",
                  pass: "wgbehbiaqxlthblt",
                },
              });
              transporter
                .sendMail({
                  from: process.env.USER,
                  to: email,
                  subject: "Email Onaylamak",
                  text: url,
                })
                .then(() => {
                  res.status(201).json("Emailinizi onaylayınız");
                })
                .catch((err) => {
                  next(
                    new SomeThingWentWrongError([
                      { reason: "Something went wrong", statusCode: 404 },
                    ])
                  );
                });
            })
            .catch((err: Error) => {
              next(
                new SomeThingWentWrongError([
                  {
                    statusCode: 404,
                    reason: "User create failed, Please check informations",
                  },
                ])
              );
            });
        } else {
          next(
            new SomeThingWentWrongError([
              {
                statusCode: 404,
                reason: "The passwords do not match",
              },
            ])
          );
        }
      } catch (error) {
        next(
          new SomeThingWentWrongError([
            {
              statusCode: 404,
              reason:
                "Something went wrong when user creating. Please check informations",
            },
          ])
        );
      }
    }
  } catch (error) {
    next(
      new SomeThingWentWrongError([
        {
          statusCode: 404,
          reason: "Something went wrong...",
        },
      ])
    );
  }
};

export const userDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        jwt.verify(
          token,
          process.env.SECRET_KEY as string,
          async (err: any, decodedToken: any) => {
            if (!err) {
              const user = await User.findById(decodedToken.id);
              if (user) {
                res.json({
                  _id: user._id,
                  email: user.email,
                  name: user.name,
                });
              } else {
                next(
                  new SomeThingWentWrongError([
                    {
                      reason: "UnAuthorized",
                      statusCode: 401,
                    },
                  ])
                );
              }
            } else {
              next(
                new SomeThingWentWrongError([
                  {
                    reason: "UnAuthorized",
                    statusCode: 401,
                  },
                ])
              );
            }
          }
        );
      } catch (error) {
        next(
          new SomeThingWentWrongError([
            {
              reason: "UnAuthorized",
              statusCode: 401,
            },
          ])
        );
      }
    } else {
      next(
        new SomeThingWentWrongError([
          {
            reason: "UnAuthorized",
            statusCode: 401,
          },
        ])
      );
    }
  } else {
    next(
      new SomeThingWentWrongError([
        {
          reason: "UnAuthorized",
          statusCode: 401,
        },
      ])
    );
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new RequestValidationError(errors.array()));
    return;
  } else {
    const { email, password } = req.body;
    User.findOne({ email }).then(async (user: IUser | null) => {
      if (user && !user.isDeleted) {
        if (user.isActive) {
          if (await user.matchPassword(password)) {
            try {
              const token = createToken(user._id);
              res.cookie("token", token);
              res.status(200);
              res.json({
                _id: user._id,
                email: user.email,
                name: user.name,
                token: token,
              });
            } catch (error) {
              next(
                new SomeThingWentWrongError([
                  { statusCode: 404, reason: "Bir şeyler ters gitti." },
                ])
              );
            }
          } else {
            next(
              new SomeThingWentWrongError([
                { statusCode: 404, reason: "Kullanıcı adı veya parola yanlış" },
              ])
            );
          }
        } else {
          next(
            new SomeThingWentWrongError([
              { statusCode: 404, reason: "Lütfen emailinizi onaylayınız" },
            ])
          );
        }
      } else {
        next(
          new SomeThingWentWrongError([
            { statusCode: 404, reason: "Kullanıcı adı veya parola yanlış" },
          ])
        );
      }
    });
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, token } = req.params;
  try {
    User.findById({ _id: id })
      .then((user) => {
        if (!user) {
          next(
            new SomeThingWentWrongError([
              { reason: "json web token geçersiz", statusCode: 404 },
            ])
          );
        } else if (user.isActive) {
          res.status(201).json({
            isVerify: true,
            message: "Kullanıcı Emaili onaylandı",
          });
        } else {
          jwt.verify(
            token,
            process.env.SECRET_KEY as string,
            async (err: Error | null, decodedToken: any) => {
              if (err) {
                next(
                  new SomeThingWentWrongError([
                    { reason: "json web token geçersiz", statusCode: 404 },
                  ])
                );
              }
              await User.findOneAndUpdate(
                { _id: id },
                { isActive: Boolean(true) }
              );
              res.status(201).send({
                isVerify: true,
                message: "Hesabınız Onaylandı",
              });
            }
          );
        }
      })
      .catch((error) => {
        next(
          new SomeThingWentWrongError([
            {
              reason: "beklenmedik hata oluştu. Lütfen tekrar deneyiniz",
              statusCode: 404,
            },
          ])
        );
      });
  } catch (error) {
    next(
      new SomeThingWentWrongError([
        {
          reason: "beklenmedik hata oluştu. Lütfen tekrar deneyiniz",
          statusCode: 404,
        },
      ])
    );
  }
};

export const setCookieForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.user as any;
  console.log(id, "id");
  console.log("knajkdnkjansnjadnsjndjansjd");
};

// SEND RESEET MAIL
export const resetPasswordEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      next(
        new SomeThingWentWrongError([
          {
            reason: "Kullanıcı bulunamadı veya hesap aktif değil",
            statusCode: 404,
          },
        ])
      );
    } else {
      try {
        const maxAge = 3 * 24 * 60 * 60;

        const jwtBilgileri = {
          id: user._id,
          password: user.password,
        };
        const secret =
          process.env.RESET_PASSWORD_SECRET_KEY + "-" + user.password;
        const token = jwt.sign(jwtBilgileri, secret, {
          expiresIn: maxAge,
        });

        const url = `http://localhost:3000/users/${user._id}/reset-password/${token}`;
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "omery020040@gmail.com",
              pass: "wgbehbiaqxlthblt",
            },
          });
          transporter
            .sendMail({
              from: process.env.USER,
              to: email,
              subject: "Şifre Değiştirme",
              text: url,
            })
            .then(() => {
              res.status(201);
              res.json({
                message: "Şifre Değiştirme Maili Gönderildi",
                status: "OK",
                statusCode: 201,
              });
            })
            .catch(() => {
              next(
                new SomeThingWentWrongError([
                  {
                    reason: "Beklenmedik hata oluştu. Lütfen tekrar deneyiniz",
                    statusCode: 404,
                  },
                ])
              );
            });
        } catch (error) {
          next(
            new SomeThingWentWrongError([
              {
                reason: "Beklenmedik hata oluştu. Lütfen tekrar deneyiniz",
                statusCode: 404,
              },
            ])
          );
        }
      } catch (error) {
        next(
          new SomeThingWentWrongError([
            {
              reason: "Beklenmedik hata oluştu. Lütfen tekrar deneyiniz",
              statusCode: 404,
            },
          ])
        );
      }
    }
  } catch (error) {
    next(
      new SomeThingWentWrongError([
        {
          reason: "Bir şeyler ters gitti",
          statusCode: 404,
        },
      ])
    );
  }
};

// RESET PASSWORD
export const resetPasswordVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body;
    const { id, token } = req.params;

    const user = await User.findById(id);

    if (!user || !user.isActive) {
      next(
        new SomeThingWentWrongError([
          {
            reason: "user bulunamadı",
            statusCode: 404,
          },
        ])
      );
    } else {
      const secret =
        process.env.RESET_PASSWORD_SECRET_KEY + "-" + user.password;
      jwt.verify(token, secret, async (e, decoded) => {
        if (e) {
          next(
            new SomeThingWentWrongError([
              {
                reason: "Link geçerli değil",
                statusCode: 404,
              },
            ])
          );
        } else {
          try {
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.findOneAndUpdate(
              { _id: id },
              { password: hashedPassword }
            );
            res.status(201).json({
              message: "Şifre Değiştirme Başarılı",
              status: "OK",
              statusCode: 201,
            });
          } catch (error) {
            next(
              new SomeThingWentWrongError([
                {
                  reason: "Bir şeyler ters gitti",
                  statusCode: 404,
                },
              ])
            );
          }
        }
      });
    }
  } catch (error) {
    next(
      new SomeThingWentWrongError([
        {
          reason: "Bir şeyler ters gitti",
          statusCode: 404,
        },
      ])
    );
  }
};
