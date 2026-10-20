// API de equipos Pokemon.
//
// ====================================================================
//  VERSION 1.1 (DESPUES) - fallas corregidas tras las pruebas del
//  Parcial 1, Actividad 2. Cada bloque [FIX-n] corrige el [VULN-n]
//  de la version 1.0. Las mismas pruebas que antes fallaban ahora pasan.
// ====================================================================
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

// [FIX-1] El secreto se lee de una variable de entorno (CWE-798).
//         En laboratorio se permite un valor por defecto explicito.
const JWT_SECRET = process.env.JWT_SECRET || "clave-solo-para-laboratorio";
const JWT_ALGOS = ["HS256"];

// Limites de dominio para la validacion de entradas.
const MAX_POKEMON = 6;
const MAX_POKEMON_ID = 1025; // numero de especies existentes
const NOMBRE_VALIDO = /^[\w áéíóúñÁÉÍÓÚÑ.-]{1,40}$/;

// [FIX-2] Contrasenas con hash lento y sal (scrypt, CWE-256/916).
//         Formato almacenado: scrypt$<salt_hex>$<hash_hex>
function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}
function verifyPassword(plain, stored) {
  const [scheme, saltHex, hashHex] = String(stored).split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const hash = crypto.scryptSync(plain, Buffer.from(saltHex, "hex"), 64);
  const esperado = Buffer.from(hashHex, "hex");
  // Comparacion en tiempo constante.
  return hash.length === esperado.length &&
    crypto.timingSafeEqual(hash, esperado);
}

// Validacion reutilizable de un equipo.
function validarEquipo(name, pokemon) {
  if (typeof name !== "string" || !NOMBRE_VALIDO.test(name)) {
    return "El nombre es obligatorio, de 1 a 40 caracteres y sin simbolos peligrosos";
  }
  if (!Array.isArray(pokemon) || pokemon.length < 1 || pokemon.length > MAX_POKEMON) {
    return `El equipo debe tener entre 1 y ${MAX_POKEMON} pokemon`;
  }
  for (const id of pokemon) {
    if (!Number.isInteger(id) || id < 1 || id > MAX_POKEMON_ID) {
      return `Cada pokemon debe ser un id entero entre 1 y ${MAX_POKEMON_ID}`;
    }
  }
  return null;
}

export function createApp(db) {
  const app = express();
  app.use(express.json());

  function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.replace("Bearer ", "");
    try {
      // [FIX] Se fija la lista de algoritmos permitida (CWE-347).
      req.user = jwt.verify(token, JWT_SECRET, { algorithms: JWT_ALGOS });
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
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "2h" }
    );
    res.json({ token });
  });

  // --- Listar / buscar equipos del usuario -------------------------
  app.get("/api/teams", auth, (req, res) => {
    const { name } = req.query;
    try {
      // [FIX-3] Consulta parametrizada (CWE-89) y acotada al dueno:
      //         solo devuelve los equipos de req.user.
      let rows;
      if (name) {
        rows = db
          .prepare("SELECT * FROM teams WHERE user_id = ? AND name LIKE ?")
          .all(req.user.id, `%${name}%`);
      } else {
        rows = db
          .prepare("SELECT * FROM teams WHERE user_id = ?")
          .all(req.user.id);
      }
      res.json(rows.map(parseTeam));
    } catch {
      // [FIX-4] Mensaje de error generico, sin detalles internos (CWE-209).
      res.status(500).json({ error: "Error interno" });
    }
  });

  // --- Leer un equipo por id ---------------------------------------
  app.get("/api/teams/:id", auth, (req, res) => {
    const team = db
      .prepare("SELECT * FROM teams WHERE id = ?")
      .get(req.params.id);
    if (!team) return res.status(404).json({ error: "Equipo no encontrado" });
    // [FIX-5] Control de acceso: el equipo debe pertenecer a req.user (CWE-639).
    if (team.user_id !== req.user.id) {
      return res.status(403).json({ error: "No autorizado" });
    }
    res.json(parseTeam(team));
  });

  // --- Crear equipo ------------------------------------------------
  app.post("/api/teams", auth, (req, res) => {
    const { name, pokemon } = req.body || {};
    // [FIX-6] Validacion de entradas antes de persistir (CWE-20).
    const error = validarEquipo(name, pokemon);
    if (error) return res.status(400).json({ error });
    const info = db
      .prepare("INSERT INTO teams (user_id, name, pokemon) VALUES (?, ?, ?)")
      .run(req.user.id, name, JSON.stringify(pokemon));
    res.status(201).json({ id: info.lastInsertRowid, name, pokemon });
  });

  // --- Borrar equipo -----------------------------------------------
  app.delete("/api/teams/:id", auth, (req, res) => {
    const team = db
      .prepare("SELECT * FROM teams WHERE id = ?")
      .get(req.params.id);
    if (!team) return res.status(404).json({ error: "Equipo no encontrado" });
    // [FIX-5] Mismo control de dueno antes de borrar (CWE-639).
    if (team.user_id !== req.user.id) {
      return res.status(403).json({ error: "No autorizado" });
    }
    db.prepare("DELETE FROM teams WHERE id = ?").run(req.params.id);
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

export const _internal = { hashPassword, verifyPassword, validarEquipo };
