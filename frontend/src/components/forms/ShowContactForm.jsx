import CircleButton from '../ui/Buttons';
import filmmakersLogo from '../../assets/filmmakersLogo.png';

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


export default function ShowContactForm({
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
    <div className=" min-h-[1200px] w-full">

      {/* Contact Display Card */}
      <div className="bg-white rounded-3xl p-4 pb-8 relative z-10 overflow-visible w-[90vw] min-w-[260px] max-w-[480px] h-fit mx-auto"
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
                className={`w-7 h-7 ${contactData.is_favorite ? 'text-red-500 hover:text-yellow-300' : 'text-black hover:text-yellow-300'
                  }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
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
                    className="inline-block py-2 min-w-[80px] mx-1 px-3 bg-gray-100 tracking-wide hover:bg-red-50 hover:text-red-700 text-black rounded-full text-base font-extralight cursor-pointer">
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
                onClick={handleIsToContactToggle}
                className="flex items-center space-x-3 mt-2 text-red-500 hover:text-red-700"
                disabled={isLoading}
              >
                {contactData.is_to_contact ? (
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


        {/* Contact Information Section */}
        {/* basic information */}
        <div className="space-y-4 pb-3">

          <div className="flex items-center gap-2 ml-0.5">
            <div className="w-1 h-6 bg-red-400 rounded-full mb-1"></div>
            <p className="relative text-lg font-light text-red-400 tracking-wide -mt-1">contact information.</p>
          </div>

          <div className="space-y-4">

            {/* Emails */}
            {contactData.emails && contactData.emails.length > 0 && (
              <div className="mt-3">
                {contactData.emails.map((emailItem, index) => (
                  <>
                    <h2 className="text-red-400 font-light tracking-wide text-[14px] -mb-7 ml-3">
                      {emailItem.title}
                      <span className="text-gray-700 tracking-wide font-extralight"> email</span>
                    </h2>
                    <div key={index} className="bg-gray-50 rounded-xl p-2 space-y-1 mb-4">
                      <div className="flex items-start ">
                        <a
                          href={`mailto:${emailItem.email}`}
                          className="text-black text-[17px] font-extralight mt-5 ml-1 hover:text-red-500 transition-colors"
                        >
                          {emailItem.email}
                        </a>
                      </div>
                    </div>
                  </>
                ))}

              </div>
            )}

            {/* Phones */}
            {contactData.phones && contactData.phones.length > 0 && (
              <div className="mt-3">
                {contactData.phones.map((phoneItem, index) => (
                  <>
                    <h2 className="text-red-400 font-light tracking-wide  text-[14px] -mb-7 ml-3">
                      {phoneItem.title}
                      <span className="text-gray-700 tracking-wide font-extralight"> phone</span>
                    </h2>
                    <div key={index} className="bg-gray-50 rounded-xl p-2 space-y-1 mb-4">
                      <div className="flex items-start ">
                        <a
                          href={`mailto:${phoneItem.phone}`}
                          className="text-black text-[17px] font-extralight mt-5 hover:text-red-500 transition-colors"
                        >
                          {phoneItem.phone}
                        </a>
                      </div>
                    </div>
                  </>
                ))}

              </div>
            )}
          </div>

          <div className="space-y-4 pt-3">
            {/* Addresses */}
            {contactData.addresses && contactData.addresses.length > 0 && (
              <>
                {/* <div className="flex items-center gap-2 ml-0.5 mb-3">
                  <div className="w-1 h-6 bg-red-400 rounded-full mb-1"></div>
                  <p className="relative text-lg font-light text-red-400 tracking-wide -mt-1">where at.</p>
                </div> */}

                <div className="border-b">
                  {contactData.addresses.map((address, index) => (
                    <>
                      <h2 className="text-red-400 font-light tracking-wide text-[14px] -mb-7 ml-3">
                        {address.title}
                        <span className="text-gray-700 tracking-wide font-extralight"> address</span>
                      </h2>

                      <div key={index}>
                        <div className="bg-gray-50 rounded-xl pt-4 p-2 mb-4">
                          <div className="flex items-start mt-1 ">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                [address.street_and_nr, address.postal_code, address.city, address.country]
                                  .filter(Boolean)
                                  .join(', ')
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block transparent rounded-xl pl-0 p-3 cursor-pointer"
                              title="Open in Google Maps"
                            >
                              <span className="flex items-center justify-start">
                                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                              </span>
                              <div className="text-black text-[17px] hover:text-red-500 font-extralight -space-y-1 -mt-5 ml-6">
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
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="space-y-4 mt-4">

          <div className="flex items-center gap-2 ml-0.5 -mb-1">
            <div className="w-1 h-6 bg-red-400 rounded-full mb-1"></div>
            <p className="relative text-lg font-light text-red-400 tracking-wide -mt-1">additional information.</p>
          </div>

          {/* Birthday */}
          {/* {contactData.birthdate && ( */}
          <>
            <div className="bg-gray-50 rounded-xl p-2 space-y-1">
              <h2 className="text-red-400 font-light tracking-wide text-[14px] -mb-1 ml-1">
                birthdate
              </h2>

              <div className="flex items-start text-normal font-extralight ml-1">
                f.e. 18.04.1995 {contactData.birthdate}
              </div>
            </div>
          </>


          {/* Notes */}
          {contactData.notes && (
            <>
              <div className="bg-gray-50 rounded-xl p-2 space-y-1">
                <h2 className="text-red-400 font-light tracking-wide text-[14px] -mb-1 ml-1">
                  notes
                </h2>

                <div className="flex items-start text-normal font-extralight ml-1">
                  {contactData.notes}
                </div>
              </div>
            </>
          )}

          {/* Links */}
          {contactData.links && contactData.links.length > 0 && (
            <div className="mt-3 bg-gray-50 rounded-xl pt-2 pb-4">
              <>
                <h2 className="text-red-400 font-light tracking-wide text-[14px] -mb-6 ml-3">
                  links
                </h2>

                <div className="rounded-xl p-3 pt-7">
                  <div className="flex flex-wrap gap-2">
                    {contactData.links.map((link, index) => {
                      const titleLower = link.title?.toLowerCase() || '';

                      // Instagram
                      if (titleLower === 'instagram') {
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-13 h-13 flex items-center justify-center group rounded-lg bg-white shadow-md shadow-gray-200 transition-all duration-300 hover:shadow-lg"
                            title="Instagram"
                          >
                            <svg className="transition-all duration-300 group-hover:scale-110" width="28" height="28" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M27.4456 35.7808C27.4456 31.1786 31.1776 27.4468 35.7826 27.4468C40.3875 27.4468 44.1216 31.1786 44.1216 35.7808C44.1216 40.383 40.3875 44.1148 35.7826 44.1148C31.1776 44.1148 27.4456 40.383 27.4456 35.7808ZM22.9377 35.7808C22.9377 42.8708 28.6883 48.618 35.7826 48.618C42.8768 48.618 48.6275 42.8708 48.6275 35.7808C48.6275 28.6908 42.8768 22.9436 35.7826 22.9436C28.6883 22.9436 22.9377 28.6908 22.9377 35.7808ZM46.1342 22.4346C46.1339 23.0279 46.3098 23.608 46.6394 24.1015C46.9691 24.595 47.4377 24.9797 47.9861 25.2069C48.5346 25.4342 49.1381 25.4939 49.7204 25.3784C50.3028 25.2628 50.8378 24.9773 51.2577 24.5579C51.6777 24.1385 51.9638 23.6041 52.0799 23.0222C52.1959 22.4403 52.1367 21.8371 51.9097 21.2888C51.6828 20.7406 51.2982 20.2719 50.8047 19.942C50.3112 19.6122 49.7309 19.436 49.1372 19.4358H49.136C48.3402 19.4361 47.5771 19.7522 47.0142 20.3144C46.4514 20.8767 46.1349 21.6392 46.1342 22.4346ZM25.6765 56.1302C23.2377 56.0192 21.9121 55.6132 21.0311 55.2702C19.8632 54.8158 19.0299 54.2746 18.1538 53.4002C17.2777 52.5258 16.7354 51.6938 16.2827 50.5266C15.9393 49.6466 15.533 48.3214 15.4222 45.884C15.3009 43.2488 15.2767 42.4572 15.2767 35.781C15.2767 29.1048 15.3029 28.3154 15.4222 25.678C15.5332 23.2406 15.9425 21.918 16.2827 21.0354C16.7374 19.8682 17.2789 19.0354 18.1538 18.1598C19.0287 17.2842 19.8612 16.7422 21.0311 16.2898C21.9117 15.9466 23.2377 15.5406 25.6765 15.4298C28.3133 15.3086 29.1054 15.2844 35.7826 15.2844C42.4598 15.2844 43.2527 15.3106 45.8916 15.4298C48.3305 15.5408 49.6539 15.9498 50.537 16.2898C51.7049 16.7422 52.5382 17.2854 53.4144 18.1598C54.2905 19.0342 54.8308 19.8682 55.2855 21.0354C55.6289 21.9154 56.0351 23.2406 56.146 25.678C56.2673 28.3154 56.2915 29.1048 56.2915 35.781C56.2915 42.4572 56.2673 43.2466 56.146 45.884C56.0349 48.3214 55.6267 49.6462 55.2855 50.5266C54.8308 51.6938 54.2893 52.5266 53.4144 53.4002C52.5394 54.2738 51.7049 54.8158 50.537 55.2702C49.6565 55.6134 48.3305 56.0194 45.8916 56.1302C43.2549 56.2514 42.4628 56.2756 35.7826 56.2756C29.1024 56.2756 28.3125 56.2514 25.6765 56.1302ZM25.4694 10.9322C22.8064 11.0534 20.9867 11.4754 19.3976 12.0934C17.7518 12.7316 16.3585 13.5878 14.9663 14.977C13.5741 16.3662 12.7195 17.7608 12.081 19.4056C11.4626 20.9948 11.0403 22.8124 10.9191 25.4738C10.7958 28.1394 10.7676 28.9916 10.7676 35.7808C10.7676 42.57 10.7958 43.4222 10.9191 46.0878C11.0403 48.7494 11.4626 50.5668 12.081 52.156C12.7195 53.7998 13.5743 55.196 14.9663 56.5846C16.3583 57.9732 17.7518 58.8282 19.3976 59.4682C20.9897 60.0862 22.8064 60.5082 25.4694 60.6294C28.138 60.7506 28.9893 60.7808 35.7826 60.7808C42.5759 60.7808 43.4286 60.7526 46.0958 60.6294C48.759 60.5082 50.5774 60.0862 52.1676 59.4682C53.8124 58.8282 55.2066 57.9738 56.5989 56.5846C57.9911 55.1954 58.8438 53.7998 59.4842 52.156C60.1026 50.5668 60.5268 48.7492 60.6461 46.0878C60.7674 43.4202 60.7956 42.57 60.7956 35.7808C60.7956 28.9916 60.7674 28.1394 60.6461 25.4738C60.5248 22.8122 60.1026 20.9938 59.4842 19.4056C58.8438 17.7618 57.9889 16.3684 56.5989 14.977C55.2088 13.5856 53.8124 12.7316 52.1696 12.0934C50.5775 11.4754 48.7588 11.0514 46.0978 10.9322C43.4306 10.811 42.5779 10.7808 35.7846 10.7808C28.9913 10.7808 28.138 10.809 25.4694 10.9322Z" fill="url(#paint0_radial_ig)" />
                              <path d="M27.4456 35.7808C27.4456 31.1786 31.1776 27.4468 35.7826 27.4468C40.3875 27.4468 44.1216 31.1786 44.1216 35.7808C44.1216 40.383 40.3875 44.1148 35.7826 44.1148C31.1776 44.1148 27.4456 40.383 27.4456 35.7808ZM22.9377 35.7808C22.9377 42.8708 28.6883 48.618 35.7826 48.618C42.8768 48.618 48.6275 42.8708 48.6275 35.7808C48.6275 28.6908 42.8768 22.9436 35.7826 22.9436C28.6883 22.9436 22.9377 28.6908 22.9377 35.7808ZM46.1342 22.4346C46.1339 23.0279 46.3098 23.608 46.6394 24.1015C46.9691 24.595 47.4377 24.9797 47.9861 25.2069C48.5346 25.4342 49.1381 25.4939 49.7204 25.3784C50.3028 25.2628 50.8378 24.9773 51.2577 24.5579C51.6777 24.1385 51.9638 23.6041 52.0799 23.0222C52.1959 22.4403 52.1367 21.8371 51.9097 21.2888C51.6828 20.7406 51.2982 20.2719 50.8047 19.942C50.3112 19.6122 49.7309 19.436 49.1372 19.4358H49.136C48.3402 19.4361 47.5771 19.7522 47.0142 20.3144C46.4514 20.8767 46.1349 21.6392 46.1342 22.4346ZM25.6765 56.1302C23.2377 56.0192 21.9121 55.6132 21.0311 55.2702C19.8632 54.8158 19.0299 54.2746 18.1538 53.4002C17.2777 52.5258 16.7354 51.6938 16.2827 50.5266C15.9393 49.6466 15.533 48.3214 15.4222 45.884C15.3009 43.2488 15.2767 42.4572 15.2767 35.781C15.2767 29.1048 15.3029 28.3154 15.4222 25.678C15.5332 23.2406 15.9425 21.918 16.2827 21.0354C16.7374 19.8682 17.2789 19.0354 18.1538 18.1598C19.0287 17.2842 19.8612 16.7422 21.0311 16.2898C21.9117 15.9466 23.2377 15.5406 25.6765 15.4298C28.3133 15.3086 29.1054 15.2844 35.7826 15.2844C42.4598 15.2844 43.2527 15.3106 45.8916 15.4298C48.3305 15.5408 49.6539 15.9498 50.537 16.2898C51.7049 16.7422 52.5382 17.2854 53.4144 18.1598C54.2905 19.0342 54.8308 19.8682 55.2855 21.0354C55.6289 21.9154 56.0351 23.2406 56.146 25.678C56.2673 28.3154 56.2915 29.1048 56.2915 35.781C56.2915 42.4572 56.2673 43.2466 56.146 45.884C56.0349 48.3214 55.6267 49.6462 55.2855 50.5266C54.8308 51.6938 54.2893 52.5266 53.4144 53.4002C52.5394 54.2738 51.7049 54.8158 50.537 55.2702C49.6565 55.6134 48.3305 56.0194 45.8916 56.1302C43.2549 56.2514 42.4628 56.2756 35.7826 56.2756C29.1024 56.2756 28.3125 56.2514 25.6765 56.1302ZM25.4694 10.9322C22.8064 11.0534 20.9867 11.4754 19.3976 12.0934C17.7518 12.7316 16.3585 13.5878 14.9663 14.977C13.5741 16.3662 12.7195 17.7608 12.081 19.4056C11.4626 20.9948 11.0403 22.8124 10.9191 25.4738C10.7958 28.1394 10.7676 28.9916 10.7676 35.7808C10.7676 42.57 10.7958 43.4222 10.9191 46.0878C11.0403 48.7494 11.4626 50.5668 12.081 52.156C12.7195 53.7998 13.5743 55.196 14.9663 56.5846C16.3583 57.9732 17.7518 58.8282 19.3976 59.4682C20.9897 60.0862 22.8064 60.5082 25.4694 60.6294C28.138 60.7506 28.9893 60.7808 35.7826 60.7808C42.5759 60.7808 43.4286 60.7526 46.0958 60.6294C48.759 60.5082 50.5774 60.0862 52.1676 59.4682C53.8124 58.8282 55.2066 57.9738 56.5989 56.5846C57.9911 55.1954 58.8438 53.7998 59.4842 52.156C60.1026 50.5668 60.5268 48.7492 60.6461 46.0878C60.7674 43.4202 60.7956 42.57 60.7956 35.7808C60.7956 28.9916 60.7674 28.1394 60.6461 25.4738C60.5248 22.8122 60.1026 20.9938 59.4842 19.4056C58.8438 17.7618 57.9889 16.3684 56.5989 14.977C55.2088 13.5856 53.8124 12.7316 52.1696 12.0934C50.5775 11.4754 48.7588 11.0514 46.0978 10.9322C43.4306 10.811 42.5779 10.7808 35.7846 10.7808C28.9913 10.7808 28.138 10.809 25.4694 10.9322Z" fill="url(#paint1_radial_ig)" />
                              <defs>
                                <radialGradient id="paint0_radial_ig" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(17.4144 61.017) scale(65.31 65.2708)">
                                  <stop offset="0.09" stopColor="#FA8F21" />
                                  <stop offset="0.78" stopColor="#D82D7E" />
                                </radialGradient>
                                <radialGradient id="paint1_radial_ig" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(41.1086 63.257) scale(51.4733 51.4424)">
                                  <stop offset="0.64" stopColor="#8C3AAA" stopOpacity="0" />
                                  <stop offset="1" stopColor="#8C3AAA" />
                                </radialGradient>
                              </defs>
                            </svg>
                          </a>
                        );
                      }

                      // Facebook
                      if (titleLower === 'facebook') {
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-13 h-13 flex items-center justify-center rounded-lg bg-white shadow-md shadow-gray-200 group transition-all duration-300 hover:shadow-lg"
                            title="Facebook"
                          >
                            <svg className="transition-all duration-300 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 72 72" fill="none">
                              <path d="M46.4927 38.6403L47.7973 30.3588H39.7611V24.9759C39.7611 22.7114 40.883 20.4987 44.4706 20.4987H48.1756V13.4465C46.018 13.1028 43.8378 12.9168 41.6527 12.8901C35.0385 12.8901 30.7204 16.8626 30.7204 24.0442V30.3588H23.3887V38.6403H30.7204V58.671H39.7611V38.6403H46.4927Z" fill="#337FFF" />
                            </svg>
                          </a>
                        );
                      }

                      // LinkedIn
                      if (titleLower === 'linkedin') {
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-13 h-13 flex items-center justify-center rounded-lg bg-white shadow-md shadow-gray-200 group transition-all duration-300 hover:shadow-lg"
                            title="LinkedIn"
                          >
                            <svg className="rounded-md transition-all duration-100 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 72 72" fill="none">
                              <path fillRule="evenodd" clipRule="evenodd" d="M14.6975 11C12.6561 11 11 12.6057 11 14.5838V57.4474C11 59.4257 12.6563 61.03 14.6975 61.03H57.3325C59.3747 61.03 61.03 59.4255 61.03 57.4468V14.5838C61.03 12.6057 59.3747 11 57.3325 11H14.6975ZM26.2032 30.345V52.8686H18.7167V30.345H26.2032ZM26.6967 23.3793C26.6967 25.5407 25.0717 27.2703 22.4615 27.2703L22.4609 27.2701H22.4124C19.8998 27.2701 18.2754 25.5405 18.2754 23.3791C18.2754 21.1686 19.9489 19.4873 22.5111 19.4873C25.0717 19.4873 26.6478 21.1686 26.6967 23.3793ZM37.833 52.8686H30.3471L30.3469 52.8694C30.3469 52.8694 30.4452 32.4588 30.3475 30.3458H37.8336V33.5339C38.8288 31.9995 40.6098 29.8169 44.5808 29.8169C49.5062 29.8169 53.1991 33.0363 53.1991 39.9543V52.8686H45.7133V40.8204C45.7133 37.7922 44.6293 35.7269 41.921 35.7269C39.8524 35.7269 38.6206 37.1198 38.0796 38.4653C37.8819 38.9455 37.833 39.6195 37.833 40.2918V52.8686Z" fill="#006699" />
                            </svg>
                          </a>
                        );
                      }


                      // Filmmakers
                      if (titleLower === 'filmmakers') {
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-13 h-13 flex items-center justify-center rounded-full bg-white shadow-md shadow-gray-200 group hover:shadow-lg transition-all duration-300"
                            title="Filmmakers"
                          >
                            <img
                              alt="Filmmakers Icon"
                              className="w-8 h-8 transition-all duration-100 group-hover:scale-110"
                              src={filmmakersLogo}
                            />
                          </a>
                        );
                      }

                      // Schauspielervideos
                      if (titleLower === 'schauspielervideos') {
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-13 h-13 flex items-center justify-center rounded-full bg-white shadow-md shadow-gray-200 group hover:shadow-lg"
                            title="schauspielervideos"
                          >
                            <img
                              alt="Schauspielervideos Icon"
                              className="w-8 h-8 group-hover:scale-110"
                              src="https://assets.filmmakers.eu/assets/web_presence_icons/schauspielervideos-30b9a754.svg"
                            />
                          </a>
                        );
                      }

                      // Website (globe icon)
                      if (titleLower === 'website') {
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-13 h-13 flex items-center px-3 justify-center rounded-lg bg-white shadow-md shadow-gray-200 group hover:shadow-lg"
                            title="Website"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-6 h-6 text-gray-600 group-hover:scale-110 hover:text-red-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                          </a>
                        );
                      }

                      // Other or unknown titles - text button
                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 flex items-center justify-center rounded-lg bg-white shadow-md shadow-gray-200 hover:shadow-lg"
                          title={link.title}
                        >
                          <span className="text-normal font-light text-gray-700 hover:text-red-500 hover:scale-110">
                            {link.title}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </>
            </div>
          )}


          {/* Contact History */}
          {
            (contactData.last_contact_date || contactData.next_contact_date) && (
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
            )
          }
        </div>

        {/* Edit Button */}
        < CircleButton
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
        </CircleButton >
      </div >

      {/* Back Links */}
      < div className="w-full mx-auto pl-5 mt-2 space-y-0.25 max-w-[480px]" >
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
      </div >

    </div >
  );
}