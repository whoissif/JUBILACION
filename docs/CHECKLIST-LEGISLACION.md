# Checklist de verificación legislativa

Todas las cifras legales están en `legislacion.js`. La lógica (`calculo.js`) no contiene números legales.

## Cuándo revisar
- Cada **1 de enero** (cambian la edad ordinaria, la escala del % de base reguladora y los años exigidos).
- Al publicarse en el BOE cualquier norma que toque pensiones (RDL, ley de presupuestos, reforma de la LGSS).
- Antes de `revisarAntes` (en `legislacion.js`). Pasada esa fecha, `npm run verificar` avisa y la CI mensual lo repite.

## Qué contrastar y dónde (texto consolidado de la LGSS, RDL 8/2015)
| Parámetro | Norma | Estado |
|---|---|---|
| Edad ordinaria por año y cotización para jubilarse a los 65 | Art. 205 y DT 7ª LGSS | contrastado (2026: 66a8m / 65 con 38a3m; 2027: 67 / 38a6m) |
| Cotización mínima (15 años) | Art. 205.1.b | contrastado |
| % de base reguladora (50 % + tramos mensuales) | Art. 210 y DT 9ª | contrastado por coherencia interna (suma 100 %: 36a6m en 2026, 37a en 2027); **releer la DT 9ª** |
| Tramos de cotización de los coeficientes (38a6m, 41a6m, 44a6m) | Arts. 206 bis y 207 (RDL 2/2023) | contrastado |
| Requisitos anticipada (35 / 33 años; 24 / 48 meses) | Arts. 206 bis y 207 | contrastado |
| **Tabla de coeficientes voluntaria** | Art. 206 bis.2 | **PENDIENTE** contra el BOE |
| **Tabla de coeficientes involuntaria** | Art. 207.2 | **PENDIENTE** contra el BOE (el verificador señala un salto sospechoso entre 20 y 21 meses) |

## Procedimiento de actualización
1. Abre el texto consolidado en el BOE (`BOE-A-2015-11724`) y contrasta cada fila de la tabla anterior.
2. Edita solo `legislacion.js`: añade el año en `porAnio`, corrige tablas y pon `verificado: 'contrastado'` cuando lo hayas comprobado.
3. Añade filas de control en `coeficientes.anclas` (copiadas del BOE, nunca de la propia tabla) para que futuras erratas salten en los tests.
4. Ajusta `actualizado` y `revisarAntes`, y ejecuta `npm test` y `npm run verificar`.
5. Si cambia la fórmula (no solo las cifras), actualiza `calculo.js` y los tests de `verificacion/calculo.test.js` con los casos calculados a mano.

## Fuera del alcance actual (no calculado)
Base máxima y pensión máxima, pensiones mínimas, complemento de maternidad/brecha de género, coeficiente por demora, cálculo de la propia base reguladora (25 años → 29 años, 2026-2037), revalorización, jubilación flexible y activa.
