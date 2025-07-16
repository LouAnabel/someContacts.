import LoginForm from '../components/forms/LoginForm'; 

const Login = () => {
    return (
        <section className="space-y-7 min-h-screen">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                <LoginForm />
            </div>
        </section>
    );
};

export default Login;