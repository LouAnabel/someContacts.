
import NavigationButtons from '../../ui/NavigationButtons.jsx';

const Step3AdditionalInfo = ({
    formData,
    handleInputChange,
    setFormData,
    links,
    handleLinkChange,
    addLink,
    removeLink,
    showLinks,
    setShowLinks,
    showBirthdate,
    setShowBirthdate,
    expandedNotes,
    setExpandedNotes,
    errors,
    hasSubmitted,
    isLoading
}) => {

  const Button = ({ children, onClick, className = "", ...props }) => {
    return (
      <button
        onClick={onClick}
        className={`text-black dark:text-white hover:text-red-500 dark:hover:text-red-500 transition-colors duration-200 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };

    return (
         
      <div className="relative">
          <h1 className="text-2xl font-bold text-center mb-3 text-black">
                additional info.  
          </h1>

          {/* Notes Section - Enhanced Card */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                    <h2 className="text-lg font-light text-red-500 tracking-wide">
                        notes
                    </h2>
                </div>

                <div className="relative">
                    <textarea
                        name="notes"
                        id="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="every thought matters..."
                        disabled={isLoading}
                        rows={expandedNotes ? 8 : 4}
                        className="w-full rounded-xl border border-gray-300 bg-white hover:border-red-300 focus:border-red-500 text-black font-extralight placeholder-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
                        style={{ fontSize: '16px', fontWeight: 100 }}
                    />

                    {/* Optional: Expand/Collapse button */}
                    <button
                        type="button"
                        onClick={() => setExpandedNotes(!expandedNotes)}
                        className="absolute bottom-3 right-3 text-xs text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                        {expandedNotes ? 'less' : 'more'}
                    </button>
                </div>
            </div>


        {/* Optional Links */}
        <div className="relative space-y-3 mt-5 mb-3">
            {/* Links Toggle and Fields */}
            {!showLinks ? (
                <button
                    type="button"
                    onClick={() => setShowLinks(true)}
                    className="flex items-center ml-1 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
                    disabled={isLoading}
                >
                    <span className="text-lg font-semibold">+</span>
                    <span className="text-normal text-black hover:text-red-500">add weblinks</span>
                </button>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="relative left-2 text-sans font-extralight text-red-500 font-md">
                            links & websites
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                            setShowLinks(false);
                            setLinks([{ title: '', url: '' }]);
                        }}
                            className="text-red-500 -mb-1 font-extralight hover:text-red-700 text-sm mr-1"
                            disabled={isLoading}
                        >
                            remove
                        </button>
                    </div>
                    
                    {links.map((link, index) => (
                        <div key={index} className="relative flex items-center space-x-2">
                            <input 
                                type="text" 
                                value={link.title}
                                onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                                placeholder="title"
                                disabled={isLoading}
                                className="flex relative p-2.5 w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 
                                          text-black font-extralight placeholder-gray-300 min-w-[100px] max-w-[120px] h-[48px] focus:outline-none focus:border-red-500"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 200
                                }}
                            />
                            <input 
                                type="url" 
                                value={link.url}
                                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                placeholder="https://example.com"
                                disabled={isLoading}
                                className="flex p-2.5 w-full rounded-xl border border-gray-400 dark:border-gray-400 bg-white hover:border-red-300 dark:hover:border-red-300 text-black font-extralight placeholder-gray-300 max-w-full min-w-[200px] h-[48px] focus:outline-none focus:border-red-500"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 200
                                }}
                            />
                            {links.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeLink(index)}
                                    className="text-red-500 hover:text-red-700 test-xl font-extralight p-1"
                                    disabled={isLoading}
                                >
                                    ×
                                </button>
                                
                            )}
                            
                        </div>
                        
                    ))}
                    
                    <button
                        type="button"
                        onClick={addLink}
                        className="flex ml-2 items-center space-x-2 text-red-500 hover:text-red-600 font-extralight text-sm"
                        disabled={isLoading}
                    >
                        <span className="mt-1 text-base">+</span>
                        <span className="mt-1 text-base text-black hover:text-red-500">add another link</span>
                    </button>
                </div>
            )}
            
        </div>
        
        

        {/* Notes
        <div className="relative">
          <label
            htmlFor="notes"
            className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
          >
            important notes
          </label>
          <textarea
            name="notes"
            id="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="every thought matters.."
            disabled={isLoading}
            rows={expandedNotes ? 6 : 3}
            className="w-full rounded-xl border border-gray-400 bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 p-3 focus:outline-none focus:border-red-500"
            style={{ fontSize: '16px', fontWeight: 200 }}
          />
        </div> */}

       
          
          {/* Optional: Birthdate */}
          {!showBirthdate ? (
            <button
              type="button"
              onClick={() => setShowBirthdate(true)}
              className="flex items-center ml-1.5 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
            >
              <span className="text-lg font-semibold">+</span>
              <span className="text-base text-black hover:text-red-500">birthdate</span>
            </button>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="relative text-red-500 left-2 font-extralight">birthdate</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowBirthdate(false);
                    setFormData(prev => ({ ...prev, birthdate: '' }));
                  }}
                  className="text-red-500 hover:text-red-700 mr-1 text-sm font-extralight"
                >
                  remove
                </button>
              </div>
              {/* Calendar icon */}
                        <div className="relative max-w-sm">
                            <input
                                
                                name='birtdate'
                                id="birtdate"
                                type="date"
                                value={formData.birtdate}
                                placeholder="Select date"
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-[150px]
                                        focus:ring-blue-500 focus:border-blue-500 block p-2.5 placeholder:text-extralight
                                        dark:bg-gray-700 dark:border-gray-400 dark:placeholder-gray-400
                                        dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
                                        [appearance:none] [&::-webkit-calendar-picker-indicator]:opacity-0
                                        [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0"
                            />
                            <div className="absolute inset-y-0 start-28 flex items-center ps-3.5 pointer-events-none">
                                <svg
                                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                >
                                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                </svg>
                            </div>
                        </div>

              {hasSubmitted && errors.birthdate && (
                <p className="absolute top-full right-1 text-sm text-red-600 z-20 font-extralight">
                  {errors.birthdate}
                </p>
              )}
            </div>
          )}

        </div>
    );
};

export default Step3AdditionalInfo;