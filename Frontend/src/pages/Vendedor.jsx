import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "./Vendedor.module.css";

export default function Vendedor() {
  const navigate = useNavigate();
  const session  = JSON.parse(sessionStorage.getItem("agro_session") || "null");
  const sellerId = session?.user?.id;

  const [products, setProducts] = useState([]);
  const [toasts, setToasts]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({
    name: "", description: "", price: "", stock: "", region: ""
  });

  function toast(msg, type = "success") {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }

  async function loadProducts() {
    try {
      const { data } = await api.get(`/products/seller/${sellerId}`);
      setProducts(data.data);
    } catch {
      toast("Error al cargar productos.", "error");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function createProduct() {
    setLoading(true);
    try {
      const payload = {
        ...form,
        price:   Number(form.price),
        stock:   Number(form.stock),
        user_id: sellerId,
      };
      const { data } = await api.post("/products", payload);
      if (!data.success) { toast(data.message, "error"); return; }
      toast(`"${data.data.name}" publicado.`);
      setForm({ name: "", description: "", price: "", stock: "", region: "" });
      await loadProducts();
    } catch {
      toast("Error de conexion.", "error");
    } finally {
      setLoading(false);
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
          🌾AgroMarket <span className={s.logoSub}>Urabá</span>
        </div>
        <div className={s.headerRight}>
          <span className={s.userName}>Bienvenido, {session?.user?.name || "Vendedor"}</span>
          <button
            style={{ background: "transparent", border: "1px solid rgba(221,232,213,0.4)", color: "#dde8d5", padding: "0.35rem 0.9rem", borderRadius: "20px", fontSize: "0.8rem", cursor: "pointer" }}
            onClick={() => navigate("/pedidos-vendedor")}
          >
            Pedidos
          </button>
          <button className={s.btnLogout} onClick={logout}>Cerrar sesion</button>
        </div>
      </header>

      {/* Page header */}
      <div className={s.pageHeader}>
        <h1>Panel de vendedor</h1>
        <p>Gestiona tus productos registrados en la plataforma</p>
      </div>

      {/* Main */}
      <main className={s.main}>

        {/* Formulario */}
        <aside>
          <div className={s.card}>
            <h2 className={s.cardTitle}>Nuevo producto</h2>

            {[
              { key: "name",   label: "Nombre",     type: "text",   placeholder: "Tomate Chonto" },
              { key: "price",  label: "Precio COP", type: "number", placeholder: "3500" },
              { key: "stock",  label: "Stock",      type: "number", placeholder: "100" },
              { key: "region", label: "Region",     type: "text",   placeholder: "Cundinamarca" },
            ].map(f => (
              <div key={f.key} className={s.field}>
                <label className={s.label}>{f.label}</label>
                <input
                  className={s.input}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}

            <div className={s.field}>
              <label className={s.label}>Descripcion</label>
              <textarea
                className={s.textarea}
                placeholder="Describe tu producto..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button className={s.btnPrimary} onClick={createProduct} disabled={loading}>
              {loading ? "Publicando..." : "+ Publicar producto"}
            </button>
          </div>
        </aside>

        {/* Tabla */}
        <section>
          <div className={s.card}>
            <h2 className={s.cardTitle}>
              Mis productos
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
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={s.emptyState}>
                          Aun no tienes productos publicados.
                        </div>
                      </td>
                    </tr>
                  ) : products.map(p => (
                    <tr key={p.id}>
                      <td className={s.idCell}>{p.id}</td>
                      <td><strong>{p.name}</strong></td>
                      <td>${Number(p.price).toLocaleString("es-CO")}</td>
                      <td>{p.stock}</td>
                      <td>{p.region}</td>
                      <td>
                        <button
                          className={s.btnDanger}
                          onClick={() => deleteProduct(p.id, p.name)}
                        >
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

      </main>

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