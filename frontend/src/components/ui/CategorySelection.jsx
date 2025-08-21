import React from 'react';

const CategorySelection = ({
    formData,
    categories,
    showCategoryDropdown,
    setShowCategoryDropdown,
    showAddCategory,
    setShowAddCategory,
    newCategoryName,
    setNewCategoryName,
    isAddingCategory,
    addCategory,
    addCategoryToForm,
    removeCategoryFromForm,
    hasSubmitted,
    errors,
    disabled = false
}) => {

    // Safely get categories array, handling both array and single category cases
    const selectedCategories = formData.categories || [];

    return (
        <div className="relative">
            {/* Selected Categories Display */}
            {selectedCategories && selectedCategories.length > 0 && (
                <div className="mb-4 ml-1.5 flex flex-wrap gap-2">
                    {selectedCategories.map((category, index) => (
                        <div
                            key={category.id || index}
                            className="inline-flex items-center bg-red-100 text-black rounded-full px-3 py-1 text-sm font-extralight"
                        >
                            <span>{category.name}</span>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log('Removing category:', category);
                                        removeCategoryFromForm(category.id);
                                    }}
                                    className="ml-2 text-red-400 hover:text-red-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            <div>
                <label className="absolute left-4 -mt-3 bg-white px-1 text-base text-black font-extralight">
                    categories
                </label>
            
                {/* Dropdown Button */}
                <button
                    type="button"
                    onClick={() => {
                        setShowCategoryDropdown(!showCategoryDropdown);
                    }}
                    disabled={disabled || selectedCategories.length >= 3}
                    className={`w-full p-2.5 rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black placeholder-gray-200 font-extralight max-w-full min-w-[200px] focus:outline-none focus:border-red-500 flex items-center justify-between ${
                        hasSubmitted && errors.categories ? 'border-red-400' : 'border-gray-400 dark:border-gray-400'
                    } ${selectedCategories.length >= 3 ? ' text-gray-300 border-gray-300 cursor-not-allowed' : ''}`}
                    style={{
                        fontSize: '16px',
                        fontWeight: 200
                    }}
                >
                    <span className={`font-extralight ${selectedCategories.length < 3 ? 'text-gray-200' : 'text-gray-300'}`}>
                        {selectedCategories.length === 0 
                            ? categories.length === 0 
                                ? 'create a category first'
                                : 'select up to 3 categories'
                            : selectedCategories.length >= 3
                                ? 'maximum categories selected'
                                : `${selectedCategories.length}/3 selected`
                        }
                    </span>
                    <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>    

            {/* Custom Dropdown Menu */}
            {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto"> 
                    
                    {/* Show category options only if categories exist */}
                    {categories.length > 0 && (
                        <>
                            {categories.map((category) => {
                                // Check if category is already selected using both id and name for compatibility
                                const isSelected = selectedCategories.some(cat => 
                                    cat.id === category.id || 
                                    (cat.name === category.name && cat.id === category.id)
                                );
                                const canSelect = !isSelected && selectedCategories.length < 3;
                                
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => {
                                            
                                            if (isSelected) {
                                                // Remove category if it's selected
                                                console.log('Removing category:', category);
                                                removeCategoryFromForm(category.id);
                                            } else if (canSelect) {
                                                // Add category if it's not selected and can be selected
                                                console.log('Adding category:', category);
                                                addCategoryToForm(category);
                                            }
                                        }}
                                        disabled={!canSelect && !isSelected}
                                        className={`w-full text-left px-3 py-2 transition-colors duration-150 font-extralight ${
                                            isSelected 
                                                ? 'bg-red-50 text-red-500 cursor-pointer hover:bg-red-100' 
                                                : canSelect
                                                    ? 'hover:bg-red-50 text-black cursor-pointer hover:text-red-500'
                                                    : 'text-gray-400 cursor-not-allowed'
                                        }`}
                                        style={{ fontSize: '16px', fontWeight: 200 }}
                                    >
                                        <span className="flex items-center justify-between">
                                            {category.name}
                                            {isSelected ? (
                                                <span className="text-red-500 text-lg font-extralight hover:text-red-700">×</span>
                                            ) : canSelect ? (
                                                <span className="text-gray-400"></span>
                                            ) : (
                                                <span className="text-gray-300"></span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                            
                            {/* Separator line before add new category */}
                            <div className="border-t border-gray-100"></div>
                        </>
                    )}
                    
                    {/* Show empty state message if no categories */}
                    {categories.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm font-extralight italic">
                            No categories yet. Create your first one below.
                        </div>
                    )}
                    
                    {/* Add Category Section - Always show this */}
                    <div>
                        {!showAddCategory ? (
                            <button
                                type="button"
                                onClick={() => {
                                    console.log('Opening add category form');
                                    setShowAddCategory(true);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-red-50 transition-colors duration-150 text-red-500 font-extralight flex items-center space-x-2"
                                style={{ fontSize: '16px', fontWeight: 300 }}
                            >
                                <span className="text-lg font-light">+</span>
                                <span>add new category</span>
                            </button>
                        ) : (
                            <div className="p-3 space-y-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => {
                                        console.log('New category name changed:', e.target.value);
                                        setNewCategoryName(e.target.value);
                                    }}
                                    placeholder="enter category name"
                                    className="w-full p-2 rounded-lg border border-gray-300 bg-transparent text-black font-extralight placeholder-gray-300 focus:outline-none focus:border-red-500"
                                    style={{ fontSize: '15px', fontWeight: 300 }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            
                                            addCategory();
                                        }
                                    }}
                                    autoFocus
                                />
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                    
                                            addCategory();
                                        }}
                                        disabled={isAddingCategory || !newCategoryName.trim()}
                                        className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-sm font-extralight"
                                    >
                                        {isAddingCategory ? 'adding...' : 'add'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddCategory(false);
                                            setNewCategoryName('');
                                        }}
                                        disabled={isAddingCategory}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150 text-sm font-extralight"
                                    >
                                        cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {showCategoryDropdown && (
                <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => {
                        setShowCategoryDropdown(false);
                        setShowAddCategory(false);
                        setNewCategoryName('');
                    }}
                />
            )}

            {hasSubmitted && errors.categories && (
                <p className="absolute top-full right-1 font-light text-sm text-red-600 z-20">{errors.categories}</p>
            )}
        </div>
    );
};

export default CategorySelection;