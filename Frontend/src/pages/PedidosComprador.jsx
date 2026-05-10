import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "./Pedidos.module.css";

function BadgeStatus({ status }) {
  const clases = {
    Pendiente:  s.badgePendiente,
    Despachado: s.badgeDespachado,
    Entregado:  s.badgeEntregado,
    Devuelto:   s.badgeDevuelto,
  };
  return <span className={`${s.badge} ${clases[status] || ""}`}>{status}</span>;
}

export default function PedidosComprador() {
  const navigate = useNavigate();
  const session  = JSON.parse(sessionStorage.getItem("agro_session") || "null");

  const [pedidos, setPedidos]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toasts, setToasts]         = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [pedidoActual, setPedidoActual] = useState(null);
  const [score, setScore]           = useState(0);
  const [comment, setComment]       = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  function toast(msg, type = "success") {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }

  async function loadPedidos() {
    try {
      const { data } = await api.get("/orders/my");
      setPedidos(data.data);
    } catch {
      toast("Error al cargar pedidos.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPedidos(); }, []);

  async function handleReturn(orderId) {
    if (!confirm("Seguro que quieres devolver este pedido?")) return;
    try {
      const { data } = await api.put(`/orders/${orderId}/return`);
      if (!data.success) { toast(data.message, "error"); return; }
      toast("Pedido marcado como devuelto.");
      await loadPedidos();
    } catch {
      toast("Error al procesar la devolucion.", "error");
    }
  }

  function openRating(pedido) {
    setPedidoActual(pedido);
    setScore(0);
    setComment("");
    setModalOpen(true);
  }

  async function submitRating() {
    if (score === 0) { toast("Selecciona una calificacion.", "error"); return; }
    setRatingLoading(true);
    try {
      const sellerId = pedidoActual.items[0]?.seller_id;
      const { data } = await api.post(`/orders/${pedidoActual.id}/rate`, {
        sellerId, score, comment
      });
      if (!data.success) { toast(data.message, "error"); return; }
      toast("Calificacion enviada.");
      setModalOpen(false);
      await loadPedidos();
    } catch {
      toast("Error al enviar la calificacion.", "error");
    } finally {
      setRatingLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("agro_session");
    sessionStorage.removeItem("agro_token");
    navigate("/login");
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      year: "numeric", month: "long", day: "numeric"
    });
  }

  return (
    <div className={s.page}>

      {/* Header */}
      <header className={s.header}>
        <div className={s.logo}>
          🌾AgroMarket <span className={s.logoSub}>Urabá</span>
        </div>
        <div className={s.headerRight}>
          <span className={s.userName}>Bienvenido, {session?.user?.name}</span>
          <button className={s.btnNav} onClick={() => navigate("/comprador")}>
            Catalogo
          </button>
          <button className={`${s.btnNav} ${s.btnNavActive}`}>
            Pedidos
          </button>
          <button className={s.btnLogout} onClick={logout}>Cerrar sesion</button>
        </div>
      </header>

      {/* Page header */}
      <div className={s.pageHeader}>
        <h1>Mis pedidos</h1>
        <p>Historial de compras y estado de tus pedidos</p>
      </div>

      {/* Main */}
      <main className={s.main}>
        {loading ? (
          <p className={s.loading}>Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <div className={s.empty}>
            <h3 className={s.emptyTitle}>No tienes pedidos aun</h3>
            <p>Explora el catalogo y realiza tu primera compra.</p>
          </div>
        ) : pedidos.map(pedido => (
          <div key={pedido.id} className={s.orderCard}>

            {/* Header del pedido */}
            <div className={s.orderHeader}>
              <div className={s.orderMeta}>
                <span className={s.orderId}>Pedido #{pedido.id}</span>
                <span className={s.orderDate}>{formatDate(pedido.created_at)}</span>
              </div>
              <div className={s.orderRight}>
                <span className={s.orderTotal}>
                  ${Number(pedido.total).toLocaleString("es-CO")}
                </span>
                <BadgeStatus status={pedido.status} />
              </div>
            </div>

            {/* Items */}
            <div className={s.orderItems}>
              {pedido.items.map(item => (
                <div key={item.id} className={s.orderItem}>
                  <div>
                    <p className={s.itemName}>{item.name}</p>
                    <p className={s.itemQty}>x{item.quantity}</p>
                  </div>
                  <span className={s.itemPrice}>
                    ${Number(item.price * item.quantity).toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div className={s.orderActions}>
              {pedido.status === "Entregado" && !pedido.rated && (
                <button className={`${s.btnAction} ${s.btnRate}`} onClick={() => openRating(pedido)}>
                  Calificar pedido
                </button>
              )}
              {pedido.status === "Entregado" && pedido.rated && (
                <span className={s.ratedLabel}>Pedido calificado</span>
              )}
              {pedido.status === "Entregado" && (
                <button className={`${s.btnAction} ${s.btnReturn}`} onClick={() => handleReturn(pedido.id)}>
                  Devolver pedido
                </button>
              )}
              {pedido.status === "Pendiente" && (
                <span style={{ fontSize: "0.82rem", color: "#7a7a6e" }}>
                  Esperando confirmacion del vendedor
                </span>
              )}
              {pedido.status === "Despachado" && (
                <span style={{ fontSize: "0.82rem", color: "#4a7c3f", fontWeight: 500 }}>
                  Tu pedido esta en camino
                </span>
              )}
            </div>

          </div>
        ))}
      </main>

      {/* Modal calificacion */}
      {modalOpen && (
        <div className={s.overlay} onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className={s.modal}>
            <button className={s.modalClose} onClick={() => setModalOpen(false)}>x</button>
            <h2 className={s.modalTitle}>Calificar pedido #{pedidoActual?.id}</h2>

            <div className={s.stars}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  className={`${s.star} ${n <= score ? s.starActive : ""}`}
                  onClick={() => setScore(n)}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              className={s.textarea}
              placeholder="Deja un comentario (opcional)..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />

            <button
              className={s.btnSubmit}
              onClick={submitRating}
              disabled={ratingLoading}
            >
              {ratingLoading ? "Enviando..." : "Enviar calificacion"}
            </button>
          </div>
        </div>
      )}

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