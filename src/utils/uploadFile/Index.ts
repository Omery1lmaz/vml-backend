import multer from "multer";
import { SomeThingWentWrongError } from "../../errors/something-went-wrong";
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB in bytes
  },
  fileFilter(req: any, file: any, cb: any) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new SomeThingWentWrongError([
          {
            reason: "File must be a image file",
            statusCode: 404,
          },
        ])
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return cb(
        new SomeThingWentWrongError([
          {
            reason: "File size exceeds the allowed limit",
            statusCode: 404,
          },
        ])
      );
    }

    cb(undefined, true);
  },
});
export default upload;
