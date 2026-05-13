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
- **Cálculo de la pensión ordinaria** según el porcentaje que corresponde por años cotizados (escala 0,21% y 0,19% por mes extra hasta el 100%).
- **Gráfico de barras comparativo** (Chart.js) entre pensión ordinaria y con anticipación.
- **Modo oscuro/claro** persistente (detecta preferencia del sistema y permite cambio manual).
- **Diseño responsive** y moderno (glassmorphism, sliders táctiles, validaciones en tiempo real).
- **Avisos inteligentes** si no se cumplen los requisitos mínimos (edad, años cotizados, límites de adelanto).

## 🧮 Fórmulas y normativa aplicada

- **Edad ordinaria de jubilación 2026**: 65 años si se han cotizado al menos 38 años y 3 meses; en caso contrario 66 años y 10 meses.
- **Porcentaje de la base reguladora**:
  - 15 años cotizados → 50%
  - Por cada mes adicional (hasta 146 meses) → +0,21%
  - A partir del mes 147 → +0,19% hasta alcanzar el 100%
- **Coeficientes reductores**:
  - **Anticipada voluntaria**: adelanto máximo 24 meses. Tabla por tramos de cotización (similar a la involuntaria pero con porcentajes distintos).
  - **Anticipada involuntaria**: adelanto máximo 48 meses. Tabla oficial extraída del PDF proporcionado, con valores exactos para cada mes y tramo.

## 🛠️ Tecnologías utilizadas

- HTML5 semántico
- CSS3 (variables CSS, flexbox, grid, media queries)
- JavaScript vanilla (ES6+)
- [Chart.js](https://www.chart.js/) para gráficos interactivos
- Fuente del sistema (Inter / SF Pro / Segoe UI)


