import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import {sendEmail} from "../configs/nodemailer.js";
import Story from "../models/Story.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "SarvTribe" });
// inngest function to create user in database
const syncUserCreation =inngest.createFunction(
    { id :'sync-user-from-clerk'  },
    {event: 'clerk/user.created'},
    async ({event})=>{
        const {id,first_name,last_name,email_addresses,image_url}=event.data
        let username = email_addresses[0].email_address.split('@')[0]
        
        //check availability of username
        const user= await User.findOne({username})

        if(user){
            username=username+Math.floor(Math.random()*1000)
        }
        const userData={
            _id:id,
            email:email_addresses[0].email_address,
            full_name:first_name+" "+last_name,
            profile_picture: image_url,
            username
        }
        await User.create(userData)
    }
)
// Inngest function to update user data in database
const syncUserUpdation =inngest.createFunction(
    { id :'update-user-from-clerk'  },
    {event: 'clerk/user.updated'},
    async ({event})=>{
        const {id,first_name,last_name,email_addresses,image_url}=event.data
        
        
       
        const updateUserData={
            email:email_addresses[0].email_address,
            full_name:first_name+" "+last_name,
            profile_picture: image_url,
            
        }
        await User.findByIdAndUpdate(id,updateUserData)
    }
)

// Inngest function to delete user data in database

const syncUserDeletion =inngest.createFunction(
    { id :'delete-user-from-clerk'  },
    {event: 'clerk/user.deleted'},
    async ({event})=>{
        const {id,}=event.data
        
        
        await User.findByIdAndDelete(id)
    }
)
//ingest function to send reminder when connection request is made

const sendNewConnectionRequestReminder = inngest.createFunction(
    {id:'send-new-connection-request-reminder'},
        {event:'app/connection-request'},
         async ({event, step}) => {
         const { connectionId } = event.data;

  await step.run("send-connection-request-mail", async () => {
    const connection = await Connection.findById(connectionId)
      .populate("from_user_id")
      .populate("to_user_id");

    const subject = "New Connection Request";
    const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from 
          <strong>${connection.from_user_id.full_name}</strong> 
          (@${connection.from_user_id.username}).
        </p>
        <p>
          Click 
          <a href="${process.env.FRONTEND_URL}/connections" style="color: #106981;">
            here
          </a> 
          to accept or reject the request.
        </p>
        <br/>
        <p>Thanks,<br/>sarrvtribe Stay Connected</p>
      </div>
    `;
      await sendEmail({
      to: connection.to_user_id.email,
      subject,
     body
    });

  });
  const in24Hours = new Date(Data.now()+24 *60*60*1000)
  await step.sleepUntil("waite-for-24-hours",in24Hours);
  await step.run('send-connection-request-reminder' ,async()=>
{
    const connection=await Connection.findById(connectionId).populate('from_user_id to_user_id');
    if(connection.status==='accepted'){
        return {message:'Already accepted'}
    }
    const subject = "New Connection Request";
    const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from 
          <strong>${connection.from_user_id.full_name}</strong> 
          (@${connection.from_user_id.username}).
        </p>
        <p>
          Click 
          <a href="${process.env.FRONTEND_URL}/connections" style="color: #106981;">
            here
          </a> 
          to accept or reject the request.
        </p>
        <br/>
        <p>Thanks,<br/>sarrvtribe Stay Connected</p>
      </div>
    `;
      await sendEmail({
      to: connection.to_user_id.email,
      subject,
     body
    });
 return{message:'Reminder sent.' }

})
})
 // Inngest Function to delete story after 24 hours
const deleteStory = inngest.createFunction(
  { id: 'story-delete' },
  { event: 'app/story.delete' },
  async ({ event, step }) => {
    const { storyId } = event.data;
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil('wait-for-24-hours', in24Hours);
    await step.run('delete-story', async () => {
      await Story.findByIdAndDelete(storyId);
      return { message: 'Story deleted.' };
    });

    
  }
);
   const sendNotificationOfUnseenMessages = inngest.createFunction(
  { id: "send-unseen-messages-notification" },
  { cron: "TZ=America/New_York 0 9 * * *" }, // Every day at 9 AM
  async ({ step }) => {
    // Find all unseen messages and populate the recipient user
    const messages = await Message.find({ seen: false }).populate('to_user_id');

    // Count unseen messages per user
    const unseenCount = {};
    messages.map(message => {
      unseenCount[message.to_user_id.id]=
      (unseenCount[message.to_user_id.id ] || 0) + 1;
    });

    // Loop through each user and send notification
    for (const userId in unseenCount) {
      const user = await User.findById(userId);
      const subject=`you have ${inseenCount[userId]} unseen messages`;
      const body = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Hi ${user.full_name},</h2>
    <p>You have ${unseenCount[userId]} unseen messages</p>
    <p>
      Click 
      <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">
        here
      </a> 
      to view them
    </p>
    <br/>
    <p>Thanks,<br/>SarvTribe Stay Connected</p>
  </div>
`;

await sendEmail({
  to: user.email,
  subject,
  body
})

    }

return { message: "Notification sent." };
  }
)


// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    deleteStory,
    sendNotificationOfUnseenMessages
];