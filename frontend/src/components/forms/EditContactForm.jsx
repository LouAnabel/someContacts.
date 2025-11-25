import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateContact, deleteContactById, getCategories } from '../../apiCalls/contactsApi';
import { validateDate } from '../helperFunctions/dateConversion';
import CircleButton from '../ui/Buttons';
import CategorySelection from '../ui/CategorySelection';

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

export default function EditContact({ contactData, onCancel, onSaveSuccess, onDelete, accessToken }) {
  const navigate = useNavigate();

  // Form data - convert from API format to form format
  const [formData, setFormData] = useState({
    firstName: contactData.first_name || '',
    lastName: contactData.last_name || '',
    categories: contactData.categories || [],
    isFavorite: contactData.is_favorite || false,
    birthdate: contactData.birth_date || '',
    notes: contactData.notes || '',
    isContacted: contactData.is_contacted || false,
    isToContact: contactData.is_to_contact || false,
    lastContactDate: contactData.last_contact_date || '',
    nextContactDate: contactData.next_contact_date || '',
    nextContactPlace: contactData.next_contact_place || ''
  });

  // Multi-field arrays
  const [emails, setEmails] = useState(
    contactData.emails && contactData.emails.length > 0 ? contactData.emails : [{ title: 'private', email: '' }]
  );
  const [phones, setPhones] = useState(
    contactData.phones && contactData.phones.length > 0 ? contactData.phones : [{ title: 'mobile', phone: '' }]
  );
  const [addresses, setAddresses] = useState(
    contactData.addresses && contactData.addresses.length > 0
      ? contactData.addresses.map(a => ({
          title: a.title,
          streetAndNr: a.street_and_nr,
          additionalInfo: a.additional_info,
          postalcode: a.postal_code,
          city: a.city,
          country: a.country
        }))
      : [{ title: 'private', streetAndNr: '', additionalInfo: '', postalcode: '', city: '', country: '' }]
  );
  const [links, setLinks] = useState(
    contactData.links && contactData.links.length > 0 ? contactData.links : [{ title: '', url: '' }]
  );

  // UI states
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Optional sections visibility
  const [showBirthdate, setShowBirthdate] = useState(!!contactData.birth_date);
  const [showAddress, setShowAddress] = useState(
    contactData.addresses && contactData.addresses.length > 0
  );
  const [showContactDetails, setShowContactDetails] = useState(
    !!(contactData.last_contact_date || contactData.next_contact_date)
  );
  const [showLinks, setShowLinks] = useState(contactData.links && contactData.links.length > 0);
  const [expandedNotes, setExpandedNotes] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (accessToken) {
          const categoriesData = await getCategories(accessToken);
          console.log('Categories loaded:', categoriesData);
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, [accessToken]);

  // ============================================
  // INPUT HANDLERS
  // ============================================

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors
    if (hasSubmitted && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  // Email handlers
  const handleEmailChange = (index, field, value) => {
    const newEmails = [...emails];
    newEmails[index] = { ...newEmails[index], [field]: value };
    setEmails(newEmails);
  };

  const addEmail = () => setEmails([...emails, { title: '', email: '' }]);
  const removeEmail = (index) => {
    if (emails.length > 1) setEmails(emails.filter((_, i) => i !== index));
  };

  // Phone handlers
  const handlePhoneChange = (index, field, value) => {
    const newPhones = [...phones];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setPhones(newPhones);
  };

  const addPhone = () => setPhones([...phones, { title: '', phone: '' }]);
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
      { title: '', streetAndNr: '', additionalInfo: '', postalcode: '', city: '', country: '' }
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

  // ============================================
  // CATEGORY HANDLERS
  // ============================================

  const getNextCategoryId = (categories) => {
    if (!categories || categories.length === 0) return 1;
    const maxId = Math.max(...categories.map(cat => parseInt(cat.id) || 0));
    return maxId + 1;
  };

  const addCategory = async () => {
    if (newCategoryName.trim() && !isAddingCategory) {
      setIsAddingCategory(true);

      try {
        const categoryName = newCategoryName.charAt(0).toUpperCase() + newCategoryName.slice(1).trim();
        const nextId = getNextCategoryId(categories);

        const newCategory = {
          id: nextId,
          name: categoryName,
          creator_id: null,
          contact_count: 0,
          isPersisted: false
        };

        setCategories(prevCategories => [...prevCategories, newCategory]);

        setFormData(prevFormData => ({
          ...prevFormData,
          categories: [...prevFormData.categories, { name: newCategory.name, id: newCategory.id }]
        }));

        if (hasSubmitted && errors.categories) {
          setErrors(prev => ({ ...prev, categories: '' }));
        }

        setNewCategoryName('');
        setShowAddCategory(false);
        setShowCategoryDropdown(false);

        console.log('Category added to form:', newCategory);
      } catch (error) {
        console.error('Failed to add category:', error);
        alert(`Failed to add category: ${error.message}`);
      } finally {
        setIsAddingCategory(false);
      }
    }
  };

  const addCategoryToForm = (category) => {
    const isAlreadySelected = formData.categories.some(cat => cat.id === category.id);
    if (isAlreadySelected) return;

    if (formData.categories.length >= 3) {
      alert('Maximum 3 categories allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { name: category.name, id: category.id }]
    }));

    if (hasSubmitted && errors.categories) {
      setErrors(prev => ({ ...prev, categories: '' }));
    }
  };

  const removeCategoryFromForm = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId)
    }));
  };

  // ============================================
  // VALIDATION
  // ============================================

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation (optional)
    if (formData.lastName && formData.lastName.trim() && formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Category validation
    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }

    // Birthdate validation
    if (formData.birthdate && formData.birthdate.trim()) {
      const birthdateError = validateDate(formData.birthdate, 'Birthdate', true);
      if (birthdateError) {
        newErrors.birthdate = birthdateError;
      }
    }

    // Validate links
    if (showLinks && links) {
      links.forEach((link, index) => {
        const hasUrl = link.url && link.url.trim();
        const hasTitle = link.title && link.title.trim();

        if (hasUrl && !hasTitle) {
          newErrors[`link_${index}`] = 'Title for URL required';
        }
      });
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
      const hasAnyAddressField = address.streetAndNr || address.city || address.country || address.postalcode;
      const hasTitle = address.title && address.title.trim();

      if (hasAnyAddressField && !hasTitle) {
        newErrors[`address_${index}`] = 'Title for address required';
      }
    });

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // FORM SUBMISSION
  // ============================================

  const handleSave = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setIsSaving(true);

    try {
      if (!accessToken) {
        throw new Error('Access token is not available');
      }

      // Prepare contact data with multi-fields
      const contactUpdateData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName?.trim() || null,
        is_favorite: formData.isFavorite || false,
        birth_date: formData.birthdate?.trim() || null,
        next_contact_date: formData.nextContactDate?.trim() || null,
        next_contact_place: formData.nextContactPlace?.trim() || null,
        last_contact_date: formData.lastContactDate?.trim() || null,
        is_contacted: formData.isContacted || false,
        is_to_contact: formData.isToContact || false,
        notes: formData.notes?.trim() || null,
        categories: formData.categories.map(cat => cat.id)
      };

      // Filter and add emails
      contactUpdateData.emails = emails
        .filter(e => e.email?.trim() && e.title?.trim())
        .map(e => ({
          email: e.email.trim(),
          title: e.title.trim()
        }));

      // Filter and add phones
      contactUpdateData.phones = phones
        .filter(p => p.phone?.trim() && p.title?.trim())
        .map(p => ({
          phone: p.phone.trim(),
          title: p.title.trim()
        }));

      // Filter and add addresses
      contactUpdateData.addresses = addresses
        .filter(a => (a.streetAndNr || a.city || a.country || a.postalcode) && a.title?.trim())
        .map(a => ({
          street_and_nr: a.streetAndNr?.trim() || '',
          additional_info: a.additionalInfo?.trim() || null,
          postal_code: a.postalcode?.trim() || '',
          city: a.city?.trim() || '',
          country: a.country?.trim() || '',
          title: a.title.trim()
        }));

      // Filter and add links
      contactUpdateData.links = links
        .filter(l => l.url?.trim() && l.title?.trim())
        .map(l => {
          let url = l.url.trim();
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          return {
            url: url,
            title: l.title.trim()
          };
        });

      console.log('Updating contact with data:', contactUpdateData);

      // Update contact
      const updatedContact = await updateContact(accessToken, contactData.id, contactUpdateData);

      console.log('Contact updated successfully:', updatedContact);

      // Call success callback
      if (onSaveSuccess) {
        onSaveSuccess(updatedContact);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to update contact'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // DELETE HANDLER
  // ============================================

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (!accessToken) {
        throw new Error('Access token is not valid');
      }

      await deleteContactById(accessToken, contactData.id);
      console.log('Contact deleted successfully');

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      setErrors(prev => ({ ...prev, submit: `Failed to delete contact: ${error.message}` }));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="w-full max-w-[480px] mx-auto pb-40">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-4 text-black">Delete Contact?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {contactData.first_name} {contactData.last_name}? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="w-full"
        style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}
      >
        <div
          className="bg-white rounded-3xl p-8 shadow-lg relative pb-20"
          style={{
            boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
          }}
        >
          <h1 className="text-3xl font-bold text-center mb-8 text-black">edit contact.</h1>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center font-extralight">{errors.submit}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* First Name */}
            <div className="relative">
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="meryl"
                disabled={isSaving}
                className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-extralight placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500 ${
                  hasSubmitted && errors.firstName ? 'border-red-500 shadow-md' : 'border-gray-400'
                }`}
                style={{ fontSize: '18px', fontWeight: 200 }}
              />
              <label
                htmlFor="firstName"
                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
              >
                first name
              </label>
              {hasSubmitted && errors.firstName && (
                <p className="absolute top-full right-1 text-sm text-red-600 z-20 font-extralight">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="relative">
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="streep"
                disabled={isSaving}
                className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-extralight placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500 ${
                  hasSubmitted && errors.lastName ? 'border-red-500 shadow-md' : 'border-gray-400'
                }`}
                style={{ fontSize: '18px', fontWeight: 200 }}
              />
              <label
                htmlFor="lastName"
                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
              >
                last name
              </label>
              {hasSubmitted && errors.lastName && (
                <p className="absolute top-full right-1 text-sm text-red-600 z-20 font-extralight">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Categories Section */}
            <div className="relative">
              <CategorySelection
                formData={formData}
                categories={categories}
                showCategoryDropdown={showCategoryDropdown}
                setShowCategoryDropdown={setShowCategoryDropdown}
                showAddCategory={showAddCategory}
                setShowAddCategory={setShowAddCategory}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                isAddingCategory={isAddingCategory}
                addCategory={addCategory}
                addCategoryToForm={addCategoryToForm}
                removeCategoryFromForm={removeCategoryFromForm}
                hasSubmitted={hasSubmitted}
                errors={errors}
                isLoading={isSaving}
              />
            </div>

            {/* Emails Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="relative text-red-500 left-2 tracking-wide font-extralight">emails</p>
                <Button type="button" onClick={addEmail} className="text-sm font-light text-red-500 hover:underline">
                  + add
                </Button>
              </div>
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={email.title}
                    onChange={(e) => handleEmailChange(index, 'title', e.target.value)}
                    placeholder="private"
                    className="w-[120px] rounded-xl border border-gray-400 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="email"
                    value={email.email}
                    onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 rounded-xl border border-gray-400 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Phones Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="relative text-red-500 left-2 tracking-wide font-extralight">phone numbers</p>
                <Button type="button" onClick={addPhone} className="text-sm font-light text-red-500 hover:underline">
                  + add
                </Button>
              </div>
              {phones.map((phone, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={phone.title}
                    onChange={(e) => handlePhoneChange(index, 'title', e.target.value)}
                    placeholder="mobile"
                    className="w-[120px] rounded-xl border border-gray-400 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="tel"
                    value={phone.phone}
                    onChange={(e) => handlePhoneChange(index, 'phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="flex-1 rounded-xl border border-gray-400 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  {phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Optional: Addresses */}
            {!showAddress ? (
              <button
                type="button"
                onClick={() => setShowAddress(true)}
                className="flex items-center ml-1.5 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
              >
                <span className="text-lg font-semibold">+</span>
                <span className="text-base text-black hover:text-red-500">address</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="relative text-red-500 left-2 tracking-wide font-extralight">addresses</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={addAddress}
                      className="text-sm font-light text-red-500 hover:underline"
                    >
                      + add
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddress(false);
                        setAddresses([{
                          title: 'private',
                          streetAndNr: '',
                          additionalInfo: '',
                          postalcode: '',
                          city: '',
                          country: ''
                        }]);
                      }}
                      className="text-sm font-light text-gray-400 hover:text-red-500"
                    >
                      remove
                    </Button>
                  </div>
                </div>
                {addresses.map((address, index) => (
                  <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Address {index + 1}</span>
                      {addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAddress(index)}
                          className="text-sm font-light text-gray-400 hover:text-red-500"
                        >
                          remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={address.title}
                      onChange={(e) => handleAddressChange(index, 'title', e.target.value)}
                      placeholder="Title (Home, Work, etc.)"
                      className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={address.streetAndNr}
                      onChange={(e) => handleAddressChange(index, 'streetAndNr', e.target.value)}
                      placeholder="Street & Number"
                      className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={address.additionalInfo}
                      onChange={(e) => handleAddressChange(index, 'additionalInfo', e.target.value)}
                      placeholder="Additional Info (optional)"
                      className="w-full rounded-xl border border-gray-300 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={address.postalcode}
                        onChange={(e) => handleAddressChange(index, 'postalcode', e.target.value)}
                        placeholder="Postal Code"
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
                  </div>
                ))}
              </div>
            )}

            {/* Optional: Links */}
            {!showLinks ? (
              <button
                type="button"
                onClick={() => setShowLinks(true)}
                className="flex items-center ml-1.5 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
              >
                <span className="text-lg font-semibold">+</span>
                <span className="text-base text-black hover:text-red-500">links</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="relative text-red-500 left-2 tracking-wide font-extralight">links</p>
                  <div className="flex gap-2">
                    <Button type="button" onClick={addLink} className="text-sm font-light text-red-500 hover:underline">
                      + add
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowLinks(false);
                        setLinks([{ title: '', url: '' }]);
                      }}
                      className="text-sm font-light text-gray-400 hover:text-red-500"
                    >
                      remove
                    </Button>
                  </div>
                </div>
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      placeholder="website"
                      className="w-[120px] rounded-xl border border-gray-400 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 rounded-xl border border-gray-400 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="relative">
              <label
                htmlFor="notes"
                className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
              >
                important notes
              </label>
              <textarea
                name="notes"
                id="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="every thought matters.."
                disabled={isSaving}
                rows={expandedNotes ? 6 : 3}
                className="w-full rounded-xl border border-gray-400 bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 p-3 focus:outline-none focus:border-red-500"
                style={{ fontSize: '16px', fontWeight: 200 }}
              />
            </div>

            {/* Optional: Birthdate */}
            {!showBirthdate ? (
              <button
                type="button"
                onClick={() => setShowBirthdate(true)}
                className="flex items-center ml-1.5 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
              >
                <span className="text-lg font-semibold">+</span>
                <span className="text-base text-black hover:text-red-500">birthdate</span>
              </button>
            ) : (
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="relative text-red-500 left-2 font-extralight">birthdate</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBirthdate(false);
                      setFormData(prev => ({ ...prev, birthdate: '' }));
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-extralight"
                  >
                    remove
                  </button>
                </div>
                <input
                  type="text"
                  name="birthdate"
                  id="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  placeholder="DD.MM.YYYY"
                  disabled={isSaving}
                  className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-extralight placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500 ${
                    hasSubmitted && errors.birthdate ? 'border-red-500 shadow-md' : 'border-gray-400'
                  }`}
                  style={{ fontSize: '16px', fontWeight: 200 }}
                />
                {hasSubmitted && errors.birthdate && (
                  <p className="absolute top-full right-1 text-sm text-red-600 z-20 font-extralight">
                    {errors.birthdate}
                  </p>
                )}
              </div>
            )}

            {/* Delete Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(true)}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-extralight transition-colors"
              >
                Delete Contact
              </button>
            </div>
          </div>

          {/* Save Button */}
          <CircleButton
            type="submit"
            size="xl"
            variant="dark"
            className="font-semibold absolute -bottom-[85px] -right-[10px]"
            style={{
              marginTop: '2rem',
              marginLeft: 'auto',
              display: 'block'
            }}
            disabled={isSaving}
          >
            {isSaving ? '. . .' : 'save.'}
          </CircleButton>
        </div>

        {/* Bottom Navigation */}
        <div className="w-full px-8 mt-2 space-y-0.25 max-w-[480px]">
          <div className="text-black dark:text-white font-extralight block relative" style={{ fontSize: '16px' }}>
            want to{' '}
            <button
              type="button"
              onClick={onCancel}
              className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
            >
              cancel editing?
            </button>
          </div>
          <div className="text-black font-extralight dark:text-white block -mt-1 relative" style={{ fontSize: '16px' }}>
            or go{' '}
            <button
              type="button"
              onClick={handleGoBack}
              className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
            >
              back
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
