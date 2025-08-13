import imagekit from '../configs/imagekit.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js'
import fs from 'fs'

export const getUserData= async(req,res)=>{
    try{
        const {userId} = req.auth();
        const user= await User.findById(userId)
          if(!user){
            return res.json({success: false,message:'User not found'})
        }
        res.json({success:true,user})
        }catch(error){
            console.log(error);
            res.json({success: false,message:error.message})


        }
    }

    export const updateUserData= async(req,res)=>{
    try{
        const {userId} = req.auth()
        let {username,bio,location,full_name}=req.body

        const tempUser= await User.findById(userId)

        !username && (username = tempUser.username)
        if(tempUser.username !== username){
            const user = await User.findOne({username})
             if(user){
                username= tempUser.username
             }
        }
        
        const updatedData ={
            username,
            bio,
            location,
            full_name
        }
        const profile=req.files.profile && req.files.profile[0]
        const cover=req.files.cover && req.files.cover[0]

        if(profile){
            const buffer =fs.readFileSync(profile.path)
            const response = await imagekit.upload({
                file:buffer,
                fileName: profile.originalname,
            })
            const url=  imagekit.url({
                path:response.filePath,
                transformation:[
                    {quality:'auto'},
                    {format:'webp'},
                    {width :'512'}

                ]
            })
            updatedData.profile_picture=url;

        }
        if(cover){
            const buffer =fs.readFileSync(cover.path)
            const response = await imagekit.upload({
                file:buffer,
                fileName: profile.originalname,
            })
            const url=  imagekit.url({
                path: response.filePath,
                transformation:[
                    {quality:'auto'},
                    {format:'webp'},
                    {width :'1280'}

                ]
            })
            updatedData.cover_photo=url;

        }
        const user=await User.findByIdAndUpdate(userId,updatedData,{new:true})
        res.json({success: true,user,message:'Profile updated successfully'})

        }catch(error){
            console.log(error);
            res.json({success: false,message:error.message})


        }
    }
    //discover
   export const discoverUsers= async(req,res)=>{
    try{
        const {userId} = req.auth();
        const {input}=req.body;
        const allUsers= await User.find(
            {
                $or:[
                    {username:new RegExp(input,'i')},
                    {email:new RegExp(input,'i')},
                    {full_name:new RegExp(input,'i')},
                    {location:new RegExp(input,'i')},
                ]
            }
        )
        const filteredUsers=allUsers.filter(user=> user._id !==userId);
         res.json({success:true,users:filteredUsers})
        
        }catch(error){
            console.log(error);
            res.json({success: false,message:error.message})


        }
    } 
//follow user
    export const followUser= async(req,res)=>{
    try{
        const {userId} = req.auth();
        const {_id}=req.body;

        const user = await User.findById(userId)
        if(user.following.includes(id)){
            return res.json({success:false ,message:'you are already following this user'})
        }
        user.following.push(id);
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers.push(userId)
        await toUser.save()

        res.json({success : true,message:'now you are following this user'})
       
        
        }catch(error){
            console.log(error);
            res.json({success: false,message:error.message})
        }
    }
    // unfollow function  
    export const unfollowUser= async(req,res)=>{
    try{
        const {userId} = req.auth();
        const {_id}=req.body;

        const user = await User.findById(userId)
       
        user.following= user.following.filter(user=> user !==id);
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers= toUser.following.filter(user=> user !==id);
        await toUser.save()

        res.json({success : true,message:'unfollowed user'})
       
        
        }catch(error){
            console.log(error);
            res.json({success: false,message:error.message})
        }
    }

    // Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth(); // assuming req.auth() returns an object with userId
    const { id } = req.body; // 'id' is the target user's ID

    // Check if user has sent more than 20 connection requests in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const connectionRequests = await Connection.find({
      from_user_id: userId,
      createdAt: { $gt: last24Hours } // createdAt comes from timestamps: true
    });

    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message: 'You have sent more than 20 connection requests in the last 24 hours'
      });
    }

    // check if users are already connected
    const connection = await Connection.findOne({
        $or:[
            {rom_user_id: userId,to_user_id:id},
            {rom_user_id:id, to_user_id:userId},
        ]
    })
    if(!connection){
        await Connection.create({
            from_user_id: userId,
            to_user_id: id
        })
        res.json({success : true,message:'Connection request sent successfully'})
    } else if(connection && connection.status==='accepted'){
         return res.json({
        success: false,
        message: 'You are alredy connected with this user'
      })

    }
    return res.json({success:false,message:'Connection request pending'})
    

  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};
// get another connection 
// Get User Connections
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await User.findById(userId)
      .populate('connections followers following')
      
    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    const pendingConnections = (await Connection.find({
      to_user_id: userId,
      status: 'pending'
    }).populate('from_user_id')).map(connection=>connection.from_user_id)

    res.json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections
    })

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth(); 
    const { id } = req.body; 

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
      status: 'pending'
    });

    if (!connection) {
      return res.json({ success: false, message: 'Connection not found' });
    }
    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save()

    const toUser = await User.findById(id);
    toUseruser.connections.push(userId);
    await toUser.save()

    connection.status = 'accepted';
    await connection.save();

    res.json({
      success: true,
      message: 'Connection request accepted successfully'
    });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};