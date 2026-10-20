// DAST minimo y reproducible para la API de equipos Pokemon.
// Arranca la aplicacion en 127.0.0.1 (laboratorio local) y la ataca por
// HTTP real con cargas maliciosas, sin tocar servicios de terceros.
// Salida: security/results/dast-report.json + resumen por consola.
//
// Uso:  node security/dast-scan.mjs
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { createDb } from "../poke-server/src/db.js";
import { createApp } from "../poke-server/src/app.js";
import { seed } from "../poke-server/src/seed.js";

const HOST = "127.0.0.1";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "results", "dast-report.json");

async function main() {
  const db = createDb(":memory:");
  seed(db);
  const server = await new Promise((resolve) => {
    const s = createApp(db).listen(0, HOST, () => resolve(s));
  });
  const base = `http://${HOST}:${server.address().port}`;

  const findings = [];
  const add = (f) => findings.push(f);

  const tokenAsh = await token(base, "ash", "pikachu123"); // user 1
  const tokenMisty = await token(base, "misty", "staryu456"); // user 2

  // --- Prueba 1: acceso sin autenticacion (control) ----------------
  {
    const r = await http("GET", `${base}/api/teams/1`);
    add({
      id: "DAST-AUTH",
      nombre: "Acceso sin token",
      severidad: r.status === 401 ? "info" : "alta",
      cwe: "CWE-306",
      estado: r.status === 401 ? "seguro" : "vulnerable",
      evidencia: `GET /api/teams/1 sin Authorization -> HTTP ${r.status}`,
    });
  }

  // --- Prueba 2: IDOR lectura (ash lee equipo de misty) ------------
  {
    const r = await http("GET", `${base}/api/teams/2`, tokenAsh);
    const expuesto = r.status === 200;
    add({
      id: "DAST-IDOR-READ",
      nombre: "Acceso entre usuarios: lectura de equipo ajeno",
      severidad: "alta",
      cwe: "CWE-639",
      estado: expuesto ? "vulnerable" : "seguro",
      evidencia: `ash (user 1) GET /api/teams/2 (de misty) -> HTTP ${r.status}` +
        (expuesto ? ` cuerpo=${JSON.stringify(r.body)}` : ""),
    });
  }

  // --- Prueba 3: IDOR borrado (ash borra equipo de misty) ----------
  {
    const r = await http("DELETE", `${base}/api/teams/2`, tokenAsh);
    const borrado = r.status === 200;
    add({
      id: "DAST-IDOR-DELETE",
      nombre: "Acceso entre usuarios: borrado de equipo ajeno",
      severidad: "alta",
      cwe: "CWE-639",
      estado: borrado ? "vulnerable" : "seguro",
      evidencia: `ash DELETE /api/teams/2 (de misty) -> HTTP ${r.status}`,
    });
    // Restaurar estado si lo borro.
    if (borrado) {
      await http("POST", `${base}/api/teams`, tokenMisty, {
        name: "Agua total",
        pokemon: [7, 54, 120, 121],
      });
    }
  }

  // --- Prueba 4: inyeccion SQL en el filtro name -------------------
  {
    const r = await http(
      "GET",
      `${base}/api/teams?name=${encodeURIComponent("' OR '1'='1")}`,
      tokenAsh
    );
    const ajenos = Array.isArray(r.body)
      ? r.body.filter((t) => t.user_id !== 1).length
      : 0;
    const vuln = r.status >= 500 || ajenos > 0;
    add({
      id: "DAST-SQLI",
      nombre: "Inyeccion SQL en filtro de busqueda",
      severidad: "alta",
      cwe: "CWE-89",
      estado: vuln ? "vulnerable" : "seguro",
      evidencia: `GET /api/teams?name=' OR '1'='1 -> HTTP ${r.status}, ` +
        `${ajenos} equipos ajenos devueltos`,
    });
  }

  // --- Prueba 5: entradas invalidas --------------------------------
  const casosInvalidos = [
    { nombre: "id de pokemon fuera de rango", body: { name: "x", pokemon: [-5, 99999] } },
    { nombre: "mas de 6 pokemon", body: { name: "x", pokemon: [1, 2, 3, 4, 5, 6, 7] } },
    { nombre: "nombre con <script>", body: { name: "<script>alert(1)</script>", pokemon: [1] } },
  ];
  for (const [i, c] of casosInvalidos.entries()) {
    const r = await http("POST", `${base}/api/teams`, tokenAsh, c.body);
    const vuln = r.status === 201; // acepto una entrada que debio rechazar
    add({
      id: `DAST-INPUT-${i + 1}`,
      nombre: `Validacion de entradas: ${c.nombre}`,
      severidad: "media",
      cwe: "CWE-20",
      estado: vuln ? "vulnerable" : "seguro",
      evidencia: `POST /api/teams ${JSON.stringify(c.body)} -> HTTP ${r.status}`,
    });
  }

  server.close();

  // --- Reporte -----------------------------------------------------
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const resumen = {
    herramienta: "dast-scan (propio)",
    objetivo: base.replace(/:\d+$/, ":<puerto efimero>"),
    fecha: new Date().toISOString(),
    total: findings.length,
    vulnerables: findings.filter((f) => f.estado === "vulnerable").length,
    findings,
  };
  fs.writeFileSync(OUT, JSON.stringify(resumen, null, 2));

  console.log(`\nDAST -> ${resumen.vulnerables} de ${resumen.total} pruebas revelan vulnerabilidad\n`);
  for (const f of findings) {
    const marca = f.estado === "vulnerable" ? "VULN" : "ok  ";
    console.log(`  [${marca}] ${f.id.padEnd(16)} ${f.nombre}`);
  }
  console.log(`\nReporte: ${path.relative(process.cwd(), OUT)}`);
  // No corta aqui: el gate del script unico decide el exit global.
  process.exit(0);
}

async function token(base, username, password) {
  const r = await http("POST", `${base}/api/login`, null, { username, password });
  return r.body.token;
}

async function http(method, url, token, body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let parsed = null;
  const text = await res.text();
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  return { status: res.status, body: parsed };
}

main().catch((e) => {
  console.error("Error en DAST:", e);
  process.exit(2);
});
