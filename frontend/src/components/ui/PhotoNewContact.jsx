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

            // Create file input with camera capture
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'user'; // Use front camera if available
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const previewUrl = URL.createObjectURL(file);

                    
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
            <div 
                className="w-[300px] h-[300px] rounded-full flex-shrink-0 relative mx-auto mb-4 overflow-hidden border border-1  border-red-300"
                style={{ 
                    background: 'linear-gradient(180deg, rgba(180, 67, 67, 0.1) 68.75%', 
                    boxShadow: '8px 8px 30px #d9d9d9, -20px -20px 30px #ffffff'
                }}
            >
                {/* Inner circle */}
                <div 
                    className="absolute rounded-full overflow-hidden border border-1 border-red-500"
                    style={{
                        boxShadow: 'inset 6px 6px 14px #d9d9d9, inset -8px -8px 16px #ffffff'
                    }}
                >
                    {photo ? (
                        <img 
                            src={photo} 
                            alt={name || 'Photo'} 
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(145deg, rgba(250, 22, 22, 0.05), rgba(135, 67, 67, 0.1))'
                            }}
                        >
                        </div>
                    )}
                </div>
                
                {!disabled && (
                    <div className="absolute inset-0 flex flex-col justify-center items-center gap-3">
                        <button 
                            onClick={handleUploadClick}
                            type="button"
                            className="w-[180px] h-[40px] rounded-2xl text-sm bg-white text-gray-600 font-light shadow-md hover:shadow-lg hover:scale-105 transition-all duration-100 hover:bg-red-500 hover:text-white"
                        >
                            upload photo.
                        </button>
                        
                        <button 
                            onClick={handleTakePhotoClick}
                            type="button"
                            className="w-[180px] h-[40px] text-sm rounded-2xl bg-white text-gray-600 font-light shadow-md hover:shadow-lg hover:scale-105 transition-all duration-100 hover:bg-red-500 hover:text-white"
                        >
                            take photo.
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoField;