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
                className="w-[300px] h-[300px] rounded-full flex-shrink-0 relative mx-auto mb-4 overflow-hidden border border-1 border-red-500"
                style={{ 
                    background: 'white', // 'linear-gradient(180deg, rgba(180, 67, 67, 0.1) 68.75%'
                    boxShadow: '8px 8px 20px #d9d9d9, -10px -10px 30px #ffffff'
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
                            background: 'linear-gradient(180deg, rgba(135, 67, 67, 0.10) 68.75%, rgba(380, 22, 22, 0.20) 100%)' 
                }}
                    >
                        <span 
                            className="text-red-500 font-light select-none mb-1"
                            style={{ 
                                fontSize: '140px',
                                textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            {getInitials(name)}
                        </span>
                    </div>
                )}
                
                {/* Upload/Photo buttons - only show if not disabled */}
                {!disabled && (
                    <div className="absolute inset-0 flex flex-row items-end gap-1 mb-11 justify-center">
                        {/* Upload link */}
                        <button 
                            onClick={handleUploadClick}
                            type="button"
                            className="flex w-[110px] h-[35px] justify-center items-center flex-shrink-0 text-sm text-red-500 font-extralight hover:text-red-500 hover:font-light border border-red-300 bg-white/50 dark:bg-white/10 dark:border-0 rounded-lg dark:font-light hover:bg-white/70 dark:hover:bg-white/20"
                        >
                            <span className="">upload photo.</span>
                        </button>
                        
                        {/* Take photo link */}
                        <button 
                            onClick={handleTakePhotoClick}
                            type="button"
                            className="flex w-[110px] h-[35px] justify-center items-center flex-shrink-0 text-sm text-red-500 font-extralight hover:text-red-500 hover:font-light border border-red-300 bg-white/50 dark:bg-white/10 dark:border-0 rounded-lg dark:font-light hover:bg-white/70 dark:hover:bg-white/20"
                        >
                            <span className="">take photo.</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoField;
