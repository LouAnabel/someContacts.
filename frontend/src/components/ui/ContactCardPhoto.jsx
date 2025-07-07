import React from 'react';

const ContactPhotoSmall = ({ photo, name, className = "" }) => {
    

    return (
            <div 
                className="w-[250px] h-[250px] rounded-full border border-red-400 dark:border-white/65 flex-shrink-0 relative mx-auto mb-4" 
                style={{ 
                    background: 'linear-gradient(180deg, rgba(135, 57, 57, 0.20) 68.75%, rgba(255, 17, 17, 0.20) 100%)' 
                }}
            >
                {/* Display photo if available */}
                {photo && (
                    <img 
                        src={photo} 
                        alt={name || 'Contact'} 
                        className="w-full h-full rounded-full object-cover"
                    />
                )}
            </div>
    );
};

export default ContactPhotoSmall;