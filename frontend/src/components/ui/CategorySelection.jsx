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
    return (
        <div className="relative">
            <label className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-light">
                categories (max 3)
            </label>
            
            {/* Selected Categories Display */}
            {formData.categories && formData.categories.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {formData.categories.map((category, index) => (
                        <div
                            key={category.id || index}
                            className="inline-flex items-center bg-red-100 text-red-600 rounded-full px-3 py-1 text-sm font-light"
                        >
                            <span>{category.name}</span>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeCategoryFromForm(category.id)}
                                    className="ml-2 text-red-400 hover:text-red-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => {
                    console.log('Dropdown clicked. Current categories:', categories);
                    console.log('Current selected categories:', formData.categories);
                    setShowCategoryDropdown(!showCategoryDropdown);
                }}
                disabled={disabled || formData.categories.length >= 3}
                className={`w-full p-2.5 rounded-xl border bg-white hover:border-red-300 dark:hover:border-red-300 text-black placeholder-gray-200 font-light max-w-full min-w-[200px] focus:outline-none focus:border-red-500 flex items-center justify-between ${
                    hasSubmitted && errors.categories ? 'border-red-500 shadow-md' : 'border-gray-400 dark:border-gray-400'
                } ${formData.categories.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                    fontSize: '16px',
                    fontWeight: 300
                }}
            >
                <span className={formData.categories.length > 0 ? 'text-black' : 'text-gray-300'}>
                    {formData.categories.length === 0 
                        ? categories.length === 0 
                            ? 'create a category first'
                            : 'select categories'
                        : formData.categories.length >= 3
                            ? 'maximum categories selected'
                            : `${formData.categories.length}/3 categories selected`
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

            {/* Custom Dropdown Menu */}
            {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto"> 
                    
                    {/* Show category options only if categories exist */}
                    {categories.length > 0 && (
                        <>
                            {categories.map((category) => {
                                const isSelected = formData.categories.some(cat => cat.id === category.id);
                                const canSelect = !isSelected && formData.categories.length < 3;
                                
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => {
                                            if (canSelect) {
                                                console.log('Category selected:', category);
                                                addCategoryToForm(category);
                                            }
                                        }}
                                        disabled={!canSelect}
                                        className={`w-full text-left px-3 py-2 transition-colors duration-150 font-light ${
                                            isSelected 
                                                ? 'bg-red-50 text-red-400 cursor-not-allowed' 
                                                : canSelect
                                                    ? 'hover:bg-red-50 text-black cursor-pointer'
                                                    : 'text-gray-400 cursor-not-allowed'
                                        }`}
                                        style={{ fontSize: '16px', fontWeight: 300 }}
                                    >
                                        <span className="flex items-center justify-between">
                                            {category.name}
                                            {isSelected && (
                                                <span className="text-red-500">✓</span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                            
                            {/* Separator line only if there are categories */}
                            <div className="border-t border-gray-100"></div>
                        </>
                    )}
                    
                    {/* Show empty state message if no categories */}
                    {categories.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm font-light italic">
                            No categories yet. Create your first one below.
                        </div>
                    )}
                    
                    {/* Add Category Section - Always show this */}
                    <div>
                        {!showAddCategory ? (
                            <button
                                type="button"
                                onClick={() => setShowAddCategory(true)}
                                className="w-full text-left px-3 py-2 hover:bg-red-50 transition-colors duration-150 text-red-500 font-light flex items-center space-x-2"
                                style={{ fontSize: '16px', fontWeight: 300 }}
                            >
                                <span className="text-lg font-semibold">+</span>
                                <span>add new category</span>
                            </button>
                        ) : (
                            <div className="p-3 space-y-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="enter category name"
                                    className="w-full p-2 rounded-lg border border-gray-300 bg-transparent text-black font-light placeholder-gray-300 focus:outline-none focus:border-red-500"
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
                                        onClick={addCategory}
                                        disabled={isAddingCategory || !newCategoryName.trim()}
                                        className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-sm font-light"
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
                                        className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150 text-sm font-light"
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