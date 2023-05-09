import express from "express";
import createError from "http-errors";
import UsersModel from "./model.js";
import passport from "passport";
import { avatarUploader } from "../../lib/cloudinary.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwt.js";
import { createAccessToken } from "../../lib/auth/tools.js";

const usersRouter = express.Router();

//Sign Up
usersRouter.post("/account", async (req, res, next) => {
  try {
    const emailInUse = await UsersModel.findOne({ email: req.body.email }); //to check if the email is already been registered
    if (!emailInUse) {
      const newUser = new UsersModel(req.body);
      const user = await newUser.save();
      const payload = { _id: user._id, email: user.email };
      const accessToken = await createAccessToken(payload); // need to construct in lib and import

      res.status(201).send({ user, accessToken });
    } else {
      res
        .status(409)
        // 409 Conflict ->
        // https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-p2-semantics-18#section-7.4.10
        // The request could not be completed due to a conflict with the current
        // state of the resource.  This code is only allowed in situations where
        // it is expected that the user might be able to resolve the conflict
        // and resubmit the request.
        .send({ message: `This email '${req.body.email}' is already in use!` });
    }
  } catch (error) {
    next(error);
  }
});

//Login
usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id, email: user.email };
      const accessToken = await createAccessToken(payload);
      res.send({ user, accessToken });
    } else {
      next(createHttpError(401, "Creditentials are not okay!"));
    }
  } catch (error) {
    next(error);
  }
});

//Google Login
usersRouter.get(
  "/googleLogin",
  passport.authenticate(
    "google",
    { scope: ["profile", "email"] },
    { session: false }
  )
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    try {
      res.redirect(`${process.env.FE_URL}?accessToken=${req.user.accessToken}`); //FE_URL needs to change, now is set to localhost
      // res.send(req.user.accessToken);
    } catch (error) {
      next(error);
    }
  }
);

//Get All Users
usersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

// Get own info --- not working
usersRouter.get("/me", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id); //the parameter might need to change
    res.send(user);
  } catch (error) {}
});

//Edit own info --- not working
usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findOneAndUpdate(
      { _id: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

//Get users by ID
usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {}
});

//Set an avatar
usersRouter.post(
  "/me/avatar",
  JWTAuthMiddleware,
  avatarUploader,
  async (req, res, next) => {
    await UsersModel.findByIdAndUpdate(req, {
      // need to fix the req params after declare UserRequest
      avatar: req.file?.path,
    });
    res.send({ avatarURL: req.file?.path });
  }
);

export default usersRouter;
