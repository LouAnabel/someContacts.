import React from 'react';

const PhotoField = ({ 
    photo, 
    name = '', 
    onUpload, 
    onTakePhoto, 
    disabled = false,
    className = "" 
}) => {
    
    // Get initials from name
    const getInitials = (fullName) => {
        if (!fullName || fullName.trim() === '') return '?';
        
        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) {
            // First name + Last name initials
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        // Just first letter if only one name
        return fullName[0].toUpperCase();
    };

    const handleUploadClick = () => {
        if (disabled) return;
        
        if (onUpload) {
            // If custom onUpload provided, call it
            onUpload();
        } else {
            // Default behavior - open file picker
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Create preview URL
                    const previewUrl = URL.createObjectURL(file);
                    console.log('File selected:', file);
                    
                    // If onUpload callback exists, call it with file and preview
                    if (onUpload) {
                        onUpload(file, previewUrl);
                    }
                }
            };
            input.click();
        }
    };

    const handleTakePhotoClick = () => {
        if (disabled) return;
        
        if (onTakePhoto) {
            onTakePhoto();
        } else {
            // Default behavior - access camera
            console.log('Take photo clicked');
            // Create file input with camera capture
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'user'; // Use front camera if available
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const previewUrl = URL.createObjectURL(file);
                    console.log('Photo captured:', file);
                    
                    // If onUpload callback exists, call it with file and preview
                    if (onUpload) {
                        onUpload(file, previewUrl);
                    }
                }
            };
            input.click();
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Circular frame with gradient background */}
            <div 
                className="w-[323px] h-[323px] rounded-full border border-red-400 flex-shrink-0 relative mx-auto mb-4 overflow-hidden" 
                style={{ 
                    background: 'linear-gradient(180deg, rgba(135, 57, 57, 0.20) 68.75%, rgba(255, 17, 17, 0.20) 100%)' 
                }}
            >
                {/* Display photo if available */}
                {photo ? (
                    <img 
                        src={photo} 
                        alt={name || 'Photo'} 
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    /* Placeholder - Show initials with gradient background */
                    <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.6) 0%, rgba(220, 38, 38, 0.8) 100%)'
                        }}
                    >
                        <span 
                            className="text-white font-light select-none"
                            style={{ 
                                fontSize: '120px',
                                textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            {getInitials(name)}
                        </span>
                    </div>
                )}
                
                {/* Upload/Photo buttons - only show if not disabled */}
                {!disabled && (
                    <div className="absolute inset-0 flex flex-col justify-center items-center gap-2">
                        {/* Upload link */}
                        <button 
                            onClick={handleUploadClick}
                            type="button"
                            className="flex w-[200px] h-[35px] justify-center items-center flex-shrink-0 bg-white/50 text-black font-light dark:bg-white/10 dark:border-0 rounded-lg dark:font-light hover:bg-white/70 dark:hover:bg-white/20 hover:text-red-500 transition-all duration-200"
                        >
                            <span className="text-sm font-md">upload photo.</span>
                        </button>
                        
                        {/* Take photo link */}
                        <button 
                            onClick={handleTakePhotoClick}
                            type="button"
                            className="flex w-[200px] h-[35px] justify-center items-center flex-shrink-0 text-black font-light bg-white/50 dark:bg-white/10 dark:border-0 rounded-lg hover:bg-white/70 dark:hover:bg-white/20 hover:text-red-500 transition-all duration-200"
                        >
                            <span className="text-sm font-md">take photo.</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoField;
