import mongoose from "mongoose";


const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  order: Number,
});

export const Section = mongoose.model("Section", sectionSchema);
  