/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  PORTADA PÚBLICA — generador, contenido base y revisor previo a la publicación
 *  Oficina de Racionalización — OGPL (UNMSM)
 *
 *  Esta es la única fuente de verdad de la página que ven los jefes, los dueños
 *  de proceso y los decanos. El editor (editor.html) y el generador de línea de
 *  comandos (generar.js) usan las mismas funciones, de modo que la vista previa
 *  del editor y el archivo que se publica no pueden divergir.
 *
 *  Piezas:
 *   · CONTENIDO_BASE            — el contenido editable, y nada más que eso.
 *   · paginaCompleta(contenido) — devuelve el index.html final, autocontenido.
 *   · leerContenido(html)       — recupera el contenido de un index.html ya
 *                                 publicado, para volver a editarlo.
 *   · revisarAntesDePublicar()  — control de seguridad: busca en los textos
 *                                 aquello que no debe salir al público.
 *
 *  El archivo generado no lleva JavaScript: el visitante recibe HTML y CSS. El
 *  contenido queda incrustado como JSON inerte al final del documento solo para
 *  que el editor pueda volver a leerlo.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Contenido de partida. Los números provienen del avance consolidado del
 * inventario; el detalle por facultad y el diagnóstico interno NO viven aquí,
 * y no deben añadirse: este objeto se publica entero.
 */
const CONTENIDO_BASE = {

  institucion: {
    universidad: 'Universidad Nacional Mayor de San Marcos',
    oficina: 'Oficina General de Planificación — Oficina de Racionalización',
    sello: 'Decana de América'
  },

  portada: {
    titulo: 'Inventario de Productos y Procesos',
    bajada: 'Estado de avance de la revisión del Anexo 1 remitido por las ' +
            'facultades, con el detalle de los documentos vigentes que rigen ' +
            'el llenado del formulario.',
    periodo: 'Corte al 31 de agosto de 2026'
  },

  indicadores: [
    { valor: '63%',   etiqueta: 'Avance de la revisión', detalle: 'Productos con revisión concluida' },
    { valor: '2 823', etiqueta: 'Productos inventariados', detalle: 'Registros recibidos en el Anexo 1' },
    { valor: '20',    etiqueta: 'Facultades', detalle: 'Formularios remitidos a la OGPL' },
    { valor: '16',    etiqueta: 'Procesos de nivel 0', detalle: 'Estratégicos, misionales y de soporte' }
  ],

  avance: {
    titulo: 'Composición del avance',
    nota: 'La cifra de avance corresponde a los productos cuya revisión ya ' +
          'concluyó, sea con resultado conforme o con observación comunicada.',
    conformes: 1779,
    observados: 612,
    pendientes: 432
  },

  documentos: {
    titulo: 'Documentos vigentes',
    bajada: 'Estos son los documentos de referencia para el llenado y la ' +
            'corrección del Anexo 1.',
    lista: [
      {
        etiqueta: 'Instructivo',
        titulo: 'Guía de llenado del Anexo 1',
        descripcion: 'Cómo se codifican los productos, qué exige cada columna ' +
                     'y qué valores admite el formulario.',
        enlace: ''
      },
      {
        etiqueta: 'Reglas',
        titulo: 'Reglas de validación vigentes',
        descripcion: 'El conjunto de reglas que aplica la revisión automática, ' +
                     'con el criterio de cada una.',
        enlace: ''
      },
      {
        etiqueta: 'Bitácora',
        titulo: 'Bitácora del proyecto',
        descripcion: 'Registro de hitos, incidencias y decisiones adoptadas ' +
                     'a lo largo de la revisión.',
        enlace: ''
      }
    ]
  },

  aviso: {
    titulo: '¿Su facultad tiene observaciones?',
    texto: 'Las observaciones se comunican por oficio a cada facultad. Para ' +
           'consultas sobre el detalle de un registro, escriba a la Oficina ' +
           'de Racionalización indicando el código del producto.'
  },

  pie: {
    contacto: 'racionalizacion.ogpl@unmsm.edu.pe',
    actualizado: '31 de agosto de 2026'
  }
};

/* ───────────────────────────── utilidades ───────────────────────────── */

/** Escapa texto para que sea seguro insertarlo en el HTML generado. */
function esc(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Separa los millares con espacio fino, como se escriben las cifras oficiales. */
function miles(n) {
  return String(Number(n) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Recorre todos los textos del contenido.
 *
 * De cada uno devuelve dos direcciones: `campo`, pensada para leerse —los
 * elementos de una lista van entre corchetes y numerados desde 1, como se
 * cuentan en voz alta—, y `ruta`, la forma con puntos y desde 0 que usa el
 * editor para encontrar el control y llevar al usuario hasta él.
 */
function recorrerTextos(objeto, campo, ruta, salida) {
  campo = campo || '';
  ruta = ruta || '';
  salida = salida || [];

  if (typeof objeto === 'string') {
    salida.push({ campo: campo, ruta: ruta, texto: objeto });
  } else if (Array.isArray(objeto)) {
    objeto.forEach(function (v, i) {
      recorrerTextos(v, campo + '[' + (i + 1) + ']', ruta + '.' + i, salida);
    });
  } else if (objeto && typeof objeto === 'object') {
    Object.keys(objeto).forEach(function (k) {
      recorrerTextos(objeto[k],
        campo ? campo + '.' + k : k,
        ruta ? ruta + '.' + k : k, salida);
    });
  }
  return salida;
}

/* ──────────────────────── revisión previa a publicar ──────────────────────── */

/**
 * Patrones de aquello que no debe llegar a una página pública.
 *
 * El orden importa poco, pero la gravedad sí: `alta` bloquea la publicación en
 * el editor; `media` solo advierte. La lista nace de un incidente real — una
 * bitácora que mencionaba la hospitalización de dos jefaturas estuvo a punto de
 * compartirse con veinte facultades.
 */
const PATRONES_RIESGO = [
  {
    nombre: 'Información de salud',
    gravedad: 'alta',
    prueba: /hospitaliz|descanso m[eé]dico|licencia m[eé]dica|convalec|cirug[ií]a|diagn[oó]stico m[eé]dico|internad[oa]|enfermed/i,
    motivo: 'Menciona la salud de una persona. Sustitúyalo por una causa neutra.'
  },
  {
    nombre: 'Documento de identidad',
    gravedad: 'alta',
    prueba: /\bDNI\b|\b\d{8}\b/,
    motivo: 'Parece un número de documento de identidad.'
  },
  {
    nombre: 'Teléfono personal',
    gravedad: 'alta',
    prueba: /\b9\d{8}\b|\b\d{3}[-\s]\d{3}[-\s]\d{4}\b/,
    motivo: 'Parece un número de teléfono personal.'
  },
  {
    nombre: 'Datos de remuneración',
    gravedad: 'alta',
    prueba: /remuneraci[oó]n|sueldo|salario|planilla|honorarios/i,
    motivo: 'Alude a remuneraciones. No corresponde a una página pública de avance.'
  },
  {
    // El tratamiento se admite en cualquier caja, pero lo que sigue debe ser un
    // nombre propio: inicial mayúscula seguida de minúscula. Así «Jefe de OGPL»
    // y «Jefa de Racionalización» —que son cargos, la forma recomendada— no se
    // marcan, y tampoco las siglas («Jefe OGPL»), mientras que «Jefe Juan Pérez»
    // o «Dra. Ramírez» sí. No se puede usar la marca /i: volvería insensible
    // también al [A-Z] del nombre, que es lo único que distingue un caso del otro.
    nombre: 'Persona identificable',
    gravedad: 'media',
    prueba: /\b(?:[Jj]efes?|[Jj]efas?|[Ss]e[nñ]or(?:a)?|[Ss]r\.|[Ss]ra\.|[Ss]rta\.|[Dd]on|[Dd]o[nñ]a|[Mm]g\.|[Dd]r\.|[Dd]ra\.|[Ii]ng\.|[Ll]ic\.|[Aa]bog\.|[Pp]rof\.|[Cc]\.?[Pp]\.?[Cc]\.)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/,
    motivo: 'Nombra a una persona concreta. Prefiera el cargo o la oficina.'
  },
  {
    nombre: 'Correo no institucional',
    gravedad: 'media',
    prueba: /[\w.+-]+@(?!unmsm\.edu\.pe\b)[\w-]+\.[\w.]+/i,
    motivo: 'Correo ajeno al dominio unmsm.edu.pe.'
  },
  {
    nombre: 'Anotación interna',
    gravedad: 'media',
    prueba: /\b(?:borrador|no publicar|confidencial|interno|pendiente de revisi[oó]n|TODO|OJO|XXX)\b/i,
    motivo: 'Parece una anotación de trabajo que quedó en el texto.'
  }
];

/**
 * Revisa el contenido antes de publicarlo.
 *
 * Devuelve la lista de reparos encontrados. Una lista vacía significa que no se
 * detectó nada — no que el contenido sea correcto: la revisión es una ayuda,
 * no un sustituto de leer la página.
 */
function revisarAntesDePublicar(contenido) {
  const reparos = [];
  const textos = recorrerTextos(contenido);

  textos.forEach(function (t) {
    PATRONES_RIESGO.forEach(function (p) {
      if (p.prueba.test(t.texto)) {
        reparos.push({
          gravedad: p.gravedad,
          nombre: p.nombre,
          campo: t.campo,
          ruta: t.ruta,
          motivo: p.motivo,
          extracto: t.texto.length > 120 ? t.texto.slice(0, 120) + '…' : t.texto
        });
      }
    });
  });

  // Enlaces de los documentos: vacíos o inseguros.
  const lista = (contenido.documentos && contenido.documentos.lista) || [];
  lista.forEach(function (d, i) {
    const donde = 'documentos.lista[' + (i + 1) + '].enlace';
    const ruta = 'documentos.lista.' + i + '.enlace';
    if (!d.enlace || !String(d.enlace).trim()) {
      reparos.push({
        gravedad: 'media', nombre: 'Enlace sin definir', campo: donde, ruta: ruta,
        motivo: 'La tarjeta «' + (d.titulo || 'sin título') + '» no lleva enlace; no aparecerá como vínculo.',
        extracto: '(vacío)'
      });
    } else if (!/^https:\/\//i.test(String(d.enlace).trim())) {
      reparos.push({
        gravedad: 'alta', nombre: 'Enlace inseguro', campo: donde, ruta: ruta,
        motivo: 'El enlace no empieza por https://',
        extracto: String(d.enlace)
      });
    }
  });

  // Coherencia de la barra de avance.
  const a = contenido.avance || {};
  const suma = (Number(a.conformes) || 0) + (Number(a.observados) || 0) + (Number(a.pendientes) || 0);
  if (suma === 0) {
    reparos.push({
      gravedad: 'alta', nombre: 'Avance sin datos',
      campo: 'avance', ruta: 'avance.conformes',
      motivo: 'Las tres cifras del avance suman cero; la barra saldría vacía.',
      extracto: '0'
    });
  }

  const orden = { alta: 0, media: 1 };
  reparos.sort(function (x, y) { return orden[x.gravedad] - orden[y.gravedad]; });
  return reparos;
}

/* ─────────────────────────── generación de la página ─────────────────────────── */

const HOJA_DE_ESTILO = `
:root{
  --tinta:#151A22; --granate:#8C1D2F; --oro:#C8A02E;
  --papel:#F7F6F3; --blanco:#FFFFFF; --linea:#E4E0D9;
  --texto:#2B2F36; --suave:#6A7079;
  --verde:#2F6F4F;
}
*{box-sizing:border-box}
body{margin:0;background:var(--papel);color:var(--texto);
  font-family:'Source Sans 3','Segoe UI',system-ui,-apple-system,sans-serif;
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.envoltura{max-width:1080px;margin:0 auto;padding:0 24px}

/* Barra institucional */
.barra{background:var(--blanco);border-bottom:3px solid var(--granate)}
.barra .envoltura{display:flex;align-items:center;justify-content:space-between;
  gap:16px;padding-top:14px;padding-bottom:14px;flex-wrap:wrap}
.barra .casa{font-family:'Archivo','Arial Narrow',sans-serif;font-weight:700;
  font-size:15px;letter-spacing:.02em;color:var(--tinta);text-transform:uppercase;margin:0}
.barra .oficina{font-size:13px;color:var(--suave);margin:2px 0 0}
.barra .sello{font-family:'Archivo',sans-serif;font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--granate);font-weight:600;white-space:nowrap}

/* Hero */
.hero{background:var(--tinta);color:#fff;padding:56px 0 60px}
.hero h1{font-family:'Archivo','Arial Narrow',sans-serif;font-weight:700;
  font-size:clamp(28px,4.4vw,46px);line-height:1.14;margin:0 0 18px;letter-spacing:-.01em}
.hero .bajada{font-size:clamp(16px,1.9vw,19px);max-width:62ch;color:#D7DAE0;margin:0}
.hero .periodo{display:inline-block;margin-top:26px;font-family:'IBM Plex Mono',ui-monospace,monospace;
  font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--oro);
  border:1px solid rgba(200,160,46,.45);border-radius:2px;padding:6px 12px}

/* Indicadores */
.indicadores{margin-top:-34px;margin-bottom:56px}
.rejilla{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}
.tarjeta-kpi{background:var(--blanco);border:1px solid var(--linea);border-radius:3px;
  padding:22px 20px;border-top:3px solid var(--granate)}
.tarjeta-kpi .cifra{font-family:'Archivo',sans-serif;font-weight:700;
  font-size:38px;line-height:1;color:var(--tinta);letter-spacing:-.02em}
.tarjeta-kpi .etiqueta{font-weight:600;font-size:14px;margin-top:10px;color:var(--texto)}
.tarjeta-kpi .detalle{font-size:13px;color:var(--suave);margin-top:3px;line-height:1.45}

/* Secciones */
section.bloque{margin-bottom:56px}
h2{font-family:'Archivo',sans-serif;font-weight:700;font-size:22px;color:var(--tinta);
  margin:0 0 6px;letter-spacing:-.005em}
.bajada-seccion{color:var(--suave);font-size:15px;margin:0 0 22px;max-width:70ch}

/* Barra de avance */
.panel{background:var(--blanco);border:1px solid var(--linea);border-radius:3px;padding:26px 24px}
.barra-avance{display:flex;height:34px;border-radius:2px;overflow:hidden;
  border:1px solid var(--linea);background:var(--papel)}
.barra-avance span{display:block;height:100%}
.seg-conforme{background:#2F6F4F}
.seg-observado{background:var(--oro)}
.seg-pendiente{background:#CFCBC2}
.leyenda{display:flex;flex-wrap:wrap;gap:22px;margin-top:18px}
.leyenda div{display:flex;align-items:baseline;gap:9px;font-size:14px}
.punto{width:11px;height:11px;border-radius:2px;flex:none;transform:translateY(1px)}
.leyenda .n{font-family:'IBM Plex Mono',ui-monospace,monospace;font-weight:600;color:var(--tinta)}
.leyenda .q{color:var(--suave)}
.nota-panel{margin:18px 0 0;font-size:13.5px;color:var(--suave);
  border-left:3px solid var(--linea);padding-left:14px;line-height:1.55}

/* Documentos */
.docs{display:grid;grid-template-columns:repeat(auto-fit,minmax(258px,1fr));gap:16px}
.doc{background:var(--blanco);border:1px solid var(--linea);border-radius:3px;
  padding:22px 20px;display:flex;flex-direction:column}
.doc .cinta{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;
  letter-spacing:.1em;text-transform:uppercase;color:var(--granate);font-weight:600;margin-bottom:12px}
.doc h3{font-family:'Archivo',sans-serif;font-size:17px;color:var(--tinta);margin:0 0 8px;line-height:1.3}
.doc p{font-size:14px;color:var(--suave);margin:0 0 18px;flex:1;line-height:1.55}
.doc a{align-self:flex-start;font-weight:600;font-size:14px;color:var(--granate);
  text-decoration:none;border-bottom:1.5px solid rgba(140,29,47,.3);padding-bottom:2px}
.doc a:hover{border-bottom-color:var(--granate)}
.doc .sin-enlace{font-size:13px;color:#9AA0A8;font-style:italic}

/* Aviso */
.aviso{background:var(--blanco);border:1px solid var(--linea);border-left:4px solid var(--granate);
  border-radius:3px;padding:24px}
.aviso h2{font-size:19px;margin-bottom:8px}
.aviso p{margin:0;color:var(--texto);font-size:15px;max-width:72ch}

/* Pie */
footer{background:var(--tinta);color:#AEB4BD;padding:30px 0;font-size:13.5px}
footer .envoltura{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
footer a{color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.3)}

@media print{
  .hero{background:#fff;color:#000;padding:24px 0}
  .hero h1,.hero .bajada{color:#000}
  body{background:#fff}
  .indicadores{margin-top:24px}
}
`;

/** Un indicador. */
function bloqueIndicador(k) {
  return '' +
    '<div class="tarjeta-kpi">' +
      '<div class="cifra">' + esc(k.valor) + '</div>' +
      '<div class="etiqueta">' + esc(k.etiqueta) + '</div>' +
      (k.detalle ? '<div class="detalle">' + esc(k.detalle) + '</div>' : '') +
    '</div>';
}

/** Una tarjeta de documento. */
function bloqueDocumento(d) {
  const enlace = String(d.enlace || '').trim();
  const pie = enlace
    ? '<a href="' + esc(enlace) + '" target="_blank" rel="noopener noreferrer">Abrir documento →</a>'
    : '<span class="sin-enlace">Enlace pendiente de publicación</span>';
  return '' +
    '<article class="doc">' +
      (d.etiqueta ? '<div class="cinta">' + esc(d.etiqueta) + '</div>' : '') +
      '<h3>' + esc(d.titulo) + '</h3>' +
      '<p>' + esc(d.descripcion) + '</p>' +
      pie +
    '</article>';
}

/** La barra de avance con su leyenda. */
function bloqueAvance(a) {
  const c = Number(a.conformes) || 0;
  const o = Number(a.observados) || 0;
  const p = Number(a.pendientes) || 0;
  const total = c + o + p;
  const pc = function (n) { return total ? (n * 100 / total).toFixed(2) : 0; };

  const fila = function (clase, etiqueta, n) {
    return '<div><span class="punto ' + clase + '"></span>' +
           '<span class="n">' + miles(n) + '</span> ' +
           '<span class="q">' + esc(etiqueta) + ' · ' + pc(n) + '%</span></div>';
  };

  return '' +
    '<div class="panel">' +
      '<div class="barra-avance" role="img" aria-label="' +
        esc(miles(c) + ' conformes, ' + miles(o) + ' observados, ' + miles(p) + ' pendientes') + '">' +
        '<span class="seg-conforme"  style="width:' + pc(c) + '%"></span>' +
        '<span class="seg-observado" style="width:' + pc(o) + '%"></span>' +
        '<span class="seg-pendiente" style="width:' + pc(p) + '%"></span>' +
      '</div>' +
      '<div class="leyenda">' +
        fila('seg-conforme', 'conformes', c) +
        fila('seg-observado', 'observados', o) +
        fila('seg-pendiente', 'pendientes', p) +
      '</div>' +
      (a.nota ? '<p class="nota-panel">' + esc(a.nota) + '</p>' : '') +
    '</div>';
}

/**
 * Devuelve el index.html completo y autocontenido.
 *
 * El resultado no depende de este archivo ni de ningún script: es HTML y CSS.
 * El JSON del final es inerte y solo sirve para que el editor pueda recuperar
 * el contenido de una página ya publicada.
 */
function paginaCompleta(contenido) {
  const c = contenido || CONTENIDO_BASE;
  const ins = c.institucion || {};
  const por = c.portada || {};
  const doc = c.documentos || {};
  const avi = c.aviso || {};
  const pie = c.pie || {};

  const registro = JSON.stringify(c, null, 2).replace(/</g, '\\u003c');

  return '<!doctype html>\n' +
'<html lang="es">\n' +
'<head>\n' +
'<meta charset="utf-8">\n' +
'<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
'<title>' + esc(por.titulo) + ' — ' + esc(ins.universidad) + '</title>\n' +
'<meta name="description" content="' + esc(por.bajada) + '">\n' +
'<meta name="robots" content="index,follow">\n' +
'<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=IBM+Plex+Mono:wght@500;600&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">\n' +
'<style>' + HOJA_DE_ESTILO + '</style>\n' +
'</head>\n' +
'<body>\n' +

'<header class="barra">\n' +
'  <div class="envoltura">\n' +
'    <div>\n' +
'      <p class="casa">' + esc(ins.universidad) + '</p>\n' +
'      <p class="oficina">' + esc(ins.oficina) + '</p>\n' +
'    </div>\n' +
(ins.sello ? '    <div class="sello">' + esc(ins.sello) + '</div>\n' : '') +
'  </div>\n' +
'</header>\n\n' +

'<section class="hero">\n' +
'  <div class="envoltura">\n' +
'    <h1>' + esc(por.titulo) + '</h1>\n' +
'    <p class="bajada">' + esc(por.bajada) + '</p>\n' +
(por.periodo ? '    <div class="periodo">' + esc(por.periodo) + '</div>\n' : '') +
'  </div>\n' +
'</section>\n\n' +

'<div class="envoltura indicadores">\n' +
'  <div class="rejilla">\n' +
    (c.indicadores || []).map(bloqueIndicador).join('\n') + '\n' +
'  </div>\n' +
'</div>\n\n' +

'<div class="envoltura">\n\n' +

'  <section class="bloque">\n' +
'    <h2>' + esc((c.avance || {}).titulo || 'Composición del avance') + '</h2>\n' +
     bloqueAvance(c.avance || {}) + '\n' +
'  </section>\n\n' +

'  <section class="bloque">\n' +
'    <h2>' + esc(doc.titulo || 'Documentos') + '</h2>\n' +
(doc.bajada ? '    <p class="bajada-seccion">' + esc(doc.bajada) + '</p>\n' : '') +
'    <div class="docs">\n' +
      (doc.lista || []).map(bloqueDocumento).join('\n') + '\n' +
'    </div>\n' +
'  </section>\n\n' +

(avi.titulo || avi.texto ?
'  <section class="bloque">\n' +
'    <div class="aviso">\n' +
(avi.titulo ? '      <h2>' + esc(avi.titulo) + '</h2>\n' : '') +
(avi.texto ? '      <p>' + esc(avi.texto) + '</p>\n' : '') +
'    </div>\n' +
'  </section>\n\n' : '') +

'</div>\n\n' +

'<footer>\n' +
'  <div class="envoltura">\n' +
'    <div>' + (pie.contacto ? 'Consultas: <a href="mailto:' + esc(pie.contacto) + '">' + esc(pie.contacto) + '</a>' : '') + '</div>\n' +
'    <div>' + (pie.actualizado ? 'Actualizado al ' + esc(pie.actualizado) : '') + '</div>\n' +
'  </div>\n' +
'</footer>\n\n' +

'<script type="application/json" id="contenido-portada">\n' + registro + '\n<\/script>\n' +
'</body>\n' +
'</html>\n';
}

/**
 * Recupera el contenido incrustado en un index.html ya generado.
 * Devuelve null si el archivo no lleva el registro (no fue hecho por el editor).
 */
function leerContenido(html) {
  const m = String(html).match(
    /<script[^>]*id=["']contenido-portada["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!m) return null;
  try {
    return JSON.parse(m[1].replace(/\\u003c/g, '<'));
  } catch (e) {
    return null;
  }
}

/* Disponible tanto en el navegador como en Node (generar.js). */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONTENIDO_BASE: CONTENIDO_BASE,
    paginaCompleta: paginaCompleta,
    leerContenido: leerContenido,
    revisarAntesDePublicar: revisarAntesDePublicar
  };
}
