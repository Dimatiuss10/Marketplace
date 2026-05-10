import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import s from "./Index.module.css";
import bananera from "../img/bananera.webp";
import hombre2   from "../img/hombre2.jpeg";
import hombre    from "../img/hombre.avif";
import bananero2 from "../img/bananero2.webp";
import cacao   from "../img/cacao.jpg";
import platano from "../img/platano.jpg";
import banano  from "../img/banano.webp";

export default function Index() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState({ name: "", email: "", role: "Comprador", region: "", password: "" });
  const [msg, setMsg]             = useState({ text: "", type: "" });
  const [loading, setLoading]     = useState(false);
  const [stats, setStats]         = useState({ products: 0, sellers: 0, regions: 0 });
  const [slideActual, setSlideActual] = useState(0);

  const slides = [bananera, hombre2, hombre, bananero2];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideActual(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(intervalo);
  }, []);


  useEffect(() => {
    api.get("/products").then(({ data }) => {
      if (data.success) {
        const products = data.data;
        const sellers  = new Set(products.map(p => p.user_id)).size;
        const regions  = new Set(products.map(p => p.region)).size;
        setStats({ products: products.length, sellers, regions });
      }
    }).catch(() => {});
  }, []);

  function handleField(e) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  function closeModal() {
    setModalOpen(false);
    setMsg({ text: "", type: "" });
    setForm({ name: "", email: "", role: "Comprador", region: "", password: "" });
  }

  async function registrar() {
    setMsg({ text: "", type: "" });
    const { name, email, role, region, password } = form;
    if (!name || !email || !region || !password) {
      setMsg({ text: "Por favor completa todos los campos.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/users", { name, email, role, region, password });
      if (!data.success) {
        setMsg({ text: data.message || "Error al crear la cuenta.", type: "error" });
        return;
      }
      setMsg({ text: "Cuenta creada. Redirigiendo al login...", type: "success" });
      setTimeout(() => { closeModal(); navigate("/login"); }, 2000);
    } catch {
      setMsg({ text: "No se pudo conectar con el servidor.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const campos = [
    { id: "name",     label: "Nombre completo",    type: "text",     placeholder: "Samuel Barco" },
    { id: "email",    label: "Correo electronico", type: "email",    placeholder: "correo@ejemplo.com" },
    { id: "password", label: "Contrasena",         type: "password", placeholder: "Minimo 4 caracteres" },
  ];

  const productos = [
    {
      img:    banano,
      nombre: "Banano de Urabá",
      historia: "Urabá es la capital bananera de Colombia y una de las zonas productoras más importantes de América Latina. Desde los años 60, el banano de Urabá ha cruzado oceanos para llegar a más de 40 paises, siendo hoy el principal producto de exportación no tradicional del país. Detrás de cada racimo hay familias que han construido su historia en estas tierras fértiles.",
    },
    {
      img:    platano,
      nombre: "Plátano hartón",
      historia: "El plátano hartón es el alimento de la identidad paisa y costeña. En Urabá se cultiva en pequeñas fincas que abastecen los mercados de todo el país. Es base de la dieta colombiana: patacón, sancocho, tostones. Más que un cultivo, es un símbolo de la cocina popular y la resistencia campesina de la subregión.",
    },
    {
      img:    cacao,
      nombre: "Cacao",
      historia: "Urabá se ha consolidado como uno de los territorios cacaoteros más prometedores de Colombia. Su cacao fino de aroma, cultivado bajo sombra en sistemas agroforestales, ha ganado reconocimiento internacional por su calidad. Pequeños productores locales transforman este grano en chocolates de origen que compiten en los mercados gourmet de Europa y Norteamérica.",
    },
  ];

  return (
    <div className={s.page}>

      {/* Navbar */}
      <nav className={s.nav}>
        <button className={s.brand} onClick={() => navigate("/")}>🌾AgroMarket Urabá</button>
        <div className={s.navLinks}>
          <a href="#nosotros" className={s.navLink}>Nosotros</a>
          <a href="#tierra"   className={s.navLink}>Nuestra tierra</a>
          <button className={s.navLink} onClick={() => navigate("/catalogo")}>Catalogo</button>
          <button className={s.btnRegistrar} onClick={() => setModalOpen(true)}>Registrarse</button>
          <button className={s.btnIngresar}  onClick={() => navigate("/login")}>Ingresar</button>
        </div>
      </nav>

      {/* Hero */}
      <header className={s.hero}>
        <div className={s.heroOverlay} />
        <div className={s.heroContent}>
          <p className={s.heroEyebrow}>Del campo a tu mesa</p>
          <h1 className={s.heroTitle}>El mercado agrícola<br />de Urabá</h1>
          <p className={s.heroSub}>
            Conectamos campesinos y compradores de la region con productos
            frescos, directos y sin intermediarios.
          </p>
          <div className={s.heroBtns}>
            <button className={s.heroBtnPrimary}   onClick={() => navigate("/catalogo")}>Ver catalogo</button>
            <button className={s.heroBtnSecondary} onClick={() => setModalOpen(true)}>Unirme</button>
          </div>
        </div>
        <div className={s.heroImage}>
          {slides.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Imagen ${i + 1}`}
              className={`${s.slide} ${i === slideActual ? s.slideActivo : ""}`}
              style={{
              objectPosition: i === 1 ? "80% center" : "center center"
              }}
            />
        ))}
        <div className={s.carruselDots}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${s.dot} ${i === slideActual ? s.dotActivo : ""}`}
              onClick={() => setSlideActual(i)}
            />
          ))}
        </div>
      </div>
      </header>

      {/* Stats */}
      <section className={s.statsBar}>
        <div className={s.statItem}>
          <span className={s.statNum}>{stats.products}+</span>
          <span className={s.statLabel}>Productos</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.statItem}>
          <span className={s.statNum}>{stats.sellers}+</span>
          <span className={s.statLabel}>Vendedores</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.statItem}>
          <span className={s.statNum}>{stats.regions}+</span>
          <span className={s.statLabel}>Regiones</span>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className={s.nosotros}>
        <div className={s.nosotrosInner}>
          <div className={s.nosotrosTexto}>
            <span className={s.tag}>Nosotros</span>
            <h2 className={s.sectionTitle}>Nacimos del campo,<br />crecemos con él</h2>
            <p className={s.nosotrosP}>
              AgroMarket es una revolución tecnológica para los campesinos del Urabá.
              Creemos que nuestro territorio, rico en biodiversidad y tradición agrícola, merece una
              plataforma moderna que le de visibilidad real a sus productos.
            </p>
            <p className={s.nosotrosP}>
              Nuestra mision es eliminar la cadena de intermediarios que históricamente ha reducido
              las ganancias del productor de Urabá, conectando directamente a quien cultiva con
              quien consume dentro de la subregión.
            </p>
            <p className={s.nosotrosP}>
              AgroMarket no solo busca modernizar la comercialización agrícola, sino también visibilizar 
              el esfuerzo de quienes trabajan la tierra y fortalecer el desarrollo económico de las comunidades 
              rurales de Urabá mediante herramientas digitales accesibles y seguras.
            </p>
          </div>

          <div className={s.municipios}>
          {[
            { nombre: "Apartado",          inicial: "A" },
            { nombre: "Turbo",             inicial: "T" },
            { nombre: "Carepa",            inicial: "C" },
            { nombre: "Chigorodo",         inicial: "Ch" },
            { nombre: "Mutata",            inicial: "M" },
            { nombre: "Necocli",           inicial: "N" },
            { nombre: "San Pedro",         inicial: "SP" },
            { nombre: "Arboletes",         inicial: "Ar" },
            { nombre: "San Juan",          inicial: "SJ" },
            { nombre: "Murindo",           inicial: "Mu" },
            { nombre: "Vigia del Fuerte",  inicial: "VF" },
          ].map(m => (
            <div key={m.nombre} className={s.municipioItem}>
              <div className={s.municipioCuadro}>
                <span className={s.municipioInicial}>{m.inicial}</span>
              </div>
              <span className={s.municipioNombre}>{m.nombre}</span>
            </div>
          ))}

          <div className={s.municipioItem}>
            <div className={s.municipioCuadroSello}>
              <span className={s.selloNumero}>11</span>
              <span className={s.selloTexto}>MUNICIPIOS</span>
            </div>
            <span className={s.municipioNombre}>&nbsp;</span>
          </div>
          </div>
        </div>
      </section>

      {/* Nuestra Tierra — Museo */}
      <section id="tierra" className={s.museo}>
        <div className={s.museoInner}>
          <span className={s.tag}>Nuestra tierra</span>
          <h2 className={s.museoTitle}>El campo de Urabá<br />alimenta a Colombia</h2>
          <p className={s.museoText}>
            La subregión del Urabá antioqueño es uno de los territorios agrícolas más estratégicos del país.
            Con mas de 150.000 hectáreas cultivadas, aporta el 70% del banano de exportación nacional,
            es cuna del plátano hartón que llega a todas las mesas colombianas, y emerge como referente
            del cacao fino de aroma en los mercados internacionales. Su biodiversidad, su gente y su tierra
            son patrimonio vivo de Colombia.
          </p>

          <div className={s.museoGrid}>
            {productos.map(p => (
              <div key={p.nombre} className={s.museoCard}>
                <div className={s.museoCardImg}>
                  <img src={p.img} alt={p.nombre} />
                  <div className={s.museoCardOverlay}>
                    <span className={s.museoCardOrigen}>{p.origen}</span>
                  </div>
                </div>
                <div className={s.museoCardBody}>
                  <h3 className={s.museoCardNombre}>{p.nombre}</h3>
                  <p className={s.museoCardHistoria}>{p.historia}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className={s.museoFootnote}>
            <p>
              Estos son solo algunos de los productos que brotan de la tierra prometida: Urabá.
              Pero no es todo, La subregión también cultiva{" "}
              <span>Palma de aceite</span>, <span>Yuca</span>, <span>Arroz</span>,{" "}
              <span>Aguacate</span>, <span>Maíz</span> y muchos más...
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.cta}>
        <h2 className={s.ctaTitle}>¿Listo para ser parte<br />del cambio?</h2>
        <p className={s.ctaSub}>
          Únete a cientos de agricultores y compradores que ya hacen parte de AgroMarket.
        </p>
        <button className={s.heroBtnPrimary} onClick={() => setModalOpen(true)}>
          Crear cuenta gratis
        </button>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <p>2026 AgroMarket.</p>
        <p>Hecho con amor en Urabá. Todos los derechos reservados.</p>
      </footer>

      {/* Modal Registro */}
      {modalOpen && (
        <div className={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={s.modal}>
            <button className={s.modalClose} onClick={closeModal}>x</button>
            <h2 className={s.modalTitle}>Crear cuenta</h2>
            <p className={s.modalSub}>Unete a AgroMarket y conecta con el campo de Urabá.</p>

            {campos.map(f => (
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
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            {msg.text && (
              <p className={`${s.modalMsg} ${msg.type === "error" ? s.msgError : s.msgSuccess}`}>
                {msg.text}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}