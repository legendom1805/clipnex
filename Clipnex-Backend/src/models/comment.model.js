import moogoose, { Schema } from "mongoose";

const CommentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },

    post:{
        type: Schema.Types.ObjectId,
        ref: "Post"
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Comment = moogoose.model("Comment", CommentSchema);
