// Humo: la web carga legislacion.js + calculo.js + script.js con un DOM simulado y calcula sin fallar.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('script.js ejecuta el cálculo con los módulos legales', () => {
    const valores = { baseReg: '2100', years: '39', monthsSlider: '24' };
    const el = id => ({
        value: valores[id], innerText: '', innerHTML: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
        addEventListener() {}, getContext: () => ({})
    });
    const nodos = {};
    const ctx = {
        document: { getElementById: id => (nodos[id] ||= el(id)), querySelectorAll: () => [], body: { classList: { toggle() {}, contains: () => false } } },
        Chart: function () { this.destroy = () => {}; }
    };
    ctx.self = ctx;
    vm.createContext(ctx);
    for (const f of ['legislacion.js', 'calculo.js', 'script.js'])
        vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
    assert.match(nodos.resultArea.innerHTML, /Pensión ordinaria/);
    assert.match(nodos.resultArea.innerHTML, /66 años y 10 meses|65 años/);
});
