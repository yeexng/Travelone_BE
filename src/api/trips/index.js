import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import TripModel from "./model.js";
import { format } from "date-fns";
import UserModel from "../user/model.js";

const tripsRouter = express.Router();

//Adding new trip
tripsRouter.post("/", async (req, res, next) => {
  try {
    const newTrip = new TripModel(req.body);
    const trip = await newTrip.save();
    res.status(201).send({ trip });
  } catch (error) {
    next(error);
  }
});

//Getting all the trip
tripsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const { trips, total } = await TripModel.findTripsWithUsers(mongoQuery);
    res.send({
      links: mongoQuery.links("http://localhost:3001/trips", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      trips,
    });
  } catch (error) {
    next(error);
  }
});

//Get a single trip
tripsRouter.get("/:tripId", async (req, res, next) => {
  try {
    const trip = await TripModel.findTripWithUser(req.params.tripId);
    if (trip) {
      res.send(trip);
    } else {
      next(
        createHttpError(404, `Trip with ID ${req.params.tripId} not found!`)
      );
    }
  } catch (error) {}
});

//Editing Trip
tripsRouter.put("/:tripId", async (req, res, next) => {
  try {
    const updatedTrip = await TripModel.findByIdAndUpdate(
      req.params.tripId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedTrip) {
      res.send(updatedTrip);
    } else {
      createHttpError(
        404,
        `Trip with the id: ${req.params.tripId} was not found!`
      );
    }
  } catch (error) {
    next(error);
  }
});

//Delete Trip
tripsRouter.delete("/:tripId", async (req, res, next) => {
  try {
    const deletedTrip = await TripModel.findByIdAndDelete(req.params.tripId);
    if (deletedTrip) {
      res.status(204).send();
    } else {
      createHttpError(
        404,
        `Trip with the id: ${req.params.tripId} was not found!`
      );
    }
  } catch (error) {
    next(error);
  }
});

//Chat Features
tripsRouter.post("/:tripId/chats", async (req, res, next) => {
  try {
    const newChat = req.body;
    const newChatToInsert = {
      ...newChat,
    };
    const updatedChats = await TripModel.findByIdAndUpdate(
      req.params.tripId,
      { $push: { chatHistory: newChatToInsert } },
      { new: true, runValidators: true }
    );
    if (updatedChats) {
      res.status(201).send(updatedChats);
    } else {
      next(
        createHttpError(404, `Trip with id ${req.params.tripId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

tripsRouter.get("/:tripId/chats", async (req, res, next) => {
  try {
    const trip = await TripModel.findById(req.params.tripId);
    if (trip) {
      res.send(trip.chatHistory);
    } else {
      next(
        createHttpError(
          404,
          `ChatHistory with id ${req.params.tripId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

tripsRouter.post("/:tripId/adventurerList", async (req, res, next) => {
  try {
    const { adventurers } = req.body;
    const newAdventurerObjectId = adventurers[0];

    const updatedTrip = await TripModel.findByIdAndUpdate(
      req.params.tripId,
      { $addToSet: { adventurers: newAdventurerObjectId } },
      { new: true, runValidators: true }
    );

    if (updatedTrip) {
      res.status(201).send(updatedTrip);
    } else {
      next(createHttpError(404, `Id ${req.params.tripId} is already there!`));
    }
  } catch (error) {
    next(error);
  }
});

tripsRouter.get("/:tripId/adventurerList", async (req, res, next) => {
  try {
    const trip = await TripModel.findById(req.params.tripId);
    if (trip) {
      res.send(trip);
    } else {
      next(
        createHttpError(404, `Trip with id ${req.params.tripId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default tripsRouter;
