

export async function getContacts(token) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }); 

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }   
    const data = await response.json();
    console.log('Fetched contacts:', data);
    return data.contacts || []; // Ensure we return an array even if contacts is undefined
  }

  catch (error) {
      alert(`Error fetching contacts: ${error.message}`);
      console.error('Error fetching contacts:', error);
      return [];
  }   
}


export async function getContactById(token, contactId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contacts/${contactId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }   
    const data = await response.json();
    console.log('Fetched contact:', data);
    return data;
  } catch (error) {
    alert(`Error fetching contact: ${error.message}`);
    console.error('Error fetching contact:', error);
    return null;
  }
}


export async function createContact(token, contactData) {
  try {
    const response = await fetch('http://127.0.0.1:5000/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(contactData)
    });     
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Contact created:', data);
    return data;
  } catch (error) {
    alert(`Error creating contact: ${error.message}`);
    console.error('Error creating contact:', error);
    return null;
  }
} 


// Get all Categories with ID validation
export const getCategories = async (accessToken) => {
    try {
        if (!accessToken) {
            throw new Error('Access token is required')
        }

        console.log("Trying to fetch GET")
        const response = await fetch('http://127.0.0.1:5000/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        console.log("fetching successful, creating categories in json")
        const categoriesData = await response.json();
        
        // Ensure all categories have unique IDs
        const categoriesWithIds = categoriesData.categories.map((category, index) => ({
            ...category,
            id: category.id || `fallback-${index}-${Date.now()}` // Ensure every category has an ID
        }));
        
        console.log('Categories with IDs:', categoriesWithIds);
        
        return categoriesWithIds;
        
    } catch (error) {
        console.error('Error fetching categories:', error);
        // Return empty array on error so the component doesn't break
        return [];
    }
};
