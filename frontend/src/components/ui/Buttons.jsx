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
    small: "w-18 h-18 text-xs",    // Increased from 16 to 18
    medium: "w-24 h-24 text-sm",   // Increased from 20 to 24
    large: "w-28 h-28 text-base",  // Increased from 24 to 28
    xl: "w-32 h-32 text-lg"
  };

  const textSpacing = {
    small: "px-2 py-1",
    medium: "px-3 py-2", 
    large: "px-4 py-3",
    xl: "px-5 py-4"
  };

  const variants = {
    dark: "bg-black hover:bg-red-500 text-white dark:bg-black dark:hover:bg-red-600",
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
        font-medium rounded-full flex items-center justify-center 
        transition-colors duration-200 
        ${className}
      `}
      {...props}
    >
      <span className={`text-xl font-text font-semibold text-center leading-relaxed ${textSpacing[size]}`}>
        {children}
      </span>
    </button>
  );
};

export default CircleButton;