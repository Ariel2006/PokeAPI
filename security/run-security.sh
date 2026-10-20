#!/usr/bin/env bash
# =====================================================================
#  Script unico de seguridad - PokeAPI / poke-server
#  Parcial 1, Actividad 2 - Ingenieria de la Seguridad del Software (NRC 36892)
#
#  Ejecuta en secuencia y con un solo comando:
#    1. SAST  -> Semgrep (reglas locales) + ESLint (plugin security)
#    2. SCA   -> npm audit
#    3. Tests -> Jest + supertest (casos de autorizacion y validacion)
#    4. DAST  -> dast-scan.mjs contra la app en 127.0.0.1
#    5. Consolidacion sin duplicados + gate
#
#  Todas las salidas quedan en security/results/.
#  Uso:  bash security/run-security.sh
# =====================================================================
set -u
cd "$(dirname "$0")/.." || exit 2
ROOT="$(pwd)"
RES="$ROOT/security/results"
mkdir -p "$RES"

echo "================================================================"
echo " PIPELINE DE SEGURIDAD - $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "================================================================"

cd "$ROOT/poke-server" || exit 2
[ -d node_modules ] || npm install --silent

echo; echo ">>> [1/5] SAST - Semgrep"
semgrep --config "$ROOT/security/semgrep" --json \
  --output "$RES/sast-semgrep.json" src 2>/dev/null
echo "    reporte: security/results/sast-semgrep.json"

echo; echo ">>> [1b/5] SAST - ESLint (plugin security)"
npx eslint src tests -f json -o "$RES/sast-eslint.json" 2>/dev/null || true
echo "    reporte: security/results/sast-eslint.json"

echo; echo ">>> [2/5] SCA - npm audit"
npm audit --json > "$RES/sca-npm-audit.json" 2>/dev/null || true
echo "    reporte: security/results/sca-npm-audit.json"

echo; echo ">>> [3/5] Tests automatizados - Jest + supertest"
npm test -- --json --outputFile="$RES/tests-jest.json" 2>"$RES/tests-jest.log"
TEST_EXIT=$?
echo "    reporte: security/results/tests-jest.json (exit $TEST_EXIT)"

echo; echo ">>> [4/5] DAST - escaneo dinamico de la app"
node "$ROOT/security/dast-scan.mjs"

echo; echo ">>> [5/5] Consolidacion y gate"
node "$ROOT/security/consolidar.mjs"
GATE_EXIT=$?

echo
echo "================================================================"
if [ "$GATE_EXIT" -eq 0 ]; then
  echo " RESULTADO: GATE PASA (sin vulnerabilidades confirmadas graves)"
else
  echo " RESULTADO: GATE FALLA (hay vulnerabilidades confirmadas graves)"
fi
echo "================================================================"
exit "$GATE_EXIT"
