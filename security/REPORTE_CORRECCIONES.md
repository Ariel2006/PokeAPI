# Reporte de correcciones — antes y después

**Materia:** Ingeniería de la Seguridad del Software (NRC 36892) · Parcial 1, Actividad 2
**Docente:** Ing. Luis Jaramillo · **Estudiante:** Ariel Alexander Jara Caiza (individual)
**Aplicación:** PokeAPI / `poke-server` · Repositorio: Ariel2006/PokeAPI

Este reporte documenta la corrección de las fallas detectadas por el pipeline
`security/run-security.sh`. Cada afirmación de vulnerabilidad se respalda con la
evidencia de las herramientas, guardada en `security/results-antes/` y
`security/results-despues/`.

## Resumen de métricas

| Herramienta | Antes (v1.0) | Después (v1.1) |
| --- | --- | --- |
| SAST — Semgrep (reglas propias) | 5 hallazgos | 0 hallazgos |
| SCA — npm audit (`jsonwebtoken`) | 1 dependencia vulnerable | corregida (ya no aparece) |
| Pruebas Jest + supertest | 2 pasan / 6 fallan | 8 pasan / 0 fallan |
| DAST — `dast-scan.mjs` | 6 de 7 vulnerables | 0 de 7 vulnerables |
| Gate del pipeline | **FALLA** | **PASA** |

## Corrección 1 — Acceso entre usuarios (IDOR / Broken Access Control)

- **Identificador:** VULN-5 · CWE-639 · OWASP A01:2025
- **Detección:** DAST `DAST-IDOR-READ` y `DAST-IDOR-DELETE`; pruebas CP-01 y CP-02.
- **Causa:** `GET /api/teams/:id` y `DELETE /api/teams/:id` buscaban el equipo solo
  por `id`, sin comprobar que perteneciera al usuario del token.

**Evidencia antes:**
```
ash (user 1) GET /api/teams/2 (de misty) -> HTTP 200 cuerpo={"id":2,"user_id":2,...}
ash DELETE /api/teams/2 (de misty) -> HTTP 200
```

**Corrección (`src/app.js`):**
```js
if (team.user_id !== req.user.id) {
  return res.status(403).json({ error: "No autorizado" });
}
```

**Evidencia después:**
```
ash GET /api/teams/2 (de misty) -> HTTP 403
ash DELETE /api/teams/2 (de misty) -> HTTP 403
```

## Corrección 2 — Inyección SQL en el filtro de búsqueda

- **Identificador:** VULN-3 · CWE-89 · OWASP A05:2025
- **Detección:** SAST Semgrep `sqli-concatenacion-string` (`src/app.js:77`);
  DAST `DAST-SQLI`; prueba CP-03.
- **Causa:** el parámetro `name` se concatenaba directamente a la cadena SQL, y la
  consulta no filtraba por `user_id`.

**Evidencia antes:**
```
GET /api/teams?name=' OR '1'='1 -> HTTP 200, 2 equipos ajenos devueltos (toda la tabla)
```

**Corrección (`src/app.js`):**
```js
db.prepare("SELECT * FROM teams WHERE user_id = ? AND name LIKE ?")
  .all(req.user.id, `%${name}%`);
```

**Evidencia después:**
```
GET /api/teams?name=' OR '1'='1 -> HTTP 200, 0 equipos ajenos devueltos
```

## Corrección 3 — Dependencia vulnerable (SCA)

- **Identificador:** VULN dependencia · `jsonwebtoken@8.5.1`
- **Detección:** SCA `npm audit`, severidad alta; avisos GHSA-8cf7-32gw-wr33, GHSA-hjrf-2m68-5959 y GHSA-qwph-4952-7xr6.
- **Causa:** versión de `jsonwebtoken` con vulnerabilidades conocidas.

**Corrección:** actualización a `jsonwebtoken` 9.0.3 (rango `^9.0.3` en `package.json`). Tras la
actualización, `jsonwebtoken` ya no aparece en el reporte de `npm audit`.

## Correcciones adicionales (mismo commit)

Detectadas por las pruebas y por SAST, corregidas junto a las anteriores:

- **VULN-6 · Validación de entradas (CWE-20):** se rechazan equipos con más de 6
  pokémon, ids fuera del rango 1–1025 y nombres con caracteres peligrosos
  (cubre CP-04, CP-05, CP-06). Mitiga el XSS almacenado en el nombre.
- **VULN-1 · Secreto embebido (CWE-798):** el secreto JWT se lee de
  `process.env.JWT_SECRET`.
- **VULN-2 · Contraseñas en texto plano (CWE-256):** se almacenan con `scrypt` y
  sal, y se comparan en tiempo constante.
- **VULN-4 · Fuga de detalles en errores (CWE-209):** los errores 500 ya no
  devuelven el mensaje interno ni la consulta SQL.
- **CWE-347:** `jwt.verify` fija `algorithms: ["HS256"]`.

## Excepciones justificadas

El `npm audit` del "después" aún reporta 28 vulnerabilidades altas. Todas
provienen de **dependencias de desarrollo** (el ecosistema de `jest` y
`supertest`, p. ej. `braces`), que no se despliegan en producción. Se registran
como **candidatas** y no bloquean el gate, que solo falla ante vulnerabilidades
**confirmadas** de severidad alta o crítica. Se revisarán al actualizar el
framework de pruebas en un parcial posterior.
