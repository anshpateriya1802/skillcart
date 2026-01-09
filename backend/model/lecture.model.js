import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },

  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },

  videoUrl: String,
  duration: Number,

  isPreview: { type: Boolean, default: false },
  order: Number,
});

export const Lecture = mongoose.model("Lecture", lectureSchema);
  