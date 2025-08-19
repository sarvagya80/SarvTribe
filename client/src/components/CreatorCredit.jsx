import React from 'react';

// SVG icons for a clean, self-contained component
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);


const CreatorCredit = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow text-center">
      <h3 className="font-bold text-lg text-gray-800">Sarvagya Pathak</h3>
      <p className="text-sm text-gray-500 mb-4">Full-Stack Developer</p>
      
      <div className="flex justify-center items-center space-x-4">
        <a href="mailto:adityapathak@gmail.com" title="Email" className="text-gray-600 hover:text-indigo-600 transition-colors">
          <MailIcon />
        </a>
        <a href="https://www.linkedin.com/in/sarvagya-pathak-845735249/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-gray-600 hover:text-indigo-600 transition-colors">
          <LinkedInIcon />
        </a>
        <a href="https://www.instagram.com/sarvagya8pathak" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-gray-600 hover:text-indigo-600 transition-colors">
          <InstagramIcon />
        </a>
      </div>
    </div>
  );
};

export default CreatorCredit;