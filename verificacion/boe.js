/*
 * Vigilante del BOE: descarga los preceptos de la LGSS (texto consolidado, API de datos abiertos)
 * y los contrasta con legislacion.js.
 *
 *   node verificacion/boe.js              compara y sale con código 1 si hay diferencias o cambios
 *   node verificacion/boe.js --aceptar    además guarda las huellas actuales en estado-boe.json
 *                                         (hacerlo solo tras revisar los cambios a mano)
 *
 * Comprueba dos cosas:
 *  1. Valores numéricos (edad por año, escala del %, tablas de coeficientes, tramos, requisitos).
 *  2. Huella (SHA-256) del texto de cada precepto: si el BOE lo modifica, avisa aunque las cifras coincidan.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const LEY = require('../legislacion.js');

const API = 'https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2015-11724/texto/bloque/';
const ESTADO = path.join(__dirname, '..', 'estado-boe.json');
const BLOQUES = { a205: 'Art. 205', a207: 'Art. 207', a208: 'Art. 208', a210: 'Art. 210', dtseptima: 'DT 7ª', dtnovena: 'DT 9ª' };

const entidades = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' };
const limpia = s => s.replace(/<[^>]+>/g, ' ').replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g, e => entidades[e])
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/\s+/g, ' ').trim();
const num = s => parseFloat(s.replace(',', '.'));

async function descargar(id, fetchFn = fetch) {
    let r;
    for (let intento = 1; ; intento++) {
        try {
            r = await fetchFn(API + id, { headers: { Accept: 'application/xml' } });
            if (r.ok) break;
            if (intento >= 3) throw new Error(`BOE ${id}: HTTP ${r.status}`);
        } catch (e) {
            if (intento >= 3) throw e;
        }
        await new Promise(res => setTimeout(res, 2000 * intento));
    }
    const xml = await r.text();
    if (!/<code>200<\/code>/.test(xml)) throw new Error(`BOE ${id}: respuesta no válida`);
    const versiones = xml.split(/(?=<version )/).slice(1);
    if (!versiones.length) throw new Error(`BOE ${id}: sin versiones`);
    const v = versiones[versiones.length - 1]; // la última es la vigente
    const vigencia = (v.match(/fecha_vigencia="(\d+)"/) || [])[1];
    const filas = [...v.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
        .map(m => [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c => limpia(c[1])));
    const texto = limpia(v);
    return { id, vigencia, texto, filas, sha256: crypto.createHash('sha256').update(texto).digest('hex') };
}

const mesesDe = s => {
    const a = s.match(/(\d+)\s+años?/), m = s.match(/(\d+)\s+meses?/);
    return (a ? +a[1] * 12 : 0) + (m ? +m[1] : 0);
};

/** Cuadro de coeficientes: filas [meses, t1, t2, t3, t4]. */
function tablaCoeficientes(filas) {
    const t = {};
    for (const f of filas) {
        const c = f.filter(x => x !== '');
        if (c.length === 5 && /^\d+$/.test(c[0]) && c.slice(1).every(x => /^\d+,\d+$/.test(x)))
            t[+c[0]] = c.slice(1).map(num);
    }
    return t;
}

/** DT 7ª: { año|'2027': { umbral, menor, general } } en meses. */
function edadesDT7(filas) {
    const out = {};
    let anio = null, cur = null;
    for (const f of filas) {
        const c = f.filter(x => x !== '');
        let periodo, edad;
        if (c.length === 3) { anio = c[0].match(/\d{4}/)?.[0]; [, periodo, edad] = c; }
        else if (c.length === 2) [periodo, edad] = c;
        else continue;
        if (!anio) continue;
        cur = out[anio] ||= {};
        if (/o más/.test(periodo)) { cur.umbral = mesesDe(periodo.replace(/o más.*/, '')); cur.menor = mesesDe(edad); }
        else cur.general = mesesDe(edad);
    }
    return out;
}

/** DT 9ª: { rangoAños: { m1, p1, m2, p2 } } */
function escalasDT9(filas) {
    const out = {};
    for (const f of filas) {
        const c = f.filter(x => x !== '');
        if (c.length !== 2) continue;
        const m = c[1].match(/entre los meses 1 y (\d+), el ([\d,]+) por ciento y por cada uno de los (\d+) meses siguientes, el ([\d,]+) por ciento/);
        if (m) out[c[0]] = { m1: +m[1], p1: num(m[2]), m2: +m[3], p2: num(m[4]) };
    }
    return out;
}

function comparar(datos) {
    const dif = [];
    const ko = t => dif.push(t);

    // --- Coeficientes ---
    for (const [tipo, id, max] of [['involuntaria', 'a207', 48], ['voluntaria', 'a208', 24]]) {
        const boe = tablaCoeficientes(datos[id].filas);
        const mios = LEY.coeficientes[tipo].tabla;
        for (let m = 1; m <= max; m++) {
            if (!boe[m]) { ko(`${BLOQUES[id]}: el BOE no trae la fila de ${m} meses (¿cambió el formato?)`); continue; }
            if (!mios[m] || boe[m].some((x, i) => Math.abs(x - mios[m][i]) > 0.005))
                ko(`Coeficientes ${tipo}, ${m} meses: legislacion.js ${JSON.stringify(mios[m])} ≠ BOE ${JSON.stringify(boe[m])}`);
        }
        for (const m of Object.keys(boe).map(Number)) if (m > max) ko(`${BLOQUES[id]}: el BOE trae ${m} meses (máximo esperado ${max})`);
        const T = LEY.tramosCotizacion.limitesMeses;
        for (const lim of T.slice(1))
            if (!datos[id].texto.includes(`${Math.floor(lim / 12)} años y ${lim % 12} meses`))
                ko(`${BLOQUES[id]}: no aparece el tramo de ${Math.floor(lim / 12)} años y ${lim % 12} meses`);
    }

    // --- Requisitos de acceso (texto) ---
    const req = (id, re, desc) => { if (!re.test(datos[id].texto)) ko(`${BLOQUES[id]}: ya no consta «${desc}»`); };
    req('a207', /inferior en cuatro años/, 'adelanto máximo de cuatro años (48 meses)');
    req('a207', /mínimo de cotización efectiva de 33 años/, '33 años de cotización');
    req('a208', /inferior en dos años/, 'adelanto máximo de dos años (24 meses)');
    req('a208', /treinta y cinco años/, '35 años de cotización');
    req('a205', /período mínimo de cotización de quince años/, '15 años mínimos de cotización');
    req('a205', /sesenta y siete años de edad, o sesenta y cinco años cuando se acrediten treinta y ocho años y seis meses/, 'régimen definitivo 67 / 65 con 38a6m');

    // --- Edad ordinaria por año (DT 7ª) ---
    const edades = edadesDT7(datos.dtseptima.filas);
    for (const [anio, p] of Object.entries(LEY.porAnio)) {
        const ref = edades[anio];
        if (!ref) { ko(`DT 7ª: no se localiza el año ${anio}`); continue; }
        const mio = p.edadOrdinaria;
        const mismo = ref.umbral === mio.mesesCotizadosParaEdadMenor
            && ref.menor === mio.edadMenor[0] * 12 + mio.edadMenor[1]
            && ref.general === mio.edadGeneral[0] * 12 + mio.edadGeneral[1];
        if (!mismo) ko(`Edad ordinaria ${anio}: legislacion.js (${mio.mesesCotizadosParaEdadMenor} meses cot. → ${mio.edadMenor}; si no → ${mio.edadGeneral}) ≠ BOE (${ref.umbral} → ${ref.menor} meses; si no → ${ref.general} meses)`);
    }

    // --- Escala del % (DT 9ª) ---
    const escalas = escalasDT9(datos.dtnovena.filas);
    const escalaDe = anio => Object.entries(escalas).find(([k]) => {
        const r = k.match(/(\d{4}) a (\d{4})/); if (r) return anio >= +r[1] && anio <= +r[2];
        const s = k.match(/A partir del año (\d{4})/); return s && anio >= +s[1];
    })?.[1];
    for (const [anio, p] of Object.entries(LEY.porAnio)) {
        const b = escalaDe(+anio);
        if (!b) { ko(`DT 9ª: no se localiza la escala del año ${anio}`); continue; }
        const [t1, t2] = p.escalaBase.tramos;
        if (!t1 || !t2 || t1.meses !== b.m1 || t1.pct !== b.p1 || t2.meses !== b.m2 || t2.pct !== b.p2)
            ko(`Escala % ${anio}: legislacion.js ${JSON.stringify(p.escalaBase.tramos)} ≠ BOE ${b.m1}×${b.p1}% + ${b.m2}×${b.p2}%`);
    }
    return dif;
}

function leerEstado() { try { return JSON.parse(fs.readFileSync(ESTADO, 'utf8')); } catch { return null; } }

async function main(argv = process.argv.slice(2)) {
    const datos = {};
    for (const id of Object.keys(BLOQUES)) datos[id] = await descargar(id);

    const diferencias = comparar(datos);
    const cambios = [];
    const previo = leerEstado();
    for (const [id, d] of Object.entries(datos)) {
        const p = previo?.bloques?.[id];
        if (!p) cambios.push(`${BLOQUES[id]}: sin huella previa (ejecuta con --aceptar tras revisar)`);
        else if (p.sha256 !== d.sha256) cambios.push(`${BLOQUES[id]}: el texto del BOE ha cambiado (vigencia ${p.vigencia} → ${d.vigencia}). Léelo y actualiza legislacion.js si procede`);
    }

    diferencias.forEach(d => console.log('DIFERENCIA  ' + d));
    cambios.forEach(c => console.log('CAMBIO      ' + c));
    const ok = !diferencias.length && !cambios.length;

    if (argv.includes('--aceptar')) {
        if (diferencias.length) { console.log('\nNo se aceptan huellas mientras haya diferencias de valores.'); return 1; }
        const hoy = new Date().toISOString().slice(0, 10);
        fs.writeFileSync(ESTADO, JSON.stringify({
            verificado: hoy,
            fuente: 'BOE-A-2015-11724 (LGSS, texto consolidado)',
            bloques: Object.fromEntries(Object.entries(datos).map(([id, d]) => [id, { titulo: BLOQUES[id], vigencia: d.vigencia, sha256: d.sha256 }]))
        }, null, 2) + '\n');
        console.log(`\nEstado guardado en estado-boe.json (${hoy}).`);
        return 0;
    }
    console.log(ok ? '\nOK: legislacion.js coincide con el BOE y no hay cambios.' : `\n${diferencias.length} diferencias, ${cambios.length} cambios.`);
    return ok ? 0 : 1;
}

module.exports = { descargar, comparar, tablaCoeficientes, edadesDT7, escalasDT9, main };

if (require.main === module) main().then(c => process.exit(c), e => { console.error('ERROR ' + e.message); process.exit(2); });
