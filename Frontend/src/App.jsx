import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index     from "./pages/Index";
import Login     from "./pages/Login";
import Catalogo  from "./pages/Catalogo";
import Admin     from "./pages/Admin";
import Vendedor  from "./pages/Vendedor";
import Comprador from "./pages/Comprador";
import ResetPassword from "./pages/ResetPassword";
import PedidosComprador from "./pages/PedidosComprador";
import PedidosVendedor  from "./pages/PedidosVendedor";

// Protege rutas que requieren sesión
function PrivateRoute({ children, roles }) {
  const session = JSON.parse(sessionStorage.getItem("agro_session") || "null");
  if (!session) return <Navigate to="/login" />;
  if (roles && !roles.includes(session.role)) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Index />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/reset-password" element={<ResetPassword />} />  
        
        <Route path="/admin" element={
          <PrivateRoute roles={["admin"]}>
            <Admin />
          </PrivateRoute>
        } />

        <Route path="/vendedor" element={
          <PrivateRoute roles={["Vendedor"]}>
            <Vendedor />
          </PrivateRoute>
        } />

        <Route path="/comprador" element={
          <PrivateRoute roles={["Comprador"]}>
            <Comprador />
          </PrivateRoute>
        } />

        <Route path="/pedidos-comprador" element={
          <PrivateRoute roles={["Comprador"]}>
            <PedidosComprador />
          </PrivateRoute>
        } />

        <Route path="/pedidos-vendedor" element={
          <PrivateRoute roles={["Vendedor"]}>
            <PedidosVendedor />
          </PrivateRoute>
        } />
        
      </Routes>
    </BrowserRouter>
  );
}