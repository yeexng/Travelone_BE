import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

export const avatarUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "travelone/users/avatars",
    },
  }),
}).single("avatar");

export const imageUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "travelone/chats/images",
    },
  }),
}).single("image");
