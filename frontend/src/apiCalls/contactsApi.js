

// Get the appropriate backend URL based on environment
const getBackendUrl = () => {
    // In development, use local backend URL
    if (import.meta.env.DEV || import.meta.env.VITE_LOCAL_BACKEND_URL) {
        return import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://127.0.0.1:5000';
    }
    // In production, use production backend URL
    return import.meta.env.VITE_BACKEND_URL;
};

const API_BASE_URL = getBackendUrl();


// Helper function for API requests
const apiRequest = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options, 
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
        return data;

    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};

// ============================================
// CONTACT CRUD OPERATIONS
// ============================================

/**
 * CREATE CONTACT with multi-field support
 * 
 * Expected contactData format:
 * {
 *   first_name: string (required),
 *   last_name: string,
 *   is_favorite: boolean,
 *   birth_date: string (DD.MM.YYYY),
 *   next_contact_date: string (DD.MM.YYYY),
 *   next_contact_place: string,
 *   last_contact_date: string (DD.MM.YYYY),
 *   last_contact_place: string,
 *   is_contacted: boolean,
 *   is_to_contact: boolean,
 *   notes: string,
 *   categories: [{ id: number, name: string }] or [number],
 *   emails: [{ email: string, title: string }],
 *   phones: [{ phone: string, title: string }],
 *   addresses: [{ street_and_nr: string, additional_info: string, postal_code: string, city: string, country: string, title: string }],
 *   links: [{ url: string, title: string }]
 * }
 */

export const createContact = async (accessToken, contactData) => {
    console.log('Creating contact with data:', contactData);
    
    const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
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
 * 
 * Updates all fields including emails, phones, addresses, links, and categories
 * Backend will replace all multi-field arrays with new data
 */

export const updateContact = async (accessToken, contactId, contactData) => {
    console.log('Updating contact with data:', contactData);
    
    const response = await apiRequest(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(contactData),
    });

    console.log("Contact updated successfully:", response.contact);
    return response.contact;
};


/**
 * GET contact by ID
 * 
 * Returns complete contact with all related data:
 * - emails[], phones[], addresses[], links[], categories[]
 */
export const getContactById = async (accessToken, contactId) => {
    const data = await apiRequest(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    console.log("Contact fetched:", data.contact);
    return data.contact;
};


/**
 * GET all contacts
 * Returns array of contacts with all related data
 */
export const getContacts = async (accessToken) => {
    console.log("Fetching all contacts");
    
    const data = await apiRequest(`${API_BASE_URL}/contacts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    console.log(`Fetched ${data.contacts?.length || 0} contacts`);
    return data.contacts;
};


/**
 * DELETE contact by ID
 */
export const deleteContactById = async (accessToken, contactId) => {
    const response = await apiRequest(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    console.log("Contact deleted successfully");
    return response;
};


/**
 * BULK DELETE multiple contacts
 * 
 * @param {Array<number>} contactIds - Array of contact IDs to delete
 */
export const bulkDeleteContacts = async (accessToken, contactIds) => {
    console.log(`Bulk deleting ${contactIds.length} contacts`);
    
    const response = await apiRequest(`${API_BASE_URL}/contacts/bulk-delete`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ contact_ids: contactIds }),
    });
    
    console.log(`Deleted ${response.deleted_count} contacts`);
    return response;
};


// ============================================
// FAVORITES
// ============================================

/**
 * GET all favorite contacts
 */
export const getFavorites = async (accessToken) => {
    const data = await apiRequest(`${API_BASE_URL}/contacts/favorites`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    console.log(`Fetched ${data.favorites?.length || 0} favorites`);
    return data.favorites;
};


/**
 * TOGGLE favorite status
 */
export const toggleFavorite = async (accessToken, contactId) => {
    const data = await apiRequest(`${API_BASE_URL}/contacts/${contactId}/favorite`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    console.log("Favorite toggled:", data.contact);
    return data.contact;
};


// ============================================
// CATEGORY OPERATIONS
// ============================================

/**
 * GET all categories for the authenticated user
 */
export const getCategories = async (accessToken) => {
    const data = await apiRequest(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    console.log(`Fetched ${data.categories?.length || 0} categories`);
    return data.categories;
};


/**
 * CREATE a new category
 * 
 * @param {Object} categoryData - { name: string }
 */
export const createCategory = async (accessToken, categoryData) => {
    const response = await apiRequest(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(categoryData),
    });
    
    console.log("Category created:", response.category);
    return response.category;
};


/**
 * UPDATE a category
 * 
 * @param {Object} categoryData - { name: string }
 */
export const updateCategory = async (accessToken, categoryId, categoryData) => {
    const data = await apiRequest(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(categoryData),
    });
    
    console.log("Category updated:", data.category);
    return data.category;
};


/**
 * DELETE a category
 */
export const deleteCategory = async (accessToken, categoryId) => {
    const response = await apiRequest(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {      
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    console.log("Category deleted");
    return response;
};


// ============================================
// CONTACT-CATEGORY RELATIONSHIPS
// ============================================

/**
 * GET all categories for a specific contact
 */
export const getContactCategories = async (accessToken, contactId) => {
    const response = await apiRequest(`${API_BASE_URL}/contact_categories/contacts/${contactId}/categories`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    return response.categories;
};


/**
 * UPDATE all categories for a contact (replaces existing)
 * 
 * @param {Array<number>} categoryIds - Array of category IDs
 */
export const updateContactCategories = async (accessToken, contactId, categoryIds) => {
    const response = await apiRequest(`${API_BASE_URL}/contact_categories/contacts/${contactId}/categories`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ category_ids: categoryIds }),
    });
    
    console.log("Contact categories updated");
    return response;
};


/**
 * ADD multiple categories to a contact
 * 
 * @param {Array<number>} categoryIds - Array of category IDs to add
 */
export const addCategoriesToContact = async (accessToken, contactId, categoryIds) => {
    const response = await apiRequest(`${API_BASE_URL}/contact_categories/contacts/${contactId}/categories`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ category_ids: categoryIds }),
    });
    
    console.log("Categories added to contact");
    return response;
};


/**
 * REMOVE a specific category from a contact
 */
export const removeCategoryFromContact = async (accessToken, contactId, categoryId) => {
    const response = await apiRequest(`${API_BASE_URL}/contact_categories/contacts/${contactId}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    console.log("Category removed from contact");
    return response;
};


/**
 * GET all contacts in a specific category
 */
export const getContactsInCategory = async (accessToken, categoryId) => {
    const response = await apiRequest(`${API_BASE_URL}/contact_categories/categories/${categoryId}/contacts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    return response.contacts;
};





