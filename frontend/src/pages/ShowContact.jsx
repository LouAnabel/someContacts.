import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContextProvider';
import { getContactById } from '../apiCalls/contactsApi';
import PhotoField from '../components/ui/PhotoShowContact.jsx';
import ViewContact from '../components/forms/ShowContactForm';
import EditContact from '../components/forms/EditContactForm.jsx';

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


export default function ShowContact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuthContext();

  // State
  const [contactData, setContactData] = useState({});
  const [contactPhoto, setContactPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // GUARD to prevent duplicate API calls
  const contactFetched = useRef(false);

  // Fetch contact data on mount
  useEffect(() => {
    const fetchContactData = async () => {
      // GUARD: Prevent duplicate calls
      if (!accessToken || !id || contactFetched.current) return;

      console.log('ShowContactPage: Starting contact fetch for ID:', id);
      contactFetched.current = true;

      try {
        setIsLoading(true);
        setError(null);

        const apiContactData = await getContactById(accessToken, id);
        console.log('Contact data received from API:', apiContactData);
        setContactData(apiContactData);

        // Set photo if available
        if (apiContactData.profile_photo) {
          setContactPhoto(apiContactData.profile_photo);
        }
      } catch (error) {
        console.error('Contact fetch failed:', error);
        setError(error.message || 'Failed to load contact data');
        contactFetched.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, [accessToken, id]);

  // Reset guard when component unmounts or ID changes
  useEffect(() => {
    return () => {
      contactFetched.current = false;
    };
  }, [id]);

  const handlePhotoUpload = (file, previewUrl) => {
    setContactPhoto(previewUrl);
    // TODO: Upload to server when backend is ready
    console.log('Photo uploaded:', file);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveSuccess = (updatedContact) => {
    setContactData(updatedContact);
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Navigate back to contacts list
    navigate('/myspace/contacts', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-black dark:text-white text-xl font-extralight">Loading...</div>
      </div>
    );
  }

  if (error && !contactData.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-red-500 text-xl font-extralight">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center mx-auto lg:py-0 mt-10"
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

      {/* Photo Field */}
      <div className={isEditing ? "w-full pb-6" : "mb-6"}>
        <PhotoField
          photo={contactPhoto}
          name={`${contactData.first_name || ''} ${contactData.last_name || ''}`.trim()}
          onUpload={handlePhotoUpload}
          disabled={!isEditing}
        />
      </div>

      {/* Contact View or Edit */}
      <div className="w-full">
        {!isEditing ? (
          <ViewContact
            contactData={contactData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNavigate={navigate}
          />
        ) : (
          <EditContact
            contactData={contactData}
            onCancel={handleCancelEdit}
            onSaveSuccess={handleSaveSuccess}
            onDelete={handleDelete}
            accessToken={accessToken}
          />
        )}
      </div>
    </div>
  );
}
