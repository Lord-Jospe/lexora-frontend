import logo from '../../assets/logo_app.svg';

const FullLogo = () => {
    return (
        <>
            <img src={logo} alt="Logo" className="hidden dark:block rtl:scale-x-[-1] mx-auto" />
        </>
    );
};

export default FullLogo;