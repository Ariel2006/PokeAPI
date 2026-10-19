// Consolida los resultados de SAST, SCA y DAST en un unico reporte,
// elimina duplicados y aplica el "gate": sale con codigo != 0 si queda
// alguna vulnerabilidad confirmada de severidad alta o critica.
//
// Uso:  node security/consolidar.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const R = path.join(__dirname, "results");
const read = (f) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(R, f), "utf8"));
  } catch {
    return null;
  }
};

const hallazgos = [];
const push = (h) => hallazgos.push(h);

// --- SAST: Semgrep -------------------------------------------------
const semgrep = read("sast-semgrep.json");
if (semgrep?.results) {
  for (const r of semgrep.results) {
    push({
      origen: "SAST/semgrep",
      regla: r.check_id,
      severidad: mapSemgrep(r.extra?.severity),
      ubicacion: `${r.path}:${r.start?.line}`,
      descripcion: (r.extra?.message || "").trim().split("\n")[0],
      estado: "candidato",
    });
  }
}

// --- SCA: npm audit ------------------------------------------------
const audit = read("sca-npm-audit.json");
if (audit?.vulnerabilities) {
  for (const [nombre, v] of Object.entries(audit.vulnerabilities)) {
    push({
      origen: "SCA/npm-audit",
      regla: `dependencia:${nombre}`,
      severidad: mapNpm(v.severity),
      ubicacion: `node_modules/${nombre}`,
      descripcion: `Dependencia vulnerable (${v.severity})`,
      estado: "candidato",
    });
  }
}

// --- DAST ----------------------------------------------------------
const dast = read("dast-report.json");
if (dast?.findings) {
  for (const f of dast.findings) {
    if (f.estado !== "vulnerable") continue; // solo lo confirmado dinamicamente
    push({
      origen: "DAST/dast-scan",
      regla: `${f.id} (${f.cwe})`,
      severidad: f.severidad,
      ubicacion: "API en ejecucion",
      descripcion: f.nombre,
      estado: "confirmado", // reproducido contra la app corriendo
    });
  }
}

// --- Deduplicado ---------------------------------------------------
// Clave: origen + regla + ubicacion. Evita contar dos veces el mismo
// hallazgo (p.ej. la misma dependencia reportada en varias rutas).
const vistos = new Map();
for (const h of hallazgos) {
  const clave = `${h.origen}|${h.regla}|${h.ubicacion}`;
  if (!vistos.has(clave)) vistos.set(clave, h);
}
const unicos = [...vistos.values()];

// --- Resumen y gate ------------------------------------------------
const orden = { critica: 0, alta: 1, media: 2, baja: 3, info: 4 };
unicos.sort((a, b) => (orden[a.severidad] ?? 9) - (orden[b.severidad] ?? 9));

const porSeveridad = unicos.reduce((acc, h) => {
  acc[h.severidad] = (acc[h.severidad] || 0) + 1;
  return acc;
}, {});

const confirmadosGraves = unicos.filter(
  (h) => h.estado === "confirmado" && ["critica", "alta"].includes(h.severidad)
);

const reporte = {
  fecha: new Date().toISOString(),
  totalCrudos: hallazgos.length,
  totalUnicos: unicos.length,
  duplicadosEliminados: hallazgos.length - unicos.length,
  porSeveridad,
  gate: confirmadosGraves.length === 0 ? "PASA" : "FALLA",
  motivoGate:
    confirmadosGraves.length === 0
      ? "Sin vulnerabilidades confirmadas de severidad alta/critica"
      : `${confirmadosGraves.length} vulnerabilidad(es) confirmada(s) alta/critica`,
  hallazgos: unicos,
};

fs.writeFileSync(
  path.join(R, "hallazgos-consolidados.json"),
  JSON.stringify(reporte, null, 2)
);
fs.writeFileSync(path.join(R, "hallazgos-consolidados.md"), aMarkdown(reporte));

console.log("\n===== HALLAZGOS CONSOLIDADOS =====");
console.log(`Crudos: ${reporte.totalCrudos}  Unicos: ${reporte.totalUnicos}  ` +
  `Duplicados eliminados: ${reporte.duplicadosEliminados}`);
console.log(`Por severidad:`, porSeveridad);
console.log(`GATE: ${reporte.gate} - ${reporte.motivoGate}\n`);

process.exit(reporte.gate === "PASA" ? 0 : 1);

// --- helpers -------------------------------------------------------
function mapSemgrep(s) {
  return { ERROR: "alta", WARNING: "media", INFO: "baja" }[s] || "media";
}
function mapNpm(s) {
  return { critical: "critica", high: "alta", moderate: "media", low: "baja" }[s] || "media";
}
function aMarkdown(rep) {
  const filas = rep.hallazgos
    .map(
      (h) =>
        `| ${h.severidad} | ${h.origen} | ${h.regla} | ${h.ubicacion} | ${h.estado} | ${h.descripcion} |`
    )
    .join("\n");
  return `# Hallazgos consolidados\n\n` +
    `Fecha: ${rep.fecha}\n\n` +
    `- Hallazgos crudos: ${rep.totalCrudos}\n` +
    `- Unicos (sin duplicados): ${rep.totalUnicos}\n` +
    `- Duplicados eliminados: ${rep.duplicadosEliminados}\n` +
    `- Por severidad: ${JSON.stringify(rep.porSeveridad)}\n` +
    `- **Gate: ${rep.gate}** (${rep.motivoGate})\n\n` +
    `| Severidad | Origen | Regla | Ubicacion | Estado | Descripcion |\n` +
    `| --- | --- | --- | --- | --- | --- |\n${filas}\n`;
}
