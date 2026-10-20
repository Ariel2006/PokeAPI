# Seguridad — PokeAPI (Parcial 1, Actividad 2)

Procedimiento repetible para **detectar y verificar la corrección** de fallas en
la aplicación PokeAPI y su backend `poke-server`.

## Requisitos

- Node.js 22+
- Python 3 con [Semgrep](https://semgrep.dev) (`pip install semgrep`)
- Sistema operativo Linux o macOS (el script usa bash)

## Ejecución (un solo comando)

```bash
# desde la raíz del repositorio
bash security/run-security.sh
```

El script ejecuta, en orden y dejando sus reportes en `security/results/`:

| Paso | Técnica | Herramienta | Salida |
| --- | --- | --- | --- |
| 1 | SAST (análisis estático) | Semgrep + ESLint | `sast-semgrep.json`, `sast-eslint.json` |
| 2 | SCA (dependencias) | npm audit | `sca-npm-audit.json` |
| 3 | Pruebas automatizadas | Jest + supertest | `tests-jest.json` |
| 4 | DAST (app en ejecución) | `dast-scan.mjs` | `dast-report.json` |
| 5 | Consolidación + gate | `consolidar.mjs` | `hallazgos-consolidados.{json,md}` |

El **gate** devuelve código de salida distinto de cero (falla el build) si queda
alguna vulnerabilidad **confirmada** de severidad alta o crítica.

## Ejecutar herramientas por separado

```bash
cd poke-server
npm install
npm run sast   # Semgrep
npm run sca    # npm audit
npm test       # Jest + supertest
npm run dast   # escaneo dinámico
```

## Arrancar solo el servidor (para pruebas manuales)

```bash
cd poke-server
npm install
npm start          # http://127.0.0.1:3001, base en memoria ya sembrada
```

Usuarios sintéticos de laboratorio: `ash` / `pikachu123`, `misty` / `staryu456`,
`brock` / `onix789`.

## Casos de prueba

| ID | Qué verifica | Esperado |
| --- | --- | --- |
| CP-01 | Un usuario no puede leer el equipo de otro (IDOR) | 403 |
| CP-02 | Un usuario no puede borrar el equipo de otro (IDOR) | 403 |
| CP-03 | El filtro `name` no permite inyección SQL | sin datos ajenos |
| CP-04 | Rechazar id de pokémon fuera de rango | 400 |
| CP-05 | Rechazar equipos con más de 6 pokémon | 400 |
| CP-06 | Rechazar nombre con contenido `<script>` | 400 |
| CP-07 | Rechazar acceso sin token | 401 |

## Versiones

- `v1.0` (antes): primera versión del backend, con fallas intencionales.
- `v1.1` (después): fallas corregidas. Ver `REPORTE_CORRECCIONES.md`.

Las corridas de referencia están guardadas en `security/results-antes/` y
`security/results-despues/`.
