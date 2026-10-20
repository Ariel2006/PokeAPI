# Hallazgos consolidados

Fecha: 2026-10-19T23:06:17.197Z

- Hallazgos crudos: 45
- Unicos (sin duplicados): 44
- Duplicados eliminados: 1
- Por severidad: {"alta":35,"media":9}
- **Gate: FALLA** (3 vulnerabilidad(es) confirmada(s) alta/critica)

| Severidad | Origen | Regla | Ubicacion | Estado | Descripcion |
| --- | --- | --- | --- | --- | --- |
| alta | SAST/semgrep | home.claude.ariel2006.pokeapi.security.semgrep.secreto-embebido | src/app.js:14 | candidato | Secreto embebido en el codigo fuente (CWE-798). Mover a una variable de entorno (process.env). |
| alta | SAST/semgrep | home.claude.ariel2006.pokeapi.security.semgrep.password-texto-plano | src/app.js:22 | candidato | La contrasena parece compararse/almacenarse en texto plano (CWE-256/CWE-916). Usar un hash lento con sal (scrypt, bcrypt, argon2). |
| alta | SAST/semgrep | home.claude.ariel2006.pokeapi.security.semgrep.sqli-concatenacion-string | src/app.js:77 | candidato | Posible inyeccion SQL (CWE-89): la consulta se arma concatenando una variable. Usar consultas parametrizadas con '?'. |
| alta | SCA/npm-audit | dependencia:@jest/console | node_modules/@jest/console | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:@jest/core | node_modules/@jest/core | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:@jest/environment | node_modules/@jest/environment | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:@jest/expect | node_modules/@jest/expect | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:@jest/fake-timers | node_modules/@jest/fake-timers | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:@jest/globals | node_modules/@jest/globals | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:@jest/reporters | node_modules/@jest/reporters | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:@jest/test-result | node_modules/@jest/test-result | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:@jest/test-sequencer | node_modules/@jest/test-sequencer | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:@jest/transform | node_modules/@jest/transform | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:babel-jest | node_modules/babel-jest | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:braces | node_modules/braces | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:create-jest | node_modules/create-jest | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:expect | node_modules/expect | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest | node_modules/jest | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-circus | node_modules/jest-circus | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-cli | node_modules/jest-cli | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-config | node_modules/jest-config | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-environment-node | node_modules/jest-environment-node | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-haste-map | node_modules/jest-haste-map | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-message-util | node_modules/jest-message-util | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-resolve | node_modules/jest-resolve | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-resolve-dependencies | node_modules/jest-resolve-dependencies | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-runner | node_modules/jest-runner | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-runtime | node_modules/jest-runtime | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-snapshot | node_modules/jest-snapshot | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jest-watcher | node_modules/jest-watcher | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:jsonwebtoken | node_modules/jsonwebtoken | candidato | Dependencia vulnerable (high) |
| alta | SCA/npm-audit | dependencia:micromatch | node_modules/micromatch | candidato | Dependencia vulnerable (high) |
| alta | DAST/dast-scan | DAST-IDOR-READ (CWE-639) | API en ejecucion | confirmado | Acceso entre usuarios: lectura de equipo ajeno |
| alta | DAST/dast-scan | DAST-IDOR-DELETE (CWE-639) | API en ejecucion | confirmado | Acceso entre usuarios: borrado de equipo ajeno |
| alta | DAST/dast-scan | DAST-SQLI (CWE-89) | API en ejecucion | confirmado | Inyeccion SQL en filtro de busqueda |
| media | SAST/semgrep | home.claude.ariel2006.pokeapi.security.semgrep.jwt-sin-algoritmo-explicito | src/app.js:33 | candidato | jwt.verify sin lista de algoritmos permitida (CWE-347). Pasar { algorithms: ["HS256"] } para evitar confusion de algoritmo. |
| media | SCA/npm-audit | dependencia:@istanbuljs/load-nyc-config | node_modules/@istanbuljs/load-nyc-config | candidato | Dependencia vulnerable (moderate) |
| media | SCA/npm-audit | dependencia:argparse | node_modules/argparse | candidato | Dependencia vulnerable (moderate) |
| media | SCA/npm-audit | dependencia:babel-plugin-istanbul | node_modules/babel-plugin-istanbul | candidato | Dependencia vulnerable (moderate) |
| media | SCA/npm-audit | dependencia:js-yaml | node_modules/js-yaml | candidato | Dependencia vulnerable (moderate) |
| media | SCA/npm-audit | dependencia:sprintf-js | node_modules/sprintf-js | candidato | Dependencia vulnerable (moderate) |
| media | DAST/dast-scan | DAST-INPUT-1 (CWE-20) | API en ejecucion | confirmado | Validacion de entradas: id de pokemon fuera de rango |
| media | DAST/dast-scan | DAST-INPUT-2 (CWE-20) | API en ejecucion | confirmado | Validacion de entradas: mas de 6 pokemon |
| media | DAST/dast-scan | DAST-INPUT-3 (CWE-20) | API en ejecucion | confirmado | Validacion de entradas: nombre con <script> |
