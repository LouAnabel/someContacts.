
/**
 * Helper: Format API contact data for frontend form
 * Converts backend format to frontend form format
 */

export const ApiToFormData = (apiContact) => {
    return {
        id: apiContact.id,
        firstName: apiContact.first_name || '',
        lastName: apiContact.last_name || '',
        isFavorite: apiContact.is_favorite || false,
        birthdate: apiContact.birth_date || '',
        lastContactDate: apiContact.last_contact_date || '',
        lastContactPlace: apiContact.last_contact_place || '',
        nextContactDate: apiContact.next_contact_date || '',
        nextContactPlace: apiContact.next_contact_place || '',
        isContacted: apiContact.is_contacted || false,
        isToContact: apiContact.is_to_contact || false,
        notes: apiContact.notes || '',
        categories: apiContact.categories || [],
        emails: apiContact.emails || [],
        phones: apiContact.phones || [],
        addresses: apiContact.addresses || [],
        links: apiContact.links || []
    };
};