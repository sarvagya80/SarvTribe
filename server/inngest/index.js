import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import { sendEmail } from "../configs/nodemailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";
import connectDB from "../configs/db.js"; // ✅ Import your database connection function

export const inngest = new Inngest({ id: "SarvTribe" });

// 1️⃣ Sync User on Creation
// 1️⃣ Sync User on Creation (Corrected Version)
const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    try {
      await connectDB(); // Ensure DB is connected before running

      const { id, first_name, last_name, email_addresses, image_url, username: clerkUsername } = event.data;
      
      // ✅ Robust way to create a username
      let username = clerkUsername || email_addresses[0].email_address.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
      
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // ✅ Robust way to create a full name, with a fallback
      let fullName = `${first_name || ''} ${last_name || ''}`.trim();
      if (!fullName) {
        fullName = username; // Use the username as a fallback if name is empty
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        full_name: fullName,
        profile_picture: image_url,
        username,
      };

      await User.create(userData);
      return { success: true, message: `User ${username} synced successfully.` };

    } catch (error) {
      // ✅ CRITICAL: Catch errors, log them, and re-throw them
      console.error("Failed to sync user from Clerk:", error);
      // This ensures Inngest marks the job as FAILED
      throw error; 
    }
  }
);

// 2️⃣ Sync User on Update
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        await connectDB(); // ✅ Ensure DB is connected before running

        const { id, first_name, last_name, image_url } = event.data;
        const updateUserData = {
            full_name: `${first_name} ${last_name}`.trim(),
            profile_picture: image_url,
        };
        await User.findByIdAndUpdate(id, updateUserData);
        return { message: `User ${id} updated.` };
    }
);

// 3️⃣ Sync User on Deletion
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        await connectDB(); // ✅ Ensure DB is connected before running

        const { id } = event.data;
        if (!id) return { message: 'Deletion skipped, no ID provided.'};
        await User.findByIdAndDelete(id);
        return { message: `User ${id} deleted.` };
    }
);

// 4️⃣ Connection Request with Reminder
const sendNewConnectionRequestReminder = inngest.createFunction(
    { id: 'send-new-connection-request-reminder' },
    { event: 'app/connection-request' },
    async ({ event, step }) => {
        await connectDB(); // ✅ Ensure DB is connected before running

        // ... Your logic here ...
        return { message: "Connection reminder logic to be implemented." };
    }
);

// 5️⃣ Delete Story After 24 Hours
const deleteStory = inngest.createFunction(
    { id: 'story-delete' },
    { event: 'app/story.created' },
    async ({ event, step }) => {
        await connectDB(); // ✅ Ensure DB is connected before running

        const { storyId } = event.data;
        const story = await step.run("get-story-creation-time", async () => {
            return await Story.findById(storyId).select("createdAt");
        });

        if (!story) return { message: "Story not found, skipping deletion." };
        
        const in24Hours = new Date(story.createdAt.getTime() + 24 * 60 * 60 * 1000);
        await step.sleepUntil('wait-for-24-hours', in24Hours);

        await step.run('delete-story', async () => {
            await Story.findByIdAndDelete(storyId);
            return { message: 'Story deleted.' };
        });
    }
);

// 6️⃣ Daily Unseen Messages Notification
const sendNotificationOfUnseenMessages = inngest.createFunction(
    { id: "send-unseen-messages-notification" },
    { cron: "TZ=Asia/Kolkata 0 9 * * *" },
    async ({ step }) => {
        await connectDB(); // ✅ Ensure DB is connected before running
        
        const usersWithUnseenMessages = await step.run("get-users-with-unseen-messages", async () => {
            return await Message.aggregate([
                // ... your aggregation pipeline ...
            ]);
        });
    
        if (usersWithUnseenMessages.length === 0) {
            return { message: "No unseen messages today." };
        }
    
        for (const user of usersWithUnseenMessages) {
            const subject = `You have ${user.unseenCount} unseen messages on SarvTribe`;
            const body = `<h2>Hi ${user.fullName},</h2><p>You have ${user.unseenCount} unseen messages waiting for you.</p><p>Click <a href="${process.env.FRONTEND_URL}/messages">here</a> to view them.</p><br/><p>Thanks,<br/>The SarvTribe Team</p>`;
            
            await step.run(`send-email-to-${user.userId}`, async () => {
                await sendEmail({ to: user.email, subject, body });
            });
        }
    
        return { message: `Notifications sent to ${usersWithUnseenMessages.length} users.` };
    }
);

export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    deleteStory,
    sendNotificationOfUnseenMessages
];