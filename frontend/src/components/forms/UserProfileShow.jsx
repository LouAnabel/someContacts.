import { useState } from 'react';
import CircleButton from '../ui/Buttons';


export default function ShowUserProfile({ userData, onEdit, onNavigate, authFetch }) {

  const Button = ({ children, onClick, className = "", ...props }) => {
    return (
      <button
        onClick={onClick}
        className={`text-black dark:text-white dark:hover:text-red-500 transition-colors duration-200 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };

  // Form data - convert from API format to form format
  const [formData, setFormData] = useState({
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    birthdate: userData.birth_date || '',
  });

  // Multi-field arrays
  const [emails, setEmails] = useState(
    userData.emails && userData.emails.length > 0 ? userData.emails : [{ title: 'private', email: '' }]
  );
  const [phones, setPhones] = useState(
    userData.phones && userData.phones.length > 0 ? userData.phones : [{ title: 'mobile', phone: '' }]
  );
  const [addresses, setAddresses] = useState(
    userData.addresses && userData.addresses.length > 0
      ? userData.addresses.map(a => ({
          title: a.title,
          streetAndNr: a.street_and_nr,
          additionalInfo: a.additional_info,
          postalcode: a.postal_code,
          city: a.city,
          country: a.country
        }))
      : [{ title: 'private', streetAndNr: '', additionalInfo: '', postalcode: '', city: '', country: '' }]
  );
  const [links, setLinks] = useState(
    userData.links && userData.links.length > 0 ? userData.links : [{ title: '', url: '' }]
  );

  console.log("formData:", formData)

  return (
    <div className=" min-h-screen w-full">

      {/* Contact Display Card */}
      <div className="bg-white rounded-3xl p-4 pb-8 relative z-10 overflow-visible w-[90vw] min-w-[260px] max-w-[480px] h-fit mx-auto"
        style={{
          boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
        }}>

        <div className="space-y-8">

          {/* Header */}
          <div className="text-center mt-6 mb-8">
            <h1 className="text-3xl font-bold text-black tracking-wide">
              {userData.first_name.toLowerCase()} {userData.last_name.toLowerCase()}.
            </h1>
          </div>

          {/* BASICS SECTION */}
          <div className="space-y-4">

            {/* Birthdate */}
            {userData.birth_date && (
              <div className="relative">
                <label className="absolute -top-2.5 left-2 bg-white px-1 text-sm text-red-500 font-extralight z-10">
                  birthdate
                </label>
                <div className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 h-[48px] flex items-center">
                  <div className="text-black text-[16px] tracking-wide font-extralight ml-1">
                    {userData.birth_date}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CONTACT DETAILS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-red-400 rounded-full"></div>
              <p className="relative text-lg font-light text-red-500 tracking-wide">account details.</p>
            </div>

            {/* Account Email */}
            <div className="relative mt-3">
              <label className="absolute -top-2.5 left-2 bg-white px-1 text-sm text-red-500 font-extralight z-10">
                account email
              </label>
              <div className="w-full rounded-xl border border-gray-300  p-3 h-[48px] flex items-center">
                <div className="text-black text-[16px] font-extralight ml-1">
                  {userData.email}
                </div>
              </div>
            </div>

            <div className="relative mt-3">
              <label className="absolute -top-2.5 left-2 bg-white px-1 text-sm text-red-500 font-extralight z-10">
                account password
              </label>
              <div className="w-full rounded-xl border border-gray-300 p-3 h-[48px] flex items-center"
                placeholder="***********">
                <div className="text-black text-[16px] font-extralight ml-1">
                  ************
                </div>
              </div>
            </div>

            {/* add address */}
            <div className="flex gap-2 items-right justify-end mr-3">

              <Button
                type="button"
                // onClick={addAddress}
                className=" -mt-2 text-sm font-extralight tracking-wide hover:font-light -ml-1 group"
              >
                <span className="text-sm text-red-500 font-light mt-0.5"> edit</span> account details
              </Button>
            </div>

            {/* Additional Emails */}
            {formData.emails && formData.emails.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm text-gray-500 font-extralight ml-2 mb-2">additional emails</h3>
                {formData.emails.map((emailItem, index) => (
                  <div key={index} className="relative">
                    <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500 font-extralight z-10">
                      {emailItem.title}
                    </label>
                    <a
                      href={`mailto:${emailItem.email}`}
                      className=" w-full rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 p-3 h-[48px] flex items-center transition-colors"
                    >
                      <span className="text-black text-[16px] font-extralight ml-1 hover:text-red-500">
                        {emailItem.email}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personal Contact Card */}
          <div className="space-y-3">

            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-red-400 rounded-full"></div>
              <p className="relative text-lg font-light text-red-500 tracking-wide">personal contact card.</p>
            </div>

            {/* Phones */}
            {formData.phones && formData.phones.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm text-gray-500 font-extralight ml-2 mb-2">phone numbers</h3>
                {formData.phones.map((phoneItem, index) => (
                  <div key={index} className="relative">
                    <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500 font-extralight z-10">
                      {phoneItem.title || ''}
                    </label>
                    <a
                      href={`tel:${phoneItem.phone}`}
                      className=" w-full rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 p-3 h-[48px] flex items-center transition-colors"
                    >
                      <span className="text-black text-[16px] font-extralight ml-1 hover:text-red-500">
                        {phoneItem.phone}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADDRESS SECTION */}
          {formData.addresses && formData.addresses.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-red-400 rounded-full"></div>
                <p className="relative text-lg font-light text-red-500 tracking-wide">address information.</p>
              </div>

              <div className="space-y-3 mt-3">
                {formData.addresses.map((address, index) => (
                  <div key={index} className="relative">
                    <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500 font-extralight z-10">
                      {address.title}
                    </label>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        [address.street_and_nr, address.postal_code, address.city, address.country]
                          .filter(Boolean)
                          .join(', ')
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 p-4 transition-colors cursor-pointer"
                      title="Open in Google Maps"
                    >
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <div className="text-black text-[15px] font-extralight space-y-0.5">
                          {address.street_and_nr && <div>{address.street_and_nr}</div>}
                          {address.additional_info && <div className="text-gray-500 text-[13px]">{address.additional_info}</div>}
                          <div>
                            {address.postal_code && `${address.postal_code} `}
                            {address.city}
                          </div>
                          {address.country && <div>{address.country}</div>}
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LINKS SECTION */}
          {formData.links && formData.links.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-red-400 rounded-full"></div>
                <p className="relative text-lg font-light text-red-500 tracking-wide">websites & links.</p>
              </div>

              <div className="space-y-2 mt-3">
                {formData.links.map((link, index) => (
                  <div key={index} className="relative">
                    <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500 font-extralight z-10">
                      {link.title}
                    </label>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 p-3 h-[48px] flex items-center transition-colors"
                    >
                      <span className="text-red-500 text-[16px] font-extralight ml-1 hover:text-red-600 break-all">
                        {link.url}
                      </span>
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

      {/* Bottom Navigation */}
      <div className="w-full px-8 mt-2 space-y-0.25 max-w-[480px] pb-28">
        <div className="text-black dark:text-white font-extralight block relative" style={{ fontSize: '16px' }}>
          want to go{' '}
          <button
            onClick={() => onNavigate('/myspace/contacts')}
            className="font-light text-red-500 hover:underline bg-transparent border-none cursor-pointer"
          >
            to contacts?
          </button>
        </div>
      </div>
    </div>
  );
}