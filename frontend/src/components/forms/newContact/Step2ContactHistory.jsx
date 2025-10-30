import React from 'react';

const Step2ContactHistory = ({
    formData,
    handleInputChange,
    setFormData,
    errors,
    hasSubmitted,
    isLoading
}) => {
    
    return (
        <div className="space-y-3">
            <div className="">
                {/* Contact History Fields */}
                <div className="relative -mt-1">
                    <p className="font-text text-base font-extralight tracking-wide text-red-500 ml-1 mt-6 mb-1">date and place of</p>
                    <label htmlFor="lastContactDate" className="relative left-4 bg-white px-1 text-sans text-base text-black font-extralight">
                        last contact
                    </label>
                    <input 
                        type="text" 
                        name="lastContactDate" 
                        id="lastContactDate" 
                        value={formData.lastContactDate}
                        onChange={handleInputChange}
                        placeholder="am 19.05.2025 in Berlin"
                        disabled={isLoading}
                        className={`w-full rounded-xl border -mt-3 border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-300 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                        style={{
                            fontSize: '16px',
                            fontWeight: 200
                        }}
                    />
                    {hasSubmitted && errors.lastContactDate && (
                        <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.lastContactDate}</p>
                    )}
                </div>

                {/* Next Contact Field */}
                <div className="relative -mt-1">
                    <label htmlFor="nextContactDate" className="relative top-3 left-4 bg-white px-1 text-sans text-base text-black font-extralight">
                        next planned contact
                    </label>
                    <input 
                        type="text" 
                        name="nextContactDate" 
                        id="nextContactDate" 
                        value={formData.nextContactDate}
                        onChange={handleInputChange}
                        placeholder="coffe shop, berlin ..."
                        disabled={isLoading}
                        className={`w-full mb-5 rounded-xl border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-300 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500`}
                        style={{
                            fontSize: '16px',
                            fontWeight: 200
                        }}
                    />
                    {hasSubmitted && errors.nextContactDate && (
                        <p className="absolute top-full right-1 text-sm text-red-600 z-20">{errors.nextContactDate}</p>
                    )}
                </div>

                {/* Checkboxes */}
                <div className="ml-2"> 

                    {/* isContacted Checkbox */}
                    <div className="flex items-center w-full relative rounded-lg">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isContacted: !prev.isContacted }))}
                            className="flex items-center space-x-3 text-red-500"
                            disabled={isLoading}
                        >
                            {formData.isContacted ? (
                                <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>

                                    <span className="text-sm font-extralight text-black cursor-pointer">
                                        contacted
                                    </span>
                                </>
                            ) : (
                                <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="black" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                                    <span className="text-sm font-extralight text-black cursor-pointer">
                                        mark as contacted
                                    </span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* isToContact Checkbox */}
                    <div className="flex items-center w-full relative">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isToContact: !prev.isToContact }))}
                            className="flex items-center space-x-3 mt-2 text-red-500 hover:text-red-500"
                            disabled={isLoading}
                        >
                            {formData.isToContact ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                    </svg>

                                    <span className="text-sm font-extralight text-black cursor-pointer">
                                        remind me
                                    </span>
                                </>
                            ) : (
                                <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="black" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                                    <span className="text-sm font-extralight text-black cursor-pointer">
                                        reminder
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>    
            </div>
        </div>
    );
};

export default Step2ContactHistory;