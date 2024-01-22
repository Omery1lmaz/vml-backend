import express from "express";
import {
  signInUser,
  getUsers,
  updateScoreByUser,
} from "../../controllers/User";
import { SomeThingWentWrongError } from "../../errors/something-went-wrong";
import { UnAuthorizedError } from "../../errors/unAuthorized";

// const CLIENT_URL = "http://localhost:3001";
const router = express.Router();

router.post("/", signInUser);
router.get("/", getUsers);
router.put("/:id/:scoree", updateScoreByUser);

export default router;
