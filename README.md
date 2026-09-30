# 📊 Simulador de Jubilación España 2026

Aplicación web interactiva que calcula la pensión de jubilación anticipada (voluntaria o involuntaria) según la normativa española vigente en 2026. El simulador aplica los coeficientes reductores oficiales y muestra una comparativa gráfica con la jubilación ordinaria.



## ✨ Características

- **Cálculo personalizado** a partir de:
  - Base reguladora (euros/mes)
  - Años cotizados totales
  - Meses de adelanto (0 a 48)
  - Tipo de anticipación: voluntaria (máx 24 meses) o involuntaria (máx 48 meses)
- **Coeficientes reductores exactos**:
  - Involuntaria: tabla oficial mes a mes (extraída del PDF normativo) con 4 tramos de cotización.
  - Voluntaria: tabla legal 2026 con interpolación para meses intermedios.
- **Cálculo de la pensión ordinaria** según el porcentaje que corresponde por años cotizados (50% a los 15 años + escala mensual 0,21%/0,19% hasta el 100%, según el año).
- **Gráfico de barras comparativo** (Chart.js) entre pensión ordinaria y con anticipación.
- **Modo oscuro/claro** persistente (detecta preferencia del sistema y permite cambio manual).
- **Diseño responsive** y moderno (glassmorphism, sliders táctiles, validaciones en tiempo real).
- **Avisos inteligentes** si no se cumplen los requisitos mínimos (edad, años cotizados, límites de adelanto).

## 🧮 Fórmulas y normativa aplicada

- **Edad ordinaria de jubilación 2026**: 65 años si se han cotizado al menos 38 años y 3 meses; en caso contrario 66 años y 8 meses (67 años desde 2027).
- **Porcentaje de la base reguladora** (art. 210 y DT 9ª LGSS):
  - 15 años cotizados → 50%
  - 2026: +0,21% los primeros 49 meses adicionales y +0,19% los 209 siguientes → 100% con 36 años y 6 meses
  - 2027 en adelante: +0,19% los primeros 248 meses y +0,18% los 16 siguientes → 100% con 37 años
- **Coeficientes reductores**:
  - **Anticipada voluntaria**: adelanto máximo 24 meses. Tabla por tramos de cotización (similar a la involuntaria pero con porcentajes distintos).
  - **Anticipada involuntaria**: adelanto máximo 48 meses. Tabla heredada de un PDF; **pendiente de contrastar con el BOE**.

## 🛠️ Tecnologías utilizadas

- HTML5 semántico
- CSS3 (variables CSS, flexbox, grid, media queries)
- JavaScript vanilla (ES6+)
- [Chart.js](https://www.chart.js/) para gráficos interactivos
- Fuente del sistema (Inter / SF Pro / Segoe UI)




## ✅ Verificación de la normativa

Los parámetros legales están aislados en `legislacion.js` (con fuente, vigencia y estado de verificación) y la lógica en `calculo.js`.

```bash
npm test            # tests del cálculo + integridad + humo de la web (Node ≥ 20)
npm run verificar   # informe: errores de coherencia y avisos (datos sin contrastar, revisión caducada)
```

Comprueba, entre otras cosas, que las escalas suman 100%, que las tablas están completas y son monótonas, los límites de los tramos de cotización, los requisitos de acceso y que existan parámetros del año en curso. Una GitHub Action lo ejecuta en cada push y el día 1 de cada mes. Procedimiento de actualización: [`docs/CHECKLIST-LEGISLACION.md`](docs/CHECKLIST-LEGISLACION.md).
