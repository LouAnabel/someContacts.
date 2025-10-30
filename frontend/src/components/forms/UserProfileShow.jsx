import CircleButton from '../ui/Buttons';
import PhotoField from '../ui/PhotoShowContact.jsx';


export default function ShowUserProfile({ userData, onEdit, onNavigate }) {
  return (
    <div className="max-w-[480px] mx-auto">
      <div
        className="bg-white rounded-3xl p-5 relative z-10 overflow-visible w-[88vw] min-w-[260px] max-w-[480px]"
        style={{
          boxShadow: '0 4px 32px rgba(109, 71, 71, 0.29)'
        }}
      >
        <h1 className="text-3xl mt-2 font-bold text-center mb-8 text-black">
          my profile.
        </h1>

        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="flex justify-center mb-6">
            <PhotoField
              photo={userData.profile_photo} //doesn't exist yet in userData
              disabled={true}
              size="large"
              userName={`${userData.first_name} ${userData.last_name}`}
            />
          </div>

          {/* Name */}
          <div>
            <h2 className="text-2xl font-light text-black text-center">
              {userData.first_name} {userData.last_name}
            </h2>
          </div>

          {/* Birthdate */}
          {userData.birth_date && (
            <div>
              <h3 className="text-red-700 font-light text-[15px] ml-3">date of birth</h3>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-black text-[17px] tracking-wide font-extralight ml-6">
                  {userData.birth_date}
                </div>
              </div>
            </div>
          )}

          {/* Account Email */}
          <div>
            <h3 className="text-red-700 font-light text-[15px] ml-3">account <span className="text-black">email</span></h3>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-black text-[17px] font-extralight ml-6">
                {userData.email}
              </div>
            </div>
          </div>

          {/* Additional Emails */}
          {userData.emails && userData.emails.length > 0 && (
            <div>
              <h3 className="text-red-700 font-light text-[15px] ml-3">contact emails</h3>
              <div className="space-y-2">
                {userData.emails.map((emailItem, index) => (
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
          {userData.phones && userData.phones.length > 0 && (
            <div>
              <h3 className="text-red-700 font-light text-[15px] ml-3">phone numbers</h3>
              <div className="space-y-2">
                {userData.phones.map((phoneItem, index) => (
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
          {userData.addresses && userData.addresses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-red-700 font-light text-[15px] ml-3">addresses</h3>
              {userData.addresses.map((address, index) => (
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

          {/* Links */}
          {userData.links && userData.links.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-red-700 font-light text-[15px] ml-3">links</h3>
              <div className="space-y-2">
                {userData.links.map((link, index) => (
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