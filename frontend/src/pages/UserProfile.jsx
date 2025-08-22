import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContextProvider';
import { authMe } from '../apiCalls/authApi';
import PhotoField from '../components/ui/PhotoField';
import CircleButton from '../components/ui/Buttons';

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
  const { accessToken, user } = useAuthContext();
  console.log(user)

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePhoto: null
  });

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        profilePhoto: user.profile_photo || null
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors if user has already submitted once
    if (hasSubmitted && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation (only if changing password)
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setHasSubmitted(false);
    setErrors({});
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      profilePhoto: user?.profile_photo || null
    });

    setIsEditing(false);
    setHasSubmitted(false);
    setErrors({});
    setError(null);
    setSuccess(null);
    setShowPasswordFields(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim()
      };

      // Add password data if changing password
      if (showPasswordFields) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }

      // TODO: Add your API call here
      // const response = await updateUserProfile(accessToken, updateData);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setShowPasswordFields(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          profilePhoto: previewUrl
        }));
        
        // TODO: Upload to server
        console.log('Photo selected for upload:', file);
      }
    };
    input.click();
  };

  const handleTakePhoto = () => {
    // TODO: Implement camera functionality
    console.log('Take photo clicked');
  };

  const clearMessage = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-white dark:bg-gray-900"
         style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
      
      {/* Header */}
      <div className="w-full text-center">
        <div className="relative items-center mt-14 -mb-14">
          <Button 
            onClick={() => navigate('/myspace/')}
            className="text-black dark:text-white hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
        
        <h1 className="pt-10 text-3xl font-bold text-gray-900 dark:text-white mb-8 mt-6">
          {isEditing ? (
            <>Edit <span className="text-red-500">Profile</span></>
          ) : (
            <>Your <span className="text-red-500">Profile</span></>
          )}
        </h1>
      </div>

      {/* Success/Error Messages */}
      {(error || success) && (
        <div className="w-full max-w-2xl px-4 mb-6">
          <div className={`${success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-xl px-3 py-2 flex items-center justify-between`}>
            <p className={`${success ? 'text-green-600' : 'text-red-600'} font-extralight`}>
              {success || error}
            </p>
            <button
              onClick={clearMessage}
              className={`${success ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'} ml-4`}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-20">
        <form onSubmit={handleSave}>
           <div className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] mx-auto"
                style={{ 
                    boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
                }}>

            {/* Profile Photo */}
            <div className="mb-8">
              <PhotoField
                photo={formData.profilePhoto}
                name={`${formData.firstName} ${formData.lastName}`}
                onUpload={isEditing ? handlePhotoUpload : undefined}
                onTakePhoto={isEditing ? handleTakePhoto : undefined}
                className="mx-auto"
              />
            </div>

            {/* User Information */}
            <div className="space-y-6 mb-12">
              
              {/* First Name */}
              <div className="relative">
                <label htmlFor="firstName" className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight">
                  first name
                </label>
                <input 
                  type="text" 
                  name="firstName" 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border bg-white  hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500  disabled:cursor-not-allowed ${
                    hasSubmitted && errors.firstName ? 'border-red-400' : 'border-gray-400 '
                  }`}
                  style={{
                    fontSize: '17px',
                    fontWeight: 200
                  }}
                />
                {hasSubmitted && errors.firstName && (
                  <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="relative">
                <label htmlFor="lastName" className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight">
                  last name
                </label>
                <input 
                  type="text" 
                  name="lastName" 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-light placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500  disabled:cursor-not-allowed ${
                    hasSubmitted && errors.lastName ? 'border-red-400' : 'border-gray-400 '
                  }`}
                  style={{
                    fontSize: '17px',
                    fontWeight: 200
                  }}
                />
                {hasSubmitted && errors.lastName && (
                  <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <label htmlFor="email" className="absolute -top-3 left-4 bg-white  px-1 text-base text-black  font-extralight">
                  email address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black dark:text-white font-light placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500  disabled:cursor-not-allowed ${
                    hasSubmitted && errors.email ? 'border-red-400' : 'border-gray-400 '
                  }`}
                  style={{
                    fontSize: '17px',
                    fontWeight: 200
                  }}
                />
                {hasSubmitted && errors.email && (
                  <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.email}</p>
                )}
              </div>

              {/* Change Password Toggle */}
              {isEditing && (
                <div className="relative">
                  {!showPasswordFields ? (
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields(true)}
                      className="flex items-center ml-1.5 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
                    >
                      <span className="text-lg font-semibold">+</span>
                      <span className="text-base text-black dark:text-white hover:text-red-500">change password</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="relative left-2 text-red-500 font-extralight">
                          password information
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordFields(false);
                            setFormData(prev => ({ 
                              ...prev, 
                              currentPassword: '', 
                              newPassword: '', 
                              confirmPassword: '' 
                            }));
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-extralight"
                        >
                          remove
                        </button>
                      </div>
                      
                      {/* Current Password */}
                      <div className="relative">
                        <label htmlFor="currentPassword" className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-1 text-base text-black dark:text-white font-extralight">
                          current password
                        </label>
                        <input 
                          type="password" 
                          name="currentPassword" 
                          id="currentPassword" 
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className={`w-full rounded-xl border bg-white dark:bg-gray-700 hover:border-red-300 dark:hover:border-red-300 text-black dark:text-white font-light h-[48px] focus:outline-none focus:border-red-500 ${
                            hasSubmitted && errors.currentPassword ? 'border-red-400' : 'border-gray-400 dark:border-gray-600'
                          }`}
                          style={{
                            fontSize: '17px',
                            fontWeight: 200
                          }}
                        />
                        {hasSubmitted && errors.currentPassword && (
                          <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.currentPassword}</p>
                        )}
                      </div>

                      {/* New Password */}
                      <div className="relative">
                        <label htmlFor="newPassword" className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-1 text-base text-black dark:text-white font-extralight">
                          new password
                        </label>
                        <input 
                          type="password" 
                          name="newPassword" 
                          id="newPassword" 
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className={`w-full rounded-xl border bg-white dark:bg-gray-700 hover:border-red-300 dark:hover:border-red-300 text-black dark:text-white font-light h-[48px] focus:outline-none focus:border-red-500 ${
                            hasSubmitted && errors.newPassword ? 'border-red-400' : 'border-gray-400 dark:border-gray-600'
                          }`}
                          style={{
                            fontSize: '17px',
                            fontWeight: 200
                          }}
                        />
                        {hasSubmitted && errors.newPassword && (
                          <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.newPassword}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="relative">
                        <label htmlFor="confirmPassword" className="absolute -top-3 left-4 bg-white dark:bg-gray-800 px-1 text-base text-black dark:text-white font-extralight">
                          confirm new password
                        </label>
                        <input 
                          type="password" 
                          name="confirmPassword" 
                          id="confirmPassword" 
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full rounded-xl border bg-white dark:bg-gray-700 hover:border-red-300 dark:hover:border-red-300 text-black dark:text-white font-light h-[48px] focus:outline-none focus:border-red-500 ${
                            hasSubmitted && errors.confirmPassword ? 'border-red-400' : 'border-gray-400 dark:border-gray-600'
                          }`}
                          style={{
                            fontSize: '17px',
                            fontWeight: 200
                          }}
                        />
                        {hasSubmitted && errors.confirmPassword && (
                          <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing ? (
              <div className="absolute font-semibold -bottom-[85px] -right-[10px]">
                <CircleButton
                  size="xl"
                  variant="dark"
                  type="submit"
                  className="font-semibold"
                  disabled={isSaving}
                >
                  {isSaving ? 'saving...' : 'save.'}
                </CircleButton>
              </div>
            ) : (
              <div className="absolute font-semibold -bottom-[85px] -right-[10px]">
                <CircleButton
                  size="xl"
                  variant="dark"
                  type="button"
                  onClick={handleEdit}
                  className="font-semibold"
                >
                  edit.
                </CircleButton>
              </div>
            )}
          </div>
        </form>

        {/* Cancel Link */}
        {isEditing && (
          <div className="w-full px-8 mt-2 space-y-0.25 max-w-[480px] ml-20">
            <span className="text-black dark:text-white font-extralight">
              want to cancel? {' '}
              <button 
                onClick={handleCancel}
                className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
                disabled={isSaving}
              >
                go back.
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}