import LoginForm from "./loginForm";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../css/auth/auth.css";

const LoginPage: React.FC = () => {
  const handleLogin = (data: {
    email: string;
    password: string;
    remember: boolean;
  }) => {
    console.log("Login payload:", data);
  };

  return (
    <div className="auth-page container-fluid">
      <div className="row min-vh-100">
        
        {/* LEFT */}
        <div className="col-lg-5 col-md-6 auth-left">
          <div className="auth-form-container">
            <LoginForm onSubmit={handleLogin} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-lg-7 col-md-6 d-none d-md-flex auth-right">
          <img
            src="/login_image.svg"
            alt="Login"
            className="auth-side-image"
          />
        </div>

      </div>
    </div>
  );
};

export default LoginPage;