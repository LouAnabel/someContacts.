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
    const validateDate = (dateString, fieldName, mustBePast = false) => {
        if (!dateString?.trim()) {
            return `${fieldName} is required`;
        }
        
        // Check format: DD.MM.YYYY
        const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const match = dateString.trim().match(datePattern);
        
        if (!match) {
            return `${fieldName} must be in format DD.MM.YYYY`;
        }
        
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        
        // Validate date components
        if (month < 1 || month > 12) {
            return `${fieldName} contains invalid month`;
        }
        
        if (day < 1 || day > 31) {
            return `${fieldName} contains invalid day`;
        }
        
        // Create date object and check if it's valid
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            return `${fieldName} is not a valid date`;
        }
        
        // Check if date must be in the past
        if (mustBePast) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to compare only dates
            
            if (date >= today) {
                return `${fieldName} must be in the past`;
            }
        }
        
        return null; // No error
    };

export { formatDateForBackend, formatDateForFrontend, validateDate };