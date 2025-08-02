import { formatDateForFrontend } from '../helperFunctions/dateConversion'

// helper funciton 
// to transform API Format in UI Form Format

const ApiDataToFormData = (apiResponse) => {
  console.log("ApiResponse to transform:", apiResponse)
    // exttacting just the contact data from API response
    const contact = apiResponse.contact || apiResponse;
    
    const birthdateForForm = contact.birth_date ? formatDateForFrontend(contact.birth_date) : contact.birth_date;
    const contactDateForForm = contact.last_contact_date ? formatDateForFrontend(contact.last_contact_date) : contact.last_contact_date;
    
    return {
      id: contact.id || '',
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      category: contact.category?.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      isFavorite: contact.is_favorite || false,
      birthdate: birthdateForForm || '',
      streetAndNr: contact.street_and_nr || '',
      postalcode: contact.postal_code || '',
      city: contact.city || '',
      country: contact.country || '',
      notes: contact.notes || '',
      lastContactDate: contactDateForForm || '',
      meetingPlace: contact.last_contact_place || '',
      links: contact.links || []
    }
};

export default ApiDataToFormData;

