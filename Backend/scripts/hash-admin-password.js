/**
 * AgroMarket — scripts/hash-admin-password.js
 * Ejecutar UNA VEZ después de instalar bcrypt para hashear
 * la contraseña del admin en la base de datos.
 *
 * Uso:  node scripts/hash-admin-password.js
 */

require("dotenv").config();
const bcrypt = require("bcrypt");
const db     = require("../db");

const PLAIN_PASSWORD = "admin"; // contraseña predeterminada 

(async () => {
  try {
    const hash = await bcrypt.hash(PLAIN_PASSWORD, 10);
    await db.query("UPDATE admins SET password = ? WHERE email = ?", [
      hash,
      "admin@agromarket.co",
    ]);
    console.log("✅ Contraseña del admin actualizada correctamente.");
    console.log(`   Hash generado: ${hash}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    process.exit();
  }
})();