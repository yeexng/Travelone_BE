import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chatHistorySchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String },
  },
  { timestamps: true }
);

const tripSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: Date, required: true },
    lookingFor: {
      type: String,
      // enum: ["Male", "Female", "Any"],
      // required: true,
    },
    typeOfJourney: { type: String },
    splitCost: {
      type: String,
      // enum: ["YES", "NO"], required: true
    },
    budget: { type: Number },
    addOns: { type: String },
    adventurers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    chatHistory: [chatHistorySchema],
  },
  { timestamps: true }
);

tripSchema.statics.findTripsWithUsers = async function (query) {
  const trips = await this.find(query.criteria, query.options.fields)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort)
    .populate({ path: "user adventurers chatHistory.sender" });
  const total = await this.countDocuments(query.criteria);
  return { trips, total };
};

tripSchema.statics.findTripWithUser = async function (id) {
  const trip = await this.findById(id)
    .populate({
      path: "user adventurers",
    })
    .populate({
      path: "chatHistory.sender",
    });
  return trip;
};

export default model("Trip", tripSchema);
