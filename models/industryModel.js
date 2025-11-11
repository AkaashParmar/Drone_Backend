import mongoose from "mongoose";

const bulletSchema = new mongoose.Schema({ 
  text: { type: String, required: true }
});

const sectionBulletSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

const featureSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true }, 
  description: { type: String, required: true },
  bullets: { type: [bulletSchema], default: [] }
});

const sectionSchema = new mongoose.Schema({
  image: { type: [String], default: [] }, 
  title: { type: String, required: true },
  description: { type: String, required: true },
  bullets: { type: [sectionBulletSchema], default: [] }
}, { _id: true });

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const industrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    theme: {
      type: String,
      required: true,
      trim: true,
    },
    industryType: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: { type: [String], default: [] },
    features: { type: [featureSchema], default: [] },
    sections: { type: [sectionSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Generate slug before saving
industrySchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

const Industry = mongoose.model("Industry", industrySchema);

export default Industry;
