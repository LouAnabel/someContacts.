import { formatDateForBackend } from '../helperFunctions/dateConversion'

// Helper Function
// Prepare Data for API call

const FormDataToApiData = (formData, categories, overrides = {}) => {
    // Get Category ID
    let categoryId = null;
    if (formData.category) {
        // if category is string, find the category object
        if (typeof formData.category === 'string') {
            const selectedCategory = categories.find(cat => cat.name === formData.category);
            categoryId = selectedCategory ? selectedCategory.id : null;
        } else if (formData.category.id) {
            // if category is an object with id
            categoryId = formData.category.id;
        }
    }

    // Format Date for Backend
    const formattedBirthdate = formData.birthdate ? formatDateForBackend(formData.birthdate) : null;
    const formattedContactDate = formData.lastContactDate ? formatDateForBackend(formData.lastContactDate) : null;

    // Update contact data with form data
    return {
        first_name: formData.firstName?.trim(),
        last_name: formData.lastName?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim() || null,
        category_id: categoryId,
        is_favorite: formData.isFavorite || false,
        birth_date: formattedBirthdate || null,
        last_contact_date: formattedContactDate || null,
        last_contact_place: formData.meetingPlace?.trim() || null,
        street_and_nr: formData.streetAndNr?.trim() || null,
        postal_code: formData.postalcode?.trim() || null,
        city: formData.city?.trim() || null,
        country: formData.country?.trim() || null,
        notes: formData.notes?.trim() || null,
        links: formData.links ? formData.links.filter(link => {
            const url = typeof link === 'string' ? link : link.url;
            return url && url.trim() !== '';
        }) : [],
        ...overrides
    };
};

export default FormDataToApiData;