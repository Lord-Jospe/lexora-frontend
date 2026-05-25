import React, { useState } from "react";
import LoginForm from "./loginForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../css/auth/auth.css";
import { useAuth } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleLogin = async (data: {
    email: string;
    password: string;
    remember: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const usuario = await login({ email: data.email, password: data.password });
      console.log("✅ Usuario autenticado:", usuario);
      navigate("/admin");
    } catch (err: unknown) {
      
      if (axios.isAxiosError(err)) {

        const msg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Ocurrió un error al iniciar sesión.";

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
    <div className="auth-page container-fluid">
      <div className="row min-vh-100">

        {/* LEFT */}
        <div className="col-lg-5 col-md-6 auth-left">
          <div className="auth-form-container">
            <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-lg-7 col-md-6 d-none d-md-flex auth-right">
          <img src="/login_image.svg" alt="Login" className="auth-side-image" />
        </div>

      </div>
    </div>
  );
};

export default LoginPage;