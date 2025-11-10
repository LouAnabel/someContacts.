import React from 'react';

const InlineTitleSelection = ({
    title,
    setTitle,
    showDropdown,
    setShowDropdown,
    showAddTitle,
    setShowAddTitle,
    newTitleName,
    setNewTitleName,
    disabled = false
}) => {
    const predefinedTitles = ['private', 'work', 'mobile', 'other'];
    const currentTitle = title || 'private';

    return (
        <div className="relative">
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                }}
                disabled={disabled}
                className="text-red-500 bg-white font-extralight hover:underline flex items-center gap-1 transition-colors px-1"
                style={{
                    fontSize: '16px',
                    fontWeight: 200
                }}
            >
                <span>{currentTitle}</span>
                <svg 
                    className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <>
                    <div 
                        className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto min-w-[150px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Predefined Titles */}
                        {predefinedTitles.map((titleOption) => {
                            const isSelected = currentTitle.toLowerCase() === titleOption.toLowerCase();
                            
                            return (
                                <button
                                    key={titleOption}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTitle(titleOption);
                                        setShowDropdown(false);
                                        setShowAddTitle(false);
                                        setNewTitleName('');
                                    }}
                                    className={`w-full text-left px-3 py-2 transition-colors duration-150 font-extralight ${
                                        isSelected 
                                            ? 'bg-red-50 text-red-500' 
                                            : 'hover:bg-red-50 text-black hover:text-red-500'
                                    }`}
                                    style={{ fontSize: '14px', fontWeight: 200 }}
                                >
                                    <span className="flex items-center justify-between">
                                        {titleOption}
                                        {isSelected && <span className="text-red-500 text-lg">✓</span>}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Separator */}
                        <div className="border-t border-gray-100"></div>

                        {/* Custom Label Section */}
                        {!showAddTitle ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddTitle(true);
                                    setNewTitleName('');
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-red-50 transition-colors duration-150 text-red-500 font-extralight flex items-center space-x-2"
                                style={{ fontSize: '14px', fontWeight: 300 }}
                            >
                                <span className="text-lg font-light">+</span>
                                <span>own label</span>
                            </button>
                        ) : (
                            <div className="p-2 space-y-2">
                                <input
                                    type="text"
                                    value={newTitleName}
                                    onChange={(e) => setNewTitleName(e.target.value)}
                                    placeholder="enter label"
                                    className="w-full p-2 rounded-lg border border-gray-300 bg-transparent text-black font-extralight placeholder-gray-300 focus:outline-none focus:border-red-500"
                                    style={{ fontSize: '13px', fontWeight: 300 }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && newTitleName.trim()) {
                                            setTitle(newTitleName.trim());
                                            setShowDropdown(false);
                                            setShowAddTitle(false);
                                            setNewTitleName('');
                                        }
                                    }}
                                    autoFocus
                                />
                                <div className="flex space-x-1">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (newTitleName.trim()) {
                                                setTitle(newTitleName.trim());
                                                setShowDropdown(false);
                                                setShowAddTitle(false);
                                                setNewTitleName('');
                                            }
                                        }}
                                        disabled={!newTitleName.trim()}
                                        className="flex-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-xs font-extralight"
                                    >
                                        set
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowAddTitle(false);
                                            setNewTitleName('');
                                        }}
                                        className="flex-1 px-2 py-1 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-xs font-extralight"
                                    >
                                        cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Click outside overlay */}
                    <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => {
                            setShowDropdown(false);
                            setShowAddTitle(false);
                            setNewTitleName('');
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default InlineTitleSelection;