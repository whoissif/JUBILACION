/*
 * Comprobaciones de integridad de legislacion.js. Devuelve { errores, avisos }.
 *  - errores: incoherencias que invalidan el cálculo (rompen `npm run verificar`).
 *  - avisos: cosas a revisar por una persona (datos sin contrastar, irregularidades, caducidad).
 */
const LEY = require('../legislacion.js');

const EPS = 1e-6;

function verificar(hoy = new Date()) {
    const errores = [], avisos = [];

    // 1. Escalas del % de base reguladora: deben sumar exactamente 100 %.
    for (const [anio, p] of Object.entries(LEY.porAnio)) {
        const e = p.escalaBase;
        const total = e.porcentajeInicial + e.tramos.reduce((s, t) => s + t.meses * t.pct, 0);
        if (Math.abs(total - 100) > EPS) errores.push(`Escala ${anio}: suma ${total}% (debe ser 100%)`);
        if (p.verificado !== 'contrastado') avisos.push(`Parámetros ${anio} sin contrastar con el BOE`);
    }

    // 2. Edad ordinaria: no puede bajar de un año al siguiente.
    const anios = Object.keys(LEY.porAnio).map(Number).sort();
    for (let i = 1; i < anios.length; i++) {
        const [a0, m0] = LEY.porAnio[anios[i - 1]].edadOrdinaria.edadGeneral;
        const [a1, m1] = LEY.porAnio[anios[i]].edadOrdinaria.edadGeneral;
        if (a1 * 12 + m1 < a0 * 12 + m0) errores.push(`Edad ordinaria decrece entre ${anios[i - 1]} y ${anios[i]}`);
    }

    // 3. Tablas de coeficientes.
    for (const tipo of ['voluntaria', 'involuntaria']) {
        const { tabla, verificado } = LEY.coeficientes[tipo];
        const max = LEY.anticipada[tipo].maxMeses;
        if (verificado !== 'contrastado')
            avisos.push(`Tabla de coeficientes ${tipo}: valores sin contrastar con el BOE`);
        for (let m = 1; m <= max; m++) {
            const f = tabla[m];
            if (!f || f.length !== 4 || f.some(x => typeof x !== 'number' || x < 0 || x > 100)) {
                errores.push(`Tabla ${tipo}: fila ${m} ausente o no válida`);
                continue;
            }
            for (let t = 1; t < 4; t++)
                if (f[t] > f[t - 1] + EPS) errores.push(`Tabla ${tipo}, ${m} meses: más cotización no puede penalizar más (tramo ${t + 1})`);
            if (m > 1 && tabla[m - 1] && f.some((x, t) => x < tabla[m - 1][t] - EPS))
                errores.push(`Tabla ${tipo}: coeficiente decrece al pasar de ${m - 1} a ${m} meses`);
        }
        for (const m of Object.keys(tabla).map(Number))
            if (m < 1 || m > max) errores.push(`Tabla ${tipo}: fila fuera de rango (${m})`);

        // Irregularidades: el incremento mes a mes debería ser estable; se señalan saltos atípicos.
        // (solo si la tabla no está contrastada: verificacion/boe.js ya la compara con el BOE)
        for (let t = 0; verificado !== 'contrastado' && t < 4; t++) {
            const inc = [];
            for (let m = 2; m <= max; m++) inc.push(tabla[m][t] - tabla[m - 1][t]);
            const med = inc.slice().sort((a, b) => a - b)[Math.floor(inc.length / 2)];
            inc.forEach((d, i) => {
                if (Math.abs(d - med) > Math.max(0.6, med)) {
                    avisos.push(`Tabla ${tipo}, tramo ${t + 1}: salto atípico ${tabla[i + 1][t].toFixed(2)}→${tabla[i + 2][t].toFixed(2)} al pasar de ${i + 1} a ${i + 2} meses (¿errata?)`);
                }
            });
        }
    }

    // 4. Valores de control (anclas) contrastados con el BOE.
    for (const [tipo, meses, esperado] of LEY.coeficientes.anclas) {
        const f = LEY.coeficientes[tipo].tabla[meses];
        if (!f || f.some((x, i) => Math.abs(x - esperado[i]) > 0.005))
            errores.push(`Ancla ${tipo}/${meses} meses: tabla ${JSON.stringify(f)} ≠ oficial ${JSON.stringify(esperado)}`);
    }

    // 5. Caducidad de la revisión legislativa.
    if (hoy > new Date(LEY.revisarAntes))
        avisos.push(`Revisión legislativa caducada (${LEY.revisarAntes}). Repasa docs/CHECKLIST-LEGISLACION.md`);
    const anioHoy = hoy.getFullYear();
    if (!LEY.porAnio[anioHoy] && anioHoy > Math.max(...anios))
        errores.push(`No hay parámetros para el año en curso (${anioHoy})`);

    return { errores, avisos };
}

module.exports = { verificar };

if (require.main === module) {
    const { errores, avisos } = verificar();
    avisos.forEach(a => console.log('AVISO  ' + a));
    errores.forEach(e => console.log('ERROR  ' + e));
    console.log(`\n${errores.length} errores, ${avisos.length} avisos`);
    process.exit(errores.length ? 1 : 0);
}
