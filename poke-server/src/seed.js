// Carga datos sinteticos reproducibles en la base.
// Uso: node src/seed.js [ruta.db]
import { createDb } from "./db.js";
import { createApp, _internal } from "./app.js";

export function seed(db) {
  const insUser = db.prepare(
    "INSERT INTO users (username, password) VALUES (?, ?)"
  );
  const insTeam = db.prepare(
    "INSERT INTO teams (user_id, name, pokemon) VALUES (?, ?, ?)"
  );

  // Contrasenas de laboratorio, no reales.
  const users = [
    { u: "ash", p: "pikachu123" },
    { u: "misty", p: "staryu456" },
    { u: "brock", p: "onix789" },
  ];
  const ids = {};
  for (const { u, p } of users) {
    const info = insUser.run(u, _internal.hashPassword(p));
    ids[u] = info.lastInsertRowid;
  }

  insTeam.run(ids.ash, "Kanto Starters", JSON.stringify([1, 4, 7]));
  insTeam.run(ids.misty, "Agua total", JSON.stringify([7, 54, 120, 121]));
  insTeam.run(ids.brock, "Roca dura", JSON.stringify([74, 95]));
  return ids;
}

// Ejecucion directa desde CLI.
if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2] || "poke.db";
  const db = createDb(path);
  db.exec("DELETE FROM teams; DELETE FROM users;");
  seed(db);
  createApp(db); // valida que la app carga sin errores
  console.log(`Base sembrada en ${path}: usuarios ash, misty, brock`);
}
