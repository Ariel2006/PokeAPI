// API de equipos Pokemon.
//
// ====================================================================
//  VERSION 1.0 (ANTES) - contiene fallas de seguridad INTENCIONALES
//  usadas como objeto de las pruebas del Parcial 1, Actividad 2.
//  Cada bloque marcado con [VULN-n] se corrige en la version 1.1.
// ====================================================================
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

// [VULN-1] Secreto JWT embebido en el codigo fuente (CWE-798).
//          Deberia leerse de una variable de entorno.
const JWT_SECRET = "pokemon-super-secreto-123";

// [VULN-2] Contrasenas en texto plano. Esta funcion "hashea" sin hacer
//          nada real; se mantiene para que el cambio a la v1.1 sea claro.
function hashPassword(plain) {
  return plain; // CWE-256: almacenamiento de credenciales sin cifrar
}
function verifyPassword(plain, stored) {
  return plain === stored;
}

export function createApp(db) {
  const app = express();
  app.use(express.json());

  function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.replace("Bearer ", "");
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      res.status(401).json({ error: "Token invalido o ausente" });
    }
  }

  // --- Registro ----------------------------------------------------
  app.post("/api/register", (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "username y password requeridos" });
    }
    try {
      const info = db
        .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
        .run(username, hashPassword(password));
      res.status(201).json({ id: info.lastInsertRowid, username });
    } catch {
      res.status(409).json({ error: "El usuario ya existe" });
    }
  });

  // --- Inicio de sesion --------------------------------------------
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body || {};
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token });
  });

  // --- Listar / buscar equipos del usuario -------------------------
  app.get("/api/teams", auth, (req, res) => {
    const { name } = req.query;
    // [VULN-3] Inyeccion SQL: el filtro `name` se concatena directamente
    //          en la consulta (CWE-89). Ademas no filtra por user_id,
    //          por lo que expone equipos de otros usuarios.
    let sql = "SELECT * FROM teams WHERE 1=1";
    if (name) {
      sql += " AND name LIKE '%" + name + "%'";
    }
    try {
      const rows = db.prepare(sql).all();
      res.json(rows.map(parseTeam));
    } catch (e) {
      // [VULN-4] Fuga de detalles internos en el mensaje de error (CWE-209).
      res.status(500).json({ error: e.message, sql });
    }
  });

  // --- Leer un equipo por id ---------------------------------------
  app.get("/api/teams/:id", auth, (req, res) => {
    // [VULN-5] IDOR / Broken Access Control (CWE-639): no verifica que el
    //          equipo pertenezca a req.user. Cualquier usuario autenticado
    //          puede leer el equipo de otro.
    const team = db
      .prepare("SELECT * FROM teams WHERE id = ?")
      .get(req.params.id);
    if (!team) return res.status(404).json({ error: "Equipo no encontrado" });
    res.json(parseTeam(team));
  });

  // --- Crear equipo ------------------------------------------------
  app.post("/api/teams", auth, (req, res) => {
    const { name, pokemon } = req.body || {};
    // [VULN-6] Falta de validacion de entradas (CWE-20): no valida el
    //          nombre, ni que `pokemon` sea una lista de <=6 ids validos.
    const info = db
      .prepare("INSERT INTO teams (user_id, name, pokemon) VALUES (?, ?, ?)")
      .run(req.user.id, name, JSON.stringify(pokemon));
    res.status(201).json({ id: info.lastInsertRowid, name, pokemon });
  });

  // --- Borrar equipo -----------------------------------------------
  app.delete("/api/teams/:id", auth, (req, res) => {
    // [VULN-5] Mismo IDOR: borra por id sin comprobar el dueno.
    const info = db
      .prepare("DELETE FROM teams WHERE id = ?")
      .run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }
    res.json({ deleted: Number(req.params.id) });
  });

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  return app;
}

function parseTeam(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    pokemon: safeParse(row.pokemon),
  };
}
function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export const _internal = { hashPassword, verifyPassword, JWT_SECRET };
