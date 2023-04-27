import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import createHttpError from "http-errors";
import usersRouter from "./api/user/index.js";
import googleStrategy from "./lib/auth/googleOauth.js";

const server = Express();
const port = process.env.PORT || 3005;

passport.use("google", googleStrategy);

//Cors
const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const corsOptions = {
  origin: (currentOrigin, corsNext) => {
    if (!currentOrigin || whiteList.includes(currentOrigin)) {
      corsNext(null, true);
    } else {
      corsNext(
        createHttpError(400, `This origin is not allowed! ${currentOrigin}`)
      );
    }
  },
};

server.use(cors(corsOptions));
server.use(Express.json());
server.use(passport.initialize());

//Endpoints
server.use("/users", usersRouter);

//Error Handlers
server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_DEV_URL);

mongoose.connection.on("connected", () => {
  console.log(`✅ Successfully connected to Mongo!`);
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
