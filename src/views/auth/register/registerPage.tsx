import React from "react";
import RegisterForm from "./registerForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../css/auth/auth.css";

const RegisterPage: React.FC = () => {
  const handleRegister = (data: {
    name: string;
    email: string;
    password: string;
    terms: boolean;
  }) => {
    // TODO: connect to FastAPI register endpoint
    console.log("Register payload:", data);
  };

  return (
    <div className="auth-page d-flex" style={{ minHeight: "100vh" }}>
      {/* Left panel — form */}
      <div className="auth-left d-flex align-items-center justify-content-center">
        <div className="auth-form-container">
          <RegisterForm onSubmit={handleRegister} />
        </div>
      </div>

      {/* Right panel — decorative image */}
      <div className="auth-right">
            <img src="/register_image.svg" alt="" className="auth-side-image" />

      </div>
    </div>
  );
};

export default RegisterPage;