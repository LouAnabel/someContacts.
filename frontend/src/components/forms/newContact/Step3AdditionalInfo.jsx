import { useState } from 'react';
import dayjs from 'dayjs';
import DatePicker from '../../ui/DatePicker';

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

  // Handler for date picker
  const handleDateChange = (newValue) => {
      setFormData(prev => ({
          ...prev,
          birthdate: newValue ? dayjs(newValue).format('DD.MM.YYYY') : ''
      }));
      console.log('Selected birthdate:', newValue);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header with subtle animation */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-black tracking-tight">
          additional information.
        </h1>
      </div>

      {/* Notes Section - Enhanced Card */}
      <div>
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

      
      {/* Optional Links */}
      <div className="relative">
        {/* Links Toggle and Fields */}
        {!showLinks ? (
          <button
            type="button"
            onClick={() => setShowLinks(true)}
            className="flex items-center space-x-2 text-red-500 hover:font-light font-extralight"
            disabled={isLoading}
          >
            <span className="text-lg font-semibold">+</span>
            <span className="text-normal text-black ">add <span className="text-red-500 font-light"> weblinks</span></span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-red-400 rounded-full"></div>
                  <h2 className="text-lg font-light text-red-500 tracking-wide">
                    links & websites.
                  </h2>
                </div>
              </span>
{/* 
              <button
                type="button"
                onClick={() => {
                  setShowLinks(false);
                  // Don't reset links here, let parent handle it
                }}
                className="relative mr-3 text-red-500 tracking-wide hover:underline text-sm font-extralight -mt-2"
                disabled={isLoading}
              >
                remove
              </button> */}
            </div>

            {links.map((link, index) => (
              <div key={index} className="">
                <div className="flex items-center justify-between space-x-2 -mt-2">
                  {/* website input field */}
                  <div className="relative mb-4">
                    <label htmlFor={`link-title-${index}`} className="absolute left-2 -top-3 bg-white px-1 font-extralight text-gray-800 z-10">
                      website
                    </label>

                    <input
                      type="text"
                      name="title"
                      id={`link-title-${index}`}
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      placeholder="filmmakers"
                      disabled={isLoading}
                      className={`flex p-2.5 w-full min-w-[110px] rounded-xl border ${
                        hasSubmitted && errors[`link_${index}`] ? 'border-red-500' : 'border-gray-400'
                      } bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 h-[48px] focus:outline-none focus:border-red-500`}
                      style={{
                        fontSize: '16px',
                        fontWeight: 100
                      }}
                    />
                    {hasSubmitted && errors[`link_${index}`] && (
                      <p className="absolute top-full mt-1 right-1 text-xs text-red-600 font-extralight">
                        {errors[`link_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* URL input field */}
                  <div className="relative mb-4 ml-1">
                    <label htmlFor={`link-url-${index}`} className="absolute left-2 -top-3 bg-white px-1 font-extralight text-gray-800 z-10">
                      link
                    </label>

                    <input
                      type="url"
                      name="url"
                      id={`link-url-${index}`}
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      placeholder="www.profile/filmmakers.com"
                      disabled={isLoading}
                      className={`flex p-2.5 w-full min-w-[260px] h-[48px] rounded-xl border border-gray-400 bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300  focus:outline-none focus:border-red-500`}
                      style={{
                        fontSize: '16px',
                        fontWeight: 100
                      }}
                    />
                  </div>

                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      disabled={isLoading}
                      className="p-1 rounded-lg hover:bg-red-50 group -mt-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-gray-400 group-hover:text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* add website */}
            <div className="flex gap-2 items-right justify-end mr-3">
              <Button
                type="button"
                onClick={addLink}
                className="text-sm font-light tracking-wide text-red-500 hover:font-normal -mt-5"
              >
                <span className="text-sm text-black font-extralight mt-0.5"><span className="text-red-500 font-normal">+</span> add </span>
                website
              </Button>
            </div>
          </div>
        )}
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
                <div className="flex items-center gap-2 mb-4">
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
    </div>
  );
};

export default Step3AdditionalInfo;