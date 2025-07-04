import RegisterForm from '../components/forms/RegisterForm.jsx';

export default function Register() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
        < RegisterForm/>
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Add contact form will go here.
      </p>
    </div>
  );
}