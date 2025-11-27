// Get the appropriate backend URL based on environment
const getBackendUrl = () => {
    if (import.meta.env.DEV || import.meta.env.VITE_LOCAL_BACKEND_URL) {
        return import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://127.0.0.1:5000';
    }
    return import.meta.env.VITE_BACKEND_URL;
};

const API_BASE_URL = getBackendUrl();

// ============================================
// CONTACT CRUD OPERATIONS
// ============================================

/**
 * CREATE CONTACT with multi-field support
 */
export const createContact = async (authFetch, contactData) => {
    console.log('Creating contact with data:', contactData);
    
    const response = await authFetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        body: JSON.stringify(contactData),
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }

    const data = await response.json();
    console.log("Contact created successfully:", data.contact);
    return data.contact;
};

/**
 * UPDATE CONTACT with multi-field support
 */
export const updateContact = async (authFetch, contactId, contactData) => {
    console.log('Updating contact with data:', contactData);
    
    const response = await authFetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        body: JSON.stringify(contactData),
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }

    const data = await response.json();
    console.log("Contact updated successfully:", data.contact);
    return data.contact;
};

/**
 * GET contact by ID
 */
export const getContactById = async (authFetch, contactId) => {
    const response = await authFetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Contact fetched:", data.contact);
    return data.contact;
};

/**
 * GET all contacts
 */
export const getContacts = async (authFetch) => {
    console.log("Fetching all contacts");
    
    const response = await authFetch(`${API_BASE_URL}/contacts`, {
        method: 'GET',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.contacts?.length || 0} contacts`);
    return data.contacts;
};

/**
 * DELETE contact by ID
 */
export const deleteContactById = async (authFetch, contactId) => {
    const response = await authFetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Contact deleted successfully");
    return data;
};

/**
 * BULK DELETE multiple contacts
 */
export const bulkDeleteContacts = async (authFetch, contactIds) => {
    console.log(`Bulk deleting ${contactIds.length} contacts`);
    
    const response = await authFetch(`${API_BASE_URL}/contacts/bulk-delete`, {
        method: 'DELETE',
        body: JSON.stringify({ contact_ids: contactIds }),
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log(`Deleted ${data.deleted_count} contacts`);
    return data;
};

// ============================================
// FAVORITES
// ============================================

/**
 * GET all favorite contacts
 */
export const getFavorites = async (authFetch) => {
    const response = await authFetch(`${API_BASE_URL}/contacts/favorites`, {
        method: 'GET',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.favorites?.length || 0} favorites`);
    return data.favorites;
};

/**
 * TOGGLE favorite status
 */
export const toggleFavorite = async (authFetch, contactId) => {
    const response = await authFetch(`${API_BASE_URL}/contacts/${contactId}/favorite`, {
        method: 'POST',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Favorite toggled:", data.contact);
    return data.contact;
};

// ============================================
// CATEGORY OPERATIONS
// ============================================

/**
 * GET all categories for the authenticated user
 */
export const getCategories = async (authFetch) => {
    const response = await authFetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.categories?.length || 0} categories`);
    return data.categories;
};

/**
 * CREATE a new category
 */
export const createCategory = async (authFetch, categoryData) => {
    const response = await authFetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Category created:", data.category);
    return data.category;
};

/**
 * UPDATE a category
 */
export const updateCategory = async (authFetch, categoryId, categoryData) => {
    const response = await authFetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Category updated:", data.category);
    return data.category;
};

/**
 * DELETE a category
 */
export const deleteCategory = async (authFetch, categoryId) => {
    const response = await authFetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Category deleted");
    return data;
};

// ============================================
// CONTACT-CATEGORY RELATIONSHIPS
// ============================================

/**
 * GET all categories for a specific contact
 */
export const getContactCategories = async (authFetch, contactId) => {
    const response = await authFetch(`${API_BASE_URL}/contact_categories/contacts/${contactId}/categories`, {
        method: 'GET',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    return data.categories;
};

/**
 * UPDATE all categories for a contact (replaces existing)
 */
export const updateContactCategories = async (authFetch, contactId, categoryIds) => {
    const response = await authFetch(`${API_BASE_URL}/contact_categories/contacts/${contactId}/categories`, {
        method: 'PUT',
        body: JSON.stringify({ category_ids: categoryIds }),
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Contact categories updated");
    return data;
};

/**
 * ADD multiple categories to a contact
 */
export const addCategoriesToContact = async (authFetch, contactId, categoryIds) => {
    const response = await authFetch(`${API_BASE_URL}/contact_categories/contacts/${contactId}/categories`, {
        method: 'POST',
        body: JSON.stringify({ category_ids: categoryIds }),
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Categories added to contact");
    return data;
};

/**
 * REMOVE a specific category from a contact
 */
export const removeCategoryFromContact = async (authFetch, contactId, categoryId) => {
    const response = await authFetch(`${API_BASE_URL}/contact_categories/contacts/${contactId}/categories/${categoryId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Category removed from contact");
    return data;
};

/**
 * GET all contacts in a specific category
 */
export const getContactsInCategory = async (authFetch, categoryId) => {
    const response = await authFetch(`${API_BASE_URL}/contact_categories/categories/${categoryId}/contacts`, {
        method: 'GET',
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
            errorMessage = await response.text() || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }
    
    const data = await response.json();
    return data.contacts;
};