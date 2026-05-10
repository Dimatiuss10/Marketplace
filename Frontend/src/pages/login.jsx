import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);


  function redirectByRole(role) {
    if (role === "admin")          navigate("/admin");
    else if (role === "Vendedor")  navigate("/vendedor");
    else if (role === "Comprador") navigate("/comprador");
    else navigate("/");
  }

  async function handleLogin() {
    setError("");
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contrasena.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (!data.success) {
        setError(data.message || "Credenciales incorrectas.");
        return;
      }
      sessionStorage.setItem("agro_session", JSON.stringify(data.data));
      sessionStorage.setItem("agro_token", data.data.token);
      redirectByRole(data.data.role);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>

        <h1 className={s.title}>🌾AgroMarket</h1>
        <p className={s.sub}>Inicia sesión para continuar</p>

        <div className={s.field}>
          <label className={s.label}>Correo electrónico</label>
          <input
            className={s.input}
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div className={s.field}>
          <label className={s.label}>Contraseña</label>
          <input
            className={s.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>

        {error && <p className={s.error}>{error}</p>}

        <button
          className={s.btn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Verificando..." : "Ingresar"}
        </button>

        <p className={s.register}>
          ¿No tienes cuenta?{" "}
          <span className={s.link} onClick={() => navigate("/")}>
            Registrate aqui
          </span>
        </p>

        <p className={s.register}>
          <span className={s.link} onClick={() => navigate("/reset-password")}>
            Olvide mi contraseña
          </span>
        </p>
      </div>
    </div>
  );
}