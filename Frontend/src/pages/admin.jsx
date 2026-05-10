import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "./Admin.module.css";

export default function Admin() {
  const navigate = useNavigate();
  const session  = JSON.parse(sessionStorage.getItem("agro_session") || "null");

  const [tab, setTab]           = useState("usuarios");
  const [users, setUsers]       = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers]   = useState([]);
  const [toasts, setToasts]     = useState([]);

  const [uForm, setUForm] = useState({ name: "", email: "", role: "", region: "", password: "" });
  const [pForm, setPForm] = useState({ name: "", description: "", price: "", stock: "", region: "", user_id: "" });

  const [uLoading, setULoading] = useState(false);
  const [pLoading, setPLoading] = useState(false);

  function toast(msg, type = "success") {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }

  async function loadUsers() {
    try {
      const { data } = await api.get("/users");
      setUsers(data.data);
      setSellers(data.data.filter(u => u.role === "Vendedor"));
    } catch {
      toast("No se pudo cargar usuarios.", "error");
    }
  }

  async function loadProducts() {
    try {
      const { data } = await api.get("/products");
      setProducts(data.data);
    } catch {
      toast("No se pudo cargar productos.", "error");
    }
  }

  useEffect(() => {
    loadUsers();
    loadProducts();
  }, []);

  async function createUser() {
    setULoading(true);
    try {
      const { data } = await api.post("/users", uForm);
      if (!data.success) { toast(data.message, "error"); return; }
      toast(`Usuario "${data.data.name}" creado.`);
      setUForm({ name: "", email: "", role: "", region: "", password: "" });
      await loadUsers();
    } catch {
      toast("Error de conexion.", "error");
    } finally {
      setULoading(false);
    }
  }

  async function deleteUser(id, name) {
    if (!confirm(`Eliminar a "${name}"?`)) return;
    try {
      const { data } = await api.delete(`/users/${id}`);
      if (!data.success) { toast(data.message, "error"); return; }
      toast(`"${name}" eliminado.`);
      await loadUsers();
      await loadProducts();
    } catch {
      toast("Error de conexion.", "error");
    }
  }

  async function createProduct() {
    setPLoading(true);
    try {
      const payload = {
        ...pForm,
        price:   Number(pForm.price),
        stock:   Number(pForm.stock),
        user_id: Number(pForm.user_id),
      };
      const { data } = await api.post("/products", payload);
      if (!data.success) { toast(data.message, "error"); return; }
      toast(`Producto "${data.data.name}" creado.`);
      setPForm({ name: "", description: "", price: "", stock: "", region: "", user_id: "" });
      await loadProducts();
    } catch {
      toast("Error de conexion.", "error");
    } finally {
      setPLoading(false);
    }
  }

  async function deleteProduct(id, name) {
    if (!confirm(`Eliminar "${name}"?`)) return;
    try {
      const { data } = await api.delete(`/products/${id}`);
      if (!data.success) { toast(data.message, "error"); return; }
      toast(`"${name}" eliminado.`);
      await loadProducts();
    } catch {
      toast("Error de conexion.", "error");
    }
  }

  function logout() {
    sessionStorage.removeItem("agro_session");
    sessionStorage.removeItem("agro_token");
    navigate("/login");
  }

  return (
    <div className={s.page}>

      {/* Header */}
      <header className={s.header}>
        <div className={s.logo}>
          🌾AgroMarket
        </div>
        <div className={s.headerRight}>
          <span className={s.adminName}>{session?.user?.name || "Admin"}</span>
          <button className={s.btnLogout} onClick={logout}>Cerrar sesion</button>
        </div>
      </header>

      {/* Tabs */}
      <div className={s.tabs}>
        <button
          className={`${s.tab} ${tab === "usuarios" ? s.active : ""}`}
          onClick={() => setTab("usuarios")}
        >
          Usuarios
        </button>
        <button
          className={`${s.tab} ${tab === "productos" ? s.active : ""}`}
          onClick={() => setTab("productos")}
        >
          Productos
        </button>
      </div>

      <div className={s.panel}>

        {/* Seccion Usuarios */}
        <div className={tab === "usuarios" ? s.sectionActive : s.section}>
          <aside>
            <div className={s.card}>
              <h2 className={s.cardTitle}>Nuevo usuario</h2>

              {[
                { key: "name",     label: "Nombre completo",    type: "text",     placeholder: "Ana Sofia Torres" },
                { key: "email",    label: "Correo electronico", type: "email",    placeholder: "usuario@ejemplo.com" },
                { key: "region",   label: "Region",             type: "text",     placeholder: "Boyaca" },
                { key: "password", label: "Contrasena",         type: "password", placeholder: "Minimo 4 caracteres" },
              ].map(f => (
                <div key={f.key} className={s.field}>
                  <label className={s.label}>{f.label}</label>
                  <input
                    className={s.input}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={uForm[f.key]}
                    onChange={e => setUForm({ ...uForm, [f.key]: e.target.value })}
                  />
                </div>
              ))}

              <div className={s.field}>
                <label className={s.label}>Rol</label>
                <select
                  className={s.input}
                  value={uForm.role}
                  onChange={e => setUForm({ ...uForm, role: e.target.value })}
                >
                  <option value="">Selecciona</option>
                  <option value="Vendedor">Vendedor</option>
                  <option value="Comprador">Comprador</option>
                </select>
              </div>

              <button className={s.btnPrimary} onClick={createUser} disabled={uLoading}>
                {uLoading ? "Creando..." : "+ Crear usuario"}
              </button>
            </div>
          </aside>

          <section>
            <div className={s.card}>
              <h2 className={s.cardTitle}>
                Usuarios registrados
                <span className={s.counter}>{users.length}</span>
              </h2>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Region</th>
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={6}><div className={s.emptyState}>Sin usuarios registrados.</div></td></tr>
                    ) : users.map(u => (
                      <tr key={u.id}>
                        <td className={s.idCell}>{u.id}</td>
                        <td><strong>{u.name}</strong></td>
                        <td className={s.idCell}>{u.email}</td>
                        <td>
                          <span className={u.role === "Vendedor" ? s.badgeVendedor : s.badgeComprador}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.region}</td>
                        <td>
                          <button className={s.btnDanger} onClick={() => deleteUser(u.id, u.name)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Seccion Productos */}
        <div className={tab === "productos" ? s.sectionActive : s.section}>
          <aside>
            <div className={s.card}>
              <h2 className={s.cardTitle}>Nuevo producto</h2>

              {[
                { key: "name",        label: "Nombre",      type: "text",   placeholder: "Tomate Chonto" },
                { key: "price",       label: "Precio COP",  type: "number", placeholder: "3500" },
                { key: "stock",       label: "Stock",       type: "number", placeholder: "100" },
                { key: "region",      label: "Region",      type: "text",   placeholder: "Cundinamarca" },
              ].map(f => (
                <div key={f.key} className={s.field}>
                  <label className={s.label}>{f.label}</label>
                  <input
                    className={s.input}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={pForm[f.key]}
                    onChange={e => setPForm({ ...pForm, [f.key]: e.target.value })}
                  />
                </div>
              ))}

              <div className={s.field}>
                <label className={s.label}>Descripcion</label>
                <textarea
                  className={s.textarea}
                  placeholder="Descripcion del producto..."
                  value={pForm.description}
                  onChange={e => setPForm({ ...pForm, description: e.target.value })}
                />
              </div>

              <div className={s.field}>
                <label className={s.label}>Vendedor</label>
                <select
                  className={s.input}
                  value={pForm.user_id}
                  onChange={e => setPForm({ ...pForm, user_id: e.target.value })}
                >
                  <option value="">Selecciona vendedor</option>
                  {sellers.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <button className={s.btnPrimary} onClick={createProduct} disabled={pLoading}>
                {pLoading ? "Creando..." : "+ Crear producto"}
              </button>
            </div>
          </aside>

          <section>
            <div className={s.card}>
              <h2 className={s.cardTitle}>
                Productos registrados
                <span className={s.counter}>{products.length}</span>
              </h2>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Region</th>
                      <th>Vendedor</th>
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan={7}><div className={s.emptyState}>Sin productos registrados.</div></td></tr>
                    ) : products.map(p => (
                      <tr key={p.id}>
                        <td className={s.idCell}>{p.id}</td>
                        <td><strong>{p.name}</strong></td>
                        <td>${Number(p.price).toLocaleString("es-CO")}</td>
                        <td>{p.stock}</td>
                        <td>{p.region}</td>
                        <td className={s.idCell}>{p.seller_name}</td>
                        <td>
                          <button className={s.btnDanger} onClick={() => deleteProduct(p.id, p.name)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

      </div>

      {/* Toasts */}
      <div className={s.toastContainer}>
        {toasts.map(t => (
          <div key={t.id} className={`${s.toast} ${t.type === "error" ? s.toastError : s.toastSuccess}`}>
            {t.msg}
          </div>
        ))}
      </div>

    </div>
  );
}