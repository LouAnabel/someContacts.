
/**
 * Helper: Format contact data for API submission
 * Ensures all fields are in the correct format expected by backend
 */

export const FormToApiData = (formData) => {
    const apiData = {
        first_name: formData.firstName?.trim(),
        last_name: formData.lastName?.trim() || null,
        is_favorite: formData.isFavorite || false,
        birth_date: formData.birthdate?.trim() || null,
        last_contact_date: formData.lastContactDate?.trim() || null,
        last_contact_place: formData.lastContactPlace?.trim() || null,
        next_contact_date: formData.nextContactDate?.trim() || null,
        next_contact_place: formData.nextContactPlace?.trim() || null,
        is_contacted: formData.isContacted || false,
        is_to_contact: formData.isToContact || false,
        notes: formData.notes?.trim() || null,
    };

    // Format categories
    if (formData.categories && Array.isArray(formData.categories)) {
        apiData.categories = formData.categories.map(cat => 
            typeof cat === 'object' ? cat.id : cat
        );
    }

    // Format emails
    if (formData.emails && Array.isArray(formData.emails)) {
        apiData.emails = formData.emails
            .filter(e => e.email?.trim() && e.title?.trim())
            .map(e => ({
                email: e.email.trim(),
                title: e.title.trim()
            }));
    }

    // Format phones
    if (formData.phones && Array.isArray(formData.phones)) {
        apiData.phones = formData.phones
            .filter(p => p.phone?.trim() && p.title?.trim())
            .map(p => ({
                phone: p.phone.trim(),
                title: p.title.trim()
            }));
    }

    // Format addresses
    if (formData.addresses && Array.isArray(formData.addresses)) {
        apiData.addresses = formData.addresses
            .filter(a => (a.street_and_nr || a.city || a.country || a.postal_code) && a.title?.trim())
            .map(a => ({
                street_and_nr: a.street_and_nr?.trim() || '',
                additional_info: a.additional_info?.trim() || null,
                postal_code: a.postal_code?.trim() || '',
                city: a.city?.trim() || '',
                country: a.country?.trim() || '',
                title: a.title.trim()
            }));
    }

    // Format links
    if (formData.links && Array.isArray(formData.links)) {
        apiData.links = formData.links
            .filter(l => l.url?.trim() && l.title?.trim())
            .map(l => {
                let url = l.url.trim();
                // Auto-add https:// if missing
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                return {
                    url: url,
                    title: l.title.trim()
                };
            });
    }

    return apiData;
};
