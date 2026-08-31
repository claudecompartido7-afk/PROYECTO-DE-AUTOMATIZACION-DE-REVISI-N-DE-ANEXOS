/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Pruebas de la portada pública y de su revisión previa a la publicación.
 *
 *  Ejecución:  node tests/portada.test.js
 *
 *  Lo que más importa aquí no es que la página se vea bien, sino que el revisor
 *  no deje pasar aquello que no debe hacerse público, y que no marque como
 *  riesgo la redacción correcta —un revisor que grita por todo se termina
 *  ignorando, y entonces no sirve de nada.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const {
  CONTENIDO_BASE, paginaCompleta, leerContenido, revisarAntesDePublicar
} = require('../publico/portada.js');

let fallos = 0, corridas = 0;

function ok(nombre, condicion) {
  corridas++;
  if (condicion) { console.log('  ok    ' + nombre); }
  else { console.log('  FALLA ' + nombre); fallos++; }
}
function grupo(t) { console.log('\n' + t); }
function copia() { return JSON.parse(JSON.stringify(CONTENIDO_BASE)); }
function con(cambio) { const c = copia(); cambio(c); return revisarAntesDePublicar(c); }
function marca(reparos, nombre) { return reparos.some(function (r) { return r.nombre === nombre; }); }

/* ─────────────────────────────────────────────────────────────────────────── */
grupo('Ida y vuelta: publicar y volver a editar');

const html = paginaCompleta(CONTENIDO_BASE);
const recuperado = leerContenido(html);

ok('el HTML generado lleva el registro de contenido', recuperado !== null);
ok('lo recuperado es idéntico a lo publicado',
   JSON.stringify(recuperado) === JSON.stringify(CONTENIDO_BASE));
ok('regenerar desde lo recuperado da byte por byte el mismo archivo',
   paginaCompleta(recuperado) === html);
ok('un HTML ajeno no rompe el editor, devuelve null',
   leerContenido('<html><body>otra cosa</body></html>') === null);
ok('un registro con JSON roto devuelve null en vez de reventar',
   leerContenido('<script id="contenido-portada">{roto</script>') === null);

/* ─────────────────────────────────────────────────────────────────────────── */
grupo('La página publicada no necesita JavaScript');

ok('no hay scripts ejecutables, solo el registro inerte',
   (html.match(/<script/g) || []).length === 1 &&
   html.includes('<script type="application/json"'));

/* ─────────────────────────────────────────────────────────────────────────── */
grupo('Revisión: lo que no debe hacerse público');

// El incidente real: una bitácora que mencionaba la hospitalización de dos
// jefaturas estuvo a punto de compartirse con veinte facultades.
const salud = con(function (c) {
  c.aviso.texto = 'Hospitalización y descanso médico del Jefe de OGPL y de la ' +
                  'Jefa de Racionalización.';
});
ok('detecta información de salud', marca(salud, 'Información de salud'));
ok('y la marca como grave',
   salud.some(function (r) { return r.nombre === 'Información de salud' && r.gravedad === 'alta'; }));

ok('detecta el DNI', marca(con(function (c) { c.aviso.texto = 'Presentar DNI 45678912.'; }),
   'Documento de identidad'));
ok('detecta el teléfono personal', marca(con(function (c) { c.aviso.texto = 'Llamar al 987654321.'; }),
   'Teléfono personal'));
ok('detecta alusiones a remuneraciones', marca(con(function (c) { c.aviso.texto = 'Afecta la planilla.'; }),
   'Datos de remuneración'));
ok('detecta anotaciones de trabajo olvidadas',
   marca(con(function (c) { c.portada.bajada = 'BORRADOR — no publicar todavía.'; }),
   'Anotación interna'));
ok('detecta correo ajeno al dominio institucional',
   marca(con(function (c) { c.pie.contacto = 'particular@gmail.com'; }), 'Correo no institucional'));

/* ─────────────────────────────────────────────────────────────────────────── */
grupo('Revisión: personas frente a cargos');

ok('marca «Jefe Juan Pérez»',
   marca(con(function (c) { c.aviso.texto = 'Coordinar con el Jefe Juan Pérez.'; }),
   'Persona identificable'));
ok('marca «Dra. Ramírez» aunque el tratamiento vaya en mayúscula',
   marca(con(function (c) { c.aviso.texto = 'Consultar con la Dra. Ramírez.'; }),
   'Persona identificable'));
ok('marca el tratamiento en minúscula, «el ing. Salazar»',
   marca(con(function (c) { c.aviso.texto = 'Revisado por el ing. Salazar.'; }),
   'Persona identificable'));

// El reverso, que es lo que evita que la advertencia se vuelva ruido: la
// redacción recomendada —el cargo, la oficina— no debe marcarse nunca.
ok('NO marca «Jefe de OGPL», que es un cargo',
   !marca(con(function (c) { c.aviso.texto = 'Dirigirse al Jefe de OGPL.'; }),
   'Persona identificable'));
ok('NO marca «Jefa de Racionalización», que es un cargo',
   !marca(con(function (c) { c.aviso.texto = 'Ver con la Jefa de Racionalización.'; }),
   'Persona identificable'));
ok('NO marca las siglas, «Jefe OGPL»',
   !marca(con(function (c) { c.aviso.texto = 'El Jefe OGPL lo aprueba.'; }),
   'Persona identificable'));

/* ─────────────────────────────────────────────────────────────────────────── */
grupo('Revisión: enlaces');

const sinEnlaces = revisarAntesDePublicar(CONTENIDO_BASE);
ok('avisa de cada documento sin enlace',
   sinEnlaces.filter(function (r) { return r.nombre === 'Enlace sin definir'; }).length === 3);
ok('rechaza un enlace que no sea https',
   marca(con(function (c) { c.documentos.lista[0].enlace = 'http://ejemplo.pe'; }), 'Enlace inseguro'));

const conEnlaces = copia();
conEnlaces.documentos.lista.forEach(function (d) { d.enlace = 'https://docs.google.com/x'; });
ok('con los enlaces puestos, el contenido base queda sin reparos',
   revisarAntesDePublicar(conEnlaces).length === 0);

/* ─────────────────────────────────────────────────────────────────────────── */
grupo('Revisión: coherencia del avance');

ok('avisa si las tres cifras suman cero',
   marca(con(function (c) { c.avance = { conformes: 0, observados: 0, pendientes: 0 }; }),
   'Avance sin datos'));

/* ─────────────────────────────────────────────────────────────────────────── */
grupo('Escapado del contenido');

const raro = copia();
raro.portada.titulo = '<script>alert(1)</script> & "comillas" \'simples\'';
raro.aviso.texto = 'Menor < mayor > ambos';
const htmlRaro = paginaCompleta(raro);

ok('no se cuela una etiqueta en el título', !/<h1><script>/.test(htmlRaro));
ok('el ampersand queda escapado', htmlRaro.includes('&amp;'));
ok('sigue habiendo un solo script en la página', (htmlRaro.match(/<script/g) || []).length === 1);
ok('el contenido raro sobrevive la ida y vuelta',
   leerContenido(htmlRaro).portada.titulo === raro.portada.titulo);

/* ─────────────────────────────────────────────────────────────────────────── */
grupo('Barra de avance');

ok('los tres segmentos suman 100%', (function () {
  const a = CONTENIDO_BASE.avance;
  const total = a.conformes + a.observados + a.pendientes;
  const suma = ['conformes', 'observados', 'pendientes'].reduce(function (s, k) {
    return s + Number((a[k] * 100 / total).toFixed(2));
  }, 0);
  return Math.abs(suma - 100) < 0.02;
})());

ok('una lista de documentos vacía no rompe la generación', (function () {
  const c = copia();
  c.documentos.lista = [];
  c.indicadores = [];
  try { return typeof paginaCompleta(c) === 'string'; } catch (e) { return false; }
})());

/* ─────────────────────────────────────────────────────────────────────────── */
console.log('\n' + corridas + ' comprobaciones · ' +
            (fallos ? fallos + ' FALLA(S)' : 'todas correctas') + '\n');
process.exit(fallos ? 1 : 0);
