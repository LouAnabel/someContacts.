import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContextProvider';
import { authMe} from '../apiCalls/authApi';
import ShowUserProfile from '../components/forms/userProfileShow.jsx';
import EditUserProfile from '../components/forms/userProfileEdit.jsx';


export default function UserProfile() {
  const navigate = useNavigate();
  const { accessToken} = useAuthContext();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);


  // GUARD to prevent duplicate API calls
  const userFetched = useRef(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!accessToken || userFetched.current) return;

      console.log('UserProfilePage: Starting user fetch');
      userFetched.current = true;

      try {
        setIsLoading(true);
        setError(null);

        const apiUserData = await authMe(accessToken);
        console.log('User data received from API:', apiUserData);
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
  }, [accessToken]);


  // Reset guard when component unmounts
  useEffect(() => {
    return () => {
      userFetched.current = false;
    };
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
      className="justify-items items-center min-h-screen bg-white dark:bg-gray-900 p-5 absolute top-[120px]"
      style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}
    >
      {!isEditing ? (
        <ShowUserProfile
          userData={userData}
          onEdit={handleEdit}
          accessToken={accessToken}
          onNavigate={navigate}
        />
      ) : (
        <EditUserProfile
          userData={userData}
          onCancel={handleCancel}
          onSaveSuccess={handleSaveSuccess}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}