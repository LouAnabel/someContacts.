import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContextProvider';
import { authMe } from '../apiCalls/authApi';
import PhotoField from '../components/ui/PhotoShowContact';
import EditUserProfile from '../components/forms/UserProfileEdit';
import ShowUserProfile from '../components/forms/UserProfileShow';

const Button = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`text-black dark:text-white hover:text-red-500 dark:hover:text-red-500 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function UserProfile() {
  const navigate = useNavigate();
  const { accessToken, authFetch } = useAuthContext();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userData, setUserData] = useState({});
  const [formData, setFormData] = useState({});
  const [links, setLinks] = useState([{ title: '', url: '' }]);

  // Photo State
  const [contactPhoto, setContactPhoto] = useState(null);

  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // GUARD to prevent duplicate API calls
  const userFetched = useRef(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authFetch || userFetched.current) return; // ← Changed: check authFetch


      userFetched.current = true;

      try {
        setIsLoading(true);
        setError(null);

        const apiUserData = await authMe(accessToken); // ← Changed: pass authFetch

        setUserData(apiUserData);

      } catch (error) {
        console.error('User fetch failed:', error);
        setError(error.message || 'Failed to load user data');
        userFetched.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authFetch]); // ← Changed: authFetch dependency

  // Reset guard when component unmounts
  useEffect(() => {
    return () => {
      userFetched.current = false;
    };
  }, []);

  // ========================================
  // HANDLE FORM FUNKTIONS
  // ========================================

  const handlePhotoUpload = (file, previewUrl) => {
    setContactPhoto(previewUrl);
    // TODO: Upload to server when backend is ready

  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Navigate back to contacts list
    navigate('/myspace/contacts', { replace: true });
  };

  const handleSaveSuccess = (updatedUserData) => {
    setUserData(updatedUserData);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-black dark:text-white text-xl font-extralight">Loading...</div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-red-500 text-xl font-extralight">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center mx-auto lg:py-0 mt-10 bg-white dark:bg-black"
      style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}
    >
      {/* Back Button */}
      <div className="relative mt-4 mb-4">
        <Button
          onClick={() => navigate(-1)}
          className="text-black dark:text-white hover:text-red-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>


      {/* Profile Photo */}
      <div className="flex justify-center mb-6">
        <PhotoField
          photo={userData.profile_photo}
          onUpload={handlePhotoUpload}
          disabled={!isEditing}
          size="large"
          name={`${userData.first_name} ${userData.last_name}`}
        />
      </div>


      {!isEditing ? (
        <ShowUserProfile
          userData={userData}
          onEdit={handleEdit}
          authFetch={authFetch}
          onDelete={handleDelete}
          onNavigate={navigate}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ) : (
        <EditUserProfile
          userData={userData}
          onCancel={handleCancel}
          onSaveSuccess={handleSaveSuccess}
          authFetch={authFetch} // ← Changed: pass authFetch instead of accessToken
        />
      )}
    </div>
  );
}