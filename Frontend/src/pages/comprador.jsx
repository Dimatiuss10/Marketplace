import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "./Comprador.module.css";

function getEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes("tomate"))                          return "Tomate";
  if (n.includes("papa"))                            return "Papa";
  if (n.includes("aguacate"))                        return "Aguacate";
  if (n.includes("maiz") || n.includes("maíz"))     return "Maiz";
  if (n.includes("mango"))                           return "Mango";
  if (n.includes("naranja"))                         return "Naranja";
  if (n.includes("platano") || n.includes("plátano")) return "Platano";
  if (n.includes("zanahoria"))                       return "Zanahoria";
  if (n.includes("cebolla"))                         return "Cebolla";
  return "Producto";
}

export default function Comprador() {
  const navigate = useNavigate();
  const session  = JSON.parse(sessionStorage.getItem("agro_session") || "null");

  const [productos, setProductos]   = useState([]);
  const [busqueda, setBusqueda]     = useState("");
  const [region, setRegion]         = useState("");
  const [regiones, setRegiones]     = useState([]);
  const [carrito, setCarrito]       = useState([]);
  const [cartOpen, setCartOpen]     = useState(false);
  const [toasts, setToasts]         = useState([]);

  function toast(msg, type = "success") {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }

  useEffect(() => {
    api.get("/products").then(({ data }) => {
      if (data.success) {
        setProductos(data.data);
        const regs = [...new Set(data.data.map(p => p.region).filter(Boolean))].sort();
        setRegiones(regs);
      }
    }).catch(() => toast("No se pudo cargar productos.", "error"));
  }, []);

  function agregarAlCarrito(producto) {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id);
      if (existe) return prev.map(i => i.id === producto.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...producto, qty: 1 }];
    });
    toast(`"${producto.name}" agregado.`);
  }

  function cambiarQty(id, delta) {
    setCarrito(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i);
      return updated.filter(i => i.qty > 0);
    });
  }

  function quitarDelCarrito(id) {
    setCarrito(prev => prev.filter(i => i.id !== id));
  }

  async function checkout() {
    try {
      const items = carrito.map(i => ({
        id:      i.id,
        user_id: i.user_id,
        name:    i.name,
        price:   i.price,
        qty:     i.qty,
      }));

      const { data } = await api.post("/orders", { items });
      if (!data.success) {
        toast("Error al procesar el pedido.", "error");
        return;
      }

      setCarrito([]);
      setCartOpen(false);
      toast("Pedido realizado correctamente.");
    } catch {
      toast("No se pudo conectar con el servidor.", "error");
    }
  }

  function logout() {
    sessionStorage.removeItem("agro_session");
    sessionStorage.removeItem("agro_token");
    navigate("/login");
  }

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(busqueda.toLowerCase());
    const matchRegion = !region || p.region === region;
    return matchBusqueda && matchRegion;
  });

  const totalCarrito  = carrito.reduce((s, i) => s + i.price * i.qty, 0);
  const countCarrito  = carrito.reduce((s, i) => s + i.qty, 0);

  return (
    <div className={s.page}>

      {/* Header */}
      <header className={s.header}>
        <div className={s.logo}>
          🌾AgroMarket <span className={s.logoSub}>Urabá</span>
        </div>
        <div className={s.headerRight}>
          <span className={s.userName}>Bienvenido, {session?.user?.name}</span>
          <button className={s.btnCart} onClick={() => setCartOpen(true)}>
            Carrito
            <span className={s.cartBadge}>{countCarrito}</span>
          </button>
          <button
            style={{ background: "transparent", border: "1px solid rgba(221,232,213,0.4)", color: "#dde8d5", padding: "0.35rem 0.9rem", borderRadius: "20px", fontSize: "0.8rem", cursor: "pointer" }}
            onClick={() => navigate("/pedidos-comprador")}
          >
            Mis pedidos
          </button>
          <button className={s.btnLogout} onClick={logout}>Cerrar sesion</button>
        </div>
      </header>

      {/* Filtros */}
      <div className={s.filters}>
        <input
          className={s.searchInput}
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select
          className={s.select}
          value={region}
          onChange={e => setRegion(e.target.value)}
        >
          <option value="">Todas las regiones</option>
          {regiones.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className={s.resultsCount}>
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div className={s.grid}>
        {productosFiltrados.length === 0 ? (
          <div className={s.emptyState}>
            <h3 className={s.emptyTitle}>No se encontraron productos</h3>
            <p>Intenta con otra busqueda o region.</p>
          </div>
        ) : productosFiltrados.map(p => (
          <div key={p.id} className={s.card}>
            <div className={s.cardImg}>{getEmoji(p.name)}</div>
            <div className={s.cardBody}>
              <h3 className={s.cardName}>{p.name}</h3>
              <p className={s.cardDesc}>{p.description || "Producto agricola fresco."}</p>
              <div className={s.cardMeta}>
                <span className={s.cardPrice}>${Number(p.price).toLocaleString("es-CO")}</span>
                <span className={`${s.cardStock} ${p.stock < 10 ? s.cardStockLow : ""}`}>
                  {p.stock < 10 ? "Poco stock: " : ""}{p.stock} uds.
                </span>
              </div>
              <p className={s.cardSeller}>{p.region} · <strong>{p.seller_name}</strong></p>
              <button
                className={s.btnAdd}
                onClick={() => agregarAlCarrito(p)}
                disabled={p.stock === 0}
              >
                {p.stock === 0 ? "Sin stock" : "Agregar al carrito"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Carrito overlay */}
      <div
        className={`${s.cartOverlay} ${cartOpen ? s.cartOverlayShow : ""}`}
        onClick={() => setCartOpen(false)}
      />

      {/* Carrito panel */}
      <div className={`${s.cartPanel} ${cartOpen ? s.cartPanelShow : ""}`}>
        <div className={s.cartHeader}>
          <h2 className={s.cartHeaderTitle}>Tu carrito</h2>
          <button className={s.cartClose} onClick={() => setCartOpen(false)}>x</button>
        </div>

        <div className={s.cartItems}>
          {carrito.length === 0 ? (
            <div className={s.cartEmpty}>Tu carrito esta vacio</div>
          ) : carrito.map(item => (
            <div key={item.id} className={s.cartItem}>
              <div className={s.cartItemInfo}>
                <p className={s.cartItemName}>{item.name}</p>
                <p className={s.cartItemPrice}>${Number(item.price).toLocaleString("es-CO")} c/u</p>
              </div>
              <div className={s.cartItemQty}>
                <button className={s.qtyBtn} onClick={() => cambiarQty(item.id, -1)}>-</button>
                <span className={s.qtyNum}>{item.qty}</span>
                <button className={s.qtyBtn} onClick={() => cambiarQty(item.id, 1)}>+</button>
              </div>
              <button className={s.cartRemove} onClick={() => quitarDelCarrito(item.id)}>x</button>
            </div>
          ))}
        </div>

        <div className={s.cartFooter}>
          <div className={s.cartTotal}>
            <span className={s.cartTotalLabel}>Total:</span>
            <strong className={s.cartTotalNum}>
              ${Math.round(totalCarrito).toLocaleString("es-CO")}
            </strong>
          </div>
          <button
            className={s.btnCheckout}
            onClick={checkout}
            disabled={carrito.length === 0}
          >
            Finalizar compra
          </button>
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