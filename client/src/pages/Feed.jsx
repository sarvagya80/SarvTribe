import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading'; // ✅ replace with correct path to your Loading component
import { assets, dummyPostsData } from '../assets/assets';
import StoriesBar from '../components/StoriesBar'; // ✅ replace with correct path to your StoriesBar component 
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';


const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    // Simulate API call or use dummy data
    setFeeds(dummyPostsData); // ✅ make sure dummyPostData is defined in assets.js
    setLoading(false);       // ✅ VERY important to update loading
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  if (loading) return <Loading />;

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">

     
      <div>
         <StoriesBar />
        <div className="p-4 space-y-6">
         {feeds.map((post)=>(
          <PostCard key={post._id} post={post}/>
         ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className='sticky top-0'>
        <div className='max-w-xs bg-white test-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
          <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
          <img src={assets.sponsored_img} className='w-75 h-50 rounded-md'/>
          <p className='text-slate-600'>Email Marketing</p>
          <p className='text-slate-400'>Supercharge your Marketing with powerful,easy-to-use platform </p>
        </div>
        <RecentMessages/>
      </div>
    </div>
  ):<Loading />; // ✅ make sure Loading component is defined
}

export default Feed;
