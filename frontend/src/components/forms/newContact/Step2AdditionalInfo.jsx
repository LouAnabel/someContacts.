import { useState } from 'react';
import dayjs from 'dayjs';
import DatePicker from '../../ui/DatePicker';
import WebTitleSelection from '../../ui/WebTitleSelection';


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

const Step2AdditionalInfo = ({
  formData,
  setFormData,
  showBirthdate,
  setShowBirthdate,
  expandedNotes,
  setExpandedNotes,
  handleInputChange,
  links,
  handleLinkChange,
  addLink,
  removeLink,
  getWebsiteDropdownState,
  updateWebsiteDropdownState,
  updateWebsiteTitle,
  errors,
  hasSubmitted,
  isLoading
}) => {



  // Helper function to get the appropriate placeholder based on title
  const getPlaceholder = (title) => {
    const titleLower = title?.toLowerCase() || 'website';
    switch (titleLower) {
      case 'instagram':
        return 'enter username with @';
      case 'facebook':
        return 'f.e. facebook.com/yourprofile';
      case 'linkedin':
        return 'f.e. linkedin.com/in/yourprofile';
      case 'filmmakers':
        return 'f.e. www.profile/filmmakers.com';
      case 'schauspielervideos':
        return 'f.e. www.profile/schauspielervideos.de';
      default:
        return 'f.e. www.yourwebsite.com';
    }
  };


  // Handle input change with formatting
  const handleInput = (index, field, value, title) => {
    if (field === 'url') {
      const titleLower = title?.toLowerCase() || '';

      // For Instagram and Twitter, format with @
      if (titleLower === 'instagram') {
        // Remove any existing @ before processing
        let cleanValue = value.replace(/^@+/, '');
        // Add single @ prefix if there's content
        if (cleanValue) {
          value = '@' + cleanValue;
        }
      }
    }

    handleLinkChange(index, field, value);
  };

  // Handler for date picker
  const handleDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      birthdate: newValue ? dayjs(newValue).format('DD.MM.YYYY') : ''
    }));

  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mb-2">
      {/* Header with subtle animation */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black tracking-tight">
          additional information.
        </h1>
      </div>

      {/* Optional: Birthdate */}
      {!showBirthdate ? (
        <button
          type="button"
          onClick={() => setShowBirthdate(true)}
          className="flex items-center ml-1 space-x-2 font-extralight hover:font-light hover:text-red-500"
        >
          <span className="text-base text-black"> <span className="font-semibold text-red-500">+</span> add <span className="text-red-500 font-light hover:font-normal">birthdate</span></span>
        </button>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between">
            <span>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-red-400 rounded-full"></div>
                <h2 className="text-lg font-light text-red-500 tracking-wide">
                  birthdate.
                </h2>
              </div>
            </span>

            <button
              type="button"
              onClick={() => {
                setShowBirthdate(false);
                setFormData(prev => ({ ...prev, birthdate: '' }));
              }}
              className="relative mr-3 text-red-500 tracking-wide hover:underline text-sm font-extralight -mt-2"
              disabled={isLoading}
            >
              remove
            </button>
          </div>

          {/* Date Picker */}
          <div className="relative">

            <DatePicker
              value={formData.birthdate}
              onChange={handleDateChange}
              label="select date"
              disabled={isLoading}
            />

          </div>


          {hasSubmitted && errors.birthdate && (
            <p className="absolute top-full right-1 text-sm text-red-600 z-20 font-extralight">
              {errors.birthdate}
            </p>
          )}
        </div>
      )}

      {/* Notes Section - Enhanced Card */}
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-red-400 rounded-full"></div>
          <h2 className="text-lg font-light text-red-500 tracking-wide">
            notes.
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
            className="w-full rounded-2xl border border-gray-400 bg-white hover:border-red-300 focus:border-red-500 text-black font-extralight placeholder-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
            style={{ fontSize: '16px', fontWeight: 100 }}
          />

          {/* Optional: Expand/Collapse button */}
          <button
            type="button"
            onClick={() => setExpandedNotes(!expandedNotes)}
            className="absolute bottom-3 right-4 text-xs font-extralight text-gray-400 hover:text-red-500"
          >
            {expandedNotes ? 'less' : 'more'}
          </button>
        </div>
      </div>


      {/* LINKS SECTION */}
      <div className="space-y-1">

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <span>
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-red-400 rounded-full"></div>
              <h2 className="text-lg font-light text-red-500 tracking-wide">
                websites & links.
              </h2>
            </div>
          </span>
        </div>

        <div className="text-sm text-gray-400 italic font-extralight">
          select website title and enter the corresponding url.
        </div>

        {/* Weblinks */}
        <div className="space-y-1">
          {links.map((link, index) => {
            const dropdownState = getWebsiteDropdownState(index);

            return (
              <div key={index} className="relative">

                {/* Dropdown wrapper */}
                <div className="ml-2 -mb-4 relative z-50">
                  {/* Website Title Dropdown - serves as label */}
                  <WebTitleSelection
                    title={link.title}
                    setTitle={(newTitle) => {
                      updateWebsiteTitle(index, newTitle);
                      // handleLinkChange(index, 'title', newTitle);

                      // Clear the URL when title changes to Instagram/Twitter
                      const newTitleLower = newTitle.toLowerCase();
                      if ((newTitleLower === 'instagram') &&
                        link.url && !link.url.startsWith('@')) {
                        handleLinkChange(index, 'url', '');
                      }
                    }}
                    showDropdown={dropdownState.showDropdown}
                    setShowDropdown={(value) => updateWebsiteDropdownState(index, { showDropdown: value })}
                    showAddTitle={dropdownState.showAddTitle}
                    setShowAddTitle={(value) => updateWebsiteDropdownState(index, { showAddTitle: value })}
                    newTitleName={dropdownState.newTitleName}
                    setNewTitleName={(value) => updateWebsiteDropdownState(index, { newTitleName: value })}
                    disabled={isLoading}
                  />
                </div>

                {/* URL input field with proper padding for remove button */}
                <div className="relative">
                  <input
                    type="text"
                    name="url"
                    value={link.url || ''}
                    onChange={(e) => handleInput(index, 'url', e.target.value, link.title)}
                    placeholder={getPlaceholder(link.title)}
                    disabled={isLoading}
                    className={`w-full p-2.5 pr-5 h-[48px] rounded-xl border ${hasSubmitted && errors[`link_${index}`]
                      ? 'border-red-500'
                      : 'border-gray-400'
                      } bg-white hover:border-red-300 text-black font-extralight placeholder-gray-400 focus:outline-none focus:border-red-500`}
                    style={{
                      fontSize: '16px',
                      fontWeight: 100,
                      paddingRight: '2.5rem'
                    }}
                  />

                  {/* Remove button - positioned absolutely in top-right */}
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      disabled={isLoading}
                      className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-lg hover:bg-red-50 group"
                      style={{ zIndex: 10 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-3 h-3 text-gray-400 group-hover:text-red-500"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {hasSubmitted && errors[`link_${index}`] && (
                    <p className="absolute top-full mt-1 right-1 text-xs text-red-600 font-extralight z-20">
                      {errors[`link_${index}`]}
                    </p>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* add website */}
        <div className="flex gap-2 items-center justify-end mr-3 mt-4">
          <Button
            type="button"
            onClick={addLink}
            className="text-sm font-light tracking-wide text-red-500 hover:font-normal"
          >
            <span className="text-sm text-black font-extralight">
              <span className="text-red-500 font-normal">+</span> add
            </span>
            {' '}website
          </Button>
        </div>
      </div>
    </div>




  );
};

export default Step2AdditionalInfo;