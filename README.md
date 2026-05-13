# Simulador de Jubilación España 2026

## Descripción
Esta aplicación web es un simulador diseñado para ayudar a los trabajadores españoles a comprender el impacto económico de la jubilación anticipada. Basada en la normativa vigente para 2026 (Ley 21/2021 y coeficientes reductores asociados), la herramienta permite calcular cómo varía la pensión en función de la edad de jubilación y los años cotizados.

## Características principales
- **Cálculo de Pensión:** Determina la pensión estimada basándose en la Base Reguladora media de los últimos 25 años.
- **Simulación de Anticipación:** Aplica automáticamente los coeficientes reductores legales según los meses de anticipación (voluntaria e involuntaria).
- **Interfaz Intuitiva:** Diseño limpio y enfocado en la experiencia del usuario, con notas aclaratorias para evitar errores comunes de concepto (diferencia entre sueldo y Base Reguladora).
- **Actualización 2026:** Integración de los parámetros legales vigentes para el año 2026.

## Cómo funciona
1. **Entrada de Datos:**
    - **Base Reguladora:** Debe ingresarse la media de las bases de cotización de los últimos 25 años.
    - **Años Cotizados:** Total de años computables para el cálculo de la pensión.
    - **Meses de Anticipación:** Número de meses que se desea adelantar la jubilación respecto a la edad legal ordinaria.
2. **Procesamiento:** El motor de cálculo (`script.js`) aplica el porcentaje de pensión correspondiente y ajusta la cifra final mediante la tabla de coeficientes reductores.
3. **Resultados:** Muestra la comparación clara entre la pensión en jubilación ordinaria y la pensión tras aplicar la penalización por jubilación anticipada.

## Tecnologías utilizadas
- **HTML5**: Estructura semántica.
- **CSS3**: Diseño responsivo y estilizado.
- **JavaScript (ES6+)**: Lógica de cálculo y manipulación del DOM.

## Estructura del Proyecto
- `index.html`: Página principal con el formulario de entrada.
- `styles.css`: Hojas de estilo para la interfaz.
- `script.js`: Lógica de negocio y cálculos de pensiones.

## Aviso Legal
Esta herramienta es meramente informativa. Los resultados son estimaciones basadas en la normativa publicada y no constituyen una asesoría jurídica ni vinculante. Para decisiones definitivas, se recomienda consultar directamente con el Instituto Nacional de la Seguridad Social (INSS).

## Instalación y Ejecución
1. Clona este repositorio: `git clone [url-del-repositorio]`
2. Abre el archivo `index.html` directamente en tu navegador.
3. No requiere compilación ni servidor backend para su funcionamiento básico.

---
*Desarrollado para facilitar la comprensión de las pensiones en el sistema español.*
