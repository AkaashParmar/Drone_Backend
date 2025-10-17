import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  avatar: { type: String, default: "" },
});

const curriculumSchema = new mongoose.Schema({
  day: { type: String, required: true },
  title: { type: String, required: true },
  details: [{ type: String }],
});

const infoSchema = new mongoose.Schema({
  title: { type: String },
  value: { type: String },
});

const learningPointSchema = new mongoose.Schema({
  title: { type: String },
  points: [{ type: String }],
});

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    type: { type: String, enum: ["Basic", "Advanced", "Professional"], required: true },
    description: { type: String, required: true },
    duration: { type: String, default: "5 Days" },
    mode: { type: String, default: "Hybrid" },
    image: { type: String, default: "" }, 

    // Subsections
    courseInfo: [infoSchema],
    whatYouLearn: [learningPointSchema],
    reviews: [reviewSchema],
    curriculum: [curriculumSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
