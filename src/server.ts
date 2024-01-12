import express, { NextFunction } from "express";
import connectDB from "./utils/database/index";
import authRoutes from "./routes/Auth/index";
import cookieSession from "cookie-session";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/error-handler";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { createToken } from "./utils/jwt";

const app = express();
connectDB();
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
// app.use(express.cookieParser());

dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    name: "token",
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3001/login/success",
    failureRedirect: "/login/failed",
    session: false,
  }),
  function (req, res) {
    res.writeHead(200, {
      // @ts-ignore
      "Set-Cookie": `test=smfnsanfjnjsnj`,
    });

    // req.session["token"] = token as string;
    res.redirect("http://localhost:3001/login/success");
  }
);

app.get("/login/failed", (req: any, res: any, next: any) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

// Kullanıcının oturum durumunu yönetmek için serialize ve deserialize işlemleri
passport.serializeUser((user: Express.User, done: VerifyCallback) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done: VerifyCallback) => {
  done(null, user);
});

const port = process.env.PORT || 5000;
app.use("/api/auth", authRoutes);
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Passport middleware'ini kullan

// Son route hatası yönetimi
app.use(errorHandler);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
