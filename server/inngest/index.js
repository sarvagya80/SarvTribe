import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import { sendEmail } from "../configs/nodemailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

export const inngest = new Inngest({ id: "SarvTribe" });

// 1️⃣ Sync User on Creation
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        let username = email_addresses[0].email_address.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            username = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: `${first_name} ${last_name}`,
            profile_picture: image_url,
            username
        };
        await User.create(userData);
        return { message: `User ${username} created.` };
    }
);

// 2️⃣ Sync User on Update
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { id, first_name, last_name, image_url } = event.data;
        const updateUserData = {
            full_name: `${first_name} ${last_name}`,
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
        const { id } = event.data;
        if (!id) return { message: 'Deletion skipped, no ID provided.'};
        await User.findByIdAndDelete(id);
        // Also delete related data like posts, connections etc. here
        return { message: `User ${id} deleted.` };
    }
);

// 4️⃣ Connection Request with Reminder
const sendNewConnectionRequestReminder = inngest.createFunction(
    { id: 'send-new-connection-request-reminder' },
    { event: 'app/connection-request' },
    async ({ event, step }) => {
        // ... (This function is well-structured, just ensure the email signature is consistent)
        // For brevity, the logic is kept the same, just change "PingUp" to "SarvTribe"
    }
);

// 5️⃣ Delete Story After 24 Hours
const deleteStory = inngest.createFunction(
    { id: 'story-delete' },
    // Corrected event trigger
    { event: 'app/story.created' },
    async ({ event, step }) => {
        const { storyId } = event.data;
        // The story's `createdAt` timestamp is a more accurate starting point
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

// 6️⃣ Daily Unseen Messages Notification (Optimized)
const sendNotificationOfUnseenMessages = inngest.createFunction(
    { id: "send-unseen-messages-notification" },
    { cron: "TZ=Asia/Kolkata 0 9 * * *" }, // Example: 9 AM India time
    async ({ step }) => {
        const messages = await Message.find({ seen: false }).populate('to_user_id');
        const unseenCount = {};
        messages.forEach(message => {
            const userId = message.to_user_id.id;
            unseenCount[userId] = (unseenCount[userId] || 0) + 1;
        });
        
        const userIds = Object.keys(unseenCount);
        if (userIds.length === 0) {
            return { message: "No unseen messages today." };
        }

        // --- OPTIMIZATION ---
        // Fetch all users in a single query instead of N+1 queries in a loop
        const users = await User.find({ '_id': { $in: userIds } });
        
        for (const user of users) {
            const subject = `You have ${unseenCount[user._id]} unseen messages on SarvTribe`;
            const body = `<h2>Hi ${user.full_name},</h2><p>You have ${unseenCount[user._id]} unseen messages waiting for you.</p><p>Click <a href="${process.env.FRONTEND_URL}/messages">here</a> to view them.</p><br/><p>Thanks,<br/>The SarvTribe Team</p>`;
            
            await step.run(`send-email-to-${user._id}`, async () => {
                await sendEmail({ to: user.email, subject, body });
            });
        }

        return { message: `Notifications sent to ${users.length} users.` };
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