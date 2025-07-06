import PhotoField from "../ui/PhotoField"
import ContactForm from "../forms/ContactForm"


const ShowContact = () => {
  return (
        // ContactCard
        <div className="min-h-screen bg-white dark:bg-black p-6 absolute top-[90px]" 
             style={{ fontFamily: "'IBM Plex Sans Devanagari', sans-serif" }}>
            
            {/* Top Part of Contact */}
            <div>
                <PhotoField 
                    // photo={contact.photo}
                    // name={contact.firstName}
                    // className=""
                />
                <h1 className="text-3xl font-bold text-center mt-6 mb-2 text-black dark:text-white">
                    Louise Debatin
                </h1>
            </div>
            {/* Contact Form */}
            <div className="mt-6">
                <ContactForm 
                    contact={contact}
                    // onSubmit={handleSubmit}
                    // onCancel={handleCancel}
                />
            </div>

            {/* Signup Link
            <div className="text-black dark:text-white font-light block mt-2 absolute left-[40px]"
                 style={{ fontSize: '16px' }}>
                already have an account? {' '}
                <a href="login" className="font-light font-normal text-red-500 hover:underline">
                     login here.
                </a>
            </div> */}
        </div>
)};

export default ShowContact;