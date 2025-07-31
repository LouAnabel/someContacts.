
// READ all contacts
export async function getContacts(token) {
  try {
    const response = await fetch("http://127.0.0.1:5000/contacts", {
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

// GET Contact By ID
export async function getContactById(token, contactId) {
  console.log("In API FILE: Fetching Data from User with ID", contactId)
  try {
    const response = await fetch(`http://127.0.0.1:5000/contacts/${contactId}`, {
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
    return data;

  } catch (error) {
    alert(`Error fetching contact: ${error.message}`);
    console.error('Error fetching contact:', error);
    return null;
  }
}


// CREATE a new Contact
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
    
    console.error('Error creating contact:', error);
    throw error;
  }
} 


// UPDATE contact
export async function updateContact(token, contactId, contactData) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/contacts/${contactId}`, {
      method : 'PUT',
      headers : {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(contactData)
    });  
    
    console.log("In API File: Response status:", response.status)

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Contact updated successfully:', data);
    return data.contact || data;

  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
} 



// Get all Categories with ID validation
export const getCategories = async (accessToken) => {
    try {
        if (!accessToken) {
            throw new Error('Access token is required')
        }

        console.log("In API FILE: Trying to GET Categories")
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
        
        console.log('In API FILE: Categories with IDs:', categoriesWithIds);
        
        return categoriesWithIds;
        
    } catch (error) {
        console.error('Error fetching categories:', error);
        // Return empty array on error so the component doesn't break
        return [];
    }
};
