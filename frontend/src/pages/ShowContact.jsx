import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContextProvider';
import { getContactById, getCategories, updateContact, deleteContactById } from '../apiCalls/contactsApi';
import { ApiToFormData } from '../components/helperFunctions/ApiToFormData.jsx';
import { FormToApiData } from '../components/helperFunctions/FormToApiData.jsx';
import PhotoField from '../components/ui/PhotoShowContact.jsx';
import ShowContactForm from '../components/forms/ShowContactForm.jsx';
import EditContactForm from '../components/forms/EditContactForm.jsx';

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
  const { authFetch } = useAuthContext(); 

  // Loading state and Error State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [contactData, setContactData] = useState({});
  const [formData, setFormData] = useState({});
  
  
  const [links, setLinks] = useState([{ title: '', url: '' }]);

  // Photo State
  const [contactPhoto, setContactPhoto] = useState(null);

  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState({}); 

  // Form states for edit mode for Categories
  const [categories, setCategories] = useState([]);

  // Form states for edit mode
  const [showBirthdate, setShowBirthdate] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
 
  // GUARD to prevent duplicate API calls
  const contactFetched = useRef(false);
  const categoriesFetched = useRef(false);

  // ========================================
  // LOAD & HANDLE CONTACT DATA
  // ========================================

  // Fetch contact data on mount
  useEffect(() => {
    const fetchContactData = async () => {
      // GUARD: Prevent duplicate calls
      if (!authFetch || !id || contactFetched.current) return; // ← Changed: check authFetch


      contactFetched.current = true;

      try {
        setIsLoading(true);
        setError(null);

        // fetch and set contactData
        const apiContactData = await getContactById(authFetch, id); // ← Changed: pass authFetch

        setContactData(apiContactData); // contactData from API

        // transform API contactData to form format and set formData
        const newFormData = ApiToFormData(apiContactData);

        setFormData(newFormData); // -> formData

        // Set photo if available
        if (apiContactData.profile_photo) {
          setContactPhoto(apiContactData.profile_photo);
        }

        // Initialize optional sections with the NEW form data
        setShowBirthdate(!!newFormData.birthdate);
        setShowAddress(
          !!(newFormData.streetAndNr || newFormData.city || 
            newFormData.country || newFormData.postalcode)
        );
        setShowContactDetails(
          !!(newFormData.lastContactDate || newFormData.nextContactDate)
        );
        
        const hasLinks = newFormData.links && newFormData.links.length > 0;
        setShowLinks(hasLinks);
        setLinks(hasLinks ? newFormData.links : [{ title: '', url: '' }]);
      
      } catch (error) {
        console.error('Contact fetch failed:', error);
        setError(error.message || 'Failed to load contact data');
        setContactData({});
        setFormData({});
        contactFetched.current = false;

      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, [authFetch, id]); // ← Changed: authFetch dependency

  // Reset guard when component unmounts or ID changes
  useEffect(() => {
    return () => {
      contactFetched.current = false;
      categoriesFetched.current = false;
    };
  }, [id]);

  // ========================================
  // LOAD & HANDLE CATEGORIES
  // ========================================

  // Categories loading with guard
  useEffect(() => {
    const loadCategories = async () => {
      // GUARD: Prevent duplicate calls
      if (!authFetch || categoriesFetched.current) return; // ← Changed: check authFetch
      categoriesFetched.current = true;

      try {
        const categoriesData = await getCategories(authFetch); // ← Changed: pass authFetch

        setCategories(categoriesData);

      } catch (error) {   
        console.error('Failed to load categories:', error);
        setCategories([]);
        categoriesFetched.current = false;
      }
    };

    loadCategories();
  }, [authFetch]); // ← Changed: authFetch dependency

  // ========================================
  // TOGGLE FUNCTIONS
  // ========================================

  // Handle FavoriteToggle
  const handleFavoriteToggle = async () => {
    const newFavoriteState = !formData.isFavorite;

    try {
      setFormData(prev => ({...prev, isFavorite: newFavoriteState}));
      
      if (!authFetch) { // ← Changed: check authFetch
        throw new Error("Authentication not available.");
      }

      // Send ONLY the favorite status - minimal payload!
      const minimalUpdateData = {
        is_favorite: newFavoriteState
      };


      const apiResponse = await updateContact(authFetch, formData.id, minimalUpdateData); // ← Changed: pass authFetch
      
      if (!apiResponse) {
        throw new Error('Failed to update favorite status');
      }

      // Update contact data to match
      setContactData(prev => ({ ...prev, is_favorite: newFavoriteState }));
      
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Revert the UI change if API call failed
      setFormData(prev => ({ ...prev, isFavorite: !newFavoriteState }));
      setError(`Failed to update favorite status: ${error.message}`);
    }
  };

  // Handle IsContactedToggle
  const handleIsContactedToggle = async () => {
    const newIsContactedState = !formData.isContacted;

    try {
      setFormData(prev => ({...prev, isContacted: newIsContactedState}));
      
      if (!authFetch) { // ← Changed: check authFetch
        throw new Error("Authentication not available.");
      }

      const minimalUpdateData = {
        is_contacted: newIsContactedState
      };


      const apiResponse = await updateContact(authFetch, formData.id, minimalUpdateData); // ← Changed: pass authFetch
      
      if (!apiResponse) {
        throw new Error('Failed to update contacted status');
      }

      setContactData(prev => ({ ...prev, is_contacted: newIsContactedState }));
      
    } catch (error) {
      console.error('Error updating contacted status:', error);
      setFormData(prev => ({ ...prev, isContacted: !newIsContactedState }));
      setError(`Failed to update contacted status: ${error.message}`);
    }
  };

  // Handle IsToContactToggle
  const handleIsToContactToggle = async () => {
    const newIsToContactState = !formData.isToContact;

    try {
      setFormData(prev => ({...prev, isToContact: newIsToContactState}));
      
      if (!authFetch) { // ← Changed: check authFetch
        throw new Error("Authentication not available.");
      }

      const minimalUpdateData = {
        is_to_contact: newIsToContactState
      };


      const apiResponse = await updateContact(authFetch, formData.id, minimalUpdateData); // ← Changed: pass authFetch
      
      if (!apiResponse) {
        throw new Error('Failed to update to contact status');
      }

      setContactData(prev => ({ ...prev, is_to_contact: newIsToContactState }));
      
    } catch (error) {
      console.error('Error updating to contact status:', error);
      setFormData(prev => ({ ...prev, isToContact: !newIsToContactState }));
      setError(`Failed to update to contact status: ${error.message}`);
    }
  };
  
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

  // ========================================
  // RENDERING
  // ========================================

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

      {/* Photo Field */}
      <div className={isEditing ? "w-full pb-6" : "mb-4"}>
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
          <ShowContactForm
            contactData={contactData}
            formData={formData}
            navigate={navigate}
            handleFavoriteToggle={handleFavoriteToggle}
            handleIsContactedToggle={handleIsContactedToggle}
            handleIsToContactToggle={handleIsToContactToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNavigate={navigate}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <EditContactForm
            contactData={contactData}
            handleFavoriteToggle={handleFavoriteToggle}
            handleIsContactedToggle={handleIsContactedToggle}
            handleIsToContactToggle={handleIsToContactToggle}
            onCancel={handleCancelEdit}
            onSaveSuccess={handleSaveSuccess}
            onDelete={handleDelete}
            authFetch={authFetch} // ← Changed: pass authFetch instead of accessToken
          />
        )}
      </div>
    </div>
  );
}