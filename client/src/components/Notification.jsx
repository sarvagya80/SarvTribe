import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// A fallback user object to prevent crashes if sender data is ever incomplete
const defaultUser = {
  _id: 'unknown',
  full_name: 'Unknown User',
  profile_picture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
};

const Notification = ({ t, message }) => {
  const navigate = useNavigate();

  // ✅ Safely access the sender's data to prevent your app from crashing
  const sender = message?.from_user_id || defaultUser;

  // Render nothing if essential props are missing
  if (!t || !message) {
    return null;
  }

  // A single, clean function to handle the click action
  const handleNotificationClick = () => {
    toast.dismiss(t.id); // ✅ Corrected typo from "dissmiss" to "dismiss"
    navigate(`/messages/${sender._id}`);
  };

  return (
    // ✅ Make the entire notification clickable and accessible for keyboard and screen reader users
    <div
      onClick={handleNotificationClick}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNotificationClick()}
      className="max-w-md w-full bg-white shadow-lg rounded-lg flex border border-gray-200 hover:shadow-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex-1 p-4">
        <div className="flex items-start">
          <img
            src={sender.profile_picture}
            alt={`${sender.full_name}'s profile`} // ✅ Added descriptive alt text for accessibility
            className="h-10 w-10 rounded-full flex-shrink-0 object-cover"
          />
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-900">
              {sender.full_name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {message.text || 'Sent you a message.'}
            </p>
          </div>
        </div>
      </div>
      <div className='flex border-l border-gray-200'>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents the main div's click from firing again
            handleNotificationClick();
          }}
          className='p-4 text-sm text-indigo-600 font-semibold hover:bg-gray-50 rounded-r-lg'
        >
          Reply
        </button>
      </div>
    </div>
  );
};

// ✅ Added PropTypes to ensure the component receives the data it needs
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