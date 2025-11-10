import mongoose from "mongoose";

// Sub-schema for FAQs
const faqSchema = new mongoose.Schema({
    question: String,
    answer: String,
});

// Sub-schema for technology stacks
const stackSchema = new mongoose.Schema({
    name: String,
    description: String,
});

// Sub-schema for sections
const sectionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: String,
    checklist: [String], // for checklists
    recommendedSettings: [String], // for recommended settings
    points: [String], // for workflow or QC steps
});

const blogSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        excerpt: String,
        category: String,
        featured: { type: Boolean, default: false },
        image: String,
        author: {
            name: String,
            avatar: String,
        },
        readTime: String,
        date: String,
        views: String,
        likes: { type: Number, default: 0 },
        tags: [String],
        sections: [sectionSchema],
        stacks: [stackSchema], // for technology stacks
        faqs: [faqSchema], // for FAQ section
    },
    { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
