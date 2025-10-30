

export const buttonStyles = {
  base: "p-2 rounded-md dark:text-black",
  active: "text-red-500 dark:bg-black dark:text-red-500",
  normal: "text-gray-900 dark:text-white hover:text-red-500 dark:hover:text-red-500"
};

export const searchStyles = {
  desktop: "w-64 px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white",
  mobile: "w-full px-4 py-2 pl-10 bg-white dark:bg-white border border-gray-300 dark:border-gray-800 rounded-lg font-light text-gray-500 dark:gray-500"
};

const CircleButton = ({ 
  children, 
  onClick, 
  size = "medium",
  variant = "dark",
  withBorder = true,
  className = "",
  ...props 
}) => {
  const sizes = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-28 h-28 text-2xl",
    xl: "w-32 h-32 text-3xl"
  };

  const textSpacing = {
    small: "px-2 py-1",
    medium: "px-3 py-2", 
    large: "px-4 py-3",
    xl: "px-5 py-4"
  };

  const variants = {
    dark: "bg-black hover:bg-red-500 text-white dark:bg-red-500 dark:hover:bg-red-600",
    red: "bg-red-600 hover:bg-red-700 text-white",
    light: "bg-gray-200 hover:bg-gray-300 text-gray-900"
  };

  const borderClass = withBorder ? "border border-white/40" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${sizes[size]} 
        ${variants[variant]}
        rounded-full 
        ${className}
      `}
      {...props}
    >
      <span className={`flex items-center font-text justify-center px-2 py-3`}>
        {children}
      </span>
    </button>
  );
};

export const NavigationButtons = ({ currentStep, totalSteps, prevStep, nextStep, handleSubmit, isLoading }) => {
  return (
    <div className="relative mt-16 mb-8">

      {/* Left side: Back button */}
      {currentStep >= 1 && (
        // Step 1: Regular small back button
        <CircleButton
            type="button"
            size="medium"
            variant="dark"
            onClick={prevStep}
            className="absolute -bottom-[0px] right-[100px] text-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-black transition-colors"
            disabled={currentStep === 1}
          >
            back.
          </CircleButton>
      )}
      
      {/* Right side: Save and Next buttons */}
      <div className="flex items-center justify-end gap-4">
        {/* Step 1 & 2: XL Next Button (hidden on step 3) */}
        {currentStep < totalSteps && (
          <CircleButton
            type="button"
            size="xl"
            variant="dark"
            onClick={nextStep}
            className="absolute -bottom-[10px] -right-[10px] bg-red-500 hover:bg-red-700 text-2xl font-semibold"
          >
            next.
          </CircleButton>
        )}
        
        {/* Step 3: XL Save Button (replaces Next button) */}
        {currentStep === totalSteps && (
          <CircleButton
            type="submit"
            size="xl"
            variant="dark"
            onClick={handleSubmit}
            className="absolute -bottom-[10px] -right-[10px] bg-red-500 hover:bg-red-700 text-2xl font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'saving...' : 'save.'}
          </CircleButton>
        )}
      </div>
    </div>
  );
};

export default CircleButton;