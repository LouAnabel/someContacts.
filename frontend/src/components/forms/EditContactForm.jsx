import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateContact, deleteContactById, getCategories } from '../../apiCalls/contactsApi';
import { validateDate } from '../helperFunctions/dateConversion';
import CircleButton from '../ui/Buttons';
import CategorySelection from '../ui/CategorySelection';
import InlineTitleSelection from '../ui/ContactTitleSelection';
import WebTitleSelection from '../ui/WebTitleSelection';
import DatePicker from '../ui/DatePicker';
import dayjs from 'dayjs';

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

export default function EditContactForm({ contactData, onCancel, onSaveSuccess, onDelete, authFetch }) {
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
  const [showLinks, setShowLinks] = useState(contactData.links && contactData.links.length > 0);
  const [expandedNotes, setExpandedNotes] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Dropdown States (using index)
  const [emailDropdownStates, setEmailDropdownStates] = useState({});
  const [phoneDropdownStates, setPhoneDropdownStates] = useState({});
  const [addressDropdownStates, setAddressDropdownStates] = useState({});
  const [websiteDropdownStates, setWebsiteDropdownStates] = useState({});

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (authFetch) {
          const categoriesData = await getCategories(authFetch);

          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, [authFetch]);

  // ============================================
  // DROPDOWN STATE HELPERS
  // ============================================

  const getEmailDropdownState = (index) => {
    return emailDropdownStates[index] || {
      showDropdown: false,
      showAddTitle: false,
      newTitleName: ''
    };
  };

  const updateEmailDropdownState = (index, updates) => {
    setEmailDropdownStates(prev => ({
      ...prev,
      [index]: { ...getEmailDropdownState(index), ...updates }
    }));
  };

  const getPhoneDropdownState = (index) => {
    return phoneDropdownStates[index] || {
      showDropdown: false,
      showAddTitle: false,
      newTitleName: ''
    };
  };

  const updatePhoneDropdownState = (index, updates) => {
    setPhoneDropdownStates(prev => ({
      ...prev,
      [index]: { ...getPhoneDropdownState(index), ...updates }
    }));
  };

  const getAddressDropdownState = (index) => {
    return addressDropdownStates[index] || {
      showDropdown: false,
      showAddTitle: false,
      newTitleName: ''
    };
  };

  const updateAddressDropdownState = (index, updates) => {
    setAddressDropdownStates(prev => ({
      ...prev,
      [index]: { ...getAddressDropdownState(index), ...updates }
    }));
  };

  const getWebsiteDropdownState = (index) => {
    return websiteDropdownStates[index] || {
      showDropdown: false,
      showAddTitle: false,
      newTitleName: ''
    };
  };

  const updateWebsiteDropdownState = (index, updates) => {
    setWebsiteDropdownStates(prev => ({
      ...prev,
      [index]: { ...getWebsiteDropdownState(index), ...updates }
    }));
  };

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

  const updateEmailTitle = (index, newTitle) => {
    const newEmails = [...emails];
    newEmails[index] = { ...newEmails[index], title: newTitle };
    setEmails(newEmails);
  };

  const addEmail = () => setEmails([...emails, { title: 'private', email: '' }]);
  
  const removeEmail = (index) => {
    if (emails.length > 1) setEmails(emails.filter((_, i) => i !== index));
  };

  // Phone handlers
  const handlePhoneChange = (index, field, value) => {
    const newPhones = [...phones];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setPhones(newPhones);
  };

  const updatePhoneTitle = (index, newTitle) => {
    const newPhones = [...phones];
    newPhones[index] = { ...newPhones[index], title: newTitle };
    setPhones(newPhones);
  };

  const addPhone = () => setPhones([...phones, { title: 'mobile', phone: '' }]);
  
  const removePhone = (index) => {
    if (phones.length > 1) setPhones(phones.filter((_, i) => i !== index));
  };

  // Address handlers
  const handleAddressChange = (index, field, value) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setAddresses(newAddresses);
  };

  const updateAddressTitle = (index, newTitle) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], title: newTitle };
    setAddresses(newAddresses);
  };

  const addAddress = () =>
    setAddresses([
      ...addresses,
      { title: 'private', streetAndNr: '', additionalInfo: '', postalcode: '', city: '', country: '' }
    ]);

  const removeAddress = (index) => {
    if (addresses.length > 1) setAddresses(addresses.filter((_, i) => i !== index));
  };

  // Link handlers
  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];

    // Auto-format URL
    if (field === 'url' && value.trim()) {
      const titleLower = newLinks[index].title?.toLowerCase() || '';
      
      if (titleLower === 'instagram') {
        let cleanValue = value.replace(/^@+/, '');
        if (cleanValue) {
          value = '@' + cleanValue;
        }
      } else if (!value.startsWith('http://') && !value.startsWith('https://')) {
        if (value.includes('.')) {
          value = 'https://' + value;
        }
      }
    }

    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const updateWebsiteTitle = (index, newTitle) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], title: newTitle };
    
    // Clear URL if switching to Instagram and current URL doesn't start with @
    const newTitleLower = newTitle.toLowerCase();
    if (newTitleLower === 'instagram' && newLinks[index].url && !newLinks[index].url.startsWith('@')) {
      newLinks[index].url = '';
    }
    
    setLinks(newLinks);
  };

  const getPlaceholder = (title) => {
    const titleLower = title?.toLowerCase() || 'website';
    switch (titleLower) {
      case 'instagram':
        return 'enter username with @';
      case 'facebook':
        return 'f.e. facebook.com/yourprofile';
      case 'linkedin':
        return 'f.e. linkedin.com/in/yourprofile';
      case 'filmmakers':
        return 'f.e. www.profile/filmmakers.com';
      case 'schauspielervideos':
        return 'f.e. www.profile/schauspielervideos.de';
      default:
        return 'f.e. www.yourwebsite.com';
    }
  };

  const addLink = () => setLinks([...links, { title: 'website', url: '' }]);
  
  const removeLink = (index) => {
    if (links.length > 1) setLinks(links.filter((_, i) => i !== index));
  };

  // Date picker handler
  const handleDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      birthdate: newValue ? dayjs(newValue).format('DD.MM.YYYY') : ''
    }));
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

      return;
    }

    setIsSaving(true);

    try {
      if (!authFetch) {
        throw new Error('Authentication not available');
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
          if (!url.startsWith('@') && !url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          return {
            url: url,
            title: l.title.trim()
          };
        });



      // Update contact
      const updatedContact = await updateContact(authFetch, contactData.id, contactUpdateData);



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
      if (!authFetch) {
        throw new Error('Authentication not available');
      }

      await deleteContactById(authFetch, contactData.id);


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
          <div className="bg-white rounded-3xl p-8 relative z-10 overflow-visible w-[90vw] min-w-[260px] max-w-[480px] h-fit mx-auto"
               style={{ 
                 boxShadow: '0 8px 48px rgba(109, 71, 71, 0.35)'
               }}>
            
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-red-500 font-extralight" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-4 text-black">
              delete <span className="text-red-500">{contactData.first_name} {contactData.last_name}?</span>
            </h2>
            
            {/* Message */}
            <p className="text-center text-black tracking-wider font-extralight mb-8 leading-relaxed">
              this action cannot be undone. the contact will be permanently removed.
            </p>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-6 rounded-xl font-extralight border-2 border-gray-300 text-black tracking-wide font-md hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '16px' }}
              >
                cancel.
              </button>
              
              {/* Delete Button */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-6 rounded-xl bg-red-500 text-white font-md tracking-wide hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ fontSize: '16px' }}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    deleting...
                  </>
                ) : (
                  'delete forever.'
                )}
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
          className="bg-white rounded-3xl p-4 shadow-lg relative pb-10"
          style={{
            boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black tracking-tight">
              edit contact.
            </h1>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center font-extralight">{errors.submit}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* BASICS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-red-400 rounded-full mb-2"></div>
                <p className="relative text-lg font-light text-red-500 tracking-wide -mt-1">basics.</p>
              </div>

              <div className="space-y-4 border-b">
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
                    className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 h-[48px] focus:outline-none focus:border-red-400 ${
                      errors.firstName ? 'border-red-400' : 'border-gray-400'
                    }`}
                    style={{ fontSize: '16px', fontWeight: 200 }}
                  />
                  <label
                    htmlFor="firstName"
                    className="absolute -top-3 left-2 bg-white px-1 text-base text-black font-extralight"
                  >
                    first name<span className="text-red-500">*</span>
                  </label>
                  {errors.firstName && (
                    <p className="absolute top-full right-1 text-xs text-red-500 z-20 font-extralight">
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
                    className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 h-[48px] focus:outline-none focus:border-red-400 ${
                      errors.lastName ? 'border-red-400' : 'border-gray-400'
                    }`}
                    style={{ fontSize: '16px', fontWeight: 200 }}
                  />
                  <label
                    htmlFor="lastName"
                    className="absolute -top-3 left-2 bg-white px-1 text-base text-black font-extralight"
                  >
                    last name<span className="text-red-500">*</span>
                  </label>
                  {errors.lastName && (
                    <p className="absolute top-full right-1 text-xs text-red-600 z-20 font-extralight">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Category Field */}
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
                    disabled={isSaving}
                  />
                </div>

                {/* Favorite Checkbox */}
                <div className="flex items-center w-full relative left-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                    className="flex items-center space-x-2 hover:scale-110 transform -mt-2 mb-6"
                    disabled={isSaving}
                  >
                    <svg
                      className={`w-7 h-7 ${
                        formData.isFavorite ? 'text-red-500 hover:text-yellow-300' : 'text-gray-300 hover:text-yellow-300'
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <span className="text-sm font-extralight text-black cursor-pointer">
                      {formData.isFavorite ? 'favorite contact' : 'mark as favorite'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* CONTACT DETAILS SECTION */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-red-400 rounded-full"></div>
                <p className="relative text-lg font-light text-red-500 tracking-wide">contact details.</p>
              </div>

              {/* Emails Section */}
              <div className="space-y-1">
                {emails.map((email, index) => {
                  const dropdownState = getEmailDropdownState(index);

                  return (
                    <div key={index} className="relative">
                      {/* Dropdown and label wrapper */}
                      <div className="flex items-center gap-2 ml-2 -mb-4 relative">
                        {/* Inline Title Dropdown */}
                        <InlineTitleSelection
                          title={email.title}
                          setTitle={(newTitle) => updateEmailTitle(index, newTitle)}
                          showDropdown={dropdownState.showDropdown}
                          setShowDropdown={(value) => updateEmailDropdownState(index, { showDropdown: value })}
                          showAddTitle={dropdownState.showAddTitle}
                          setShowAddTitle={(value) => updateEmailDropdownState(index, { showAddTitle: value })}
                          newTitleName={dropdownState.newTitleName}
                          setNewTitleName={(value) => updateEmailDropdownState(index, { newTitleName: value })}
                          disabled={isSaving}
                        />

                        {/* Email label */}
                        <label className="-ml-2 text-black font-extralight bg-white px-1 z-20" style={{ fontSize: '16px', fontWeight: 200 }}>
                          email
                        </label>
                      </div>

                      {/* Input field wrapper */}
                      <div className="relative">
                        <input
                          type="email"
                          value={email.email}
                          onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                          placeholder="email@example.com"
                          disabled={isSaving}
                          className={`w-full p-2.5 pr-5 h-[48px] rounded-xl border mt-0.5
                            ${hasSubmitted && errors[`email_${index}`]
                              ? 'border-red-500'
                              : 'border-gray-400'
                            } bg-white hover:border-red-300 text-black font-extralight placeholder-gray-400 focus:outline-none focus:border-red-500`}
                          style={{
                            fontSize: '16px',
                            fontWeight: 100,
                            paddingRight: '2.5rem'
                          }}
                        />

                        {/* Remove button */}
                        {emails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmail(index)}
                            disabled={isSaving}
                            className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-lg hover:bg-red-50 group"
                            style={{ zIndex: 10 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-gray-400 group-hover:text-red-500 transition-colors duration-200">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Phones Section */}
              <div className="space-y-1">
                {phones.map((phone, index) => {
                  const dropdownState = getPhoneDropdownState(index);

                  return (
                    <div key={index} className="relative">
                      {/* Dropdown and label wrapper */}
                      <div className="flex items-center gap-2 ml-2 -mb-4 relative">
                        {/* Inline Title Dropdown */}
                        <InlineTitleSelection
                          title={phone.title}
                          setTitle={(newTitle) => updatePhoneTitle(index, newTitle)}
                          showDropdown={dropdownState.showDropdown}
                          setShowDropdown={(value) => updatePhoneDropdownState(index, { showDropdown: value })}
                          showAddTitle={dropdownState.showAddTitle}
                          setShowAddTitle={(value) => updatePhoneDropdownState(index, { showAddTitle: value })}
                          newTitleName={dropdownState.newTitleName}
                          setNewTitleName={(value) => updatePhoneDropdownState(index, { newTitleName: value })}
                          disabled={isSaving}
                        />

                        {/* Phone label */}
                        <label className="-ml-2 z-20 text-black font-extralight bg-white px-1" style={{ fontSize: '16px', fontWeight: 200 }}>
                          phone
                        </label>
                      </div>

                      {/* Input field wrapper */}
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone.phone}
                          onChange={(e) => handlePhoneChange(index, 'phone', e.target.value)}
                          placeholder="+49 123 4567890"
                          disabled={isSaving}
                          className={`w-full pr-10 rounded-xl border bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 h-[48px] px-3 mt-0.5 focus:outline-none focus:border-red-500 ${
                            hasSubmitted && errors[`phone_${index}`] ? 'border-red-500 shadow-md' : 'border-gray-400'
                          }`}
                          style={{
                            fontSize: '16px',
                            fontWeight: 180,
                            paddingRight: '2.5rem'
                          }}
                        />

                        {/* Remove button */}
                        {phones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePhone(index)}
                            disabled={isSaving}
                            className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-lg hover:bg-red-50 group"
                            style={{ zIndex: 10 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-gray-400 group-hover:text-red-500 transition-colors duration-200">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Email/Phone Buttons */}
              <div className="relative">
                <div className="flex items-center justify-end gap-1 mr-2">
                  <span className="text-sm text-black font-extralight mt-0.5">
                    <span className="text-red-500 font-normal">+</span> add
                  </span>
                  <span>
                    <Button
                      type="button"
                      onClick={addEmail}
                      className="text-sm font-light text-red-500 hover:font-normal tracking-wide"
                    >
                      email
                    </Button>
                  </span>
                  <span className="text-sm mt-1 font-extralight text-black">/</span>
                  <span>
                    <Button
                      type="button"
                      onClick={addPhone}
                      className="text-sm font-light text-red-500 hover:font-normal tracking-wide"
                    >
                      number
                    </Button>
                  </span>
                </div>
              </div>

              {/* Optional: Addresses */}
              <div className="relative">
                {!showAddress ? (
                  <button
                    type="button"
                    onClick={() => setShowAddress(true)}
                    className="flex tracking-wide items-center mt-5 space-x-2 font-light"
                  >
                    <span className="text-lg text-red-400 hover:text-red-500">
                      <span className="text-xl font-semibold text-red-400">+</span> address information.
                    </span>
                  </button>
                ) : (
                  <div className="mt-5">
                    <div className="flex items-center justify-between -mb-2">
                      <span>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-red-400 rounded-full"></div>
                          <h2 className="text-lg font-light text-red-500 tracking-wide">
                            address information.
                          </h2>
                        </div>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddress(false);
                          setAddresses([{ title: 'private', streetAndNr: '', additionalInfo: '', postalcode: '', city: '', country: '' }]);
                        }}
                        className="relative mr-3 text-red-500 tracking-wide hover:underline text-sm font-extralight"
                        disabled={isSaving}
                      >
                        remove all
                      </button>
                    </div>

                    {addresses.map((address, index) => {
                      const dropdownState = getAddressDropdownState(index);

                      return (
                        <div key={index} className="space-y-2 mt-2 py-2 border-b pb-7">
                          <div className="flex items-center justify-between">
                            {/* Inline Title Dropdown and Label */}
                            <div className="flex items-center gap-2 mb-1 ml-1">
                              <InlineTitleSelection
                                title={address.title}
                                setTitle={(newTitle) => updateAddressTitle(index, newTitle)}
                                showDropdown={dropdownState.showDropdown}
                                setShowDropdown={(value) => updateAddressDropdownState(index, { showDropdown: value })}
                                showAddTitle={dropdownState.showAddTitle}
                                setShowAddTitle={(value) => updateAddressDropdownState(index, { showAddTitle: value })}
                                newTitleName={dropdownState.newTitleName}
                                setNewTitleName={(value) => updateAddressDropdownState(index, { newTitleName: value })}
                                disabled={isSaving}
                              />
                              <span className="text-black font-extralight -ml-2 pl-0.5"> address</span>
                            </div>

                            {/* Remove button for individual address */}
                            {addresses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAddress(index)}
                                className="p-1 text-black font-light rounded-lg hover:bg-red-50 group mr-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* INPUT FIELDS ADDRESS */}
                          <div className="relative w-full space-y-4">
                            {/* Street & Number */}
                            <div className="relative">
                              <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                street & nr°
                              </label>
                              <input
                                type="text"
                                value={address.streetAndNr}
                                onChange={(e) => handleAddressChange(index, 'streetAndNr', e.target.value)}
                                placeholder="Main Street 12"
                                className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                style={{ fontSize: '16px', fontWeight: 200 }}
                              />
                            </div>

                            {/* Additional Info */}
                            <div className="relative">
                              <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                additional info (optional)
                              </label>
                              <input
                                type="text"
                                value={address.additionalInfo}
                                onChange={(e) => handleAddressChange(index, 'additionalInfo', e.target.value)}
                                placeholder="Apartment 4B, 2nd floor"
                                className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                style={{ fontSize: '15px', fontWeight: 200 }}
                              />
                            </div>

                            {/* Postal Code & City */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="relative">
                                <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                  postal code
                                </label>
                                <input
                                  type="text"
                                  value={address.postalcode}
                                  onChange={(e) => handleAddressChange(index, 'postalcode', e.target.value)}
                                  placeholder="12345"
                                  className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                  style={{ fontSize: '15px', fontWeight: 200 }}
                                />
                              </div>
                              <div className="relative">
                                <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                  city
                                </label>
                                <input
                                  type="text"
                                  value={address.city}
                                  onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                  placeholder="Berlin"
                                  className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                  style={{ fontSize: '15px', fontWeight: 200 }}
                                />
                              </div>
                            </div>

                            {/* Country */}
                            <div className="relative">
                              <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                country
                              </label>
                              <input
                                type="text"
                                value={address.country}
                                onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                                placeholder="Germany"
                                className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                style={{ fontSize: '15px', fontWeight: 200 }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* add address */}
                    <div className="flex gap-2 items-right justify-end mr-3 mt-2">
                      <Button
                        type="button"
                        onClick={addAddress}
                        className="text-sm font-light tracking-wide text-red-500 hover:font-normal -ml-1"
                      >
                        <span className="text-sm text-black font-extralight mt-0.5">
                          <span className="text-red-500 font-normal">+</span> add
                        </span>{' '}
                        address
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ADDITIONAL INFO SECTION */}
            <div className="space-y-6">
              {/* Optional: Birthdate */}
              {!showBirthdate ? (
                <button
                  type="button"
                  onClick={() => setShowBirthdate(true)}
                  className="flex items-center ml-1 space-x-2 font-extralight hover:font-light hover:text-red-500"
                >
                  <span className="text-base text-black">
                    <span className="font-semibold text-red-500">+</span> add{' '}
                    <span className="text-red-500 font-light hover:font-normal">birthdate</span>
                  </span>
                </button>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-6 bg-red-400 rounded-full"></div>
                        <h2 className="text-lg font-light text-red-500 tracking-wide">birthdate.</h2>
                      </div>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setShowBirthdate(false);
                        setFormData(prev => ({ ...prev, birthdate: '' }));
                      }}
                      className="relative mr-3 text-red-500 tracking-wide hover:underline text-sm font-extralight -mt-2"
                      disabled={isSaving}
                    >
                      remove
                    </button>
                  </div>

                  {/* Date Picker */}
                  <div className="relative">
                    <DatePicker
                      value={formData.birthdate}
                      onChange={handleDateChange}
                      label="select date"
                      disabled={isSaving}
                    />
                  </div>

                  {hasSubmitted && errors.birthdate && (
                    <p className="absolute top-full right-1 text-sm text-red-600 z-20 font-extralight">
                      {errors.birthdate}
                    </p>
                  )}
                </div>
              )}

              {/* Notes Section */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-red-400 rounded-full"></div>
                  <h2 className="text-lg font-light text-red-500 tracking-wide">notes.</h2>
                </div>

                <div className="relative">
                  <textarea
                    name="notes"
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="every thought matters..."
                    disabled={isSaving}
                    rows={expandedNotes ? 8 : 4}
                    className="w-full rounded-2xl border border-gray-400 bg-white hover:border-red-300 focus:border-red-500 text-black font-extralight placeholder-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
                    style={{ fontSize: '16px', fontWeight: 100 }}
                  />

                  {/* Optional: Expand/Collapse button */}
                  <button
                    type="button"
                    onClick={() => setExpandedNotes(!expandedNotes)}
                    className="absolute bottom-3 right-4 text-xs font-extralight text-gray-400 hover:text-red-500"
                  >
                    {expandedNotes ? 'less' : 'more'}
                  </button>
                </div>
              </div>

              {/* LINKS SECTION */}
              {!showLinks ? (
                <button
                  type="button"
                  onClick={() => setShowLinks(true)}
                  className="flex items-center ml-1 space-x-2 font-extralight hover:font-light hover:text-red-500"
                >
                  <span className="text-base text-black">
                    <span className="font-semibold text-red-500">+</span> add{' '}
                    <span className="text-red-500 font-light hover:font-normal">websites & links</span>
                  </span>
                </button>
              ) : (
                <div className="space-y-1">
                  {/* Section Header */}
                  <div className="flex items-center justify-between">
                    <span>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-red-400 rounded-full"></div>
                        <h2 className="text-lg font-light text-red-500 tracking-wide">websites & links.</h2>
                      </div>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLinks(false);
                        setLinks([{ title: 'website', url: '' }]);
                      }}
                      className="relative mr-3 text-red-500 tracking-wide hover:underline text-sm font-extralight"
                      disabled={isSaving}
                    >
                      remove all
                    </button>
                  </div>

                  <div className="text-sm text-gray-400 italic font-extralight">
                    select website title and enter the corresponding url.
                  </div>

                  {/* Weblinks */}
                  <div className="space-y-1">
                    {links.map((link, index) => {
                      const dropdownState = getWebsiteDropdownState(index);

                      return (
                        <div key={index} className="relative">
                          {/* Dropdown wrapper */}
                          <div className="ml-2 -mb-4 relative z-50">
                            {/* Website Title Dropdown - serves as label */}
                            <WebTitleSelection
                              title={link.title}
                              setTitle={(newTitle) => {
                                updateWebsiteTitle(index, newTitle);
                              }}
                              showDropdown={dropdownState.showDropdown}
                              setShowDropdown={(value) => updateWebsiteDropdownState(index, { showDropdown: value })}
                              showAddTitle={dropdownState.showAddTitle}
                              setShowAddTitle={(value) => updateWebsiteDropdownState(index, { showAddTitle: value })}
                              newTitleName={dropdownState.newTitleName}
                              setNewTitleName={(value) => updateWebsiteDropdownState(index, { newTitleName: value })}
                              disabled={isSaving}
                            />
                          </div>

                          {/* URL input field with proper padding for remove button */}
                          <div className="relative">
                            <input
                              type="text"
                              name="url"
                              value={link.url || ''}
                              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                              placeholder={getPlaceholder(link.title)}
                              disabled={isSaving}
                              className={`w-full p-2.5 pr-5 h-[48px] rounded-xl border ${
                                hasSubmitted && errors[`link_${index}`] ? 'border-red-500' : 'border-gray-400'
                              } bg-white hover:border-red-300 text-black font-extralight placeholder-gray-400 focus:outline-none focus:border-red-500`}
                              style={{
                                fontSize: '16px',
                                fontWeight: 100,
                                paddingRight: '2.5rem'
                              }}
                            />

                            {/* Remove button - positioned absolutely in top-right */}
                            {links.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLink(index)}
                                disabled={isSaving}
                                className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-lg hover:bg-red-50 group"
                                style={{ zIndex: 10 }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-3 h-3 text-gray-400 group-hover:text-red-500"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}

                            {hasSubmitted && errors[`link_${index}`] && (
                              <p className="absolute top-full mt-1 right-1 text-xs text-red-600 font-extralight z-20">
                                {errors[`link_${index}`]}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* add website */}
                  <div className="flex gap-2 items-center justify-end mr-3 mt-4">
                    <Button
                      type="button"
                      onClick={addLink}
                      className="text-sm font-light tracking-wide text-red-500 hover:font-normal"
                    >
                      <span className="text-sm text-black font-extralight">
                        <span className="text-red-500 font-normal">+</span> add
                      </span>{' '}
                      website
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(true)}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-extralight"
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