import express from "express";
import {
  createOfficer,
  getOfficers,
  getScroressWithLimit,
} from "../../controllers/Officer";
import upload from "../../utils/uploadFile/Index";

// const CLIENT_URL = "http://localhost:3001";
const router = express.Router();

router.post("/", upload.single("image"), createOfficer);
router.get("/score", getScroressWithLimit);
router.get("/", getOfficers);

export default router;
