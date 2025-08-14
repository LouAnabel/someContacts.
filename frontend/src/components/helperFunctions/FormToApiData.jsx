const FormDataToApiData = (formData, categories, links, overrides = {}) => {
    console.log("🔧 === FormDataToApiData STARTING ===");
    console.log("🔧 Input formData:", formData);

    
    // FIXED: Get Category IDs for backend (not full objects)
    let categoryIds = []; // Send array of IDs only
    if (formData.categories && Array.isArray(formData.categories) && formData.categories.length > 0) {
        categoryIds = formData.categories
            .filter(cat => cat && cat.id) // Only include categories with valid IDs
            .map(cat => cat.id); // CRITICAL: Send only the ID, not the full object
    }
    
    // Format links properly - filter out empty ones and structure them correctly
    const formattedLinks = links ? links
        .filter(link => link.url?.trim()) // Only include links with URLs (title is optional)
        .map(link => ({
            title: link.title?.trim() || '', // Title can be empty
            url: link.url.trim()
        })) : [];

    console.log("🔧 Extracted category IDs:", categoryIds);
    console.log("🔧 Formatted links:", formattedLinks);

    // Return API data - dates are already in DD.MM.YYYY format, no conversion needed
    const apiData = {
        first_name: formData.firstName?.trim(),
        last_name: formData.lastName?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim() || null,
        
        // CRITICAL FIX: Send category_ids instead of categories
        categories: categoryIds, // Array like [1, 2, 3] - NOT objects
        
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

    console.log("🔧 === FormDataToApiData COMPLETE ===");
    console.log("🔧 Final API data:", apiData);
    console.log("🔧 Category IDs being sent:", apiData.categories);

    return apiData;
};

export default FormDataToApiData;