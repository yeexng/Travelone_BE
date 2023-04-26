import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import { httpServer, expressServer } from "./server.js";

const port = process.env.PORT || 3005;

mongoose.connect(process.env.MONGO_DEV_URL);

mongoose.connection.on("connected", () => {
  httpServer.listen(port, () => {
    console.table(listEndpoints(expressServer));
  });
});
