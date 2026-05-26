import React, { useState } from "react";

interface RegisterFormProps {
  onSubmit?: (data: {
    name: string;
    email: string;
    password: string;
    terms: boolean;
  }) => void;
  loading?: boolean;
  error?: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading, error }) => {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms]       = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ name, email, password, terms });
  };

  const handleGoogleRegister = () => {
    console.log("Google register — pendiente implementar");
  };

  return (
    <div className="login-form-wrapper">
      <h1 className="login-title">¡Comienza ahora!</h1>
      <p className="login-subtitle">
        Convierte tus documentos y facturas en archivos editables con Lexora!
      </p>

      {/* ── Error del backend ── */}
      {error && (
        <div className="alert alert-danger py-2 px-3 mb-3 rounded-3 small">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Nombre */}
        <div className="form-group mb-3">
          <label htmlFor="name" className="form-label">Nombre</label>
          <input
            id="name"
            type="text"
            className="form-control custom-input"
            placeholder="Ingresa tu nombre y apellido"
            value={name}
            onChange={(e) => { setName(e.target.value); }}
            required
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="form-group mb-3">
          <label htmlFor="reg-email" className="form-label">Correo electrónico</label>
          <input
            id="reg-email"
            type="email"
            className="form-control custom-input"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            required
            disabled={loading}
          />
        </div>

        {/* Contraseña */}
        <div className="form-group mb-3">
          <label htmlFor="reg-password" className="form-label">Contraseña</label>
          <input
            id="reg-password"
            type="password"
            className="form-control custom-input"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
            required
            minLength={8}
            disabled={loading}
          />
        </div>

        {/* Términos */}
        <div className="form-check mb-4">
          <input
            id="terms"
            type="checkbox"
            className="form-check-input"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            required
            disabled={loading}
          />
          <label htmlFor="terms" className="form-check-label remember-label">
            Acepto los términos y condiciones
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-100 login-btn mb-3"
          disabled={loading || !terms}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Registrando...
            </>
          ) : (
            "Empieza ahora"
          )}
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
        onClick={handleGoogleRegister}
        disabled={loading}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          width={20}
          height={20}
          className="me-2"
        />
        Regístrate con Google
      </button>

      {/* Login link */}
      <p className="text-center register-cta mb-0">
        ¿Ya tienes una cuenta?{" "}
        <a href="/login" className="register-link">Acceder</a>
      </p>
    </div>
  );
};

export default RegisterForm;