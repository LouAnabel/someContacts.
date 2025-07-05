import LoginForm from '../components/forms/LoginForm'; 

const Login = () => {
    return (
        <section>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <LoginForm />
            </div>
        </section>
    );
};

export default Login;