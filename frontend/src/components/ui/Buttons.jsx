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
    small: "w-16 h-16",    // Increased from 16 to 18
    medium: "w-24 h-24",   // Increased from 20 to 24
    large: "w-28 h-28 text-2xl",  // Increased from 24 to 28
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

export default CircleButton;