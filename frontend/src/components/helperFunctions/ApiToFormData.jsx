import { formatDateForFrontend } from '../helperFunctions/dateConversion'

// helper funciton 
// to transform API Format in UI Form Format

const ApiDataToFormData = (apiResponse) => {
    // extracting just the contact data from API response
    const contact = apiResponse.contact || apiResponse;
    
    // FIXED: Handle category properly - return object format that matches your form
    let categoryForForm = { name: '', id: null }; // Default empty category object
    if (contact.category) {
        categoryForForm = {
            id: contact.category.id,
            name: contact.category.name
        };
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
        contactDate: contact.contact_date || '', // No conversion needed
        meetingPlace: contact.contact_place || '',
        links: linksForForm
    };
};

export default ApiDataToFormData;