import InlineTitleSelection from '../../ui/InlineTitleSelection.jsx';
import CategorySelection from '../../ui/CategorySelection.jsx';

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

const Step1BasicInfo = ({
    formData,
    setFormData,
    handleInputChange,
    emails,  
    phones,  
    addresses,
    addEmail,
    handleEmailChange,
    removeEmail,
    getEmailDropdownState,
    updateEmailDropdownState,
    updateEmailTitle,
    addPhone,
    handlePhoneChange,
    removePhone,
    getPhoneDropdownState,
    updatePhoneDropdownState,
    updatePhoneTitle,
    addAddress,
    handleAddressChange,
    removeAddress,
    getAddressDropdownState,
    updateAddressDropdownState,
    updateAddressTitle,
    setAddresses,
    showAddress,  
    setShowAddress, 
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
    errors,
    hasSubmitted,
    prevStep,
    nextStep,
    handleSubmit,
    isLoading
}) => {

    return (
        
            <div className="space-y-5">
                {/* Favorite Checkbox */}
                <div className="flex items-center w-full relative left-2 mb-9 rounded-lg">
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                    className="flex items-center space-x-2 hover:scale-110 transform"
                    disabled={isLoading}
                >
                    <svg
                    className={`w-7 h-7 ${formData.isFavorite ? 'text-red-500 hover:text-yellow-300' : 'text-black hover:text-yellow-300'
                        }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                    >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <span className="text-sm font-extralight text-black cursor-pointer">
                    {formData.isFavorite ? 'favorite contact' : 'not a favorite'}
                    </span>
                </button>
                </div>

                {/* Error Message */}
                {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center font-extralight">{errors.submit}</p>
                </div>
                )}

                <div className="space-y-5">
                {/* First Name */}
                <div className="relative">
                    <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="meryl"
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 h-[48px] focus:outline-none focus:border-red-500 ${hasSubmitted && errors.firstName ? 'border-red-500 ' : 'border-gray-400'
                        }`}
                    style={{ fontSize: '16px', fontWeight: 200 }}
                    />
                    <label
                    htmlFor="firstName"
                    className="absolute -top-3 left-2 bg-white px-1 text-base text-black font-extralight"
                    >
                    first name
                    </label>
                    {hasSubmitted && errors.firstName && (
                    <p className="absolute top-full right-1 text-xs text-red-500 z-20 font-extralight">
                        {errors.firstName}
                    </p>
                    )}
                </div>

                {/* Last Name */}
                <div className="relative">
                    <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="streep"
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 h-[48px] focus:outline-none focus:border-red-500 ${hasSubmitted && errors.lastName ? 'border-red-500 shadow-md' : 'border-gray-400'
                        }`}
                    style={{ fontSize: '16px', fontWeight: 200 }}
                    />
                    <label
                    htmlFor="lastName"
                    className="absolute -top-3 left-2 bg-white px-1 text-base text-black font-extralight"
                    >
                    last name
                    </label>
                    {hasSubmitted && errors.lastName && (
                    <p className="absolute top-full right-1 text-xs text-red-600 z-20 font-extralight">
                        {errors.lastName}
                    </p>
                    )}
                </div>
                
                {/* Category Field */}
                <div className="relative">
                    <CategorySelection 
                    formData={formData}
                    categories={categories}
                    showCategoryDropdown={showCategoryDropdown}
                    setShowCategoryDropdown={setShowCategoryDropdown}
                    showAddCategory={showAddCategory}
                    setShowAddCategory={setShowAddCategory}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    isAddingCategory={isAddingCategory}
                    addCategory={addCategory}
                    addCategoryToForm={addCategoryToForm}
                    removeCategoryFromForm={removeCategoryFromForm}
                    hasSubmitted={hasSubmitted}
                    errors={errors}
                    disabled={false}
                />
                </div>

                {/* How to contact? Section */}
                {/* Emails Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                    <p className="relative text-red-500 text-lg ml-1 mt-3 -mb-1 tracking-wide font-extralight">how to contact?  
                    </p>
                    </div>

                    <div className="space-y-1">
                    {emails.map((email, index) => {
                        const dropdownState = getEmailDropdownState(index);
                        
                        return (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="relative flex-1 ">
                            <div className="flex items-center gap-2 ml-2 -mb-3">
                                {/* Inline Title Dropdown */}
                                <InlineTitleSelection
                                title={email.title}
                                setTitle={(newTitle) => updateEmailTitle(index, newTitle)}
                                showDropdown={dropdownState.showDropdown}
                                setShowDropdown={(value) => updateEmailDropdownState(index, { showDropdown: value })}
                                showAddTitle={dropdownState.showAddTitle}
                                setShowAddTitle={(value) => updateEmailDropdownState(index, { showAddTitle: value })}
                                newTitleName={dropdownState.newTitleName}
                                setNewTitleName={(value) => updateEmailDropdownState(index, { newTitleName: value })}
                                disabled={isLoading}
                                />

                                {/* Email label */}
                                <label className="z-20 -ml-2 pr-1 text-black font-extralight bg-white" style={{ fontSize: '16px', fontWeight: 200 }}>
                                email
                                </label>
                            </div>
                            
                            <input
                                type="email"
                                value={email.email}
                                onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                                placeholder="email@example.com"
                                className={`w-full rounded-xl border  bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 h-[48px] px-3 focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.email ? 'border-red-500 shadow-md' : 'border-gray-400'
                                }`}
                                style={{
                                fontSize: '16px',
                                fontWeight: 180
                                }}
                            />
                            </div>

                            {emails.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeEmail(index)}
                                className="text-red-500 hover:text-red-700 mt-5 font-extralight text-lg"
                            >
                                ×
                            </button>
                            )}
                        </div>
                        );
                    })}
                    </div>
                

                    {/* Phones Section */}
                    <div className="space-y-3">
                    {phones.map((phone, index) => {
                    const dropdownState = getPhoneDropdownState(index);
                    
                    return (
                        <div key={index} className="flex gap-2 items-start">
                        <div className="relative flex-1">
                            <div className="flex items-center gap-2 -mb-3 -mt-1 ml-2">
                            {/* Inline Title Dropdown */}
                            <InlineTitleSelection
                                title={phone.title}
                                setTitle={(newTitle) => updatePhoneTitle(index, newTitle)}
                                showDropdown={dropdownState.showDropdown}
                                setShowDropdown={(value) => updatePhoneDropdownState(index, { showDropdown: value })}
                                showAddTitle={dropdownState.showAddTitle}
                                setShowAddTitle={(value) => updatePhoneDropdownState(index, { showAddTitle: value })}
                                newTitleName={dropdownState.newTitleName}
                                setNewTitleName={(value) => updatePhoneDropdownState(index, { newTitleName: value })}
                                disabled={isLoading}
                            />

                            {/* Phone label */}
                            <label className="z-20 text-black  font-extralight -ml-2 bg-white pr-1" style={{ fontSize: '16px', fontWeight: 200 }}>
                                phone
                            </label>
                            </div>
                            
                            <input
                            type="tel"
                            value={phone.phone}
                            onChange={(e) => handlePhoneChange(index, 'phone', e.target.value)}
                            placeholder="+49 123 4567890"
                            className={`w-full rounded-xl border bg-white -mb-1 hover:border-red-300 text-black font-extralight placeholder-gray-300 h-[48px] px-3 focus:outline-none focus:border-red-500 ${
                                hasSubmitted && errors.phone ? 'border-red-500 shadow-md' : 'border-gray-400'
                            }`}
                            style={{
                                fontSize: '16px',
                                fontWeight: 180
                            }}
                            />
                        </div>

                        {phones.length > 1 && (
                            <button
                            type="button"
                            onClick={() => removePhone(index)}
                            className="text-red-500 hover:text-red-700 mt-4 font-extralight text-lg"
                            >
                            ×
                            </button>
                        )}
                        </div>
                    );
                    })}
                    </div>

                    {/* Add Phone Button */}
                    <div className="relative ">
                    <span className="text-sm text-black font-extralight ml-72 mt-1">+ add</span>
                        <span>
                        <Button 
                        type="button" 
                        onClick={addEmail} 
                        className="ml-1 text-sm font-extralight text-red-500 hover:underline tracking-wide"
                    >
                        email
                    </Button>
                        </span>
                        <span className="ml-1 text-sm mt-1 font-extralight text-black">/</span>
                        <span>
                        <Button 
                        type="button" 
                        onClick={addPhone} 
                        className="ml-0.5 text-sm font-extralight text-red-500 hover:underline tracking-wide"
                    >
                        number
                    </Button>
                        </span>
                    </div>


                    {/* Optional: Addresses */}
                    <div className="relative">
                    {!showAddress ? (
                        <button
                        type="button"
                        onClick={() => setShowAddress(true)}
                        className="flex items-center ml-1 -mt- space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
                        >
                        <span className="text-lg font-semibold">+</span>
                        <span className="text-base text-black hover:text-red-500">add address</span>
                        </button>
                    ) : (
                        <div className="mt-2">
                            <div className="flex items-center justify-between -mb-5">
                                <span className="relative left-2 tracking-wide font-extralight text-red-500 font-md">
                                    address information
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddress(false);
                                        setAddresses([{ title: 'private', streetAndNr: '', additionalInfo: '', postalcode: '', city: '', country: '' }]);
                                    }}
                                    className="relative mr-5 text-red-500 tracking-wide hover:underline text-sm font-extralight"
                                    disabled={isLoading}
                                >
                                    remove all
                                </button>
                            </div>
                        

                        {addresses.map((address, index) => {
                            const dropdownState = getAddressDropdownState(index);
                            
                            return (
                            <div key={index} className="space-y-2 rounded-xl mt-6 py-2 ">
                                <div className="flex items-center justify-between">
                                
                                {/* Inline Title Dropdown and Label */}
                                <div className="flex items-center gap-2 ml-2">
                                    <InlineTitleSelection
                                    title={address.title}
                                    setTitle={(newTitle) => updateAddressTitle(index, newTitle)}
                                    showDropdown={dropdownState.showDropdown}
                                    setShowDropdown={(value) => updateAddressDropdownState(index, { showDropdown: value })}
                                    showAddTitle={dropdownState.showAddTitle}
                                    setShowAddTitle={(value) => updateAddressDropdownState(index, { showAddTitle: value })}
                                    newTitleName={dropdownState.newTitleName}
                                    setNewTitleName={(value) => updateAddressDropdownState(index, { newTitleName: value })}
                                    disabled={isLoading}
                                    />
                                    <span className="text-black font-extralight -ml-2">address</span> 
                                </div>
                                
                                {/* Remove button for individual address */}
                                {addresses.length > 1 && (
                                    <button
                                    type="button"
                                    onClick={() => removeAddress(index)}
                                    className="text-sm font-extralight tracking-wide text-red-500 hover:underline mr-5"
                                    >
                                    X
                                    </button>
                                )}
                                </div>

                                {/* INPUT FIELDS ADDRESS */}
                                <div className="relative w-full space-y-4">
                                {/* Street & Number */}
                                <div className="relative">
                                    <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                    street & nr°
                                    </label>
                                    <input
                                    type="text"
                                    value={address.streetAndNr}
                                    onChange={(e) => handleAddressChange(index, 'streetAndNr', e.target.value)}
                                    placeholder="Main Street 12"
                                    className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                    style={{ fontSize: '16px', fontWeight: 200 }}
                                    />
                                </div>

                                
                                {/* Additional Info */}
                                <div className="relative">
                                    <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                    additional info (optional)
                                    </label>
                                    <input
                                    type="text"
                                    value={address.additionalInfo}
                                    onChange={(e) => handleAddressChange(index, 'additionalInfo', e.target.value)}
                                    placeholder="Apartment 4B, 2nd floor"
                                    className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                    style={{ fontSize: '15px', fontWeight: 200 }}
                                    />
                                </div>
                                
                                {/* Postal Code & City */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                    <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                        postal code
                                    </label>
                                    <input
                                        type="text"
                                        value={address.postalcode}
                                        onChange={(e) => handleAddressChange(index, 'postalcode', e.target.value)}
                                        placeholder="12345"
                                        className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                        style={{ fontSize: '15px', fontWeight: 200 }}
                                    />
                                    </div>
                                    <div className="relative">
                                    <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                        city
                                    </label>
                                    <input
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                        placeholder="Berlin"
                                        className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                        style={{ fontSize: '15px', fontWeight: 200 }}
                                    />
                                    </div>
                                </div>
                                
                                {/* Country */}
                                <div className="relative">
                                    <label className="absolute left-2 -top-2.5 bg-white px-1 text-sm text-black font-extralight z-10">
                                    country
                                    </label>
                                    <input
                                    type="text"
                                    value={address.country}
                                    onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                                    placeholder="Germany"
                                    className="w-full h-[48px] px-3 rounded-xl border border-gray-400 placeholder:text-gray-200 bg-white p-2.5 text-black font-extralight focus:outline-none focus:border-red-500"
                                    style={{ fontSize: '15px', fontWeight: 200 }}
                                    />
                                </div>
                                </div>
                            </div>  
                            );
                        })}
                        <div className="flex gap-2 items-right justify-end mr-5">
                            <span className="text-black font-extralight text-sm">+ add</span>
                            <Button
                                type="button"
                                onClick={addAddress}
                                className="text-sm font-extralight text-red-500 hover:underline -ml-1"
                            >
                            address
                            </Button>
                            
                            </div>
                        </div>
                        
                    )}
                    
                    </div>
                </div>
            </div>         
        </div>


    );
}

export default Step1BasicInfo;