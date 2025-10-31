
import express from 'express';
import {
  createPage, getPage, listPages, updatePage, deletePage, uploadImages
} from '../controllers/pageController.js';
import  upload  from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', listPages);
router.get('/:slug', getPage);
router.post('/', protect, createPage);
router.put('/:id', protect, updatePage);
router.delete('/:id', protect, deletePage); 
router.post('/upload/images', protect, upload.array('images', 8), uploadImages);

export default router;
