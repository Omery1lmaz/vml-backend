import express, { NextFunction } from "express";
import connectDB from "./utils/database/index";
import authRoutes from "./routes/Auth/index";
import officerRoutes from "./routes/Officer/index";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/error-handler";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
const app = express();
connectDB();
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:5000",
      "https://verdant-sherbet-67353d.netlify.app",
      "http://localhost:3004",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use("/api/files", express.static(__dirname + "/images"));
app.use("/api/auth", authRoutes);
app.use("/api/officer", officerRoutes);
// Son route hatası yönetimi
app.use(errorHandler);

const port = process.env.PORT || 3003;

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port} 
  `);
});
