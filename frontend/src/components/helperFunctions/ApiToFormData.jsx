import { formatDateForFrontend } from '../helperFunctions/dateConversion'

// helper funciton 
// to transform API Format in UI Form Format

const ApiDataToFormData = (apiResponse) => {
    // extracting just the contact data from API response
    const contact = apiResponse.contact || apiResponse;
    
    // Handle multiple categories - return array format
    let categoriesForForm = []; // Default empty category object
    if (contact.categories && Array.isArray(contact.categories) && contact.categories.length > 0) {
        categoriesForForm = contact.categories.map(category => ({
            id: category.id,
            name: category.name
        }));
    }
    
    let linksForForm = [{ title: '', url: '' }]; // Default empty link
    if (contact.links && Array.isArray(contact.links) && contact.links.length > 0) {
        linksForForm = contact.links.map(link => ({
            title: link.title || '',
            url: link.url || ''
        }));
    }

    return {
        id: contact.id || '',
        firstName: contact.first_name || '',
        lastName: contact.last_name || '',
        category: categoryForForm, 
        email: contact.email || '',
        phone: contact.phone || '',
        isFavorite: contact.is_favorite || false,
        birthdate: contact.birth_date || '', // No conversion needed - already DD.MM.YYYY
        streetAndNr: contact.street_and_nr || '',
        postalcode: contact.postal_code || '',
        city: contact.city || '',
        country: contact.country || '',
        notes: contact.notes || '',
        isToContact: contact.is_to_contact,
        isContacted: contact.is_contacted,
        lastContactDate: contact.last_contact_date || '', // No conversion needed, string now
        nextContactDate: contact.next_contact_date || '',
        
        links: linksForForm
    };
};

export default ApiDataToFormData;