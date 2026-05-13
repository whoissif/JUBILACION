document.getElementById('calcBtn').addEventListener('click', calculate);

function calculate() {
    const baseReg = parseFloat(document.getElementById('baseReg').value);
    const anosCot = parseFloat(document.getElementById('anosCot').value);
    const mesesAdelanto = parseInt(document.getElementById('mesesAdelanto').value);

    // 1. Determinar Edad Ordinaria 2026
    // Regla: 65 años si >= 38a 3m cotizados. Si no, 66a 10m.
    const edadOrd = anosCot >= 38.25 ? "65 años" : "66 años y 10 meses";
    document.getElementById('edadOrdText').innerText = edadOrd;

    // 2. Porcentaje de Base según años cotizados
    // 15 años = 50%. A partir de ahí, se suma % mensual hasta llegar al 100% (aprox 36.5 años)
    let pctBase = 0;
    if (anosCot >= 15) {
        pctBase = 50;
        if (anosCot > 15) {
            // Simplificación basada en el cálculo de 2026 (aprox 0.19% por mes extra hasta 36.5a)
            const mesesExtra = (anosCot - 15) * 12;
            pctBase += mesesExtra * 0.1938;
        }
    }
    pctBase = Math.min(pctBase, 100);
    document.getElementById('pctBaseText').innerText = pctBase.toFixed(2) + "%";

    const pensionTeorica = baseReg * (pctBase / 100);

    const opciones = [];

    // OPCIÓN A: ORDINARIA
    opciones.push({
        tipo: "Jubilación Ordinaria",
        pension: pensionTeorica,
        reduccion: 0,
        meses: 0,
        req: "Haber alcanzado la edad legal.",
        color: ""
    });

    // OPCIÓN B: ANTICIPADA VOLUNTARIA (Máx 24 meses / Mín 35 años cotizados)
    if (anosCot >= 35 && mesesAdelanto > 0 && mesesAdelanto <= 24) {
        const coef = getCoeficiente(anosCot, mesesAdelanto, "voluntaria");
        opciones.push({
            tipo: "Anticipada Voluntaria",
            pension: pensionTeorica * (1 - coef / 100),
            reduccion: coef,
            meses: mesesAdelanto,
            req: "Cese voluntario. Mínimo 35 años cotizados.",
            color: ""
        });
    }

    // OPCIÓN C: ANTICIPADA INVOLUNTARIA (Máx 48 meses / Mín 33 años cotizados)
    if (anosCot >= 33 && mesesAdelanto > 0 && mesesAdelanto <= 48) {
        const coef = getCoeficiente(anosCot, mesesAdelanto, "involuntaria");
        opciones.push({
            tipo: "Anticipada Involuntaria",
            pension: pensionTeorica * (1 - coef / 100),
            reduccion: coef,
            meses: mesesAdelanto,
            req: "Cese por ERE o despido objetivo. Mínimo 33 años cotizados.",
            color: ""
        });
    }

    renderOptions(opciones);
}

// Lógica de coeficientes reductores según tablas 2026
function getCoeficiente(anos, meses, tipo) {
    let tramo = 0; // 0: <38.5, 1: 38.5-41.5, 2: 41.5-44.5, 3: >44.5
    if (anos >= 44.5) tramo = 3;
    else if (anos >= 41.5) tramo = 2;
    else if (anos >= 38.5) tramo = 1;

    if (tipo === "voluntaria") {
        // Ejemplo simplificado de las tablas suministradas (PDF Voluntaria)
        const tablaV = [
            {24: 21.00, 12: 5.50, 1: 3.26}, // <38.5
            {24: 19.00, 12: 5.25, 1: 3.11}, // 38.5-41.5
            {24: 17.00, 12: 5.00, 1: 2.96}, // 41.5-44.5
            {24: 13.00, 12: 4.75, 1: 2.81}  // >44.5
        ];
        // Aproximación lineal para meses intermedios (en la app real sería la tabla completa)
        if (meses >= 24) return tablaV[tramo][24];
        if (meses >= 12) return tablaV[tramo][12] + (meses-12)*((tablaV[tramo][24]-tablaV[tramo][12])/12);
        return tablaV[tramo][1] * meses;
    } else {
        // Tablas Involuntaria (Adelanto hasta 4 años / 48 meses)
        const tablaI = [
            {48: 30.00, 24: 15.00}, // <38.5
            {48: 28.00, 24: 14.00}, // 38.5-41.5
            {48: 26.00, 24: 13.00}, // 41.5-44.5
            {48: 24.00, 24: 12.00}  // >44.5
        ];
        if (meses >= 48) return tablaI[tramo][48];
        return (meses/48) * tablaI[tramo][48];
    }
}

function renderOptions(opciones) {
    const grid = document.getElementById('optionsGrid');
    const container = document.getElementById('resultsSection');
    grid.innerHTML = "";
    container.style.display = 'block';

    // Encontrar la mejor opción (pension más alta)
    const bestValue = Math.max(...opciones.map(o => o.pension));

    opciones.forEach(opt => {
        const isBest = opt.pension === bestValue;
        const card = document.createElement('div');
        card.className = `option-card card ${isBest ? 'recommended' : ''}`;
        
        card.innerHTML = `
            ${isBest ? '<div class="badge-best">Más Ventajosa</div>' : ''}
            <h3>${opt.tipo}</h3>
            <p class="details">${opt.meses > 0 ? 'Adelanto de ' + opt.meses + ' meses' : 'Sin adelanto'}</p>
            <div class="price">${opt.pension.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</div>
            <p class="reduction">Reducción aplicada: ${opt.reduccion.toFixed(2)}%</p>
            <p class="details" style="margin-top: 15px;">${opt.req}</p>
        `;
        grid.appendChild(card);
    });
}
