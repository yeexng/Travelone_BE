import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const postsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    locations: { type: String },
    details: { type: String },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1682595167681-888983414521?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
    },
    comments: [commentsSchema],
  },
  { timestamps: true }
);

postsSchema.statics.findPostsWithUsers = async function (query) {
  const posts = await this.find(query.criteria, query.options.fields)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort)
    .populate({
      path: "user comments.user",
    });
  const total = await this.countDocuments(query.criteria);
  return { posts, total };
};

postsSchema.statics.findPostWithUser = async function (id) {
  const post = await this.findById(id).populate({
    path: "user comments.user",
  });
  return post;
};

export default model("Post", postsSchema);
