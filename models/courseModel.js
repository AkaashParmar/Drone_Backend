import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  avatar: { type: String, default: "" },
});


const curriculumSchema = new mongoose.Schema({
  day: { type: String, required: true },
  title: { type: String, required: true },
  details: [{ type: String, required: true }],
});

const infoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: String, required: true },
});

const learningPointSchema = new mongoose.Schema({
  title: { type: String, required: true },
  points: [{ type: String, required: true }],
});

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    course: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String },
    status: { type: String, enum: ["Pending", "Processed"], default: "Pending" },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);


const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    overview: { type: String },
    duration: { type: String, default: "5 Days" },
    mode: { type: String, default: "Hybrid" },
    image: { type: String, default: "" },
    slug: { type: String, unique: true, lowercase: true, trim: true },

    // Subdocuments
    courseInfo: [infoSchema],
    whatYouLearn: [learningPointSchema],
    curriculum: [curriculumSchema],
    reviews: [reviewSchema],
    enrollments: [enrollmentSchema],

    // Optional UI helper fields
    ctaText: { type: String, default: "Enroll Today" },
    ctaLink: { type: String, default: "/EnrollmentForm" },
  },
  { timestamps: true }
);


// Generate slug before saving
courseSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

export default mongoose.model("Course", courseSchema);
