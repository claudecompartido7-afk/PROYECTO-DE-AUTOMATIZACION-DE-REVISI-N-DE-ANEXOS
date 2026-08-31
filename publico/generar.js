#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Genera publico/index.html a partir del contenido.
 *
 *  Uso:
 *    node publico/generar.js                 → usa CONTENIDO_BASE
 *    node publico/generar.js contenido.json  → usa ese archivo
 *
 *  Es la misma función que emplea el editor, de modo que el resultado es
 *  idéntico al que se obtiene pulsando «Descargar index.html».
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const { CONTENIDO_BASE, paginaCompleta, revisarAntesDePublicar } = require('./portada.js');

const origen = process.argv[2];
const contenido = origen
  ? JSON.parse(fs.readFileSync(origen, 'utf8'))
  : CONTENIDO_BASE;

const reparos = revisarAntesDePublicar(contenido);
if (reparos.length) {
  console.log('\nRevisión previa — ' + reparos.length + ' reparo(s):\n');
  reparos.forEach(function (r) {
    console.log('  [' + r.gravedad.toUpperCase() + '] ' + r.nombre + '  (' + r.campo + ')');
    console.log('      ' + r.motivo);
    console.log('      «' + r.extracto + '»\n');
  });
} else {
  console.log('\nRevisión previa: sin reparos.\n');
}

const destino = path.join(__dirname, 'index.html');
fs.writeFileSync(destino, paginaCompleta(contenido), 'utf8');
console.log('Escrito: ' + destino + '  (' + fs.statSync(destino).size + ' bytes)');

const graves = reparos.filter(function (r) { return r.gravedad === 'alta'; });
if (graves.length) {
  console.log('\nATENCIÓN: hay ' + graves.length + ' reparo(s) de gravedad alta. ' +
              'Revíselos antes de subir el archivo.\n');
  process.exitCode = 1;
}
