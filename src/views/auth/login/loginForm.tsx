import React, { useState } from "react";
 
interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void;
}
 
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password, remember });
  };
 
  const handleGoogleLogin = () => {
    // TODO: connect Google OAuth
    console.log("Google login");
  };
 
  return (
    <div className="login-form-wrapper">
      <h1 className="login-title">Ingresa a tu cuenta</h1>
      <p className="login-subtitle">
        ¡Bienvenido de nuevo! Introduce tus credenciales para continuar.
      </p>
 
      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="form-group mb-3">
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            className="form-control custom-input"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
 
        {/* Password */}
        <div className="form-group mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label htmlFor="password" className="form-label mb-0">
              Contraseña
            </label>
            <a href="/forgot-password" className="forgot-link">
              ¿Has olvidado tu contraseña?
            </a>
          </div>
          <input
            id="password"
            type="password"
            className="form-control custom-input mt-1"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
 
        {/* Remember me */}
        <div className="form-check mb-4">
          <input
            id="remember"
            type="checkbox"
            className="form-check-input"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label htmlFor="remember" className="form-check-label remember-label">
            Mantener sesión
          </label>
        </div>
 
        {/* Submit */}
        <button type="submit" className="btn btn-primary w-100 login-btn mb-3">
          Iniciar sesión
        </button>
      </form>
 
      {/* Divider */}
      <div className="divider-row">
        <span className="divider-dot" />
      </div>
 
      {/* Google */}
      <button
        type="button"
        className="btn btn-outline-secondary w-100 google-btn mb-3"
        onClick={handleGoogleLogin}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          width={20}
          height={20}
          className="me-2"
        />
        Inicia sesión con google
      </button>
 
      {/* Register link */}
      <p className="text-center register-cta mb-0">
        ¿Aún no tienes cuenta?{" "}
        <a href="/register" className="register-link">
          Regístrate
        </a>
      </p>
    </div>
  );
};
 
export default LoginForm;