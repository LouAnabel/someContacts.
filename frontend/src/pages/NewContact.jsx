import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoField from '../components/ui/PhotoNewContact.jsx';
import NewContactForm from '../components/forms/newContact/NewContactForm.jsx';

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

export default function NewContact() {
  const navigate = useNavigate();
  const [contactPhoto, setContactPhoto] = useState(null);

  const handlePhotoUpload = (file, previewUrl) => {
    setContactPhoto(previewUrl);
    // TODO: Upload to server when backend is ready
    console.log('Photo uploaded:', file);
  };

  const handleCreateSuccess = (newContact) => {
    console.log('Contact created successfully:', newContact);
    // Navigate to the new contact's page
    navigate(`/myspace/contacts/${newContact.id}`);
  };

  return (
    <div
      className="flex flex-col items-center justify-center mx-auto lg:py-0 mt-10"
      style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}
    >
      {/* Back Button */}
      <div className="relative mt-4 mb-4">
        <Button
          onClick={() => navigate('/myspace/')}
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

      {/* Photo Field - Full width at top */}
      <div className="w-full mb-4">
        <PhotoField
          photo={contactPhoto}
          name="New Contact"
          onUpload={handlePhotoUpload}
          disabled={false}
        />
      </div>

      {/* Contact Form */}
      <div className="w-full pb-40">
        <NewContactForm
          contactPhoto={contactPhoto}
          onCreateSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  );
}