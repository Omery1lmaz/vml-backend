import jwt from "jsonwebtoken";

const maxAge = 3 * 24 * 60 * 60;

export const createToken = (id: string) => {
  console.log("id", id);
  return jwt.sign({ id }, process.env.SECRET_KEY as string, {
    expiresIn: maxAge,
  });
};

export const createResetPasswordToken = (jwtInfos: string) => {
  return jwt.sign(jwtInfos, process.env.RESET_PASSWORD_SECRET_KEY as string, {
    expiresIn: "15m",
  });
};
