import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Story from "../models/Story.js"; // Assuming you have a Story model
import User from '../models/User.js'
import { inngest } from "../inngest/index.js";
// Add User Story
export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file;
    let media_url = "";

    // Upload media to ImageKit if it's image or video
    if (media && (media_type === "image" || media_type === "video")) {
      const fileBuffer = fs.readFileSync(media.path);

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: media.originalname,
      });

      media_url = response.url;
    }

    // Create new story
    const story =  await  Story.create({
      user: userId,
      content,
      media_type,
      background_color,
      media_url,
    });
    //schedule story deletion after 24 h 
    await inngest.send({
        name:'app/story.delete',
        data: {storyId: story._id}
    })


      res.json({success: true});
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}

//get user stories
// Get User Stories
export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId)

    const userIds = [userId, ...user.connections, ...user.following];

    const stories = await Story.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};