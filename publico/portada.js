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
        etiqueta: 'Plan',
        titulo: 'Plan de Gestión del Proyecto',
        descripcion: 'Alcance, entregables, hitos, responsabilidades, ' +
                     'comunicaciones y riesgos de la revisión del Anexo 1.',
        // `pagina` en lugar de `enlace`: no sale a Drive, se publica junto a
        // la portada y se edita en el mismo editor.
        pagina: 'plan.html'
      },
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

  /**
   * Plan de Gestión del Proyecto. Se publica como `plan.html`, una página
   * aparte: es un documento formal, con su propia portada y su propia
   * impresión, y meterlo dentro de la portada la volvería ilegible.
   *
   * Cada apartado admite tres formas, y puede combinarlas: `cuerpo` para los
   * párrafos, `lista` para las viñetas y `tabla` para lo que se lee mejor en
   * columnas. Lo que se deje vacío no se dibuja.
   */
  plan: {
    titulo: 'Plan de Gestión del Proyecto',
    bajada: 'Revisión y normalización del Anexo 1 — Inventario de productos ' +
            'y procesos de las facultades.',
    version: 'Versión 1.0',
    aprobacion: 'Oficina General de Planificación — Oficina de Racionalización',

    apartados: [
      {
        titulo: '1. Objeto',
        cuerpo: 'Este plan ordena la revisión del Anexo 1 remitido por las ' +
                'veinte facultades, de modo que el inventario de productos y ' +
                'procesos quede codificado con un criterio único y verificable.\n\n' +
                'La revisión no reescribe el contenido de las facultades: ' +
                'detecta lo que se aparta de las reglas, lo comunica por ' +
                'oficio y registra la respuesta.',
        lista: [],
        tabla: null
      },
      {
        titulo: '2. Alcance',
        cuerpo: 'Queda comprendido en el alcance:',
        lista: [
          'La validación de las columnas B a I de cada formulario, según las reglas vigentes.',
          'La verificación del sufijo de formulario que corresponde a cada facultad.',
          'La comprobación de la jerarquía de códigos y de los procesos de nivel 0.',
          'La comunicación de observaciones a cada facultad y el registro de su respuesta.'
        ],
        tabla: null
      },
      {
        titulo: '3. Fuera de alcance',
        cuerpo: '',
        lista: [
          'La redacción del contenido sustantivo de los productos, que es responsabilidad de cada facultad.',
          'El Anexo 3 — Ficha técnica, que se atenderá en una etapa posterior.',
          'La aprobación formal del inventario, que corresponde a las instancias de gobierno.'
        ],
        tabla: null
      },
      {
        titulo: '4. Entregables',
        cuerpo: '',
        lista: [],
        tabla: {
          encabezados: ['Entregable', 'Descripción', 'Responsable'],
          filas: [
            ['Resumen ejecutivo', 'Estado consolidado por facultad y por proceso.', 'Oficina de Racionalización'],
            ['Detalle de productos', 'Observación por registro, con la regla que la origina.', 'Oficina de Racionalización'],
            ['Observaciones de proceso', 'Reparos sobre la hoja de procesos de cada facultad.', 'Oficina de Racionalización'],
            ['Oficios de observación', 'Comunicación formal a cada facultad.', 'Jefatura de la OGPL'],
            ['Inventario normalizado', 'Anexo 1 con las observaciones subsanadas.', 'Facultades']
          ]
        }
      },
      {
        titulo: '5. Hitos',
        cuerpo: 'Las fechas se ajustan a la disponibilidad de las facultades ' +
                'y se comunican con antelación por oficio.',
        lista: [],
        tabla: {
          encabezados: ['Hito', 'Estado'],
          filas: [
            ['Recepción de los formularios de las veinte facultades', 'Concluido'],
            ['Primera corrida de la revisión automática', 'Concluido'],
            ['Comunicación de observaciones por oficio', 'En curso'],
            ['Subsanación por las facultades', 'En curso'],
            ['Corrida de verificación', 'Programado'],
            ['Consolidación del inventario', 'Programado']
          ]
        }
      },
      {
        titulo: '6. Organización y responsabilidades',
        cuerpo: '',
        lista: [],
        tabla: {
          encabezados: ['Rol', 'Responsabilidad'],
          filas: [
            ['Jefatura de la OGPL', 'Aprueba el plan y suscribe las comunicaciones a las facultades.'],
            ['Oficina de Racionalización', 'Ejecuta la revisión, mantiene las reglas y consolida los resultados.'],
            ['Dueño de proceso', 'Valida que los productos de su proceso estén completos y bien clasificados.'],
            ['Decanato de la facultad', 'Dispone la subsanación de las observaciones comunicadas.'],
            ['Responsable designado por la facultad', 'Corrige el formulario y responde las observaciones.']
          ]
        }
      },
      {
        titulo: '7. Gestión de la calidad',
        cuerpo: 'La revisión se apoya en un conjunto de reglas escritas y ' +
                'versionadas, no en el criterio de quien revisa. Cada regla ' +
                'declara qué exige y por qué, de modo que una observación ' +
                'siempre puede rastrearse hasta la regla que la origina.\n\n' +
                'Las reglas cuentan con pruebas automáticas que se ejecutan ' +
                'antes de cada corrida. Una regla que no pasa sus pruebas no ' +
                'se aplica.',
        lista: [],
        tabla: null
      },
      {
        titulo: '8. Comunicaciones',
        cuerpo: '',
        lista: [],
        tabla: {
          encabezados: ['Qué', 'A quién', 'Cómo', 'Cuándo'],
          filas: [
            ['Estado de avance', 'Facultades y dueños de proceso', 'Portada pública', 'Permanente'],
            ['Observaciones del Anexo 1', 'Decanato de la facultad', 'Oficio', 'Al cierre de cada corrida'],
            ['Consultas sobre un registro', 'Oficina de Racionalización', 'Correo institucional', 'A demanda'],
            ['Cambios en las reglas', 'Facultades', 'Oficio y portada pública', 'Antes de aplicarse']
          ]
        }
      },
      {
        titulo: '9. Riesgos',
        cuerpo: '',
        lista: [],
        tabla: {
          encabezados: ['Riesgo', 'Efecto', 'Respuesta'],
          filas: [
            ['Subsanación tardía de una facultad', 'Retrasa la consolidación del inventario.', 'Reiterar por oficio y escalar al decanato.'],
            ['Interpretación dispar de una regla', 'Observaciones discutidas y reprocesos.', 'Precisar la regla por escrito y volver a correr la revisión.'],
            ['Cambio en la estructura del formulario', 'Invalida el mapa de columnas.', 'Versionar las reglas y conservar la versión anterior.'],
            ['Ausencia temporal de personal de la oficina', 'Detiene la atención de consultas.', 'Documentar el procedimiento y designar un reemplazo.']
          ]
        }
      },
      {
        titulo: '10. Control de cambios',
        cuerpo: 'Toda modificación de las reglas queda registrada con su ' +
                'versión y su fecha, y se comunica a las facultades antes de ' +
                'aplicarse. Las versiones anteriores se conservan, de modo ' +
                'que siempre es posible saber con qué criterio se revisó una ' +
                'corrida pasada.',
        lista: [],
        tabla: null
      }
    ]
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
    // Las tarjetas que apuntan a una página del propio sitio no llevan enlace
    // externo, y exigirles https sería un reparo falso.
    if (String(d.pagina || '').trim()) {
      return;
    }
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

  /* Sin fuentes remotas: un <link> a un servidor de tipografías bloquea el
     primer pintado, y en una red institucional lenta o filtrada la página
     quedaría en blanco justo para quien tiene que leerla. Además evita que
     cada lector de un documento oficial quede registrado en un tercero.
     El carácter se consigue con el peso y el espaciado, no con la familia. */
  --sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
}
*{box-sizing:border-box}
body{margin:0;background:var(--papel);color:var(--texto);
  font-family:var(--sans);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.envoltura{max-width:1080px;margin:0 auto;padding:0 24px}

/* Barra institucional */
.barra{background:var(--blanco);border-bottom:3px solid var(--granate)}
.barra .envoltura{display:flex;align-items:center;justify-content:space-between;
  gap:16px;padding-top:14px;padding-bottom:14px;flex-wrap:wrap}
.barra .casa{font-family:var(--sans);font-weight:700;
  font-size:15px;letter-spacing:.02em;color:var(--tinta);text-transform:uppercase;margin:0}
.barra .oficina{font-size:13px;color:var(--suave);margin:2px 0 0}
.barra .sello{font-family:var(--sans);font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--granate);font-weight:600;white-space:nowrap}

/* Hero */
.hero{background:var(--tinta);color:#fff;padding:56px 0 60px}
.hero h1{font-family:var(--sans);font-weight:700;
  font-size:clamp(28px,4.4vw,46px);line-height:1.14;margin:0 0 18px;letter-spacing:-.01em}
.hero .bajada{font-size:clamp(16px,1.9vw,19px);max-width:62ch;color:#D7DAE0;margin:0}
.hero .periodo{display:inline-block;margin-top:26px;font-family:var(--mono);
  font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--oro);
  border:1px solid rgba(200,160,46,.45);border-radius:2px;padding:6px 12px}

/* Indicadores */
.indicadores{margin-top:-34px;margin-bottom:56px}
.rejilla{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}
.tarjeta-kpi{background:var(--blanco);border:1px solid var(--linea);border-radius:3px;
  padding:22px 20px;border-top:3px solid var(--granate)}
.tarjeta-kpi .cifra{font-family:var(--sans);font-weight:700;
  font-size:38px;line-height:1;color:var(--tinta);letter-spacing:-.02em}
.tarjeta-kpi .etiqueta{font-weight:600;font-size:14px;margin-top:10px;color:var(--texto)}
.tarjeta-kpi .detalle{font-size:13px;color:var(--suave);margin-top:3px;line-height:1.45}

/* Secciones */
section.bloque{margin-bottom:56px}
h2{font-family:var(--sans);font-weight:700;font-size:22px;color:var(--tinta);
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
.leyenda .n{font-family:var(--mono);font-weight:600;color:var(--tinta)}
.leyenda .q{color:var(--suave)}
.nota-panel{margin:18px 0 0;font-size:13.5px;color:var(--suave);
  border-left:3px solid var(--linea);padding-left:14px;line-height:1.55}

/* Documentos */
.docs{display:grid;grid-template-columns:repeat(auto-fit,minmax(258px,1fr));gap:16px}
.doc{background:var(--blanco);border:1px solid var(--linea);border-radius:3px;
  padding:22px 20px;display:flex;flex-direction:column}
.doc .cinta{font-family:var(--mono);font-size:11px;
  letter-spacing:.1em;text-transform:uppercase;color:var(--granate);font-weight:600;margin-bottom:12px}
.doc h3{font-family:var(--sans);font-size:17px;color:var(--tinta);margin:0 0 8px;line-height:1.3}
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
  const pagina = String(d.pagina || '').trim();
  const enlace = String(d.enlace || '').trim();

  // Una página interna se abre en la misma pestaña —es parte del sitio—;
  // un documento de Drive se abre aparte, para no perder la portada.
  const pie = pagina
    ? '<a href="' + esc(pagina) + '">Ver el documento &rarr;</a>'
    : enlace
      ? '<a href="' + esc(enlace) + '" target="_blank" rel="noopener noreferrer">Abrir documento &rarr;</a>'
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


/* ─────────────────────── página del Plan de Gestión ─────────────────────── */

const ESTILO_PLAN = `
.plan-cabecera{background:var(--tinta);color:#fff;padding:44px 0 40px}
.plan-cabecera .volver{display:inline-block;font-size:13px;color:#9BA3AE;
  text-decoration:none;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,.22);
  padding-bottom:2px}
.plan-cabecera .volver:hover{color:#fff}
.plan-cabecera h1{font-family:var(--sans);font-weight:700;
  font-size:clamp(26px,3.8vw,40px);line-height:1.15;margin:0 0 14px;letter-spacing:-.01em}
.plan-cabecera .bajada{font-size:clamp(15px,1.7vw,18px);color:#D7DAE0;margin:0;max-width:62ch}
.plan-sellos{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.plan-sellos span{font-family:var(--mono);font-size:11.5px;
  letter-spacing:.07em;text-transform:uppercase;color:var(--oro);
  border:1px solid rgba(200,160,46,.45);border-radius:2px;padding:5px 11px}

.plan-cuerpo{padding:44px 0 60px;display:grid;grid-template-columns:230px 1fr;gap:44px;
  align-items:start}
@media(max-width:860px){.plan-cuerpo{grid-template-columns:1fr;gap:26px}}

.plan-indice{position:sticky;top:24px;border-left:2px solid var(--linea);padding-left:16px}
@media(max-width:860px){.plan-indice{position:static;border-left:0;border-top:1px solid var(--linea);
  border-bottom:1px solid var(--linea);padding:16px 0}}
.plan-indice p{font-family:var(--mono);font-size:10.5px;
  letter-spacing:.11em;text-transform:uppercase;color:var(--suave);margin:0 0 12px;font-weight:600}
.plan-indice a{display:block;font-size:13.5px;color:var(--texto);text-decoration:none;
  padding:5px 0;line-height:1.35;border-bottom:1px solid transparent}
.plan-indice a:hover{color:var(--granate)}

.apartado{margin-bottom:40px;scroll-margin-top:20px}
.apartado:last-child{margin-bottom:0}
.apartado h2{font-family:var(--sans);font-weight:700;font-size:20px;
  color:var(--tinta);margin:0 0 14px;padding-bottom:9px;border-bottom:2px solid var(--granate);
  display:inline-block}
.apartado p{margin:0 0 13px;max-width:76ch;line-height:1.65}
.apartado ul{margin:0 0 13px;padding-left:20px;max-width:76ch}
.apartado li{margin-bottom:7px;line-height:1.6}
.apartado li::marker{color:var(--granate)}

.plan-tabla{width:100%;border-collapse:collapse;margin:6px 0 14px;font-size:14px;
  background:var(--blanco);border:1px solid var(--linea)}
.plan-tabla th{background:#EFEDE8;text-align:left;font-family:var(--sans);
  font-size:12.5px;letter-spacing:.02em;color:var(--tinta);padding:10px 13px;
  border-bottom:2px solid var(--linea);vertical-align:bottom}
.plan-tabla td{padding:10px 13px;border-bottom:1px solid var(--linea);
  vertical-align:top;line-height:1.5}
.plan-tabla tr:last-child td{border-bottom:0}
.plan-tabla tr:nth-child(even) td{background:#FBFAF8}
.envuelve-tabla{overflow-x:auto;margin-bottom:14px}

@media print{
  .plan-cabecera{background:#fff;color:#000;padding:0 0 20px}
  .plan-cabecera h1,.plan-cabecera .bajada{color:#000}
  .plan-cabecera .volver{display:none}
  .plan-sellos span{color:#000;border-color:#999}
  .plan-indice{display:none}
  .plan-cuerpo{display:block;padding:0}
  .apartado{break-inside:avoid;margin-bottom:24px}
  .plan-tabla{font-size:11px}
}
`;

/** Convierte el texto de un apartado en párrafos; la línea en blanco separa. */
function parrafos(texto) {
  return String(texto || '').split(/\n\s*\n/)
    .map(function (t) { return t.trim(); })
    .filter(Boolean)
    .map(function (t) { return '<p>' + esc(t).replace(/\n/g, '<br>') + '</p>'; })
    .join('\n');
}

/** Dibuja la tabla de un apartado, si la tiene. */
function bloqueTabla(t) {
  if (!t || !t.encabezados || !t.encabezados.length) return '';
  const filas = t.filas || [];
  return '<div class="envuelve-tabla"><table class="plan-tabla">' +
    '<thead><tr>' +
      t.encabezados.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
      filas.map(function (f) {
        return '<tr>' + (f || []).map(function (c) {
          return '<td>' + esc(c) + '</td>';
        }).join('') + '</tr>';
      }).join('') +
    '</tbody></table></div>';
}

/** Un ancla estable por apartado, para el índice lateral. */
function anclaApartado(i) { return 'ap' + (i + 1); }

function bloqueApartado(a, i) {
  const lista = (a.lista || []).filter(function (x) { return String(x || '').trim(); });
  return '<section class="apartado" id="' + anclaApartado(i) + '">' +
    '<h2>' + esc(a.titulo) + '</h2>' +
    parrafos(a.cuerpo) +
    (lista.length ? '<ul>' + lista.map(function (x) {
      return '<li>' + esc(x) + '</li>';
    }).join('') + '</ul>' : '') +
    bloqueTabla(a.tabla) +
  '</section>';
}

/**
 * Devuelve `plan.html`: el Plan de Gestión del Proyecto como página completa.
 *
 * Igual que la portada, es HTML y CSS; el JSON del final es el mismo registro
 * del contenido íntegro, de modo que cualquiera de las dos páginas publicadas
 * sirve para reabrir el editor.
 */
function paginaPlan(contenido) {
  const c = contenido || CONTENIDO_BASE;
  const ins = c.institucion || {};
  const pl = c.plan || {};
  const pie = c.pie || {};
  const apartados = pl.apartados || [];

  const registro = JSON.stringify(c, null, 2).replace(/</g, '\\u003c');

  return '<!doctype html>\n' +
'<html lang="es">\n' +
'<head>\n' +
'<meta charset="utf-8">\n' +
'<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
'<title>' + esc(pl.titulo) + ' — ' + esc(ins.universidad) + '</title>\n' +
'<meta name="description" content="' + esc(pl.bajada) + '">\n' +
'<style>' + HOJA_DE_ESTILO + ESTILO_PLAN + '</style>\n' +
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

'<section class="plan-cabecera">\n' +
'  <div class="envoltura">\n' +
'    <a class="volver" href="index.html">&larr; Volver a la portada</a>\n' +
'    <h1>' + esc(pl.titulo) + '</h1>\n' +
(pl.bajada ? '    <p class="bajada">' + esc(pl.bajada) + '</p>\n' : '') +
((pl.version || pl.aprobacion) ?
'    <div class="plan-sellos">\n' +
(pl.version ? '      <span>' + esc(pl.version) + '</span>\n' : '') +
(pl.aprobacion ? '      <span>' + esc(pl.aprobacion) + '</span>\n' : '') +
'    </div>\n' : '') +
'  </div>\n' +
'</section>\n\n' +

'<div class="envoltura">\n' +
'  <div class="plan-cuerpo">\n' +
'    <nav class="plan-indice">\n' +
'      <p>Contenido</p>\n' +
      apartados.map(function (a, i) {
        return '      <a href="#' + anclaApartado(i) + '">' + esc(a.titulo) + '</a>';
      }).join('\n') + '\n' +
'    </nav>\n' +
'    <main>\n' +
      apartados.map(bloqueApartado).join('\n') + '\n' +
'    </main>\n' +
'  </div>\n' +
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
    paginaPlan: paginaPlan,
    leerContenido: leerContenido,
    revisarAntesDePublicar: revisarAntesDePublicar
  };
}
