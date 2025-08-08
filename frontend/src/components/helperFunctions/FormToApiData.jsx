const FormDataToApiData = (formData, categories, links, overrides = {}) => {
    
    // Get Categories for backend
    let formCategories = [];
    if (formData.categories && Array.isArray(formData.categories)) {
        formCategories = formData.categories
            .filter(cat => cat && cat.id) // Only include categories with valid IDs
            .slice(0, 3) // Limit to maximum 3 categories
            .map(cat => ({
                id: cat.id,
                name: cat.name
            }));
    }

    // Format links properly - filter out empty ones and structure them correctly
    const formattedLinks = links ? links
        .filter(link => link.url?.trim()) // Only include links with URLs (title is optional)
        .map(link => ({
            title: link.title?.trim() || '', // Title can be empty
            url: link.url.trim()
        })) : [];

    // Return API data - dates are already in DD.MM.YYYY format, no conversion needed
    return {
        first_name: formData.firstName?.trim(),
        last_name: formData.lastName?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim() || null,
        categories: formCategories,
        is_favorite: formData.isFavorite || false,
        birth_date: formData.birthdate?.trim() || null, // Send as-is (DD.MM.YYYY)
        last_contact_date: formData.lastContactDate?.trim() || null, 
        next_contact_date: formData.nextContactDate?.trim() || null,
        is_to_contact: formData.isToContact || false,
        is_contacted: formData.isContacted || false,
        street_and_nr: formData.streetAndNr?.trim() || null,
        postal_code: formData.postalcode?.trim() || null,
        city: formData.city?.trim() || null,
        country: formData.country?.trim() || null,
        notes: formData.notes?.trim() || null,
        links: formattedLinks,
        ...overrides
    };
};

export default FormDataToApiData;