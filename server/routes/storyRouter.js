import express from 'express';
import { clerkProtect } from '../middlewares/auth.js';
import { upload } from '../middlewares/multer.js';
import { createStory, getAllStories } from '../controllers/storyController.js';

const router = express.Router();

router.get('/', clerkProtect, getAllStories);

router.post('/create', clerkProtect, upload.single('media'), createStory);

export default router;