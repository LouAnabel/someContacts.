const API_BASE_URL = 'http://127.0.0.1:5000';

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
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};



// CREATE contact with multiple categories
export const createContact = async (accessToken, contactData) => {
    console.log('Creating contact with data:', contactData);
    
    const response = await apiRequest(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(contactData),
    });

    // If contact was created successfully, add categories
    if (response.success && response.contact && contactData.category_ids?.length > 0) {
        const contactId = response.contact.id;
        
        try {
            // Add categories to the contact
            await addCategoriesToContact(accessToken, contactId, contactData.category_ids);
            
            // Fetch the updated contact with categories
            const updatedContact = await getContactById(accessToken, contactId);
            return updatedContact;
        } catch (categoryError) {
            console.error('Failed to add categories to contact:', categoryError);
            // Return the contact even if category assignment failed
            return response;
        }
    }
    
    return response;
};


// UPDATE contact with multiple categories
export const updateContact = async (accessToken, contactId, contactData) => {
    console.log('In API FILE: Updating contact with data:', contactData);
    
    // First, update the basic contact information
    const response = await apiRequest(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(contactData),
    });

    // If categories are provided, update them separately
    if (contactData.category_ids !== undefined) {
        try {
            await updateContactCategories(accessToken, contactId, contactData.category_ids);
        } catch (categoryError) {
            console.error('Failed to update contact categories:', categoryError);
            // Continue with the response even if category update failed
        }
    }

    // Fetch the updated contact with categories
    const updatedContact = await getContactById(accessToken, contactId);
    return updatedContact;
};


// POST / ADD multiple categories to a contact
export const addCategoriesToContact = async (accessToken, contactId, categoryIds) => {
    return await apiRequest(`${API_BASE_URL}/contact-categories/contacts/${contactId}/categories`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ category_ids: categoryIds }),
    });
};


// DELETE a category from a contact
export const removeCategoryFromContact = async (accessToken, contactId, categoryId) => {
    return await apiRequest(`${API_BASE_URL}/contact-categories/contacts/${contactId}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
};


// UPDATE all categories for a contact (replace existing)
export const updateContactCategories = async (accessToken, contactId, categoryIds) => {
    return await apiRequest(`${API_BASE_URL}/contact-categories/contacts/${contactId}/categories`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ category_ids: categoryIds }),
    });
};

// READ all categories for a contact
export const getContactCategories = async (accessToken, contactId) => {
    return await apiRequest(`${API_BASE_URL}/contact-categories/contacts/${contactId}/categories`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
};

// READ all contacts in a category
export const getContactsInCategory = async (accessToken, categoryId) => {
    return await apiRequest(`${API_BASE_URL}/contact-categories/categories/${categoryId}/contacts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
};


// GET contact By ID
export const getContactById = async (accessToken, contactId) => {
    return await apiRequest(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
};


// GET All Contacts
export const getContacts = async (accessToken) => {
    console.log("In API FILE: fetch all contacts")
    data = await apiRequest(`${API_BASE_URL}/contacts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    console.log("In API FILE: contacts data:", data)
    return data
};


// DELETE contact by ID
export const deleteContactById = async (accessToken, contactId) => {
    return await apiRequest(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
};


// GET all categories
export const getCategories = async (accessToken) => {
    return await apiRequest(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
};


// CREATE a category
export const createCategory = async (accessToken, categoryData) => {
    return await apiRequest(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(categoryData),
    });
};