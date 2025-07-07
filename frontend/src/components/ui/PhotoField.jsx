import React from 'react';

const PhotoField = ({ photo, name, onUpload, onTakePhoto, className = "" }) => {
    const handleUploadClick = () => {
        if (onUpload) {
            onUpload();
        } else {
            // Default behavior - open file picker
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log('File selected:', file);
                    // Handle file upload here
                }
            };
            input.click();
        }
    };

    const handleTakePhotoClick = () => {
        if (onTakePhoto) {
            onTakePhoto();
        } else {
            // Default behavior - access camera
            console.log('Take photo clicked');
            // You can implement camera access here
        }
    };

    return (
        <div className={`relative ${className} bg-white dark:bg-black`}>
            {/* Circular frame with gradient background */}
            <div 
                className="w-[323px] h-[323px] rounded-full border border-red-400 dark:border-white/65 flex-shrink-0 relative mx-auto mb-4" 
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
                
                {/* Upload/Photo links positioned in the center */}
                <div className="absolute inset-0 px-44 flex flex-col justify-center gap-2">
                    {/* Upload link */}
                    <button 
                        onClick={handleUploadClick}
                        className="flex w-[200px] h-[35px] justify-center items-center flex-shrink-0 bg-white/50 text-black font-light border border-red-100 dark:bg-white/10 dark:border-0 rounded-lg dark:text-white dark:font-light hover:border hover:border-red-300 dark:hover:bg-white/20 hover:text-red-500"
                    >
                        <span className="text-sm font-md">upload photo.</span>
                    </button>
                    
                    {/* Take photo link */}
                    <button 
                        onClick={handleTakePhotoClick}
                        className="flex w-[200px] h-[35px] justify-center items-center flex-shrink-0 bg-white/50 text-black font-light dark:bg-white/10 border border-red-100 dark:border-0 rounded-lg dark:text-white dark:font-light hover:border hover:border-red-300 dark:hover:bg-white/20 hover:text-red-500"
                    >
                        <span className="text-sm font-md">take photo.</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhotoField;