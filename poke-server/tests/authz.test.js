// Pruebas automatizadas de seguridad sobre la API de equipos.
// Se ejecutan contra la app real (supertest) con la base sembrada.
// Los mismos casos corren sin cambios en la v1.0 (antes) y v1.1 (despues):
// en "antes" varios fallan (revelan la vulnerabilidad); en "despues" pasan.
import { jest } from "@jest/globals";
import request from "supertest";
import { createDb } from "../src/db.js";
import { createApp } from "../src/app.js";
import { seed } from "../src/seed.js";

let app;

beforeEach(() => {
  const db = createDb(":memory:");
  seed(db);
  app = createApp(db);
});

async function login(username, password) {
  const res = await request(app)
    .post("/api/login")
    .send({ username, password });
  return res.body.token;
}

describe("Autenticacion (control base)", () => {
  // CP-07
  test("CP-07 rechaza acceso sin token (401)", async () => {
    const res = await request(app).get("/api/teams/1");
    expect(res.status).toBe(401);
  });
});

describe("Acceso entre usuarios (IDOR / Broken Access Control)", () => {
  // CP-01
  test("CP-01 un usuario NO puede leer el equipo de otro", async () => {
    const tokenAsh = await login("ash", "pikachu123");
    // El equipo 2 pertenece a misty, no a ash.
    const res = await request(app)
      .get("/api/teams/2")
      .set("Authorization", `Bearer ${tokenAsh}`);
    expect(res.status).toBe(403);
  });

  // CP-02
  test("CP-02 un usuario NO puede borrar el equipo de otro", async () => {
    const tokenAsh = await login("ash", "pikachu123");
    const res = await request(app)
      .delete("/api/teams/2")
      .set("Authorization", `Bearer ${tokenAsh}`);
    expect(res.status).toBe(403);
  });

  test("CP-01b un usuario SI puede leer su propio equipo (200)", async () => {
    const tokenAsh = await login("ash", "pikachu123");
    const res = await request(app)
      .get("/api/teams/1")
      .set("Authorization", `Bearer ${tokenAsh}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Kanto Starters");
  });
});

describe("Inyeccion SQL", () => {
  // CP-03
  test("CP-03 el filtro name no permite inyeccion booleana", async () => {
    const token = await login("ash", "pikachu123");
    const res = await request(app)
      .get("/api/teams")
      .query({ name: "' OR '1'='1" })
      .set("Authorization", `Bearer ${token}`);
    // No debe devolver equipos de otros usuarios ni volcar toda la tabla.
    expect(res.status).toBeLessThan(500);
    const ajenos = (res.body || []).filter((t) => t.user_id !== 1);
    expect(ajenos).toHaveLength(0);
  });
});

describe("Validacion de entradas", () => {
  async function crear(token, body) {
    return request(app)
      .post("/api/teams")
      .set("Authorization", `Bearer ${token}`)
      .send(body);
  }

  // CP-04
  test("CP-04 rechaza id de pokemon fuera de rango", async () => {
    const token = await login("ash", "pikachu123");
    const res = await crear(token, { name: "Prueba", pokemon: [-5, 99999] });
    expect(res.status).toBe(400);
  });

  // CP-05
  test("CP-05 rechaza equipos con mas de 6 pokemon", async () => {
    const token = await login("ash", "pikachu123");
    const res = await crear(token, {
      name: "Demasiados",
      pokemon: [1, 2, 3, 4, 5, 6, 7],
    });
    expect(res.status).toBe(400);
  });

  // CP-06
  test("CP-06 rechaza nombre con contenido tipo script (XSS almacenado)", async () => {
    const token = await login("ash", "pikachu123");
    const res = await crear(token, {
      name: "<script>alert(1)</script>",
      pokemon: [1],
    });
    expect(res.status).toBe(400);
  });
});
