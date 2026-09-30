// Pruebas sin red del analizador del BOE (formato de las tablas de la API de datos abiertos).
const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('./boe.js');

test('descargar toma la última versión y calcula huella', async () => {
    const xml = `<response><status><code>200</code></status><data>
        <version fecha_vigencia="20160102"><p>viejo</p></version>
        <version fecha_vigencia="20250401"><p>nuevo</p><table><tr><td><p>48</p></td><td><p>30,00</p></td></tr></table></version></data></response>`;
    const d = await B.descargar('a207', async () => ({ ok: true, text: async () => xml }));
    assert.equal(d.vigencia, '20250401');
    assert.match(d.texto, /nuevo/);
    assert.doesNotMatch(d.texto, /viejo/);
    assert.deepEqual(d.filas, [['48', '30,00']]);
    assert.equal(d.sha256.length, 64);
});

test('tablaCoeficientes ignora cabeceras y lee filas de 5 celdas', () => {
    const filas = [['Meses', '% reducción', '% reducción', '% reducción', '% reducción'], ['24', '21,00', '19,00', '17,00', '13,00'], ['1', '3,26', '3,11', '2,96', '2,81']];
    assert.deepEqual(B.tablaCoeficientes(filas), { 24: [21, 19, 17, 13], 1: [3.26, 3.11, 2.96, 2.81] });
});

test('edadesDT7 interpreta años con celda combinada y "a partir de 2027"', () => {
    const filas = [
        ['2026', '38 años y 3 meses o más.', '65 años.'], ['Menos de 38 años y 3 meses.', '66 años y 10 meses.'],
        ['A partir del año 2027', '38 años y 6 meses o más.', '65 años.'], ['Menos de 38 años y 6 meses.', '67 años.']
    ];
    assert.deepEqual(B.edadesDT7(filas), {
        2026: { umbral: 459, menor: 780, general: 802 },
        2027: { umbral: 462, menor: 780, general: 804 }
    });
});

test('escalasDT9 extrae los tramos mensuales', () => {
    const filas = [['Durante los años 2023 a 2026.', 'Por cada mes adicional de cotización entre los meses 1 y 49, el 0,21 por ciento y por cada uno de los 209 meses siguientes, el 0,19 por ciento.']];
    assert.deepEqual(B.escalasDT9(filas), { 'Durante los años 2023 a 2026.': { m1: 49, p1: 0.21, m2: 209, p2: 0.19 } });
});

test('descargar falla si la API no responde 200', async () => {
    await assert.rejects(B.descargar('a207', async () => ({ ok: true, text: async () => '<response><status><code>400</code></status></response>' })), /respuesta no válida/);
});
