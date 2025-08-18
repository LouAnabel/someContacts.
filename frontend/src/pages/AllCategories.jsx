import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContextProvider';
import { getCategories, getContacts, updateCategory, deleteCategory } from '../apiCalls/contactsApi';
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

export default function ShowCategories() {
  const navigate = useNavigate();
  const { accessToken } = useAuthContext();
  const [searchParams] = useSearchParams();

  // Data states
  const [categories, setCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [categoryContacts, setCategoryContacts] = useState({});

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const categoryRef = useRef({});

  // Edit states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guards
  const categoriesFetched = useRef(false);
  const contactsFetched = useRef(false);



  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken || categoriesFetched.current) return;
      categoriesFetched.current = true;

      try {
        setIsLoading(true);
        setError(null);

        const categoriesData = await getCategories(accessToken);
        console.log('Categories data:', categoriesData);
        
        if (!categoriesData || !Array.isArray(categoriesData)) {
          console.error('Invalid categories data:', categoriesData);
          setCategories([]);
          return;
        }

        setCategories(categoriesData);

      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories. Please try again later.');
        setCategories([]);
        categoriesFetched.current = false;
      }
    };

    fetchCategories();
  }, [accessToken]);


  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!accessToken || contactsFetched.current) return;
      contactsFetched.current = true;

      try {
        const contactsData = await getContacts(accessToken);
        console.log('Contacts data:', contactsData);
        
        if (!contactsData || !Array.isArray(contactsData)) {
          console.error('Invalid contacts data:', contactsData);
          setContacts([]);
          return;
        }

        setContacts(contactsData);

      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContacts([]);
        contactsFetched.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [accessToken]);



  // Process category contacts when data changes
  useEffect(() => {
    if (categories.length > 0 && contacts.length > 0) {
      const categoryContactsMap = {};

      categories.forEach(category => {
        const contactsInCategory = contacts.filter(contact => {
          // Check different possible category structures
          return contact.category_id === category.id || 
                 contact.category?.id === category.id ||
                 contact.categories?.some(cat => cat.id === category.id);
        });

        categoryContactsMap[category.id] = contactsInCategory;
      });

      setCategoryContacts(categoryContactsMap);
    }
  }, [categories, contacts]);

  // Reset guards when component unmounts
  useEffect(() => {
    return () => {
      categoriesFetched.current = false;
      contactsFetched.current = false;
    };
  }, []);


  // Handle category expansion from URL
  useEffect(() => {
    const expandCategoryId = searchParams.get('expand');
    if (!expandCategoryId || categories.length === 0) {
      return;
    }
    console.log('Processing URL expansion for category:', expandCategoryId);
    console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
    
    const targetCategory = categories.find(cat => {
    return String(cat.id) === String(expandCategoryId) || 
           cat.id === parseInt(expandCategoryId) ||
           cat.id === expandCategoryId;
    });

    if (targetCategory) {
      console.log('Found target category:', targetCategory);
        
      // Expand the category
      setExpandedCategories(prev => {
        const newExpanded = new Set(prev);
        newExpanded.add(targetCategory.id);
        return newExpanded;
      });

      // Scroll to the category after a brief delay to ensure rendering
      requestAnimationFrame(() => {
        setTimeout(() => {
          const categoryElement = categoryRef.current[targetCategory.id];
          if (categoryElement) {
            categoryElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          } else {
            console.log('Category element not found in ref');
          }
        }, 50);
      });

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('expand');
      const cleanUrl = `/myspace/categories${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
      navigate(cleanUrl, { replace: true });
    } else {
      console.log('Category not found for ID:', expandCategoryId);
    }
  }, [categories, searchParams, navigate]);


  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const startEditing = (category) => {
    setEditingCategory(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditingName('');
  };

  const saveCategory = async (categoryId) => {
    if (!editingName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedCategory = await updateCategory(accessToken, categoryId, { name: editingName.trim() });
      console.log('Category updated successfully:', updatedCategory);

      // Update local state
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, name: editingName.trim() }
            : cat
        )
      );

      setEditingCategory(null);
      setEditingName('');

    } catch (error) {
      console.error('Error updating category:', error);
      setError(`Failed to update category: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (category) => {
    const contactsInCategory = categoryContacts[category.id] || [];
    if (contactsInCategory.length > 0) {
      setError(`Cannot delete category "${category.name}" because it contains ${contactsInCategory.length} contact${contactsInCategory.length === 1 ? '' : 's'}.`);
      return;
    }

    setCategoryToDelete(category);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategory(accessToken, categoryToDelete.id);
      console.log('Category deleted successfully');

      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      
      // Remove from expanded categories
      setExpandedCategories(prev => {
        const newExpanded = new Set(prev);
        newExpanded.delete(categoryToDelete.id);
        return newExpanded;
      });

      setShowDeleteConfirmation(false);
      setCategoryToDelete(null);

    } catch (error) {
      console.error('Error deleting category:', error);
      setError(`Failed to delete category: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const navigateToContact = (contactId) => {
    navigate(`/myspace/contacts/${contactId}`);
  };

  const clearError = () => {
    setError(null);
  };

  // IS LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }


  //IF NO CATEGORIES
  if (categories.length === 0) {
    return (
      <div className="py-20 w-full flex flex-col items-center justify-center"
           style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
        
        <Button 
          onClick={() => navigate('/myspace/contacts')}
          className="text-black dark:text-white hover:text-red-500 mb-5 -mt-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">
          All Categories
        </h1>
        
        <div className="font-extralight text-red-500 tracking-wider text-center">
          No categories found.
          <p>Categories will appear here once you create contacts.</p>
        </div>

        <CircleButton
          size="small"
          variant="dark"
          className="border border-white/30 relative font-semibold bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:border-red-500"
          style={{
            marginTop: '2rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'block'
          }}
          onClick={() => navigate('/myspace/newcontact')}>
          +
        </CircleButton>
      </div>
    );
  }


  // ALL CATEGORIES
  return (
    <div className="w-full 2xl:flex 2xl:flex-col 2xl:items-center"
         style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
      
      {/* Header */}
      <div className="w-full text-center">
        <div className="relative items-center mt-14 -mb-14">
          <Button 
            onClick={() => navigate('/myspace/contacts')}
            className="text-black dark:text-white hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
        
        <h1 className="pt-10 text-3xl font-bold text-gray-900 dark:text-white mb-8 mt-6">
          All <span className="text-red-500">{categories.length}</span> Categories
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-auto max-w-2xl px-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center justify-between">
            <p className="text-red-600 font-extralight">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 ml-4"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="w-full max-w-2xl min-w-[180px] mx-auto px-4 pb-20">
        <div className="space-y-4">
          {categories.map((category) => {
            const contactsInCategory = categoryContacts[category.id] || [];
            const isExpanded = expandedCategories.has(category.id);
            const isEditing = editingCategory === category.id;

            return (
              <div 
                key={category.id}
                ref={el => categoryRef.current[category.id] = el} // ref for scrolling
                className="bg-white rounded-3xl overflow-hidden"
                style={{ 
                  boxShadow: '0 4px 32px rgba(109, 71, 71, 0.15)'
                }}>
                
                {/* Category Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      
                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleCategoryExpansion(category.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={contactsInCategory.length === 0}
                      >
                        {contactsInCategory.length > 0 ? (
                          <svg 
                            className={`w-6 h-6 ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                          </svg>
                        ) : (
                          <div className="w-6 h-6 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                        )}
                      </button>

                      {/* Category Name */}
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex items-center space-x-3">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 font-extralight"
                              placeholder="Category name"
                              autoFocus
                            />
                            <button
                              onClick={() => saveCategory(category.id)}
                              disabled={isSaving || !editingName.trim()}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600  disabled:opacity-50 disabled:cursor-not-allowed font-extralight"
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={isSaving}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 font-extralight"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-3">
                            <h3 className="text-xl font-semibold text-black dark:text-gray-900">
                              {category.name}
                            </h3>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category Info */}
                    {!isEditing && (
                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-extralight mr-14">
                          {contactsInCategory.length} contact{contactsInCategory.length === 1 ? '' : 's'}
                        </span>
                        
                        {/* Edit Button - always present */}
                        <button
                          onClick={() => startEditing(category)}
                          className="p-2 text-gray-600 hover:text-red-500"
                          title="Edit category name"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {/* Delete Button - only for empty categories, but with fixed width container */}
                        <div className="w-9 h-9 flex items-center justify-center">
                          {contactsInCategory.length === 0 && (
                            <button
                              onClick={() => handleDeleteRequest(category)}
                              className="p-2 text-red-500 hover:text-red-700"
                              title="Delete category"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contacts List (Expandable) */}
                {isExpanded && contactsInCategory.length > 0 && (
                  <div className="border-t border-gray-100 bg-white">
                    <div className="p-6 space-y-3">
                      {/* <h4 className="text-sm font-light text-red-500 mb-4 -mt-3">
                        Contacts in this category:
                      </h4> */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {contactsInCategory.map((contact) => (
                          <button
                            key={contact.id}
                            onClick={() => navigateToContact(contact.id)}
                            className="flex items-center space-x-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-200 hover:border-red-100"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-bold text-sm">
                                {contact.first_name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-extralight text-black truncate">
                                {contact.first_name} {contact.last_name}
                              </p>
                              {contact.email && (
                                <p className="text-sm text-gray-500 font-extralight truncate">
                                  {contact.email}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 relative overflow-visible w-[85vw] min-w-[280px] max-w-[400px] mx-auto"
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
              delete <span className="text-red-500">{categoryToDelete.name}?</span>
            </h2>
            
            {/* Message */}
            <p className="text-center text-black tracking-wider font-extralight mb-8 leading-relaxed">
              this action cannot be undone. the category will be permanently removed.
            </p>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setCategoryToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-3 px-6 rounded-xl font-extralight border-2 border-gray-300 text-black tracking-wide font-md hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '16px' }}
              >
                cancel.
              </button>
              
              {/* Delete Button */}
              <button
                type="button"
                onClick={handleDeleteCategory}
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
    </div>
  );
}