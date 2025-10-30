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

const NavigationButtons = ({ currentStep, totalSteps, prevStep, nextStep, handleSubmit, isLoading }) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
      
      {/* Left: Previous Button (hidden on first step) */}
      <div className="flex-1">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-extralight transition-colors"
          >
            ← Previous
          </button>
        )}
      </div>
      
      {/* Center: Save Contact Button */}
      <div className="flex-1 flex justify-center">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-8 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed font-extralight transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
      
      {/* Right: Next Button (hidden on last step) */}
      <div className="flex-1 flex justify-end">
        {currentStep < totalSteps && (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-extralight transition-colors"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationButtons;