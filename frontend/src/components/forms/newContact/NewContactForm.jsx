import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContextProvider';
import { createContact, getCategories } from '../../../apiCalls/contactsApi';
import { FormToApiData } from '../../helperFunctions/FormToApiData';
import { validateDate } from '../../helperFunctions/dateConversion';
import { formatDateForBackend } from '../../helperFunctions/dateConversion';

import { NavigationButtons } from '../../ui/Buttons';
import ProgressIndicator from './ProgressIndicator';
import Step1BasicInfo from './Step1BasicInfo';
import Step2AdditionalInfo from './Step2AdditionalInfo';
// import ContactPlanner from './ContactPlanner';


export default function NewContactForm({ contactPhoto, onCreateSuccess }) {
  const navigate = useNavigate();
  const { accessToken } = useAuthContext();

  // multi-step form or optional sections
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Basic form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    categories: [],
    isFavorite: false,
    birthdate: '',
    notes: '',
    isContacted: false,
    isToContact: false,
    lastContactDate: '',
    lastContactPlace: '',
    nextContactDate: '',
    nextContactPlace: ''
  });

  // Multi-field arrays
  const [emails, setEmails] = useState([{ title: 'private', email: '' }]);
  const [phones, setPhones] = useState([{ title: 'mobile', phone: '' }]);
  const [addresses, setAddresses] = useState([{
    title: 'private',
    streetAndNr: '',
    additionalInfo: '',
    postalcode: '',
    city: '',
    country: ''
  }]);
  const [links, setLinks] = useState([{ title: '', url: '' }]);

  // UI states
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Optional sections visibility
  const [showBirthdate, setShowBirthdate] = useState(false);
  const [showLinks, setShowLinks] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

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

  // ========================================
  // LOAD & HANDLE CATEGORIES
  // ========================================

  // Categories loading with guard
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


  const addCategory = async () => {
    if (newCategoryName.trim() && !isAddingCategory) {
      setIsAddingCategory(true);

      try {
        const categoryName = newCategoryName.charAt(0).toUpperCase() + newCategoryName.slice(1).trim();

        const newCategory = {
          // id: nextId,
          new_category: true,
          name: categoryName,
          creator_id: null,
          contact_count: 0,
          isPersisted: false
        };

        setCategories(prevCategories => [...prevCategories, newCategory]);

        setFormData(prevFormData => ({
          ...prevFormData,
          categories: [...prevFormData.categories, { name: newCategory.name, new_category: true, }]
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
  // NAVIGATION HANDLERS
  // ============================================

  const nextStep = async () => {
    // Validate the current step
    const isValid = validateForm();

    // If validation fails, don't proceed
    if (!isValid) {
      return;
    }

    // If validation passes, move to next step
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // ============================================
  // INPUT HANDLERS
  // ============================================

  // Handle basic input changes
  const handleInputChange = (e) => {
    console.log('e.target:', e.target.value);
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  // handle EMAILS
  const handleEmailChange = (index, field, value) => {
    const newEmails = [...emails];
    newEmails[index] = { ...newEmails[index], [field]: value };
    setEmails(newEmails);
  };

  const addEmail = () => {
    setEmails([...emails, { title: '', email: '' }]);
  };

  const removeEmail = (index) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  // handle PHONES
  const handlePhoneChange = (index, field, value) => {
    const newPhones = [...phones];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setPhones(newPhones);
  };

  const addPhone = () => {
    setPhones([...phones, { title: '', phone: '' }]);
  };

  const removePhone = (index) => {
    if (phones.length > 1) {
      setPhones(phones.filter((_, i) => i !== index));
    }
  };

  // handle ADDRESSES
  const handleAddressChange = (index, field, value) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setAddresses(newAddresses);
  };

  const addAddress = () => {
    setAddresses([...addresses, {
      title: '',
      streetAndNr: '',
      additionalInfo: '',
      postalcode: '',
      city: '',
      country: ''
    }]);
  };

  const removeAddress = (index) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index));
      // Clean up dropdown state
      setAddressDropdownStates(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  // Handle Links
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

  const addLink = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const removeLink = (index) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };


  // ============================================
  // TITLE HANDLERS
  // ============================================

  const getEmailDropdownState = (index) => emailDropdownStates[index] || {
    showDropdown: false,
    showAddTitle: false,
    newTitleName: ''
  };

  const updateEmailDropdownState = (index, updates) => {
    setEmailDropdownStates(prev => ({
      ...prev,
      [index]: {
        ...(prev[index] || { showDropdown: false, showAddTitle: false, newTitleName: '' }),
        ...updates
      }
    }));
  };

  const updateEmailTitle = (index, newTitle) => {
    const updatedEmails = [...emails];
    updatedEmails[index].title = newTitle;
    setEmails(updatedEmails);
  };

  // Helper functions for PHONES
  const getPhoneDropdownState = (index) => phoneDropdownStates[index] || {
    showDropdown: false,
    showAddTitle: false,
    newTitleName: ''
  };

  const updatePhoneDropdownState = (index, updates) => {
    setPhoneDropdownStates(prev => ({
      ...prev,
      [index]: {
        ...(prev[index] || { showDropdown: false, showAddTitle: false, newTitleName: '' }),
        ...updates
      }
    }));
  };

  const updatePhoneTitle = (index, newTitle) => {
    const updatedPhones = [...phones];
    updatedPhones[index].title = newTitle;
    setPhones(updatedPhones);
  };

  // Helper functions for ADDRESSES
  const getAddressDropdownState = (index) => addressDropdownStates[index] || {
    showDropdown: false,
    showAddTitle: false,
    newTitleName: ''
  };

  const updateAddressDropdownState = (index, updates) => {
    setAddressDropdownStates(prev => ({
      ...prev,
      [index]: {
        ...(prev[index] || { showDropdown: false, showAddTitle: false, newTitleName: '' }),
        ...updates
      }
    }));
  };

  const updateAddressTitle = (index, newTitle) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index].title = newTitle;
    setAddresses(updatedAddresses);
  };

  // ============================================
  // VALIDATION
  // ============================================

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'first name is required.';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'first name must be at least 2 characters.';
    }

    // Last name validation (optional)
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'last name is required.';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'last name must be at least 2 characters.';
    }

    // Category validation
    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'at least one category is required.';
    }

    // Birthdate validation
    if (formData.birthdate && formData.birthdate.trim()) {
      const birthdateError = validateDate(formData.birthdate, 'birthdate', true);
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
          newErrors[`link_${index}`] = 'title for URL required.';
        }
      });
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // FORM SUBMISSION
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setIsLoading(true);

    try {
      if (!accessToken) {
        throw new Error('Access token is not available');
      }

      console.log('sending categories', formData.categories.map(cat => cat.id))

      // Prepare contact data with multi-fields
      const contactData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName?.trim() || null,
        is_favorite: formData.isFavorite || false,
        birth_date: formatDateForBackend(formData.birthdate?.trim()) || null,
        last_contact_date: formatDateForBackend(formData.lastContactDate?.trim()) || null,
        last_contact_place: formData.lastContactPlace?.trim() || null,
        next_contact_date: formatDateForBackend(formData.nextContactDate?.trim()) || null,
        next_contact_place: formData.nextContactPlace?.trim() || null,
        is_contacted: formData.isContacted || false,
        is_to_contact: formData.isToContact || false,
        notes: formData.notes?.trim() || null,
        categories: formData.categories
      };

      // Filter and add emails
      contactData.emails = emails
        .filter(e => e.email?.trim() && e.title?.trim())
        .map(e => ({
          email: e.email.trim(),
          title: e.title.trim()
        }));

      // Filter and add phones
      contactData.phones = phones
        .filter(p => p.phone?.trim() && p.title?.trim())
        .map(p => ({
          phone: p.phone.trim(),
          title: p.title.trim()
        }));

      // Filter and add addresses
      contactData.addresses = addresses
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
      contactData.links = links
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

      console.log('Creating contact with data:', contactData);

      // Create contact
      const newContact = await createContact(accessToken, contactData);

      console.log('Contact created successfully:', newContact);

      // Call success callback
      if (onCreateSuccess) {
        onCreateSuccess(newContact);
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to create contact'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };


  // ============================================
  // RENDER STEP CONTENT
  // ============================================

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            formData={formData}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            showBirthdate={showBirthdate}
            setShowBirthdate={setShowBirthdate}
            emails={emails}
            phones={phones}
            addresses={addresses}
            addEmail={addEmail}
            handleEmailChange={handleEmailChange}
            removeEmail={removeEmail}
            addPhone={addPhone}
            handlePhoneChange={handlePhoneChange}
            removePhone={removePhone}
            addAddress={addAddress}
            handleAddressChange={handleAddressChange}
            removeAddress={removeAddress}
            setAddresses={setAddresses}
            showAddress={showAddress}
            setShowAddress={setShowAddress}
            getEmailDropdownState={getEmailDropdownState}
            getPhoneDropdownState={getPhoneDropdownState}
            getAddressDropdownState={getAddressDropdownState}
            updateEmailDropdownState={updateEmailDropdownState}
            updatePhoneDropdownState={updatePhoneDropdownState}
            updateAddressDropdownState={updateAddressDropdownState}
            updateEmailTitle={updateEmailTitle}
            updatePhoneTitle={updatePhoneTitle}
            updateAddressTitle={updateAddressTitle}
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
            errors={errors}
            hasSubmitted={hasSubmitted}
            isLoading={isLoading}
          />
        );

      case 2:
        return (
          <Step2AdditionalInfo
            formData={formData}
            handleInputChange={handleInputChange}
            setFormData={setFormData}
            links={links}
            showBirthdate={showBirthdate}
            setShowBirthdate={setShowBirthdate}
            handleLinkChange={handleLinkChange}
            addLink={addLink}
            removeLink={removeLink}
            showLinks={showLinks}
            setShowLinks={setShowLinks}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
            errors={errors}
            hasSubmitted={hasSubmitted}
            isLoading={isLoading}
          />
        );
        
      // NOT USED ANYMORE
      // case 3:
      //   return (
      //     <ContactPlanner
      //       formData={formData}
      //       handleInputChange={handleInputChange}
      //       setFormData={setFormData}
      //       expandedNotes={expandedNotes}
      //       setExpandedNotes={setExpandedNotes}
      //       errors={errors}
      //       hasSubmitted={hasSubmitted}
      //       isLoading={isLoading}

      //     />
      //   );

        

      default:
        return null;
    }
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <div>
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        goToStep={goToStep}
      />

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-[90vw] min-w-[260px] max-w-[480px] mx-auto -mt-4"
        style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}
      >
        <div
          className="bg-white rounded-3xl p-4 pt-8 shadow-lg relative pb-20"
          style={{
            boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
          }}
        >

          {renderStepContent()}

        </div>

        {/* Navigation Buttons */}
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={totalSteps}
          prevStep={prevStep}
          nextStep={nextStep}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {/* Back Links */}
        <div className="w-full px-6 max-w-[480px] -mt-24">
          <div className="text-black dark:text-white font-extralight block relative"
            style={{ fontSize: '16px' }}>
             want to {' '}
            <button
              onClick={() => navigate('/myspace/contacts')}
              className="font-extralight text-red-500 hover:underline bg-transparent border-none cursor-pointer"
            >
              cancel?
            </button>
          </div>
        </div>
      </form>

      {/* Global Error Message */}
      {errors.submit && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-extralight">{errors.submit}</p>
        </div>
      )}
    </div>
  );
}