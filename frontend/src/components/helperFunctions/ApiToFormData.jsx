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

    // Handle multiple phone numbers - return array format
    let phonesForForm = [{ title: '', phone: '' }];
    if (contact.phones && Array.isArray(contact.phones) && contact.phones.length > 0) {
        phonesForForm = contact.phones.map(phone => ({
            title: phone.title || '',
            phone: phone.phone || ''
        }));
    }

    // Handle multiple emails - return array format
    let emailsForForm = [{ title: '', email: '' }]; // Default empty email object
    if (contact.emails && Array.isArray(contact.emails) && contact.emails.length > 0) {
        emailsForForm = contact.emails.map(email => ({
            title: email.title || '',
            email: email.email || ''
        }));
    }

    // Handle multiple addresses - return array format
    let addressesForForm = [{ title: '', streetAndNr: '', additionalInfo: '', postalcode: '', city: '', country: '' }]; // Default empty address object
    if (contact.addresses && Array.isArray(contact.addresses) && contact.addresses.length > 0) {
        addressesForForm = contact.addresses.map(address => ({
            title: address.title || '',
            streetAndNr: address.street_and_nr || '',
            additionalInfo: address.additional_info || '',
            postalcode: address.postal_code || '',
            city: address.city || '',
            country: address.country || ''
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
        categories: categoriesForForm, 
        emails: emailsForForm,
        phones: phonesForForm,
        isFavorite: contact.is_favorite || false,
        addresses: addressesForForm,
        notes: contact.notes || '',
        isToContact: contact.is_to_contact,
        isContacted: contact.is_contacted,
        lastContactDate: contact.last_contact_date || '', // No conversion needed, string now
        nextContactDate: contact.next_contact_date || '',
        nextContactPlace: contact.next_contact_place || '',
        birthdate: contact.birth_date || '',
        links: linksForForm
    };
};

export default ApiDataToFormData;