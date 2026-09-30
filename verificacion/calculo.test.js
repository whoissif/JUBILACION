const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../calculo.js');
const { verificar } = require('./integridad.js');

const cerca = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) <= e, `${a} ≠ ${b}`);

test('integridad de legislacion.js sin errores', () => {
    const { errores } = verificar();
    assert.deepEqual(errores, []);
});

test('edad ordinaria 2026: 65 años con 38a3m; 66a8m si no', () => {
    assert.equal(C.edadOrdinaria(38.25, 2026).texto, '65 años');
    assert.equal(C.edadOrdinaria(38.17, 2026).texto, '66 años y 8 meses'); // 38a2m
    assert.equal(C.edadOrdinaria(30, 2026).texto, '66 años y 8 meses');
});

test('edad ordinaria 2027: 67 años (65 con 38a6m)', () => {
    assert.equal(C.edadOrdinaria(38.5, 2027).texto, '65 años');
    assert.equal(C.edadOrdinaria(30, 2027).texto, '67 años');
});

test('% base reguladora 2026', () => {
    assert.equal(C.porcentajeBase(14.9, 2026), 0);
    assert.equal(C.porcentajeBase(15, 2026), 50);
    cerca(C.porcentajeBase(16, 2026), 50 + 12 * 0.21);
    cerca(C.porcentajeBase(20, 2026), 50 + 49 * 0.21 + 11 * 0.19);
    assert.equal(C.porcentajeBase(36.5, 2026), 100); // 36 años y 6 meses
    assert.equal(C.porcentajeBase(36.4, 2026) < 100, true);
    assert.equal(C.porcentajeBase(45, 2026), 100);
});

test('% base reguladora 2027: 100% con 37 años', () => {
    assert.equal(C.porcentajeBase(37, 2027), 100);
    assert.ok(C.porcentajeBase(36.5, 2027) < 100);
});

test('tramos de cotización en los límites (38a6m, 41a6m, 44a6m)', () => {
    assert.equal(C.indiceTramo(38 * 12 + 5), 0);
    assert.equal(C.indiceTramo(38 * 12 + 6), 1);
    assert.equal(C.indiceTramo(41 * 12 + 6), 2);
    assert.equal(C.indiceTramo(44 * 12 + 6), 3);
});

test('coeficientes de control', () => {
    assert.equal(C.coeficiente('voluntaria', 24, 36), 21);
    assert.equal(C.coeficiente('voluntaria', 24, 45), 13);
    assert.equal(C.coeficiente('involuntaria', 48, 36), 30);
    assert.equal(C.coeficiente('involuntaria', 12, 36), 5.5);
    assert.equal(C.coeficiente('involuntaria', 0, 36), 0);
});

test('requisitos de acceso a anticipada', () => {
    assert.ok(C.calcular({ base: 2000, anos: 34, mesesAdelanto: 12, tipo: 'voluntaria' }).error);
    assert.ok(C.calcular({ base: 2000, anos: 35, mesesAdelanto: 12, tipo: 'voluntaria' }).final > 0);
    assert.ok(C.calcular({ base: 2000, anos: 32.9, mesesAdelanto: 12, tipo: 'involuntaria' }).error);
    assert.ok(C.calcular({ base: 2000, anos: 33, mesesAdelanto: 12, tipo: 'involuntaria' }).final > 0);
    assert.ok(C.calcular({ base: 2000, anos: 40, mesesAdelanto: 25, tipo: 'voluntaria' }).error);
    assert.ok(C.calcular({ base: 2000, anos: 14, tipo: 'voluntaria' }).error);
});

test('caso completo', () => {
    const r = C.calcular({ base: 2100, anos: 39, mesesAdelanto: 24, tipo: 'voluntaria' });
    cerca(r.pctBase, 100);
    cerca(r.final, 2100 * (1 - 0.19));
});
