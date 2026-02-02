import multer from "multer";
import path from "path";
import fs from "fs";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const profilePhotoDir = path.join(process.cwd(), "public", "profile_photo");

if (!fs.existsSync(profilePhotoDir)) {
  fs.mkdirSync(profilePhotoDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, profilePhotoDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${Date.now()}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  // field must be EXACT
  if (file.fieldname !== "profilePicture") return cb(null, false);

  // allow common image formats
  if (!/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) return cb(null, false);

  cb(null, true);
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
});
