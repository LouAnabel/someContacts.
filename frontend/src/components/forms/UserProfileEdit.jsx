import { useState } from 'react';
import { updateUserData } from '../../apiCalls/authApi';
import CircleButton from '../ui/Buttons';
import PhotoField from '../ui/PhotoShowContact.jsx';

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

export default function EditUserProfile({ userData, onCancel, onSaveSuccess, accessToken }) {
  // Form state
  const [formData, setFormData] = useState({
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    email: userData.email || '',
    birthdate: userData.birth_date || '',
    profilePhoto: userData.profile_photo || null //doesn't exist yet in userData
  });


  // Multi-field states
  const [emails, setEmails] = useState(
    userData.emails && userData.emails.length > 0 ? userData.emails : [{ email: '', title: '' }]
  );
  const [phones, setPhones] = useState(
    userData.phones && userData.phones.length > 0 ? userData.phones : [{ phone: '', title: '' }]
  );
  const [addresses, setAddresses] = useState(
    userData.addresses && userData.addresses.length > 0
      ? userData.addresses
      : [{ street_and_nr: '', additional_info: '', postal_code: '', city: '', country: '', title: '' }]
  );
  const [links, setLinks] = useState(
    userData.links && userData.links.length > 0 ? userData.links : [{ title: '', url: '' }]
  );

  // Password change
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (hasSubmitted && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));

    if (hasSubmitted && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUpload = (file, previewUrl) => {
    setFormData(prev => ({ ...prev, profilePhoto: previewUrl }));
    // TODO: Upload to server when backend is ready
  };

  // Email handlers
  const handleEmailChange = (index, field, value) => {
    const newEmails = [...emails];
    newEmails[index] = { ...newEmails[index], [field]: value };
    setEmails(newEmails);
  };

  const addEmail = () => setEmails([...emails, { email: '', title: '' }]);
  const removeEmail = (index) => {
    if (emails.length > 1) setEmails(emails.filter((_, i) => i !== index));
  };

  // Phone handlers
  const handlePhoneChange = (index, field, value) => {
    const newPhones = [...phones];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setPhones(newPhones);
  };

  const addPhone = () => setPhones([...phones, { phone: '', title: '' }]);
  const removePhone = (index) => {
    if (phones.length > 1) setPhones(phones.filter((_, i) => i !== index));
  };

  // Address handlers
  const handleAddressChange = (index, field, value) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setAddresses(newAddresses);
  };

  const addAddress = () =>
    setAddresses([
      ...addresses,
      { street_and_nr: '', additional_info: '', postal_code: '', city: '', country: '', title: '' }
    ]);
  const removeAddress = (index) => {
    if (addresses.length > 1) setAddresses(addresses.filter((_, i) => i !== index));
  };

  // Link handlers
  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];

    // Auto-format URL
    if (field === 'url' && value.trim()) {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        if (value.includes('.')) {
          value = 'https://' + value;
        }
      }
    }

    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const addLink = () => setLinks([...links, { title: '', url: '' }]);
  const removeLink = (index) => {
    if (links.length > 1) setLinks(links.filter((_, i) => i !== index));
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

    // Birthdate validation
    if (formData.birthdate && formData.birthdate.trim()) {
      const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
      if (!dateRegex.test(formData.birthdate)) {
        newErrors.birthdate = 'Date must be in format DD.MM.YYYY';
      } else {
        const [day, month, year] = formData.birthdate.split('.').map(Number);
        const date = new Date(year, month - 1, day);
        if (date > new Date()) {
          newErrors.birthdate = 'Birthdate cannot be in the future';
        }
      }
    }

    // Password validation
    if (showPasswordFields) {
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!passwordData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      } else if (!/[A-Z]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain an uppercase letter';
      } else if (!/[a-z]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain a lowercase letter';
      } else if (!/\d/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain a number';
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Validate emails
    emails.forEach((emailItem, index) => {
      const hasEmail = emailItem.email && emailItem.email.trim();
      const hasTitle = emailItem.title && emailItem.title.trim();

      if (hasEmail && !hasTitle) {
        newErrors[`email_${index}`] = 'Title for email required';
      }
      if (hasEmail && !/\S+@\S+\.\S+/.test(emailItem.email)) {
        newErrors[`email_${index}`] = 'Invalid email format';
      }
    });

    // Validate phones
    phones.forEach((phoneItem, index) => {
      const hasPhone = phoneItem.phone && phoneItem.phone.trim();
      const hasTitle = phoneItem.title && phoneItem.title.trim();

      if (hasPhone && !hasTitle) {
        newErrors[`phone_${index}`] = 'Title for phone required';
      }
    });

    // Validate addresses
    addresses.forEach((address, index) => {
      const hasAnyAddressField = address.street_and_nr || address.city || address.country || address.postal_code;
      const hasTitle = address.title && address.title.trim();

      if (hasAnyAddressField && !hasTitle) {
        newErrors[`address_${index}`] = 'Title for address required';
      }
    });

    // Validate links
    links.forEach((link, index) => {
      const hasUrl = link.url && link.url.trim();
      const hasTitle = link.title && link.title.trim();

      if (hasUrl && !hasTitle) {
        newErrors[`link_${index}`] = 'Title for URL required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!accessToken) {
        throw new Error('Access token is not available.');
      }

      // Filter out empty entries
      const filteredEmails = emails.filter(e => e.email && e.email.trim() && e.title && e.title.trim());
      const filteredPhones = phones.filter(p => p.phone && p.phone.trim() && p.title && p.title.trim());
      const filteredAddresses = addresses.filter(
        a => (a.street_and_nr || a.city || a.country || a.postal_code) && a.title && a.title.trim()
      );
      const filteredLinks = links.filter(l => l.url && l.url.trim() && l.title && l.title.trim());

      // Prepare update data
      const updateData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        birth_date: formData.birthdate || null,
        emails: filteredEmails,
        phones: filteredPhones,
        addresses: filteredAddresses,
        links: filteredLinks
      };

      // Add password change if requested
      if (showPasswordFields) {
        updateData.current_password = passwordData.currentPassword;
        updateData.new_password = passwordData.newPassword;
      }

      console.log('Updating user with data:', updateData);

      const apiUserData = await updateUserData(accessToken, updateData);

      if (!apiUserData) {
        throw new Error('Failed to update profile - no response from server');
      }

      console.log('Profile updated successfully:', apiUserData);

      setSuccess('Profile updated successfully!');

      // Call parent callback with updated data
      onSaveSuccess(apiUserData.user);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.data?.message || error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[480px] mx-auto">
      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600 text-center font-extralight">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center font-extralight">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div
          className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px]"
          style={{
            boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
          }}
        >
          <h1 className="text-3xl font-bold mt-2 mb-10 text-center text-black">
            edit profile.
          </h1>

          <div className="space-y-5 mb-14">
            {/* Profile Photo */}
            <div className="flex justify-center mb-6">
              <PhotoField
                photo={formData.profilePhoto} //doesn't exist yet in userData
                onUpload={handlePhotoUpload}
                disabled={false}
                size="large"
                userName={`${formData.firstName} ${formData.lastName}`}
              />
            </div>

            {/* First Name */}
            <div className="relative">
              <label
                htmlFor="firstName"
                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
              >
                first name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-light placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500 ${
                  hasSubmitted && errors.firstName ? 'border-red-500 shadow-md' : 'border-gray-400'
                }`}
                style={{ fontSize: '17px', fontWeight: 200 }}
              />
              {hasSubmitted && errors.firstName && (
                <p className="absolute top-full right-1 font-extralight text-sm text-red-600 z-20">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="relative">
              <label
                htmlFor="lastName"
                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
              >
                last name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-light placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500 ${
                  hasSubmitted && errors.lastName ? 'border-red-500 shadow-md' : 'border-gray-400'
                }`}
                style={{ fontSize: '17px', fontWeight: 200 }}
              />
              {hasSubmitted && errors.lastName && (
                <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.lastName}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="relative">
              <label
                htmlFor="email"
                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
              >
                account email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                disabled={true}
                className="w-full rounded-xl border bg-gray-100 text-gray-600 font-light h-[48px] cursor-not-allowed border-gray-300"
                style={{ fontSize: '17px', fontWeight: 200 }}
              />
              <p className="text-gray-400 text-[13px] font-extralight ml-2 mt-1">Email cannot be changed</p>
            </div>

            {/* Birthdate */}
            <div className="relative">
              <label
                htmlFor="birthdate"
                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
              >
                birthdate
              </label>
              <input
                type="text"
                name="birthdate"
                id="birthdate"
                value={formData.birthdate}
                onChange={handleInputChange}
                placeholder="DD.MM.YYYY"
                className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-light placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500 ${
                  hasSubmitted && errors.birthdate ? 'border-red-500 shadow-md' : 'border-gray-400'
                }`}
                style={{ fontSize: '17px', fontWeight: 200 }}
              />
              {hasSubmitted && errors.birthdate && (
                <p className="absolute top-full right-1 font-extralight text-sm text-red-600 z-20">
                  {errors.birthdate}
                </p>
              )}
            </div>

            {/* Additional Emails */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="relative text-red-500 left-2 tracking-wide font-extralight">additional emails</p>
                <Button type="button" onClick={addEmail} className="text-sm font-light text-red-500 hover:underline">
                  + add
                </Button>
              </div>
              {emails.map((email, index) => (
                <div key={index} className="space-y-2 mb-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Email {index + 1}</span>
                    {emails.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeEmail(index)}
                        className="text-sm font-light text-gray-400 hover:text-red-500"
                      >
                        remove
                      </Button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={email.title}
                    onChange={(e) => handleEmailChange(index, 'title', e.target.value)}
                    placeholder="Work, Personal, etc."
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="email"
                    value={email.email}
                    onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  {hasSubmitted && errors[`email_${index}`] && (
                    <p className="text-sm text-red-600 font-extralight">{errors[`email_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Phone Numbers */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="relative text-red-500 left-2 tracking-wide font-extralight">phone numbers</p>
                <Button type="button" onClick={addPhone} className="text-sm font-light text-red-500 hover:underline">
                  + add
                </Button>
              </div>
              {phones.map((phone, index) => (
                <div key={index} className="space-y-2 mb-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Phone {index + 1}</span>
                    {phones.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePhone(index)}
                        className="text-sm font-light text-gray-400 hover:text-red-500"
                      >
                        remove
                      </Button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={phone.title}
                    onChange={(e) => handlePhoneChange(index, 'title', e.target.value)}
                    placeholder="Mobile, Work, etc."
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="tel"
                    value={phone.phone}
                    onChange={(e) => handlePhoneChange(index, 'phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  {hasSubmitted && errors[`phone_${index}`] && (
                    <p className="text-sm text-red-600 font-extralight">{errors[`phone_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Addresses */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="relative text-red-500 left-2 tracking-wide font-extralight">addresses</p>
                <Button type="button" onClick={addAddress} className="text-sm font-light text-red-500 hover:underline">
                  + add
                </Button>
              </div>
              {addresses.map((address, index) => (
                <div key={index} className="space-y-2 mb-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Address {index + 1}</span>
                    {addresses.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="text-sm font-light text-gray-400 hover:text-red-500"
                      >
                        remove
                      </Button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={address.title}
                    onChange={(e) => handleAddressChange(index, 'title', e.target.value)}
                    placeholder="Home, Work, etc."
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="text"
                    value={address.street_and_nr}
                    onChange={(e) => handleAddressChange(index, 'street_and_nr', e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="text"
                    value={address.additional_info || ''}
                    onChange={(e) => handleAddressChange(index, 'additional_info', e.target.value)}
                    placeholder="Apt 4B (optional)"
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={address.postal_code}
                      onChange={(e) => handleAddressChange(index, 'postal_code', e.target.value)}
                      placeholder="12345"
                      className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                      placeholder="City"
                      className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                    placeholder="Country"
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  {hasSubmitted && errors[`address_${index}`] && (
                    <p className="text-sm text-red-600 font-extralight">{errors[`address_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="relative text-red-500 left-2 tracking-wide font-extralight">links</p>
                <Button type="button" onClick={addLink} className="text-sm font-light text-red-500 hover:underline">
                  + add
                </Button>
              </div>
              {links.map((link, index) => (
                <div key={index} className="space-y-2 mb-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Link {index + 1}</span>
                    {links.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-sm font-light text-gray-400 hover:text-red-500"
                      >
                        remove
                      </Button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                    placeholder="LinkedIn, Website, etc."
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  {hasSubmitted && errors[`link_${index}`] && (
                    <p className="text-sm text-red-600 font-extralight">{errors[`link_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Password Change Section */}
            <div className="pt-2">
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
                    <span className="relative left-2 text-red-500 font-extralight">password information</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordFields(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.currentPassword;
                          delete newErrors.newPassword;
                          delete newErrors.confirmPassword;
                          return newErrors;
                        });
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-extralight"
                    >
                      remove
                    </button>
                  </div>

                  {/* Current Password */}
                  <div className="relative">
                    <label
                      htmlFor="currentPassword"
                      className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                    >
                      current password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-light h-[48px] focus:outline-none focus:border-red-500 ${
                        hasSubmitted && errors.currentPassword ? 'border-red-500 shadow-md' : 'border-gray-400'
                      }`}
                      style={{ fontSize: '17px', fontWeight: 200 }}
                    />
                    {hasSubmitted && errors.currentPassword && (
                      <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="relative">
                    <label
                      htmlFor="newPassword"
                      className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                    >
                      new password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-light h-[48px] focus:outline-none focus:border-red-500 ${
                        hasSubmitted && errors.newPassword ? 'border-red-500 shadow-md' : 'border-gray-400'
                      }`}
                      style={{ fontSize: '17px', fontWeight: 200 }}
                    />
                    {hasSubmitted && errors.newPassword && (
                      <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <label
                      htmlFor="confirmPassword"
                      className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
                    >
                      confirm new password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-light h-[48px] focus:outline-none focus:border-red-500 ${
                        hasSubmitted && errors.confirmPassword ? 'border-red-500 shadow-md' : 'border-gray-400'
                      }`}
                      style={{ fontSize: '17px', fontWeight: 200 }}
                    />
                    {hasSubmitted && errors.confirmPassword && (
                      <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="absolute font-semibold -bottom-[85px] -right-[10px]">
            <CircleButton size="xl" variant="dark" type="submit" className="font-semibold" disabled={isSaving}>
              {isSaving ? 'saving...' : 'save.'}
            </CircleButton>
          </div>
        </div>
      </form>

      {/* Cancel Link */}
      <div className="w-full px-8 mt-2 space-y-0.25 max-w-[480px] pb-28">
        <div className="text-black dark:text-white font-extralight block relative" style={{ fontSize: '16px' }}>
          want to cancel?{' '}
          <button
            onClick={onCancel}
            className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
            disabled={isSaving}
          >
            go back.
          </button>
        </div>
      </div>
    </div>
  );
}