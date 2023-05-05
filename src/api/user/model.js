import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const usersSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    gender: { type: String },
    aboutMe: { type: String },
    dateOfBirth: { type: Date },
    avatar: {
      type: String,
      required: true,
      default:
        "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
    },
    trips: [{ type: Schema.Types.ObjectId, ref: "trips" }],
    googleId: { type: String },
  },
  { timestamps: true }
);

usersSchema.pre("save", async function () {
  const newUserData = this;
  if (newUserData.isModified("password")) {
    const plainPW = newUserData.password;
    const hashPW = await bcrypt.hash(plainPW, 11);
    newUserData.password = hashPW;
  }
});

usersSchema.methods.toJSON = function () {
  const currentUserDocument = this;
  const currentUser = currentUserDocument.toObject();
  delete currentUser.password;
  delete currentUser.__v;
  return currentUser;
};

usersSchema.static("checkCredentials", async function (email, plainPW) {
  const user = await this.findOne({ email });
  if (user) {
    const passwordMatch = await bcrypt.compare(plainPW, user.password);
    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

usersSchema.static("findUserWithTrips", async function (id) {
  const user = await this.findById(id).populate({ path: "trips" });
  return user;
});

export default model("User", usersSchema);
