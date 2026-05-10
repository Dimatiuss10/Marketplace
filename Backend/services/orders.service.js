const db = require("../db");

// ── Crear pedido ──────────────────────────────────────────────────
const create = async (buyerId, items) => {
  if (!items || items.length === 0) {
    const err = new Error("El carrito esta vacio");
    err.status = 400;
    throw err;
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const [result] = await db.query(
    "INSERT INTO orders (buyer_id, total) VALUES (?, ?)",
    [buyerId, total]
  );

  const orderId = result.insertId;

  for (const item of items) {
    await db.query(
      "INSERT INTO order_items (order_id, product_id, seller_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)",
      [orderId, item.id, item.user_id, item.name, item.price, item.qty]
    );
  }

  return getById(orderId);
};

// ── Obtener pedido por ID ─────────────────────────────────────────
const getById = async (id) => {
  const [orders] = await db.query(
    `SELECT o.*, u.name AS buyer_name
     FROM orders o
     JOIN users u ON u.id = o.buyer_id
     WHERE o.id = ?`,
    [id]
  );
  if (orders.length === 0) return null;

  const [items] = await db.query(
    "SELECT * FROM order_items WHERE order_id = ?",
    [id]
  );

  return { ...orders[0], items };
};

// ── Pedidos del comprador ─────────────────────────────────────────
const getByBuyer = async (buyerId) => {
  const [orders] = await db.query(
    "SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC",
    [buyerId]
  );

  const result = [];
  for (const order of orders) {
    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [order.id]
    );
    const [rating] = await db.query(
      "SELECT * FROM ratings WHERE order_id = ? AND buyer_id = ?",
      [order.id, buyerId]
    );
    result.push({ ...order, items, rated: rating.length > 0 });
  }

  return result;
};

// ── Pedidos del vendedor ──────────────────────────────────────────
const getBySeller = async (sellerId) => {
  const [itemRows] = await db.query(
    `SELECT DISTINCT oi.order_id
     FROM order_items oi
     WHERE oi.seller_id = ?`,
    [sellerId]
  );

  const result = [];
  for (const row of itemRows) {
    const [orders] = await db.query(
      `SELECT o.*, u.name AS buyer_name
       FROM orders o
       JOIN users u ON u.id = o.buyer_id
       WHERE o.id = ?`,
      [row.order_id]
    );
    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ? AND seller_id = ?",
      [row.order_id, sellerId]
    );
    if (orders.length > 0) {
      result.push({ ...orders[0], items });
    }
  }

  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// ── Cambiar estado ────────────────────────────────────────────────
const updateStatus = async (orderId, sellerId, status) => {
  const validStatuses = ["Pendiente", "Despachado", "Entregado"];
  if (!validStatuses.includes(status)) {
    const err = new Error("Estado invalido");
    err.status = 400;
    throw err;
  }

  // Verificar que el vendedor tiene productos en ese pedido
  const [items] = await db.query(
    "SELECT id FROM order_items WHERE order_id = ? AND seller_id = ?",
    [orderId, sellerId]
  );
  if (items.length === 0) {
    const err = new Error("No tienes permiso para modificar este pedido");
    err.status = 403;
    throw err;
  }

  await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
  return getById(orderId);
};

// ── Devolver pedido ───────────────────────────────────────────────
const returnOrder = async (orderId, buyerId) => {
  const [orders] = await db.query(
    "SELECT * FROM orders WHERE id = ? AND buyer_id = ?",
    [orderId, buyerId]
  );
  if (orders.length === 0) {
    const err = new Error("Pedido no encontrado");
    err.status = 404;
    throw err;
  }
  if (orders[0].status !== "Entregado") {
    const err = new Error("Solo puedes devolver pedidos entregados");
    err.status = 400;
    throw err;
  }

  await db.query("UPDATE orders SET status = 'Devuelto' WHERE id = ?", [orderId]);
  return getById(orderId);
};

// ── Calificar ─────────────────────────────────────────────────────
const rate = async (orderId, buyerId, sellerId, score, comment) => {
  if (score < 1 || score > 5) {
    const err = new Error("La calificacion debe ser entre 1 y 5");
    err.status = 400;
    throw err;
  }

  const [existing] = await db.query(
    "SELECT id FROM ratings WHERE order_id = ? AND buyer_id = ?",
    [orderId, buyerId]
  );
  if (existing.length > 0) {
    const err = new Error("Ya calificaste este pedido");
    err.status = 409;
    throw err;
  }

  await db.query(
    "INSERT INTO ratings (order_id, buyer_id, seller_id, score, comment) VALUES (?, ?, ?, ?, ?)",
    [orderId, buyerId, sellerId, score, comment || ""]
  );

  return { message: "Calificacion enviada" };
};

module.exports = { create, getById, getByBuyer, getBySeller, updateStatus, returnOrder, rate };