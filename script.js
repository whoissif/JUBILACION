// ----- TABLA COMPLETA INVOLUNTARIA (extraída del PDF) -----
const involTable = {
    48: [30.00,28.00,26.00,24.00], 47: [29.38,27.42,25.46,23.50],
    46: [28.75,26.83,24.92,23.00], 45: [28.13,26.25,24.38,22.50],
    44: [27.50,25.67,23.83,22.00], 43: [26.88,25.08,23.29,21.50],
    42: [26.25,24.50,22.75,21.00], 41: [25.63,23.92,22.21,20.50],
    40: [25.00,23.33,21.67,20.00], 39: [24.38,22.75,21.13,19.50],
    38: [23.75,22.17,20.58,19.00], 37: [23.13,21.58,20.04,18.50],
    36: [22.50,21.00,19.50,18.00], 35: [21.88,20.42,18.96,17.50],
    34: [21.25,19.83,18.42,17.00], 33: [20.63,19.25,17.88,16.50],
    32: [20.00,18.67,17.33,16.00], 31: [19.38,18.08,16.79,15.50],
    30: [18.75,17.50,16.25,15.00], 29: [18.13,16.92,15.71,14.50],
    28: [17.50,16.33,15.17,14.00], 27: [16.88,15.75,14.63,13.50],
    26: [16.25,15.17,14.08,13.00], 25: [15.63,14.58,13.54,12.50],
    24: [15.00,14.00,13.00,12.00], 23: [14.38,13.42,12.46,11.50],
    22: [13.75,12.83,11.92,11.00], 21: [12.57,12.00,11.38,10.00],
    20: [11.00,10.50,10.00,9.20],  19: [9.78,9.33,8.89,8.40],
    18: [8.80,8.40,8.00,7.60],    17: [8.00,7.64,7.27,6.91],
    16: [7.33,7.00,6.67,6.33],    15: [6.77,6.46,6.15,5.85],
    14: [6.29,6.00,5.71,5.43],    13: [5.87,5.60,5.33,5.07],
    12: [5.50,5.25,5.00,4.75],    11: [5.18,4.94,4.71,4.47],
    10: [4.89,4.67,4.44,4.22],    9: [4.63,4.42,4.21,4.00],
    8: [4.40,4.20,4.00,3.80],     7: [4.19,4.00,3.81,3.62],
    6: [3.75,3.50,3.25,3.00],     5: [3.13,2.92,2.71,2.50],
    4: [2.50,2.33,2.17,2.00],     3: [1.88,1.75,1.63,1.50],
    2: [1.25,1.17,1.08,1.00],     1: [0.63,0.58,0.54,0.50]
};

// Coeficientes voluntaria (hasta 24 meses)
const volTable = {
    24: [21.00,19.00,17.00,13.00], 23: [20.00,18.13,16.25,12.38],
    22: [19.00,17.25,15.50,11.75], 21: [18.00,16.38,14.75,11.13],
    20: [17.00,15.50,14.00,10.50], 19: [16.00,14.63,13.25,9.88],
    18: [15.00,13.75,12.50,9.25],  17: [14.00,12.88,11.75,8.63],
    16: [13.00,12.00,11.00,8.00],  15: [12.00,11.13,10.25,7.38],
    14: [11.00,10.25,9.50,6.75],   13: [10.00,9.38,8.75,6.13],
    12: [9.00,8.50,8.00,5.50],     11: [8.17,7.75,7.33,5.04],
    10: [7.33,7.00,6.67,4.58],     9: [6.50,6.25,6.00,4.13],
    8: [5.67,5.50,5.33,3.67],      7: [4.83,4.75,4.67,3.21],
    6: [4.00,4.00,4.00,2.75],      5: [3.25,3.25,3.25,2.25],
    4: [2.50,2.50,2.50,1.75],      3: [1.75,1.75,1.75,1.25],
    2: [1.00,1.00,1.00,0.75],      1: [0.50,0.50,0.50,0.50]
};
// Rellenar huecos simples (por si acaso)
for(let i=1;i<=24;i++) if(!volTable[i]) volTable[i]=volTable[24];

function getTramo(anos) {
    if (anos >= 44.5) return 3;
    if (anos >= 41.5) return 2;
    if (anos >= 38.5) return 1;
    return 0;
}

function getCoeficiente(tipo, meses, anos) {
    const tramo = getTramo(anos);
    if (tipo === 'involuntary') {
        if (meses < 1) return 0;
        if (meses > 48) meses = 48;
        const entry = involTable[meses];
        if (entry) return entry[tramo];
        // interpolación simple
        const prev = Math.floor(meses);
        const next = prev + 1;
        if(involTable[prev] && involTable[next]) {
            let p = involTable[prev][tramo];
            let n = involTable[next][tramo];
            let frac = (meses - prev) / (next - prev);
            return p + (n-p)*frac;
        }
        return involTable[24]?.[tramo] || 15;
    } 
    else { // voluntary
        if (meses < 1) return 0;
        if (meses > 24) meses = 24;
        const entry = volTable[meses];
        if (entry) return entry[tramo];
        return volTable[24]?.[tramo] || 13;
    }
}

// Porcentaje de base reguladora según años cotizados (normativa 2026)
function getPorcentajeBase(anos) {
    if (anos < 15) return 0;
    let mesesTot = anos * 12;
    let pct = 50;
    let mesesExtra = mesesTot - 180;
    if (mesesExtra > 0) {
        if (mesesExtra <= 146) pct += mesesExtra * 0.21;
        else {
            pct += 146 * 0.21;
            mesesExtra -= 146;
            pct += mesesExtra * 0.19;
        }
    }
    return Math.min(pct, 100);
}

let chartInstance = null;
let currentType = 'involuntary';

// Elementos DOM
const baseInput = document.getElementById('baseReg');
const yearsInput = document.getElementById('years');
const monthsSlider = document.getElementById('monthsSlider');
const monthsValue = document.getElementById('monthsValue');
const typeRadios = document.querySelectorAll('.radio-option');
const calcBtn = document.getElementById('calcBtn');
const warningDiv = document.getElementById('warningMsg');
const resultArea = document.getElementById('resultArea');
const detailSpan = document.getElementById('detailInfo');
const canvas = document.getElementById('pensionChart');

monthsSlider.addEventListener('input', () => {
    monthsValue.innerText = monthsSlider.value;
});

typeRadios.forEach(radio => {
    radio.addEventListener('click', () => {
        typeRadios.forEach(r => r.classList.remove('active'));
        radio.classList.add('active');
        currentType = radio.dataset.type === 'voluntary' ? 'voluntary' : 'involuntary';
        let maxMeses = currentType === 'voluntary' ? 24 : 48;
        if (parseInt(monthsSlider.value) > maxMeses) {
            monthsSlider.value = maxMeses;
            monthsValue.innerText = maxMeses;
        }
        monthsSlider.max = maxMeses;
        calcular();
    });
});

function calcular() {
    const base = parseFloat(baseInput.value);
    let anos = parseFloat(yearsInput.value);
    let mesesAdelanto = parseInt(monthsSlider.value);
    const tipo = currentType;

    if (isNaN(base) || isNaN(anos)) return;
    if (anos < 15) {
        warningDiv.style.display = 'block';
        warningDiv.innerText = '⚠️ Mínimo 15 años cotizados para acceder a pensión contributiva.';
        resultArea.innerHTML = '<p style="color:var(--danger)">No cumple requisitos mínimos</p>';
        if(chartInstance) chartInstance.destroy();
        return;
    } else warningDiv.style.display = 'none';

    let errorMsg = null;
    if (mesesAdelanto > 0) {
        if (tipo === 'voluntary' && (anos < 35 || mesesAdelanto > 24)) 
            errorMsg = 'Jubilación voluntaria: mínimo 35 años cotizados y adelanto ≤ 24 meses';
        if (tipo === 'involuntary' && (anos < 33 || mesesAdelanto > 48)) 
            errorMsg = 'Jubilación involuntaria: mínimo 33 años cotizados y adelanto ≤ 48 meses';
    }
    if (errorMsg) {
        warningDiv.style.display = 'block';
        warningDiv.innerText = errorMsg;
        resultArea.innerHTML = `<p style="color:var(--danger)">${errorMsg}</p>`;
        if(chartInstance) chartInstance.destroy();
        return;
    }

    const pctBase = getPorcentajeBase(anos);
    const pensionOrdinaria = base * (pctBase / 100);
    let pensionFinal = pensionOrdinaria;
    let reduccion = 0;
    if (mesesAdelanto > 0) {
        const coef = getCoeficiente(tipo, mesesAdelanto, anos);
        reduccion = coef;
        pensionFinal = pensionOrdinaria * (1 - coef/100);
    }

    resultArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap;">
            <div><strong>💼 Pensión ordinaria</strong><br><span class="pension-number">${pensionOrdinaria.toFixed(2)} €/mes</span><br><small>${pctBase.toFixed(1)}% BR</small></div>
            <div><strong>⚡ Pensión con anticipación</strong><br><span class="pension-number" style="color:${reduccion>0?'#e05561':'#2c9e6b'}">${pensionFinal.toFixed(2)} €/mes</span><br>
            ${reduccion>0? `<span class="reduction-badge">-${reduccion.toFixed(2)}%</span>` : '<span>Sin reducción</span>'}
            </div>
        </div>
        <hr style="margin:1rem 0; border-color:var(--border)">
        <div><small>📌 Edad ordinaria 2026: ${anos >= 38.25 ? '65 años' : '66 años y 10 meses'}</small></div>
    `;
    detailSpan.innerHTML = `🏷️ ${tipo === 'voluntary' ? 'Anticipada voluntaria' : 'Anticipada involuntaria'} · Adelanto ${mesesAdelanto} meses · ${anos} años cotizados (tramo ${getTramo(anos)+1}/4).`;

    if (chartInstance) chartInstance.destroy();
    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jubilación ordinaria', 'Con anticipación'],
            datasets: [{
                label: 'Pensión mensual (€)',
                data: [pensionOrdinaria, pensionFinal],
                backgroundColor: ['#2266cc', reduccion>0 ? '#e05561' : '#2c9e6b'],
                borderRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(2)} €` } }
            }
        }
    });
}

// Tema oscuro
const themeBtn = document.getElementById('themeToggle');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeBtn.innerText = document.body.classList.contains('dark') ? '☀️ Modo claro' : '🌙 Modo oscuro';
});

calcBtn.addEventListener('click', calcular);
// Ejecutar al cargar
calcular();