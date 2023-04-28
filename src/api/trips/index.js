import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import TripModel from "./model.js";
import { format } from "date-fns";
import UserModel from "../user/model.js";

const tripsRouter = express.Router();

//Adding new trip
tripsRouter.post("/trips", async (req, res, next) => {
  try {
    const newTrip = new TripModel(req.body);
    const { _id } = await newTrip.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

//Getting all the trip
tripsRouter.get("/trips", async (req, res, next) => {
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
tripsRouter.get("/trips/:tripId", async (req, res, next) => {
  try {
  } catch (error) {}
});

//Adding new trip
tripsRouter.post("/:userId/trips", async (req, res, next) => {
  try {
    if (user) {
      const newTrip = new TripModel(req.body);
      const { _id } = await newTrip.save();
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.params.userId,
        { $push: { trips: _id } },
        { new: true, runValidators: true }
      );
      res.status(201).send({ updatedUser: updatedUser });
    } else {
      createHttpError(
        404,
        `User with the id: ${req.params.userId} was not found!`
      );
    }
  } catch (error) {
    next(error);
  }
});

//Get user's single trip
tripsRouter.get("/:userId/trips/:tripId", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (user) {
      const trip = user.trips.find(
        (e) => e._id.toString() === req.params.tripId
      );
      if (trip) {
        res.send(trip);
      } else {
        createHttpError(
          404,
          `Trip with the id: ${req.params.tripId} was not found!`
        );
      }
    }
  } catch (error) {}
});

//Editing Trip
tripsRouter.put("/:userId/trips/:tripId", async (req, res, next) => {
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
tripsRouter.delete("/:userId/trips/:tripId", async (req, res, next) => {
  try {
    const trip = await TripModel.findByIdAndDelete(req.params.tripId);
    await UserModel.findByIdAndUpdate(
      req.params.userId,
      { $pull: { trips: req.params.tripId } },
      { new: true, runValidators: true }
    );
    if (experience) {
      res.status(204).send();
    } else {
      createHttpError(
        404,
        `Trip with the id: ${req.params.tripId} was not found!`
      );
    }
  } catch (error) {}
});

export default tripsRouter;
