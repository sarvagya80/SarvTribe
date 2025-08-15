import express from 'express';
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';
import { addUserStory, getStories } from '../controllers/storycontroller.js';

const storyRouter = express.Router();

// Route to create a new story
storyRouter.post(
    '/create',
    protect, // 1. Authenticate the user first
    upload.single('media'), // 2. Then, process the file upload
    addUserStory
);

// Route to get the stories feed
storyRouter.get('/get', protect, getStories);

export default storyRouter;