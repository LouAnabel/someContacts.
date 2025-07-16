

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
    return data;
    }

    catch (error) {
        alert(`Error fetching contacts: ${error.message}`);
        console.error('Error fetching contacts:', error);
        return [];
    }   
}

