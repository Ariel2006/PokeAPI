// Punto de entrada: arranca la API en 127.0.0.1 con la base sembrada.
import { createDb } from "./db.js";
import { createApp } from "./app.js";
import { seed } from "./seed.js";

const PORT = Number(process.env.PORT) || 3001;
const HOST = "127.0.0.1"; // solo laboratorio local

const db = createDb(process.env.DB_PATH || ":memory:");
// Si la base esta vacia, sembrar datos sinteticos.
const count = db.prepare("SELECT COUNT(*) c FROM users").get().c;
if (count === 0) seed(db);

const app = createApp(db);
app.listen(PORT, HOST, () => {
  console.log(`poke-server escuchando en http://${HOST}:${PORT}`);
});
