import CircleButton from '../ui/Buttons';

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


export default function ShowContact({ 
  contactData, 
  navigate,
  handleFavoriteToggle, 
  handleIsContactedToggle, 
  handleIsToContactToggle, 
  onEdit,  
  onNavigate,
  isLoading

}) {


  const handleGoBack = () => {
    onNavigate(-1);
  };

  return (
    <div className=" min-h-screen w-full">

      {/* Contact Display Card */}
      <div className="bg-white rounded-3xl p-4 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px] h-fit mx-auto"
          style={{ 
              boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
          }}>
        
        {/* Favorite Button, Name, Categories */}
        <div className="text-center mb-4 space-y-7 pb-3">
          
          {/* Favorite checkbox */}
          <div className="flex justify-center">
              <button
                      type="button"
                      onClick={handleFavoriteToggle} 
                      className="flex items-center hover:scale-110 transcontact -mb-4"
                      disabled={isLoading}
                  >
                  <svg 
                      className={`w-7 h-7 ${
                          contactData.is_favorite ? 'text-red-500 hover:text-yellow-300' : 'text-black hover:text-yellow-300'
                      }`} 
                      aria-hidden="true" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="currentColor" 
                      viewBox="0 0 22 20"
                      >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                  </svg>
              </button>
          </div>
          
          {/* Name */}
          <h1 className="text-3xl font-bold text-center text-black">
              {contactData.first_name} {contactData.last_name}
          </h1>
    
          
          {/* Categories Display */}
          {contactData && contactData.categories && contactData.categories.length > 0 && (
            <div className="w-full justify-center mx-auto flex-wrap ">
              <div className="-mt-4">
                {contactData.categories.map((category, index) => (
                    <span 
                    key={category.id || index} 
                    onClick={() => navigate(`/myspace/categories?expand=${category.id}`)}
                    className="inline-block px-3 py-2 min-w-[90px] mx-1 bg-red-100 tracking-wide hover:bg-red-50 hover:text-red-700 text-red-700 rounded-full text-base font-extralight">
                        {category.name}
                    </span>
                ))}
               </div> 
            </div>
          )}

          {/* Checkboxes */}
          <div className="ml-2 border-b border-gray-200 pb-5"> 
            
              {/* isContacted Checkbox */}
              <div className="flex items-center w-full relative rounded-lg">
                  <button
                      type="button"
                      onClick={handleIsContactedToggle} 
                      className="flex items-center space-x-3 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                  >
                      {contactData.is_contacted ? ( 
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>

                              <span className="text-sm font-extralight text-black cursor-pointer">
                                  contacted
                              </span>
                          </>
                      ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="black" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                              <span className="text-sm font-extralight text-black cursor-pointer">
                                  mark as contacted
                              </span>
                          </>
                      )}
                  </button>
                </div>

              {/* isToContact Checkbox */}
              <div className="flex items-center w-full relative">
                  <button
                      type="button"
                      onClick={handleIsToContactToggle} // FIXED: Use the correct handler
                      className="flex items-center space-x-3 mt-2 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                  >
                      {contactData.is_to_contact ? ( // FIXED: Use contactData instead of contactData
                          <>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                              </svg>

                              <span className="text-sm font-extralight text-black cursor-pointer">
                                  remind me
                              </span>
                          </>
                      ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="black" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                              <span className="text-sm font-extralight text-black cursor-pointer">
                                  reminder
                              </span>
                          </>
                      )}
                  </button>
              </div>
          </div>
        </div>


         {/* Contact Information */}
        <div className="space-y-7 mb-7 ">
          
          {/* Emails */}
          {contactData.emails && contactData.emails.length > 0 && (
            <div>
              <h3 className="text-red-700 font-light text-[15px] ml-3 mb-2">emails</h3>
              <div className="space-y-2">
                {contactData.emails.map((emailItem, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-gray-500 text-[13px] font-extralight ml-6">
                      {emailItem.title}
                    </div>
                    <a
                      href={`mailto:${emailItem.email}`}
                      className="text-black text-[17px] font-extralight ml-6 hover:text-red-500 transition-colors"
                    >
                      {emailItem.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phones */}
          {contactData.phones && contactData.phones.length > 0 && (
            <div>
              <h3 className="text-red-700 font-light text-[15px] ml-3 mb-2">phone numbers</h3>
              <div className="space-y-2">
                {contactData.phones.map((phoneItem, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-gray-500 text-[13px] font-extralight ml-6">
                      {phoneItem.title}
                    </div>
                    <a
                      href={`tel:${phoneItem.phone}`}
                      className="text-black text-[17px] font-extralight ml-6 hover:text-red-500 transition-colors"
                    >
                      {phoneItem.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addresses */}
          {contactData.addresses && contactData.addresses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-red-700 font-light text-[15px] ml-3 mb-2">addresses</h3>
              {contactData.addresses.map((address, index) => (
                <div key={index}>
                  <div className="text-gray-500 text-[13px] font-extralight ml-3 mb-1">
                    {address.title}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [address.street_and_nr, address.postal_code, address.city, address.country]
                        .filter(Boolean)
                        .join(', ')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-3 cursor-pointer"
                    title="Open in Google Maps"
                  >
                    <span className="flex items-center justify-start">
                      <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    </span>
                    <div className="text-black text-[17px] font-extralight -space-y-1 -mt-5 ml-6">
                      {address.street_and_nr && <div>{address.street_and_nr},</div>}
                      {address.additional_info && <div>{address.additional_info}</div>}
                      <div>
                        {address.postal_code && `${address.postal_code} `}
                        {address.city},
                      </div>
                      {address.country && <div>{address.country}</div>}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Birthday */}
          {contactData.birth_date && (
            <div>
              <h3 className="text-red-700 font-light text-[15px] ml-3">date of birth</h3>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-black text-[17px] tracking-wide font-extralight ml-6">
                  {contactData.birth_date}
                </div>
              </div>
            </div>
          )}

          {/* Contact History */}
          {(contactData.last_contact_date || contactData.next_contact_date) && (
            <div className="bg-gray-50 rounded-xl">
              {/* Last contact */}
              {contactData.last_contact_date && (
                <>
                  <h3 className="text-red-700 text-[15px] ml-3 pt-3">
                    <span className="font-extralight">last date of contact:</span>
                  </h3>
                  <div className="p-3 pt-2">
                    <div className="text-black text-[16px] font-extralight">{contactData.last_contact_date}</div>
                  </div>
                </>
              )}

              {/* Next contact */}
              {contactData.next_contact_date && (
                <>
                  <h3 className="text-red-700 font-extralight text-[15px] ml-3">
                    <span className="font-extralight">next planned contact:</span>
                  </h3>
                  <div className="p-3 pb-3">
                    <div className="text-black text-[17px] font-extralight">{contactData.next_contact_date}</div>
                    {contactData.next_contact_place && (
                      <div className="text-gray-500 text-[14px] font-extralight mt-1">
                        at: {contactData.next_contact_place}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          {contactData.notes && (
            <div>
              <h3 className="text-red-700 font-light text-[16px] ml-3">notes</h3>
              <div className="bg-gray-50 rounded-xl p-3 min-h-[100px]">
                <div className="text-black text-[17px] font-extralight whitespace-pre-wrap">
                  "{contactData.notes}"
                </div>
              </div>
            </div>
          )}

          {/* Links */}
          {contactData.links && contactData.links.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-red-700 font-light text-[15px] ml-3">links</h3>
              <div className="space-y-2">
                {contactData.links.map((link, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 text-[17px] font-extralight hover:text-red-500 transition-colors break-all"
                    >
                      {link.title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <CircleButton
          size="xl"
          variant="dark"
          onClick={onEdit}
          className="absolute -bottom-[85px] -right-[10px] font-semibold"
          style={{
            marginTop: '2rem',
            marginLeft: 'auto',
            display: 'block'
          }}
        >
          edit.
        </CircleButton>
      </div>

      {/* Back Links */}
      <div className="w-full px-8 mt-2 space-y-0.25 max-w-[480px]">
        <div className="text-black dark:text-white font-extralight block relative" style={{ fontSize: '16px' }}>
          want to go{' '}
          <button
            onClick={() => onNavigate('/myspace/contacts')}
            className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
          >
            to contacts?
          </button>
        </div>
        <div className="text-black dark:text-white font-extralight block -mt-2 relative" style={{ fontSize: '16px' }}>
          or go{' '}
          <button onClick={handleGoBack} className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer">
            back
          </button>
        </div>
      </div>
    </div>
  );
}