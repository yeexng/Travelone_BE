import express from "express";
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
import { Server } from "socket.io";
import { createServer } from "http";
import createHttpError from "http-errors";
import usersRouter from "./api/user/index.js";
import googleStrategy from "./lib/auth/googleOauth.js";
import tripsRouter from "./api/trips/index.js";
import postsRouter from "./api/hiddenGems/index.js";
import { newConnectionHandler } from "./socket/index.js";

const app = express();
const port = process.env.PORT || 3005;

// Socket.io
const httpServer = createServer(app);
const socketIoServer = new Server(httpServer);

socketIoServer.on("connection", (socket) => {
  newConnectionHandler(socket, socketIoServer);
});

passport.use("google", googleStrategy);

// Cors
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

app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

// Endpoints
app.use("/users", usersRouter);
app.use("/trips", tripsRouter);
app.use("/posts", postsRouter);

// Error Handlers
app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_DEV_URL);

mongoose.connection.on("connected", () => {
  console.log(`✅ Successfully connected to Mongo!`);
  httpServer.listen(port, () => {
    console.table(listEndpoints(app));
    console.log(`✅ Server is running on port ${port}`);
  });
});
