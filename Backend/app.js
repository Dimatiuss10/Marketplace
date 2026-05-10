/**
 * AgroMarket — app.js
 * Configura Express, middlewares globales y rutas.
 */

require("dotenv").config();

const express        = require("express");
const cors           = require("cors");
const path           = require("path");
const errorHandler   = require("./middlewares/errorHandler");
const authRoutes     = require("./routes/auth.routes");
const usersRoutes    = require("./routes/users.routes");
const productsRoutes = require("./routes/products.routes");
const ordersRoutes = require("./routes/orders.routes");


const app = express();

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/users",    usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

// ── Manejo centralizado de errores ────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;