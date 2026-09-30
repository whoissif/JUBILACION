// Las cifras legales viven en legislacion.js y la lógica en calculo.js (verificados con `npm test`).
const TIPO = { voluntary: 'voluntaria', involuntary: 'involuntaria' };

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
    const anos = parseFloat(yearsInput.value);
    const mesesAdelanto = parseInt(monthsSlider.value);
    if (isNaN(base) || isNaN(anos)) return;

    const r = CALCULO.calcular({ base, anos, mesesAdelanto, tipo: TIPO[currentType] });
    if (r.error) {
        warningDiv.style.display = 'block';
        warningDiv.innerText = r.error;
        resultArea.innerHTML = `<p style="color:var(--danger)">${r.error}</p>`;
        if (chartInstance) chartInstance.destroy();
        return;
    }
    warningDiv.style.display = 'none';
    const { pctBase, ordinaria: pensionOrdinaria, final: pensionFinal, coef: reduccion } = r;
    const tipo = currentType;

    resultArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap;">
            <div><strong>💼 Pensión ordinaria</strong><br><span class="pension-number">${pensionOrdinaria.toFixed(2)} €/mes</span><br><small>${pctBase.toFixed(1)}% BR</small></div>
            <div><strong>⚡ Pensión con anticipación</strong><br><span class="pension-number" style="color:${reduccion>0?'#e05561':'#2c9e6b'}">${pensionFinal.toFixed(2)} €/mes</span><br>
            ${reduccion>0? `<span class="reduction-badge">-${reduccion.toFixed(2)}%</span>` : '<span>Sin reducción</span>'}
            </div>
        </div>
        <hr style="margin:1rem 0; border-color:var(--border)">
        <div><small>📌 Edad ordinaria ${LEGISLACION.anioPorDefecto}: ${r.edadOrdinaria.texto}</small></div>
    `;
    detailSpan.innerHTML = `🏷️ ${tipo === 'voluntary' ? 'Anticipada voluntaria' : 'Anticipada involuntaria'} · Adelanto ${mesesAdelanto} meses · ${anos} años cotizados (tramo ${r.tramo+1}/4).`;

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