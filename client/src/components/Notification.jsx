import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// A default user object to prevent crashes if data is missing
const defaultUser = {
  _id: 'unknown',
  full_name: 'Unknown User',
  profile_picture: 'default-avatar.png', // A path to a default avatar in your assets
};

const Notification = ({ t, message }) => {
  const navigate = useNavigate();

  // Safely access the sender's data, using the default if necessary
  const sender = message?.from_user_id || defaultUser;

  // Render nothing if the toast or message is invalid
  if (!t || !message) {
    return null;
  }

  const handleNotificationClick = () => {
    toast.dismiss(t.id);
    navigate(`/messages/${sender._id}`);
  };

  return (
    <div
      onClick={handleNotificationClick}
      // Make the div accessible to keyboard users
      role="button"
      tabIndex="0"
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNotificationClick()}
      className="max-w-md w-full bg-white shadow-lg rounded-lg flex border border-gray-300 hover:scale-105 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex-1 p-4">
        <div className="flex items-start">
          <img
            src={sender.profile_picture}
            alt={`${sender.full_name}'s profile`}
            className="h-10 w-10 rounded-full flex-shrink-0 mt-0.5"
          />
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {sender.full_name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {message.text}
            </p>
          </div>
        </div>
      </div>
      <div className='flex border-l border-gray-200'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNotificationClick();
          }}
          className='p-4 text-indigo-600 font-semibold'
        >
          Reply
        </button>
      </div>
    </div>
  );
};

// Add prop types for developer safety and self-documentation
Notification.propTypes = {
  t: PropTypes.object.isRequired,
  message: PropTypes.shape({
    text: PropTypes.string,
    from_user_id: PropTypes.shape({
      _id: PropTypes.string,
      full_name: PropTypes.string,
      profile_picture: PropTypes.string,
    }),
  }).isRequired,
};

export default Notification;