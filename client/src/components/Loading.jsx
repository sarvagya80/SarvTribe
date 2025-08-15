import React from 'react';

const Loading = ({ 
  height = '100vh', 
  size = '10', // e.g., '10', '12', '16'
  color = 'purple-500' // e.g., 'purple-500', 'blue-500'
}) => {
  return (
    // Add role="status" for screen readers to announce that a process is busy
    <div style={{ height }} className='flex items-center justify-center' role="status">
      {/* Dynamic size and color classes are now applied */}
      <div 
        className={`w-${size} h-${size} rounded-full border-4 border-${color} border-t-transparent animate-spin`}
      ></div>
      {/* This text is visually hidden but read by screen readers */}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;