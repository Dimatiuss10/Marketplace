import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();

  // ── Login
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // ── Registro
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState({ name: "", email: "", role: "Comprador", region: "", password: "" });
  const [regMsg, setRegMsg]       = useState({ text: "", type: "" });
  const [regLoading, setRegLoading] = useState(false);

  function redirectByRole(role) {
    if (role === "admin")          navigate("/admin");
    else if (role === "Vendedor")  navigate("/vendedor");
    else if (role === "Comprador") navigate("/comprador");
    else navigate("/");
  }

  async function handleLogin() {
    setError("");
    if (!email || !password) { setError("Por favor ingresa tu correo y contraseña."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (!data.success) { setError(data.message || "Contraseña incorrecta."); return; }
      sessionStorage.setItem("agro_session", JSON.stringify(data.data));
      sessionStorage.setItem("agro_token", data.data.token);
      redirectByRole(data.data.role);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  function handleField(e) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  function closeModal() {
    setModalOpen(false);
    setRegMsg({ text: "", type: "" });
    setForm({ name: "", email: "", role: "Comprador", region: "", password: "" });
  }

  async function registrar() {
    setRegMsg({ text: "", type: "" });
    const { name, email, role, region, password } = form;
    if (!name || !email || !region || !password) {
      setRegMsg({ text: "Por favor completa todos los campos.", type: "error" });
      return;
    }
    setRegLoading(true);
    try {
      const { data } = await api.post("/users", { name, email, role, region, password });
      if (!data.success) { setRegMsg({ text: data.message || "Error al crear la cuenta.", type: "error" }); return; }
      setRegMsg({ text: "Cuenta creada. Ya puedes iniciar sesion.", type: "success" });
      setTimeout(() => closeModal(), 2000);
    } catch {
      setRegMsg({ text: "No se pudo conectar con el servidor.", type: "error" });
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <h1 className={s.title} onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          🌾AgroMarket
        </h1>
        <p className={s.sub}>Inicia sesion para continuar</p>

        <div className={s.field}>
          <label className={s.label}>Correo electronico</label>
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
          <label className={s.label}>Contrasena</label>
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

        <button className={s.btn} onClick={handleLogin} disabled={loading}>
          {loading ? "Verificando..." : "Ingresar"}
        </button>

        <p className={s.register}>
          ¿No tienes cuenta?{" "}
          <span className={s.link} onClick={() => setModalOpen(true)}>
            Registrate aqui
          </span>
        </p>

        <p className={s.register}>
          <span className={s.link} onClick={() => navigate("/reset-password")}>
            Olvide mi contraseña
          </span>
        </p>

      </div>

      {/* Modal Registro */}
      {modalOpen && (
        <div className={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={s.modal}>
            <button className={s.modalClose} onClick={closeModal}>x</button>
            <h2 className={s.modalTitle}>Crear cuenta</h2>
            <p className={s.modalSub}>Unete a AgroMarket y conecta con el campo de Urabá.</p>

            {[
              { id: "name",     label: "Nombre completo",    type: "text",     placeholder: "Samuel Barco" },
              { id: "email",    label: "Correo electrónico", type: "email",    placeholder: "ejemplo@agromarket.com" },
              { id: "password", label: "Contraseña",         type: "password", placeholder: "Mínimo 4 caracteres" },
            ].map(f => (
              <div key={f.id} className={s.field}>
                <label className={s.label}>{f.label}</label>
                <input
                  className={s.input}
                  id={f.id}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.id]}
                  onChange={handleField}
                />
              </div>
            ))}

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label className={s.label}>Rol</label>
                <select className={s.input} id="role" value={form.role} onChange={handleField}>
                  <option value="Comprador">Comprador</option>
                  <option value="Vendedor">Vendedor</option>
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Municipio</label>
                <input
                  className={s.input}
                  id="region"
                  type="text"
                  placeholder="Ej: Turbo"
                  value={form.region}
                  onChange={handleField}
                />
              </div>
            </div>

            <button
              className={s.btnSubmit}
              onClick={registrar}
              disabled={regLoading}
            >
              {regLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            {regMsg.text && (
              <p className={`${s.modalMsg} ${regMsg.type === "error" ? s.msgError : s.msgSuccess}`}>
                {regMsg.text}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}