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
  CONTENIDO_BASE, paginaCompleta, paginaPlan, leerContenido, revisarAntesDePublicar
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
// El índice 0 es la tarjeta del Plan, que apunta a una página del propio sitio
// y por eso no lleva enlace externo; se prueba sobre una que sí lo lleva.
ok('rechaza un enlace que no sea https',
   marca(con(function (c) { c.documentos.lista[1].enlace = 'http://ejemplo.pe'; }), 'Enlace inseguro'));

const conEnlaces = copia();
conEnlaces.documentos.lista.forEach(function (d) {
  if (!d.pagina) d.enlace = 'https://docs.google.com/x';
});
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
grupo('Plan de Gestión del Proyecto');

const plan = paginaPlan(CONTENIDO_BASE);
const aps = CONTENIDO_BASE.plan.apartados;

ok('se dibuja un apartado por cada uno del contenido',
   (plan.match(/class="apartado"/g) || []).length === aps.length);
ok('el índice lateral tiene una entrada por apartado',
   (plan.match(/class="plan-indice"/g) || []).length === 1 &&
   aps.every(function (_, i) { return plan.includes('href="#ap' + (i + 1) + '"'); }));
ok('cada apartado lleva su ancla',
   aps.every(function (_, i) { return plan.includes('id="ap' + (i + 1) + '"'); }));
ok('se dibujan las tablas que tienen encabezados',
   (plan.match(/<table class="plan-tabla">/g) || []).length ===
   aps.filter(function (a) { return a.tabla && a.tabla.encabezados.length; }).length);
ok('el plan vuelve a la portada', plan.includes('href="index.html"'));
ok('la portada enlaza al plan', paginaCompleta(CONTENIDO_BASE).includes('href="plan.html"'));

ok('una línea en blanco separa dos párrafos', (function () {
  const c = copia();
  c.plan.apartados = [{ titulo: 'X', cuerpo: 'Uno.\n\nDos.', lista: [], tabla: null }];
  // Se cuenta dentro del apartado: la cabecera de la página trae párrafos suyos.
  const seccion = paginaPlan(c).match(/<section class="apartado"[\s\S]*?<\/section>/)[0];
  return (seccion.match(/<p>/g) || []).length === 2 &&
         seccion.includes('<p>Uno.</p>') && seccion.includes('<p>Dos.</p>');
})());

ok('un apartado vacío no dibuja lista ni tabla', (function () {
  const c = copia();
  c.plan.apartados = [{ titulo: 'X', cuerpo: '', lista: [], tabla: null }];
  const h = paginaPlan(c);
  return !h.includes('<ul>') && !h.includes('<table');
})());

ok('las viñetas en blanco se descartan', (function () {
  const c = copia();
  c.plan.apartados = [{ titulo: 'X', cuerpo: '', lista: ['Una', '', '   '], tabla: null }];
  return (paginaPlan(c).match(/<li>/g) || []).length === 1;
})());

ok('el plan también lleva el registro para reabrirlo',
   JSON.stringify(leerContenido(plan)) === JSON.stringify(CONTENIDO_BASE));
ok('el plan tampoco necesita JavaScript',
   (plan.match(/<script/g) || []).length === 1);
ok('el contenido del plan pasa por la revisión', (function () {
  const c = copia();
  c.plan.apartados[0].cuerpo = 'Hospitalización del responsable.';
  return marca(revisarAntesDePublicar(c), 'Información de salud');
})());
ok('una tarjeta con página interna no se exige que sea https',
   !revisarAntesDePublicar(CONTENIDO_BASE).some(function (r) {
     return r.campo.indexOf('documentos.lista[1]') === 0;
   }));

/* ─────────────────────────────────────────────────────────────────────────── */
grupo('Ninguna página depende de un servidor ajeno');

// Un <link> a una hoja de estilo remota bloquea el primer pintado: en una red
// institucional lenta o filtrada la página quedaría en blanco. Y un recurso de
// un tercero registra a cada lector de un documento oficial.
[['index.html', paginaCompleta(CONTENIDO_BASE)], ['plan.html', plan]].forEach(function (par) {
  ok(par[0] + ' no pide hojas de estilo ni fuentes remotas',
     !/<link[^>]+href=["']https?:/i.test(par[1]));
  ok(par[0] + ' no carga imágenes ni scripts remotos',
     !/(src|href)=["']https?:\/\/(?!)/i.test(par[1].replace(/href="mailto:[^"]*"/g, '')) &&
     !/<img/i.test(par[1]));
});

/* ─────────────────────────────────────────────────────────────────────────── */
console.log('\n' + corridas + ' comprobaciones · ' +
            (fallos ? fallos + ' FALLA(S)' : 'todas correctas') + '\n');
process.exit(fallos ? 1 : 0);
