/*
 * PARÁMETROS LEGALES DEL SIMULADOR (única fuente de verdad).
 *
 * Cada bloque lleva: fuente normativa y estado de verificación.
 *   verificado: 'contrastado' -> comprobado contra texto oficial (BOE / Seguridad Social)
 *   verificado: 'pendiente'   -> valor heredado, aún NO contrastado con el BOE
 * Al cambiar la ley: añade un bloque por año en `porAnio`, actualiza `revisarAntes`
 * y ejecuta `npm test` (ver docs/CHECKLIST-LEGISLACION.md).
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.LEGISLACION = factory();
})(typeof self !== 'undefined' ? self : this, function () {

    // Coeficientes reductores (% de reducción) por meses de anticipación.
    // Columnas = tramos de cotización: [<38a6m, 38a6m-41a6m, 41a6m-44a6m, >=44a6m]
    const INVOLUNTARIA = {
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

    const VOLUNTARIA = {
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

    return {
        version: '2026.1',
        actualizado: '2026-09-30',
        // Fecha límite para volver a contrastar con el BOE (el verificador avisa al pasarla).
        revisarAntes: '2026-12-31',
        anioPorDefecto: 2026,

        // Tramos de cotización del coeficiente reductor, en MESES cotizados (límite inferior).
        tramosCotizacion: {
            limitesMeses: [0, 38 * 12 + 6, 41 * 12 + 6, 44 * 12 + 6],
            fuente: 'Arts. 206 bis y 207 LGSS, redacción RDL 2/2023',
            verificado: 'contrastado'
        },

        anticipada: {
            voluntaria:   { maxMeses: 24, minMesesCotizados: 35 * 12, fuente: 'Art. 206 bis LGSS', verificado: 'contrastado' },
            involuntaria: { maxMeses: 48, minMesesCotizados: 33 * 12, fuente: 'Art. 207 LGSS',     verificado: 'contrastado' }
        },

        minMesesCotizadosPension: 15 * 12, // Art. 205.1.b LGSS

        porAnio: {
            2026: {
                // DT 7ª LGSS: 65 años con >= 38a3m cotizados; si no, 66a8m.
                edadOrdinaria: { mesesCotizadosParaEdadMenor: 38 * 12 + 3, edadMenor: [65, 0], edadGeneral: [66, 8] },
                // Art. 210 + DT 9ª LGSS: 50% a los 15 años y tramos mensuales hasta el 100%
                // (36 años y 6 meses = 438 meses). 49*0,21 + 209*0,19 = 50.
                escalaBase: { porcentajeInicial: 50, tramos: [{ meses: 49, pct: 0.21 }, { meses: 209, pct: 0.19 }] },
                fuente: 'DT 7ª y DT 9ª LGSS (RDL 8/2015; Ley 27/2011; RDL 2/2023)',
                verificado: 'contrastado'
            },
            2027: {
                edadOrdinaria: { mesesCotizadosParaEdadMenor: 38 * 12 + 6, edadMenor: [65, 0], edadGeneral: [67, 0] },
                // Régimen definitivo, art. 210: 100% con 37 años. 248*0,19 + 16*0,18 = 50.
                escalaBase: { porcentajeInicial: 50, tramos: [{ meses: 248, pct: 0.19 }, { meses: 16, pct: 0.18 }] },
                fuente: 'Arts. 205 y 210 LGSS (régimen definitivo desde 2027)',
                verificado: 'contrastado'
            }
        },

        coeficientes: {
            involuntaria: { tabla: INVOLUNTARIA, fuente: 'Art. 207.2 LGSS (RDL 2/2023)',   verificado: 'pendiente' },
            voluntaria:   { tabla: VOLUNTARIA,   fuente: 'Art. 206 bis.2 LGSS (RDL 2/2023)', verificado: 'pendiente' },
            // Valores de control que el verificador exige. Al contrastar con el BOE,
            // añadir aquí más filas: [tipo, mesesAnticipacion, [t1, t2, t3, t4]]
            anclas: [
                ['voluntaria', 24, [21.00, 19.00, 17.00, 13.00]],
                ['involuntaria', 48, [30.00, 28.00, 26.00, 24.00]]
            ]
        }
    };
});
