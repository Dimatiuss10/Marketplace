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

export default function PedidosVendedor() {
  const navigate = useNavigate();
  const session  = JSON.parse(sessionStorage.getItem("agro_session") || "null");

  const [pedidos, setPedidos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toasts, setToasts]     = useState([]);
  const [updating, setUpdating] = useState(null);

  function toast(msg, type = "success") {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }

  async function loadPedidos() {
    try {
      const { data } = await api.get("/orders/seller");
      setPedidos(data.data);
    } catch {
      toast("Error al cargar pedidos.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPedidos(); }, []);

  async function handleStatusChange(orderId, newStatus) {
    setUpdating(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (!data.success) { toast(data.message, "error"); return; }
      toast(`Estado actualizado a "${newStatus}".`);
      await loadPedidos();
    } catch {
      toast("Error al actualizar el estado.", "error");
    } finally {
      setUpdating(null);
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

  const statusSiguiente = {
    Pendiente:  "Despachado",
    Despachado: "Entregado",
  };

  const labelSiguiente = {
    Pendiente:  "Marcar como despachado",
    Despachado: "Marcar como entregado",
  };

  return (
    <div className={s.page}>

      {/* Header */}
      <header className={s.header}>
        <div className={s.logo}>
          🌾AgroMarket <span className={s.logoSub}>Urabá</span>
        </div>
        <div className={s.headerRight}>
          <span className={s.userName}>Bienvenido, {session?.user?.name}</span>
          <button className={s.btnNav} onClick={() => navigate("/vendedor")}>
            Mis productos
          </button>
          <button className={`${s.btnNav} ${s.btnNavActive}`}>
            Pedidos
          </button>
          <button className={s.btnLogout} onClick={logout}>Cerrar sesion</button>
        </div>
      </header>

      {/* Page header */}
      <div className={s.pageHeader}>
        <h1>Pedidos recibidos</h1>
        <p>Gestiona el estado de los pedidos de tus productos</p>
      </div>

      {/* Main */}
      <main className={s.main}>
        {loading ? (
          <p className={s.loading}>Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <div className={s.empty}>
            <h3 className={s.emptyTitle}>No tienes pedidos aún</h3>
            <p>Cuando un comprador adquiera tus productos apareceran aqui.</p>
          </div>
        ) : pedidos.map(pedido => (
          <div key={pedido.id} className={s.orderCard}>

            {/* Header del pedido */}
            <div className={s.orderHeader}>
              <div className={s.orderMeta}>
                <span className={s.orderId}>Pedido #{pedido.id}</span>
                <span className={s.orderDate}>{formatDate(pedido.created_at)}</span>
                <span className={s.orderBuyer}>Comprador: {pedido.buyer_name}</span>
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
              {pedido.status === "Devuelto" && (
                <span style={{ fontSize: "0.82rem", color: "#c0392b", fontWeight: 500 }}>
                  El comprador ha devuelto este pedido
                </span>
              )}
              {pedido.status === "Entregado" && (
                <span style={{ fontSize: "0.82rem", color: "#4a7c3f", fontWeight: 500 }}>
                  Pedido entregado correctamente
                </span>
              )}
              {statusSiguiente[pedido.status] && (
                <button
                  className={`${s.btnAction} ${s.btnStatus}`}
                  onClick={() => handleStatusChange(pedido.id, statusSiguiente[pedido.status])}
                  disabled={updating === pedido.id}
                >
                  {updating === pedido.id ? "Actualizando..." : labelSiguiente[pedido.status]}
                </button>
              )}
            </div>

          </div>
        ))}
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