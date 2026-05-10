import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "./Login.module.css";

export default function ResetPassword() {
  const navigate  = useNavigate();
  const [step, setStep]         = useState(1);
  const [email, setEmail]       = useState("");
  const [code, setCode]         = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleRequestCode() {
    setError("");
    if (!email) { setError("Ingresa tu correo."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/request-reset", { email });
      if (!data.success) { setError(data.message); return; }
      setStep(2);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    setError("");
    if (!code || code.length !== 6) { setError("Ingresa el codigo de 6 digitos."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-code", { email, code });
      if (!data.success) { setError(data.message); return; }
      setStep(3);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError("");
    if (!password || password.length < 4) { setError("Mínimo 4 caracteres."); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", { email, code, newPassword: password });
      if (!data.success) { setError(data.message); return; }
      setStep(4);
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>AgroMarket</h1>

        {/* Step 1 — Correo */}
        {step === 1 && (
          <>
            <p className={s.sub}>Ingresa tu correo para recibir el código</p>
            <div className={s.field}>
              <label className={s.label}>Correo electrónico</label>
              <input
                className={s.input}
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRequestCode()}
              />
            </div>
            {error && <p className={s.error}>{error}</p>}
            <button className={s.btn} onClick={handleRequestCode} disabled={loading}>
              {loading ? "Enviando..." : "Enviar codigo"}
            </button>
          </>
        )}

        {/* Step 2 — Codigo */}
        {step === 2 && (
          <>
            <p className={s.sub}>Ingresa el código de 6 dígitos que enviamos a <strong>{email}</strong></p>
            <div className={s.field}>
              <label className={s.label}>Codigo</label>
              <input
                className={s.input}
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={e => e.key === "Enter" && handleVerifyCode()}
                style={{ letterSpacing: "0.5rem", fontSize: "1.3rem", textAlign: "center" }}
              />
            </div>
            {error && <p className={s.error}>{error}</p>}
            <button className={s.btn} onClick={handleVerifyCode} disabled={loading}>
              {loading ? "Verificando..." : "Verificar codigo"}
            </button>
            <p className={s.register}>
              No recibiste el correo?{" "}
              <span className={s.link} onClick={() => { setStep(1); setError(""); }}>
                Intentar de nuevo
              </span>
            </p>
          </>
        )}

        {/* Step 3 — Nueva contrasena */}
        {step === 3 && (
          <>
            <p className={s.sub}>Crea tu nueva contraseña</p>
            <div className={s.field}>
              <label className={s.label}>Nueva contraseña</label>
              <input
                className={s.input}
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>Confirmar contraseña</label>
              <input
                className={s.input}
                type="password"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleResetPassword()}
              />
            </div>
            {error && <p className={s.error}>{error}</p>}
            <button className={s.btn} onClick={handleResetPassword} disabled={loading}>
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>
          </>
        )}

        {/* Step 4 — Exito */}
        {step === 4 && (
          <>
            <p className={s.sub}>Contraseña actualizada correctamente. Redirigiendo al login...</p>
          </>
        )}

        {step !== 4 && (
          <p className={s.register}>
            <span className={s.link} onClick={() => navigate("/login")}>
              Volver al login
            </span>
          </p>
        )}
      </div>
    </div>
  );
}