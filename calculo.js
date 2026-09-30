/*
 * Lógica de cálculo pura (sin DOM). Toda cifra legal sale de legislacion.js.
 * Los importes se calculan en meses cotizados enteros para evitar errores de coma flotante.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./legislacion.js'));
    else root.CALCULO = factory(root.LEGISLACION);
})(typeof self !== 'undefined' ? self : this, function (LEY) {

    function parametrosAnio(anio) {
        const anios = Object.keys(LEY.porAnio).map(Number).sort((a, b) => a - b);
        const usado = anios.filter(a => a <= anio).pop();
        if (usado === undefined) throw new Error('Sin parámetros legales para el año ' + anio);
        return { anio: usado, ...LEY.porAnio[usado] };
    }

    const aMeses = anos => Math.round(anos * 12);

    function indiceTramo(mesesCotizados) {
        const l = LEY.tramosCotizacion.limitesMeses;
        let t = 0;
        for (let i = 0; i < l.length; i++) if (mesesCotizados >= l[i]) t = i;
        return t;
    }

    function edadOrdinaria(anos, anio) {
        const e = parametrosAnio(anio).edadOrdinaria;
        const [a, m] = aMeses(anos) >= e.mesesCotizadosParaEdadMenor ? e.edadMenor : e.edadGeneral;
        return { anos: a, meses: m, texto: m ? `${a} años y ${m} meses` : `${a} años` };
    }

    function porcentajeBase(anos, anio) {
        const totalMeses = aMeses(anos);
        if (totalMeses < LEY.minMesesCotizadosPension) return 0;
        const esc = parametrosAnio(anio).escalaBase;
        let restantes = totalMeses - LEY.minMesesCotizadosPension;
        let pct = esc.porcentajeInicial;
        for (const t of esc.tramos) {
            const m = Math.min(restantes, t.meses);
            pct += m * t.pct;
            restantes -= m;
            if (restantes <= 0) break;
        }
        return Math.min(Math.round(pct * 1e6) / 1e6, 100);
    }

    function coeficiente(tipo, mesesAdelanto, anos) {
        if (mesesAdelanto < 1) return 0;
        const cfg = LEY.anticipada[tipo];
        if (!cfg) throw new Error('Tipo desconocido: ' + tipo);
        if (mesesAdelanto > cfg.maxMeses) throw new Error('Adelanto superior al máximo legal');
        const fila = LEY.coeficientes[tipo].tabla[mesesAdelanto];
        if (!fila) throw new Error(`Falta coeficiente (${tipo}, ${mesesAdelanto} meses)`);
        return fila[indiceTramo(aMeses(anos))];
    }

    /** Devuelve { error } o el desglose completo. */
    function calcular({ base, anos, mesesAdelanto = 0, tipo = 'involuntaria', anio = LEY.anioPorDefecto }) {
        if (!(base >= 0) || !(anos >= 0)) return { error: 'Datos no válidos' };
        if (aMeses(anos) < LEY.minMesesCotizadosPension)
            return { error: 'Mínimo 15 años cotizados para acceder a pensión contributiva.' };
        if (mesesAdelanto > 0) {
            const c = LEY.anticipada[tipo];
            if (aMeses(anos) < c.minMesesCotizados || mesesAdelanto > c.maxMeses)
                return { error: `Jubilación ${tipo}: mínimo ${c.minMesesCotizados / 12} años cotizados y adelanto ≤ ${c.maxMeses} meses` };
        }
        const pctBase = porcentajeBase(anos, anio);
        const ordinaria = base * pctBase / 100;
        const coef = coeficiente(tipo, mesesAdelanto, anos);
        return {
            pctBase, ordinaria, coef,
            final: ordinaria * (1 - coef / 100),
            tramo: indiceTramo(aMeses(anos)),
            edadOrdinaria: edadOrdinaria(anos, anio)
        };
    }

    return { parametrosAnio, indiceTramo, edadOrdinaria, porcentajeBase, coeficiente, calcular };
});
