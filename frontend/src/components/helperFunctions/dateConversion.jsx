import React, { useState, useEffect } from 'react';

// convert date formate for backend
const formatDateForBackend = (isoDate) => {
    if (!isoDate) return null;

    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return null;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth()+1).padStart(2,'0');
        const year = date.getFullYear();

        return `${day}.${month}.${year}`; 
    } catch (error) {
        return null;
    }
};


// convert date formate for UI Form
const formatDateForFrontend = (backendDate) => {
    if(!backendDate) return '';

    try {
      const [day, month, year] = backendDate.split('-');
    if (!day || !month || !year) return '';
    
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};


// Date Validation
const validateDate = (isoDate, validationType) => {
    if (!isoDate) {
        return { isValid: true, error: null};
    }

    try {
        const date = new Date(isoDate);
        const today = new Date();

        if (isNaN(date.getTime())) {
            return { isValid: false, error: 'Invalid date format' };
        }
        
        switch (validationType) {
        case 'birthdate':
            if (date > today) {
            return { isValid: false, error: 'Birth date cannot be in the future' };
            }
            const maxAge = new Date();
            maxAge.setFullYear(maxAge.getFullYear() - 150);
            if (date < maxAge) {
            return { isValid: false, error: 'Birth date seems too far in the past' };
            }
            break;
            
        case 'future':
            if (date < today) {
            return { isValid: false, error: 'Date must be in the future' };
            }
            break;
            
        case 'past':
            if (date > today) {
            return { isValid: false, error: 'Date must be in the past' };
            }
            break;
            
        default:
            // No additional validation for 'any' type
            break;
        }
        
        return { isValid: true, error: null };
    } catch (error) {
        return { isValid: false, error: 'Invalid date' };
  }
};

export { formatDateForBackend, formatDateForFrontend, validateDate };