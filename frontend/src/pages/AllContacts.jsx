import ContactCardSmall from "../components/layout/ContactCardSmall"

export default function AllContacts() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="w-full flex flex-col items-center justify-center text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
        All Contacts
      </h1>
      <div className="">
        <ContactCardSmall />
      </div>
    </div>
  );
}

