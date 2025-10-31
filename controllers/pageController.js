import Page from '../models/pages.js';

// Create page
export const createPage = async (req, res) => {
  try {
    const payload = req.body;
    payload.createdBy = req.user?.id;
    const page = new Page(payload);
    await page.save();
    res.status(201).json({ success: true, page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get page by slug
export const getPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ slug });
    if (!page) return res.status(404).json({ success:false, message: 'Page not found' });
    res.json({ success:true, page });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
};

// List pages (with optional status filter)
export const listPages = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const pages = await Page.find(filter).sort({ updatedAt: -1 });
    res.json({ success:true, pages });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
};

// Update page by id
export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    payload.updatedBy = req.user?.id;
    const page = await Page.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!page) return res.status(404).json({ success:false, message: 'Page not found' });
    res.json({ success:true, page });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
};

// Delete page
export const deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findByIdAndDelete(id);
    if (!page) return res.status(404).json({ success:false, message: 'Page not found' });
    res.json({ success:true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
};

// Upload images (via multer + cloudinary)
export const uploadImages = (req, res) => {
  try {
    const urls = req.files.map(f => f.path || f.filename || f.url);
    res.json({ success:true, urls });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
};
