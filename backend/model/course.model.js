import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },

    description: String,
    thumbnail: String,
    previewVideo: String,

    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },

    language: String,

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    totalDuration: Number,
    published: { type: Boolean, default: false },

    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
