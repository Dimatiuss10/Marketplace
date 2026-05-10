import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "./Catalogo.module.css";

export default function Catalogo() {
  const navigate = useNavigate();
  const [productos, setProductos]     = useState([]);
  const [busqueda, setBusqueda]       = useState("");
  const [region, setRegion]           = useState("");
  const [regiones, setRegiones]       = useState([]);
  const [carrito, setCarrito]         = useState([]);
  const [modalOpen, setModalOpen]     = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    api.get("/products")
      .then(({ data }) => {
        if (data.success) {
          setProductos(data.data);
          const regs = [...new Set(data.data.map(p => p.region).filter(Boolean))];
          setRegiones(regs);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPage(false));
  }, []);

  function agregarAlCarrito(producto) {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id);
      if (existe) return prev;
      return [...prev, producto];
    });
  }

  function quitarDelCarrito(id) {
    setCarrito(prev => prev.filter(i => i.id !== id));
  }

  function checkout() {
    setCarrito([]);
    setModalOpen(false);
    alert("Pedido enviado. Pronto un vendedor se pondra en contacto.");
  }

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.name.toLowerCase().includes(busqueda.toLowerCase());
    const matchRegion   = !region || p.region == region;
    return matchBusqueda && matchRegion;
  });

  const total = carrito.reduce((acc, p) => acc + Number(p.price), 0);

  return (
    <div className={s.page}>

      {/* Navbar */}
      <nav className={s.nav}>
        <button className={s.brand} onClick={() => navigate("/")}>🌾AgroMarket Urabá</button>
        <div className={s.navLinks}>
          <button className={s.navLink} onClick={() => navigate("/")}>Inicio</button>
          <button className={s.btnIngresar} onClick={() => navigate("/login")}>Ingresar</button>
        </div>
      </nav>

      {/* Header */}
      <header className={s.header}>
        <h1 className={s.headerTitle}>Catálogo de productos</h1>
        <p className={s.headerSub}>Productos frescos directamente de los agricultores de Urabá</p>
      </header>

      {/* Filtros */}
      <div className={s.filtros}>
        <input
          className={s.searchInput}
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select className={s.select} value={region} onChange={e => setRegion(e.target.value)}>
          <option value="">Todas las regiones</option>
          {regiones.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Contenido */}
      {loadingPage ? (
        <p className={s.loading}>Cargando productos...</p>
      ) : productosFiltrados.length === 0 ? (
        <div className={s.empty}>
          <h3 className={s.emptyTitle}>No se encontraron productos</h3>
          <p>Intenta con otra busqueda o region.</p>
        </div>
      ) : (
        <div className={s.grid}>
          {productosFiltrados.map(p => (
            <div key={p.id} className={s.card}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className={s.cardImg} />
              ) : (
                <div className={s.cardImgPlaceholder}>Sin imagen</div>
              )}
              <div className={s.cardBody}>
                <h3 className={s.cardName}>{p.name}</h3>
                <p className={s.cardDesc}>{p.description}</p>
                <div className={s.cardFooter}>
                  <span className={s.cardPrice}>${Number(p.price).toLocaleString("es-CO")}</span>
                  <span className={s.cardStock}>{p.stock} uds.</span>
                </div>
                <p className={s.cardSeller}>{p.region} · {p.seller_name || "Vendedor"}</p>
                <button className={s.btnCarrito} onClick={() => agregarAlCarrito(p)}>
                  Agregar al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boton carrito flotante */}
      {carrito.length > 0 && (
        <button className={s.carritoBtn} onClick={() => setModalOpen(true)}>
          Carrito ({carrito.length}) — ${total.toLocaleString("es-CO")}
        </button>
      )}

      {/* Modal carrito */}
      {modalOpen && (
        <div className={s.overlay} onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className={s.modal}>
            <button className={s.modalClose} onClick={() => setModalOpen(false)}>x</button>
            <h2 className={s.modalTitle}>Tu carrito</h2>

            {carrito.map(item => (
              <div key={item.id} className={s.carritoItem}>
                <div>
                  <p className={s.carritoItemName}>{item.name}</p>
                  <p className={s.carritoItemPrice}>${Number(item.price).toLocaleString("es-CO")}</p>
                </div>
                <button className={s.btnRemove} onClick={() => quitarDelCarrito(item.id)}>
                  Quitar
                </button>
              </div>
            ))}

            <div className={s.carritoTotal}>
              <span className={s.totalLabel}>Total</span>
              <span className={s.totalNum}>${total.toLocaleString("es-CO")}</span>
            </div>

            <button className={s.btnCheckout} onClick={checkout}>
              Confirmar pedido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}