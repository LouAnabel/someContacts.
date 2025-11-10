import React from 'react';
import { useState } from 'react';
import dayjs from 'dayjs';
import DatePicker from '../../ui/DatePicker';

const Step2ContactHistory = ({
    formData,
    handleInputChange,
    setFormData,
    expandedNotes,
    setExpandedNotes,
    errors,
    hasSubmitted,
    isLoading
}) => {
    const [showLastContact, setShowLastContact] = useState(false);

    // Handler for date picker
    const handleDateChange = (newValue) => {
        setFormData(prev => ({
            ...prev,
            nextContactDate: newValue ? dayjs(newValue).format('DD.MM.YYYY') : ''
        }));
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header with subtle animation */}
            <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-black tracking-tight">
                    contact planner.
                </h1>
            </div>

            {/* Toggle button for last contact */}
            {!showLastContact && (
                <button
                    type="button"
                    onClick={() => setShowLastContact(true)}
                    className="w-full bg-white rounded-2xl p-2 shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-red-500 group-hover:text-red-500 transition-colors duration-200">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <span className="text-base font-extralight text-gray-700 group-hover:text-red-500 transition-colors duration-200">
                                last contact
                            </span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-red-300 group-hover:text-red-500 transition-colors duration-200">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>
                </button>
            )}

            {/* last contact - shown when toggled */}
            {showLastContact && (
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-red-300 rounded-full"></div>
                            <h2 className="text-lg font-extralight text-red-500 tracking-wide">
                                last contact
                            </h2>
                        </div>
                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={() => {
                                setShowLastContact(false);
                                setFormData(prev => ({ ...prev, lastContactDate: '', isContacted: false }));
                            }}
                            className="p-1 rounded-lg hover:bg-red-50 transition-colors duration-200 group"
                            disabled={isLoading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <label htmlFor="lastContactDate" className="absolute left-2 -top-3 bg-white px-2 font-extralight text-gray-800 z-10">
                            date & place
                        </label>
                        <input
                            type="text"
                            name="lastContactDate"
                            id="lastContactDate"
                            value={formData.lastContactDate}
                            onChange={handleInputChange}
                            placeholder="last may in berlin"
                            disabled={isLoading}
                            className={`w-full rounded-xl border border-gray-300 bg-white hover:border-red-300 focus:border-red-500 text-black font-extralight placeholder-gray-400 h-[52px] px-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-100`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 100
                            }}
                        />
                        {hasSubmitted && errors.lastContactDate && (
                            <p className="absolute top-full mt-1 right-1 text-sm text-red-600">{errors.lastContactDate}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Next Contact Section - Enhanced Card */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                {/* <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"></div> */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                    <h2 className="text-lg font-light text-red-500 tracking-wide">
                        next planned contact
                    </h2>
                </div>

                <div className="space-y-4">
                    {/* Date and Place in a grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                        {/* Date Picker */}
                        <div>
                            <DatePicker
                                value={formData.nextContactDate}
                                onChange={handleDateChange}
                                label="select date"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Place Input */}
                        <div className="relative">
                            <label htmlFor="nextContactPlace" className="absolute left-2 -top-3 bg-white px-1 text-gray-800 font-extralight z-10">
                                place
                            </label>
                            <input
                                type="text"
                                name="nextContactPlace"
                                id="nextContactPlace"
                                value={formData.nextContactPlace}
                                onChange={handleInputChange}
                                placeholder="coffee shop, berlin..."
                                disabled={isLoading}
                                className="w-full rounded-xl border border-gray-300 bg-white hover:border-red-300 focus:border-red-500 text-black font-extralight placeholder-gray-400 h-[52px] px-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-100"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 100
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Reminder Section */}
                <div className="">
                    <div className="flex mt-6 items-center gap-2 mb-3">
                        <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                        <h2 className="text-lg font-light text-red-500 tracking-wide">
                            reminder & notification
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, isToContact: !prev.isToContact }))}
                        className="flex items-center gap-3 mb-3 ml-2 group"
                        disabled={isLoading}
                    >
                        <div className={`p-1 rounded-lg transition-colors duration-200 ${formData.isToContact ? 'bg-red-500' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            {formData.isToContact ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm font-light text-gray-700 group-hover:text-red-500 transition-colors duration-200">
                            {formData.isToContact ? 'remind me' : 'set reminder'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step2ContactHistory;