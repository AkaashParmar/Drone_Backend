import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
    number: { type: String, required: true },
    text: { type: String, required: true }
});

const planSchema = new mongoose.Schema({
    name: { type: String,required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    slug: { type: String, required: true, unique: true },

    steps: [stepSchema], // array of steps
    whyUs: [{ type: String }], // array of points

}, { timestamps: true });

export default mongoose.model("Plan", planSchema);
