import express from "express";
import cors from "cors";
import passport from "passport";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
// import googleStrategy from "./lib/auth/googleOauth.js";
import createHttpError from "http-errors";

const expressServer = express();

//socket.io
const httpServer = createServer(expressServer);
const socketioServer = new Server(httpServer);
socketioServer.on("connect", newConnectionHandler);
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

expressServer.use(cors(corsOptions));
expressServer.use(express.json());

//Endpoints

//Error Handlers
expressServer.use(badRequestHandler);
expressServer.use(unauthorizedHandler);
expressServer.use(forbiddenHandler);
expressServer.use(notFoundHandler);
expressServer.use(genericErrorHandler);

export { httpServer, expressServer };
