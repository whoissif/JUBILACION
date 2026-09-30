// Muestra en el pie la fecha de la última verificación contra el BOE (estado-boe.json, actualizado por la Action).
(function () {
    const el = document.getElementById('estadoBoe');
    if (!el || typeof fetch !== 'function') return;
    fetch('estado-boe.json', { cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(e => {
            const [y, m, d] = e.verificado.split('-');
            el.textContent = `Última verificación con el BOE: ${d}/${m}/${y}.`;
        })
        .catch(() => { el.textContent = ''; });
})();
