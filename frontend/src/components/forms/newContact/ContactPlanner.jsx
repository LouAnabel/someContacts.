import React from 'react';
import { useState } from 'react';
import dayjs from 'dayjs';
import DatePicker from '../../ui/DatePicker';

const ContactPlanner = ({
    formData,
    handleInputChange,
    setFormData,
    errors,
    hasSubmitted,
    isLoading

}) => {

    const [showLastContact, setShowLastContact] = useState(false);

    // Handler for date picker
    const handleLastDateChange = (newValue) => {
        setFormData(prev => ({
            ...prev,
            lastContactDate: newValue ? dayjs(newValue).format('DD.MM.YYYY') : '',

        }));
        console.log('Selected last contact date:', newValue);
    };

    // Handler for date picker
    const handleNextDateChange = (newValue) => {
        setFormData(prev => ({
            ...prev,
            nextContactDate: newValue ? dayjs(newValue).format('DD.MM.YYYY') : '',

        }));
        console.log('Selected next contact date:', newValue);
    };


    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header with subtle animation */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-black tracking-tight">
                    contact planner.
                </h1>
            </div>

            <div>
                {/* Toggle button for last contact */}
                {!showLastContact ? (
                    <button
                        type="button"
                        onClick={() => setShowLastContact(true)}
                        className="w-full bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:border-red-100 group"
                    >
                        <div className="flex items-center justify-between rounded-l">
                            <div className="flex items-center gap-2">
                                <h2 className="text-normal font-extralight text-black tracking-wide group-hover:font-light">
                                    <span className="text-red-400 font-semibold">+</span> add <span className="font-light text-red-500">last contact</span> details.
                                </h2>
                            </div>

                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-red-300 group-hover:text-red-500 transition-colors duration-200">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </div>
                    </button>
                ) : (
                    /* last contact - shown when toggled */
                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 hover:shadow-md ">
                        <div className="flex items-center justify-between mb-2 mt-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="ml-1 w-1 h-6 bg-red-400 rounded-full"></div>
                                <h2 className="text-lg font-light text-red-500 tracking-wide">
                                    last contact.
                                </h2>
                            </div>

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLastContact(false);
                                    setFormData(prev => ({ ...prev, lastContactDate: '', isContacted: false }));
                                }}
                                className="p-2 rounded-lg hover:bg-red-50 group"
                                disabled={isLoading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 ml-1">
                            {/* Date and Place in a grid */}
                            <div className="grid grid-cols-1 gap-4 ">
                                
                                {/* Date Picker */}
                                <div>
                                    <DatePicker
                                        value={formData.lastContactDate}
                                        onChange={handleLastDateChange}
                                        label="select date"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Place Input */}
                                <div className="relative">
                                    <label htmlFor="lastContactPlace" className="absolute left-2 -top-3 bg-white px-1 text-gray-800 font-extralight z-10">
                                        time & place
                                    </label>
                                    <input
                                        type="text"
                                        name="lastContactPlace"
                                        id="lastContactPlace"
                                        value={formData.lastContactPlace}
                                        onChange={handleInputChange}
                                        placeholder="coffee shop, berlin..."
                                        disabled={isLoading}
                                        className="w-full rounded-xl border mb-5 border-gray-400 bg-white hover:border-red-300 focus:border-red-500 text-black font-extralight placeholder-gray-400 h-[52px] px-4 focus:outline-none focus:ring-2 focus:ring-red-100"
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: 100
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Next Contact Section - Enhanced Card */}
            <div className="bg-white rounded-2xl p-2 pb-8 shadow-sm border border-gray-100 hover:shadow-md">
                <div className="flex items-center justify-between mb-2 mt-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="ml-1 w-1 h-6 bg-red-400 rounded-full"></div>
                        <h2 className="text-lg font-light text-red-500 tracking-wide">
                            next planned contact.
                        </h2>
                    </div>
                </div>

                <div className="space-y-4 ml-1">
                    {/* Date and Place in a grid */}
                    <div className="grid grid-cols-1 gap-4 ">
                        
                        {/* Date Picker */}
                        <div>
                            <DatePicker
                                value={formData.nextContactDate}
                                onChange={handleNextDateChange}
                                label="select date"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Place Input */}
                        <div className="relative">
                            <label htmlFor="nextContactPlace" className="absolute left-2 -top-3 bg-white px-1 text-gray-800 font-extralight z-10">
                                time & place
                            </label>
                            <input
                                type="text"
                                name="nextContactPlace"
                                id="nextContactPlace"
                                value={formData.nextContactPlace}
                                onChange={handleInputChange}
                                placeholder="coffee shop, berlin..."
                                disabled={isLoading}
                                className="w-full rounded-xl border border-gray-400 -mb-1 bg-white hover:border-red-300 focus:border-red-500 text-black font-extralight placeholder-gray-400 h-[52px] px-4 focus:outline-none focus:ring-2 focus:ring-red-100"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 100
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reminder Section */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 hover:shadow-md">
                <div className="flex-col items-center justify-between mb-2 mt-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="ml-1 w-1 h-6 bg-red-400 rounded-full"></div>
                        <h2 className="text-lg font-light text-red-500 tracking-wide">
                            reminder & notifications.
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, isToContact: !prev.isToContact }))}
                        className="flex items-center mt-3 ml-3 mb-4"
                        disabled={isLoading}
                    >

                        {formData.isToContact ? (
                            <div className=" text-red-500  group flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>

                                <span className="text-sm font-extralight text-black hover:text-red-500 cursor-pointer">
                                    remind me
                                </span>
                            </div>

                        ) : (
                            <div className=" text-white  group flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1" stroke="black" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                                <span className="text-normal font-extralight text-black hover:text-red-500 cursor-pointer">
                                    set reminder
                                </span>
                            </div>
                        )}
                    </button>
                </div>
            </div>




        </div>
    );
};

export default ContactPlanner;