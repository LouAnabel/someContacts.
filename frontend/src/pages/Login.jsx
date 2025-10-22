import LoginForm from '../components/forms/LoginForm'; 

const Login = () => {
    return (
        <section className="space-y-7 min-h-screen">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                <LoginForm />
            </div>
            
            {/* Bottom Tagline */}
            <div className="text-center text-black dark:text-white text-l absolute bottom-[34px] left-1/2 transform -translate-x-1/2 w-full min-[480px]:text-base"
                style={{
                    fontWeight: 300,
                    lineHeight: 1.4,
                    fontSize: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '30px' : '24px',
                }}>
                <p>Remember their names.</p>
                <p>Know their faces.</p>
            </div>
        </section>
    );
};

export default Login;