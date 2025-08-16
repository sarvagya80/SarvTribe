import express from 'express';
import { createStory, getStories } from '../controllers/storyController.js';
import { clerkProtect } from '../middlewares/auth.js';
import { upload } from '../middlewares/multer.js';

const storyRouter = express.Router();

// 🔒 Get stories for the user's feed
storyRouter.get('/', clerkProtect, getStories);

// 🔒 Create a new story
storyRouter.post('/create', clerkProtect, upload.single('media'), createStory);

export default storyRouter;