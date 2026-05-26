import React, { useState } from "react";
import RegisterForm from "./registerForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../css/auth/auth.css";
import { useAuth } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: {
    name: string;
    email: string;
    password: string;
    terms: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      await register({ name: data.name, email: data.email, password: data.password });
      navigate("/admin"); // registro exitoso → dashboard
    } catch (err: unknown) {
      
      if (axios.isAxiosError(err)) {

        const msg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Ocurrió un error al registrarse.";

        setError(
          typeof msg === "string"
            ? msg
            : JSON.stringify(msg)
        );

      } else {

        setError("Error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex" style={{ minHeight: "100vh" }}>
      {/* Left panel — form */}
      <div className="auth-left d-flex align-items-center justify-content-center">
        <div className="auth-form-container">
          <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
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