import Course from "../models/courseModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary-config.js";

// Create new course
export const createCourse = async (req, res) => {
  try {
    let courseData = req.body;

    // If frontend sends JSON as string, parse it
    if (typeof courseData === "string") {
      courseData = JSON.parse(courseData);
    }

    // image upload (from req.file)
    if (req.file && req.file.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "courses",
      });

      fs.unlinkSync(req.file.path);
      courseData.image = resultCloud.secure_url;
    }

    // Create and save course
    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating course",
      error: error.message,
    });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching courses", error: error.message });
  }
};


export const getAllCoursesdropdown = async (req, res) => {
  try {
    const courses = await Course.find({}, "name _id"); 
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get single course by ID or type
export const getCourse = async (req, res) => {
  try {
    const { idOrType } = req.params;
    const course =
      (await Course.findOne({ type: idOrType })) || (await Course.findById(idOrType));
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching course", error: error.message });
  }
};

export const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, message: "Course updated successfully", updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating course", error: error.message });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting course", error: error.message });
  }
};

export const updateCourseImage = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Ensure at least one file is uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    // Upload all images to Cloudinary
    const uploadedImages = [];
    for (const file of req.files) {
      const resultCloud = await cloudinary.uploader.upload(file.path, {
        folder: "courses",
      });

      uploadedImages.push(resultCloud.secure_url);
      fs.unlinkSync(file.path);
    }

    course.image = uploadedImages[0];

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course image updated successfully",
      image: course.image,
    });
  } catch (error) {
    console.error("Update Course Image Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating course image",
      error: error.message,
    });
  }
};

// export const addEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, phone, course, email, message } = req.body;

//     if (!req.user) {
//       return res.status(401).json({ success: false, message: "Login required" });
//     }

//     const updatedCourse = await Course.findByIdAndUpdate(
//       id,
//       {
//         $push: {
//           enrollments: {
//             name,
//             phone,
//             course,
//             email,
//             message,
//             userId: req.user._id,  
//             submittedAt: new Date()
//           }
//         }
//       },
//       { new: true }
//     );

//     res.status(200).json({ success: true, data: updatedCourse });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const addEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, course, email, message } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $push: { enrollments: { name, phone, course, email, message } } },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding enrollment" });
  }
};


export const getEnrollments = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).select("name enrollments");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      data: course.enrollments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const addReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { review, rating } = req.body;

    // Must be logged in
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    // auto-fill name and avatar from user model
    const name = req.user.fullName;
    const avatar = req.user.avatar || ""; 

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          reviews: {
            userId: req.user._id,
            name,
            review,
            rating,
            avatar,
          },
        },
      },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).select("reviews");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      reviews: course.reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


