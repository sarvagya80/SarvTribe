import React from 'react';

// Map props to full Tailwind classes
const sizeClasses = {
  '10': 'w-10 h-10',
  '12': 'w-12 h-12',
  '16': 'w-16 h-16',
};

const colorClasses = {
  'purple-500': 'border-purple-500',
  'blue-500': 'border-blue-500',
  'white': 'border-white',
};

const Loading = ({ 
  height = '100vh', 
  size = '10',
  color = 'purple-500'
}) => {
  // ✅ Select the class from the map, with a fallback
  const sizeClass = sizeClasses[size] || sizeClasses['10'];
  const colorClass = colorClasses[color] || colorClasses['purple-500'];

  return (
    <div style={{ height }} className='flex items-center justify-center' role="status">
      <div 
        // ✅ Apply the full class names
        className={`${sizeClass} rounded-full border-4 ${colorClass} border-t-transparent animate-spin`}
      ></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;