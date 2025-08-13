 import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// Add Post
export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files || [];

    let image_urls = [];

    if (images.length > 0) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);
          const response = await imagekit.upload({
                         file:fileBuffer,
                         fileName: image.originalname,
                         folder:'posts',
                     })
                     const url=  imagekit.url({
                         path:response.filePath,
                         transformation:[
                             {quality:'auto'},
                             {format:'webp'},
                             {width :'512'}
         
                         ]
                     })
         

          return url; // ImageKit returns the uploaded file URL
        })
      );
    }
    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });
       res.json({
      success: true,
      message: "Post added successfully",
    });
  } catch (error) {
    console.error(error);
     res.json({
      success: false,
      message: error.message,
    });
  }
}

//get post
// Get Posts
export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    const userIds = [userId, ...user.connections, ...user.following];
    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Like / Unlike Post
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;

    const post = await Post.findById(postId);
    // If already liked → unlike
    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter(user => user.toString() !== userId.toString());
      await post.save();
      res.json({ success: true, message: "Post unliked" });
    }

    else{
    post.likes_count.push(userId);
            await post.save();}

    

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};