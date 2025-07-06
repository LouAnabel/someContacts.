import ThemeToggle from '../theme/ThemeToggle';

const AuthHeader = () => {
  return (
    <nav className="bg-white dark:bg-black fixed w-full z-50 top-0">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* someContacts. Title - Left side */}
          <div className="flex items-center">
            <span className="p-3 text-3xl font-heading text-black hover:text-red-500 dark:text-white hover:dark:text-red-500">
              <span className="font-semibold">some</span>
              <span className="font-light">Contacts.</span>
            </span>
          </div>

          {/* Theme Toggle - Right side */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          
        </div>
      </div>
    </nav>
  );
}

export default AuthHeader;