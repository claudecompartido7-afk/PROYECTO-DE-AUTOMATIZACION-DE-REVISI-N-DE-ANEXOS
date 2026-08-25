/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  AUDITORÍA AUTOMÁTICA DEL ANEXO 1 — INVENTARIO DE PRODUCTOS Y PROCESOS
 *  Oficina de Racionalización — OGPL (UNMSM)
 *
 *  VERSIÓN 3
 *  ─────────────────────────────────────────────────────────────────────────────
 *  Cambios respecto de la v2:
 *
 *   [C1] Col D — Catálogo de siglas inválidas (AEI, AS, AM, AO, OE) con
 *        diagnóstico explicativo por caso, en vez de un rechazo genérico.
 *   [C2] Col D — Se exige numeración de dos niveles (AE.##.##) y texto
 *        descriptivo después del código.
 *   [C3] Col E — Se rechazan los marcadores de vacío (NINGUNO, N/A, ...) que
 *        antes aprobaban por el simple `length > 2`.
 *   [C4] Pestañas — Localización por sigla exacta. Elimina la colisión
 *        FM⊂FMV y FCC⊂FCCSS de `String.includes`.
 *   [C5] Jerarquía — Regla general: si la denominación coincide con un proceso
 *        de Nivel 0, la fila es proceso aunque su código tenga profundidad de
 *        producto. Reemplaza la lista fija SUBPROCESOS_EXCLUIDOS.
 *   [C6] Cobertura — Se verifica la presencia de los 16 procesos de Nivel 0
 *        (regla 2.1), con PE.03 y PS.08 tratados como opcionales.
 *   [C7] Ejecución — `getUi().alert()` aislado en try/catch para permitir
 *        activadores por tiempo.
 *
 *  Especificación: reglas/ANEXO-1_reglas-v3.md
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const CONFIG_A1 = {

  ID_ANEXO1:    '1SUMuS32zUweN_o7WfdBhXq-ipvvaFXYTcxKF1hmhPww',
  ID_DASHBOARD: '1oYBAHp-Bd0V8un5hUAWdK1jKbcbdsROH4IOyM0MAmFk',

  FILA_INICIO: 5,
  COL_INICIO: 2,   // Columna B
  NUM_COLUMNAS: 8, // B..I

  FACULTADES: [
    { sigla: "FM",     nombre: "Medicina",        alias: ["MEDICINA"] },
    { sigla: "FDCP",   nombre: "Derecho",         alias: ["DERECHO Y CIENCIA POLITICA", "DERECHO"] },
    { sigla: "FLCH",   nombre: "Letras",          alias: ["LETRAS Y CIENCIAS HUMANAS", "LETRAS"] },
    { sigla: "FFB",    nombre: "Farmacia",        alias: ["FARMACIA Y BIOQUIMICA", "FARMACIA"] },
    { sigla: "FO",     nombre: "Odontología",     alias: ["ODONTOLOGIA"] },
    { sigla: "FE",     nombre: "Educación",       alias: ["EDUCACION"] },
    { sigla: "FQIQ",   nombre: "Química",         alias: ["QUIMICA E INGENIERIA QUIMICA"] },
    { sigla: "FMV",    nombre: "Veterinaria",     alias: ["MEDICINA VETERINARIA", "VETERINARIA"] },
    { sigla: "FCA",    nombre: "Administrativas", alias: ["CIENCIAS ADMINISTRATIVA"] },
    { sigla: "FCB",    nombre: "Biológicas",      alias: ["CIENCIAS BIOLOGICA"] },
    { sigla: "FCC",    nombre: "Contables",       alias: ["CIENCIAS CONTABLE"] },
    { sigla: "FCE",    nombre: "Económicas",      alias: ["CIENCIAS ECONOMICA"] },
    { sigla: "FCF",    nombre: "Físicas",         alias: ["CIENCIAS FISICA"] },
    { sigla: "FCM",    nombre: "Matemáticas",     alias: ["CIENCIAS MATEMATICA"] },
    { sigla: "FCCSS",  nombre: "Sociales",        alias: ["CIENCIAS SOCIALE"] },
    { sigla: "FIGMMG", nombre: "Geológica",       alias: ["INGENIERIA GEOLOGICA", "GEOLOGICA"] },
    { sigla: "FII",    nombre: "Industrial",      alias: ["INGENIERIA INDUSTRIAL", "INDUSTRIAL"] },
    { sigla: "FPSIC",  nombre: "Psicología",      alias: ["PSICOLOGIA"] },
    { sigla: "FIEE",   nombre: "Electrónica",     alias: ["INGENIERIA ELECTRICA ELECTRONICA", "ELECTRONICA"] },
    { sigla: "FISI",   nombre: "Sistemas",        alias: ["INGENIERIA DE SISTEMAS", "SISTEMAS"] }
  ],

  // ── Regla 2.1 — Los 16 procesos de Nivel 0 ──────────────────────────────────
  // `opcional: true` según las directrices internas del Anexo 1: la ejecución de
  // PE.03 y PS.08 no aplica a todas las facultades.
  PROCESOS_NIVEL0: [
    { codigo: "PE.01", nombre: "GESTIÓN ESTRATÉGICA" },
    { codigo: "PE.02", nombre: "GESTIÓN DE LA CALIDAD Y MEJORA CONTINUA" },
    { codigo: "PE.03", nombre: "GESTIÓN DE RELACIONES INTERINSTITUCIONALES", opcional: true },
    { codigo: "PM.01", nombre: "GESTIÓN DE LA FORMACIÓN ACADÉMICA" },
    { codigo: "PM.02", nombre: "GESTIÓN DE LA INVESTIGACIÓN" },
    { codigo: "PM.03", nombre: "GESTIÓN DE LA RESPONSABILIDAD Y VINCULACIÓN SOCIAL" },
    { codigo: "PS.01", nombre: "GESTIÓN DE ADMISIÓN Y MATRÍCULA" },
    { codigo: "PS.02", nombre: "GESTIÓN DOCUMENTAL" },
    { codigo: "PS.03", nombre: "GESTIÓN DE BIENESTAR INTEGRAL" },
    { codigo: "PS.04", nombre: "GESTIÓN DE RECURSOS ECONÓMICOS" },
    { codigo: "PS.05", nombre: "GESTIÓN DE RECURSOS HUMANOS" },
    { codigo: "PS.06", nombre: "GESTIÓN DE ABASTECIMIENTO Y SERVICIOS" },
    { codigo: "PS.07", nombre: "GESTIÓN DE LA TECNOLOGÍA DE LA INFORMACIÓN" },
    { codigo: "PS.08", nombre: "GESTIÓN DE ACTIVIDADES PRODUCTIVAS", opcional: true },
    { codigo: "PS.09", nombre: "GESTIÓN DE RECURSOS BIBLIOGRÁFICOS" },
    { codigo: "PS.10", nombre: "GESTIÓN DE LA COMUNICACIÓN" }
  ],

  CATEGORIAS_NO_PRODUCTO: [
    "PROCESOS ESTRATÉGICOS",
    "PROCESOS MISIONALES",
    "PROCESOS DE SOPORTE"
  ],

  TIPOS_ENTREGABLE:      ["Regulación", "Servicio", "Bien"],
  ROLES_INSTITUCIONALES: ["Ente rector", "Calidad"],
  VARIABLES_CALIDAD: [
    "Tiempo de atención", "Cumplimiento de plazos", "Claridad",
    "Trato recibido", "Facilidad de acceso"
  ],
  CRITERIOS_IMPACTO: [
    "solucionar un problema público",
    "funciones sustantivas",
    "misión, estrategia",
    "necesidades de las personas",
    "desarrollo y fortalecimiento"
  ],

  // [C3] Marcadores de vacío que NO constituyen un registro válido.
  VALORES_NULOS: [
    "NINGUNO", "NINGUNA", "NINGUN", "N/A", "NA", "N.A.",
    "NO APLICA", "NO APLICABLE", "SIN DATO", "SIN DATOS",
    "-", "--", "---", ".", "X", "0", "PENDIENTE", "POR DEFINIR"
  ],

  // ── Jerarquía de la columna B ───────────────────────────────────────────────
  REGEX_NIVEL0:      /^((PE|PM|PS)\.\d{2})(?:[_\-]?[Ff]\d+)?\s+(.+)$/i,
  REGEX_NIVEL1:      /^((PE|PM|PS)\.\d{2}\.\d{2})(?:[_\-]?[Ff]\d+)?\s+(.+)$/i,
  REGEX_PRODUCTO:    /^((PE|PM|PS)\.\d{2}\.\d{2}\.\d{2}[_\-][Ff]\d{1,2})\s+(.+)$/i,

  // ── [C2] Acción Estratégica: AE + dos niveles numéricos + texto ────────────
  // Se analiza por partes en vez de con un patrón único, porque los datos traen
  // separadores heterogéneos: "AE.04.01 texto", "AE 04.01 texto",
  // "AE.02.02: texto" y hasta "AE 01.01texto" sin espacio.
  REGEX_AE_PARSE: /^AE[\s.\-]?(\d{1,2})(?:\s*[.\-]\s*(\d{1,2}))?([\s\S]*)$/i,
  REGEX_LETRA:    /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/,

  /**
   * [C1] Catálogo de siglas inválidas en la columna D.
   *
   * Cada entrada explica POR QUÉ el registro es incorrecto y QUÉ debe hacerse,
   * porque el error no es el mismo en todos los casos: unos son un problema de
   * sigla, otro es un nivel jerárquico equivocado y otro es contenido puesto en
   * la columna que no le corresponde.
   */
  SIGLAS_INVALIDAS_D: [
    {
      sigla: "AEI",
      regex: /^AEI\b|^AEI[\s.\-]?\d/i,
      motivo:
        'Sigla incorrecta "AEI". La regla 3.1 del Anexo 1 normaliza la Acción ' +
        'Estratégica con la sigla "AE". "AEI" (Acción Estratégica Institucional) ' +
        'pertenece a la nomenclatura del PEI y no se emplea en este inventario.',
      correccion:
        'NO basta con eliminar la "I": la numeración del PEI no coincide con la ' +
        'del Anexo. Verificado — AEI.04.02 describe "Simplificación administrativa" ' +
        'mientras AE 04.02 describe "Infraestructura y equipamiento": son acciones ' +
        'distintas. Identifique la AE equivalente por su DESCRIPCIÓN y regístrela ' +
        'como AE.##.## seguida de su texto.'
    },
    {
      sigla: "OE",
      regex: /^OE\b|^OE[\s.\-]?\d/i,
      motivo:
        'Nivel jerárquico equivocado. "OE" es un Objetivo Estratégico, no una ' +
        'Acción Estratégica. El objetivo es el nivel superior y agrupa varias ' +
        'acciones; la columna D exige el nivel de acción.',
      correccion:
        'Descienda del objetivo a la acción que lo ejecuta: de OE.02 debe pasarse ' +
        'a la acción que deriva de él, p. ej. AE.02.01, seguida de su descripción. ' +
        'Por eso corresponde AE.02.01 y no OE.02.'
    },
    {
      sigla: "AO",
      regex: /^AO\b|^AO[\s.\-]/i,
      motivo:
        'Contenido en la columna equivocada. "AO" identifica una Actividad ' +
        'Operativa, que corresponde a la COLUMNA E. La columna D está reservada ' +
        'a la Acción Estratégica.',
      correccion:
        'Traslade este texto a la columna E y registre en la columna D la Acción ' +
        'Estratégica AE.##.## de la que depende esa actividad.'
    },
    {
      sigla: "AS",
      regex: /^AS[\s.\-]?\d/i,
      motivo:
        'Sigla no reconocida "AS". No corresponde a ninguna nomenclatura del ' +
        'planeamiento institucional aplicable al Anexo 1, que solo admite "AE".',
      correccion:
        'Reemplace por la Acción Estratégica correspondiente en formato AE.##.## ' +
        'seguida de su descripción. Nota: estos registros además vienen sin texto ' +
        'descriptivo, solo con el código.'
    },
    {
      sigla: "AM",
      regex: /^AM[\s.\-]?\d/i,
      motivo:
        'Sigla no reconocida "AM". No corresponde a ninguna nomenclatura del ' +
        'planeamiento institucional aplicable al Anexo 1, que solo admite "AE".',
      correccion:
        'Reemplace por la Acción Estratégica correspondiente en formato AE.##.## ' +
        'seguida de su descripción. Nota: estos registros además vienen sin texto ' +
        'descriptivo, solo con el código.'
    }
  ]
};

const TOTAL_CRITERIOS = 8;

/* ═══════════════════════════════════════════════════════════════════════════
   UTILIDADES
   ═══════════════════════════════════════════════════════════════════════════ */

function normalizarTexto_(txt) {
  return (txt || "")
    .toString()
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function esValorNulo_(txt) {
  const n = normalizarTexto_(txt).replace(/[.\s]+$/, "");
  return CONFIG_A1.VALORES_NULOS.some(v => normalizarTexto_(v).replace(/[.\s]+$/, "") === n);
}

const CATEGORIAS_NORM = CONFIG_A1.CATEGORIAS_NO_PRODUCTO.map(normalizarTexto_);

// Palabras vacías: las facultades escriben el mismo proceso con y sin
// artículos ("GESTIÓN DE CALIDAD" vs "GESTIÓN DE LA CALIDAD"). Se descartan
// para comparar por el esqueleto de la denominación.
const PALABRAS_VACIAS = ["DE", "DEL", "LA", "LAS", "EL", "LOS", "Y", "E", "A"];

/** Reduce una denominación a sus palabras significativas. */
function esqueleto_(txt) {
  return normalizarTexto_(txt)
    .split(/[^A-Z0-9]+/)
    .filter(function (t) { return t && PALABRAS_VACIAS.indexOf(t) === -1; });
}

const NIVEL0_ESQUELETOS = CONFIG_A1.PROCESOS_NIVEL0.map(function (p) {
  return { proceso: p, tokens: esqueleto_(p.nombre) };
});

/** ¿`tokens` empieza exactamente por la secuencia `prefijo`? */
function empiezaPor_(tokens, prefijo) {
  if (prefijo.length === 0 || tokens.length < prefijo.length) return false;
  for (let i = 0; i < prefijo.length; i++) {
    if (tokens[i] !== prefijo[i]) return false;
  }
  return true;
}

/**
 * [C5] ¿La denominación corresponde a un proceso de Nivel 0?
 *
 * Se aplica sin importar la profundidad del código. En el libro hay 38 filas
 * con código de producto (4 segmentos) cuya denominación es en realidad un
 * proceso de Nivel 0 — una facultad numeró los 16 procesos como si fueran
 * productos de PE.01.01. Comparar por denominación cubre todos esos casos, que
 * la lista fija de la v2 solo cubría para una facultad.
 */
function esDenominacionDeProcesoN0_(nombre) {
  return buscarNivel0PorNombre_(nombre) !== null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   VALIDADORES POR COLUMNA
   Cada validador devuelve { ok: boolean, obs: string }
   ═══════════════════════════════════════════════════════════════════════════ */

function validarCodigo_(colB, match) {
  if (match) return { ok: true, obs: "" };
  return {
    ok: false,
    obs: 'Col B — Código ausente o mal formado. El producto debe seguir la ' +
         'estructura PE|PM|PS.##.##.##_F## seguida de su denominación ' +
         '(ej. PE.01.01.01_F01 PLAN ESTRATÉGICO APROBADO).'
  };
}

function validarTipoProducto_(colC) {
  if (!colC) {
    return { ok: false, obs: 'Col C — Tipo de producto vacío. Debe indicarse "Final / Salida" o "Parcial / Registro".' };
  }
  const c = colC.toLowerCase();
  if (c.indexOf("final") !== -1 || c.indexOf("parcial") !== -1) return { ok: true, obs: "" };
  return {
    ok: false,
    obs: 'Col C — "' + recortar_(colC) + '" no identifica el tipo de producto. ' +
         'Debe contener "Final" (producto de salida del proceso) o "Parcial" ' +
         '(registro intermedio).'
  };
}

/**
 * [C1][C2] Columna D — Acción Estratégica.
 *
 * Formato exigido por la regla 3.1: sigla AE + numeración de dos niveles
 * (objetivo.acción) + texto descriptivo. Ejemplo: "AE.04.01 Simplificación...".
 */
function validarAccionEstrategica_(colD) {
  if (!colD) {
    return {
      ok: false,
      obs: 'Col D — Acción Estratégica vacía. Debe registrarse el código AE.##.## ' +
           'seguido de la descripción de la acción.'
    };
  }

  if (esValorNulo_(colD)) {
    return {
      ok: false,
      obs: 'Col D — "' + recortar_(colD) + '" es un marcador de vacío, no una Acción ' +
           'Estratégica. Todo producto se alinea a una AE del PEI; registre AE.##.## + descripción.'
    };
  }

  // Siglas inválidas, con diagnóstico específico por caso.
  for (let i = 0; i < CONFIG_A1.SIGLAS_INVALIDAS_D.length; i++) {
    const s = CONFIG_A1.SIGLAS_INVALIDAS_D[i];
    if (s.regex.test(colD)) {
      return { ok: false, obs: 'Col D — ' + s.motivo + ' CORRECCIÓN: ' + s.correccion };
    }
  }

  const m = colD.match(CONFIG_A1.REGEX_AE_PARSE);

  if (!m) {
    return {
      ok: false,
      obs: 'Col D — "' + recortar_(colD) + '" no corresponde a una Acción Estratégica. ' +
           'Formato exigido: AE.##.## seguido de su descripción.'
    };
  }

  if (!m[2]) {
    return {
      ok: false,
      obs: 'Col D — "' + recortar_(colD) + '" tiene numeración incompleta. La Acción ' +
           'Estratégica requiere dos niveles: AE.<objetivo>.<acción>, p. ej. AE.02.01. ' +
           'Un solo nivel identifica el objetivo, no la acción que deriva de él.'
    };
  }

  // El texto puede ir tras un espacio, dos puntos, un guion o pegado al código.
  const descripcion = m[3].replace(/^[\s:.\-\u2013\u2014]+/, "").trim();

  if (!CONFIG_A1.REGEX_LETRA.test(descripcion)) {
    return {
      ok: false,
      obs: 'Col D — "' + recortar_(colD) + '" registra el código pero omite la ' +
           'descripción. La regla 3.1 exige el código AE.##.## SEGUIDO del texto de la acción ' +
           '(ej. "AE.02.01 Formación académica de calidad").'
    };
  }

  return { ok: true, obs: "" };
}

/** [C3] Columna E — Actividad Operativa. */
function validarActividadOperativa_(colE) {
  if (!colE) {
    return { ok: false, obs: 'Col E — Actividad Operativa vacía. Registre la actividad operativa del POI que ejecuta este producto.' };
  }
  if (esValorNulo_(colE)) {
    return {
      ok: false,
      obs: 'Col E — "' + recortar_(colE) + '" es un marcador de vacío, no una Actividad ' +
           'Operativa. Si el producto se ejecuta, tiene una actividad operativa asociada; ' +
           'regístrela con su denominación.'
    };
  }
  if (/^AE[\s.\-]?\d/i.test(colE)) {
    return {
      ok: false,
      obs: 'Col E — Contiene una Acción Estratégica ("' + recortar_(colE) + '"), que ' +
           'corresponde a la columna D. La columna E espera la Actividad Operativa en texto libre.'
    };
  }
  if (colE.length <= 2) {
    return { ok: false, obs: 'Col E — "' + recortar_(colE) + '" es demasiado breve para ser una Actividad Operativa.' };
  }
  return { ok: true, obs: "" };
}

function validarListaCerrada_(valor, lista, etiquetaCol, etiquetaCampo) {
  if (!valor) {
    return { ok: false, obs: etiquetaCol + ' — ' + etiquetaCampo + ' vacío. Valores admitidos: ' + lista.join(" · ") + '.' };
  }
  const v = normalizarTexto_(valor);
  if (lista.some(x => normalizarTexto_(x) === v)) return { ok: true, obs: "" };
  return {
    ok: false,
    obs: etiquetaCol + ' — "' + recortar_(valor) + '" no es un valor admitido. ' +
         'Debe ser exactamente uno de: ' + lista.join(" · ") + '.'
  };
}

function validarListaAbierta_(valor, lista, etiquetaCol, etiquetaCampo) {
  if (!valor || esValorNulo_(valor)) {
    return { ok: false, obs: etiquetaCol + ' — ' + etiquetaCampo + ' sin registrar. Debe aparecer al menos uno de: ' + lista.join(" · ") + '.' };
  }
  const v = normalizarTexto_(valor);
  if (lista.some(x => v.indexOf(normalizarTexto_(x)) !== -1)) return { ok: true, obs: "" };
  return {
    ok: false,
    obs: etiquetaCol + ' — "' + recortar_(valor) + '" no coincide con ninguna opción válida. ' +
         'Debe incluir al menos uno de: ' + lista.join(" · ") + '.'
  };
}

function recortar_(txt) {
  const t = (txt || "").toString().trim().replace(/\s+/g, " ");
  return t.length > 60 ? t.substring(0, 57) + "..." : t;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOCALIZACIÓN DE PESTAÑAS  [C4]
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * La v2 usaba `nombreHoja.includes(sigla)`, que hace que FM capture la pestaña
 * de FMV y FCC la de FCCSS — y la facultad legítima quedaba reportada como
 * NO INICIADO. Aquí la sigla se compara contra los tokens del nombre de la
 * pestaña, exigiendo igualdad exacta del token.
 */
/**
 * Determina a qué facultad pertenece una pestaña, resolviendo la ambigüedad por
 * especificidad: gana la coincidencia más larga. Así "Facultad de Medicina
 * Veterinaria" queda para FMV (alias "MEDICINA VETERINARIA", 20 caracteres) y no
 * para FM (alias "MEDICINA", 8). Una sigla como token exacto siempre prevalece
 * sobre cualquier alias por nombre.
 */
function facultadDeLaHoja_(nombreHoja) {
  const nom = normalizarTexto_(nombreHoja);
  const tokens = nom.split(/[^A-Z0-9]+/).filter(String);
  let mejor = null;

  CONFIG_A1.FACULTADES.forEach(function (f) {
    if (tokens.indexOf(normalizarTexto_(f.sigla)) !== -1) {
      const peso = 1000 + f.sigla.length;
      if (!mejor || peso > mejor.peso) mejor = { fac: f, peso: peso };
    }
    f.alias.forEach(function (a) {
      const an = normalizarTexto_(a);
      if (an && nom.indexOf(an) !== -1) {
        if (!mejor || an.length > mejor.peso) mejor = { fac: f, peso: an.length };
      }
    });
  });

  return mejor ? mejor.fac : null;
}

function localizarHoja_(hojas, fac, yaAsignadas) {
  for (let i = 0; i < hojas.length; i++) {
    const h = hojas[i];
    if (yaAsignadas[h.getSheetId()]) continue;
    const duenio = facultadDeLaHoja_(h.getName());
    if (duenio && duenio.sigla === fac.sigla) return h;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROCESO PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

function ejecutarAuditoriaAnexo1() {
  const ssA1 = SpreadsheetApp.openById(CONFIG_A1.ID_ANEXO1);
  const hojas = ssA1.getSheets();

  const listaResumen = [];
  let listaDetalle = [];
  let listaCobertura = [];
  const yaAsignadas = {};

  CONFIG_A1.FACULTADES.forEach(function (fac) {
    const hoja = localizarHoja_(hojas, fac, yaAsignadas);

    if (!hoja) {
      listaResumen.push([
        fac.sigla, fac.nombre, 0, 0, 0, 0, "0%", "NO INICIADO",
        "Pestaña no encontrada en el Anexo 1. Verifique que exista una hoja cuyo nombre contenga la sigla " + fac.sigla + "."
      ]);
      return;
    }
    yaAsignadas[hoja.getSheetId()] = true;

    const r = procesarFacultad_(hoja, fac);
    listaResumen.push(r.resumenFila);
    listaDetalle = listaDetalle.concat(r.detalleFilas);
    listaCobertura = listaCobertura.concat(r.coberturaFilas);
  });

  escribirEnDashboard_(listaResumen, listaDetalle, listaCobertura);

  // [C7] La notificación no debe abortar una ejecución sin interfaz.
  notificar_("Auditoría del Anexo 1 completada. Se evaluaron " +
             listaDetalle.length + " productos en " + CONFIG_A1.FACULTADES.length + " facultades.");
}

function procesarFacultad_(hoja, fac) {
  const sigla = fac.sigla;
  const ultimaFila = hoja.getLastRow();

  if (ultimaFila < CONFIG_A1.FILA_INICIO) {
    return {
      resumenFila: [sigla, fac.nombre, 0, 0, 0, 0, "0%", "VACÍO", "Sin datos registrados a partir de la fila " + CONFIG_A1.FILA_INICIO + "."],
      detalleFilas: [],
      coberturaFilas: construirCobertura_(sigla, {})
    };
  }

  const numFilas = ultimaFila - CONFIG_A1.FILA_INICIO + 1;
  const datos = hoja
    .getRange(CONFIG_A1.FILA_INICIO, CONFIG_A1.COL_INICIO, numFilas, CONFIG_A1.NUM_COLUMNAS)
    .getValues();

  const productos = [];
  const n0Encontrados = {};
  let procN0Actual = "(sin proceso asignado)";

  for (let i = 0; i < datos.length; i++) {
    const filaReal = i + CONFIG_A1.FILA_INICIO;
    const v = datos[i].map(function (c) { return c === null || c === undefined ? "" : c.toString().trim(); });
    const colB = v[0], colC = v[1], colD = v[2], colE = v[3],
          colF = v[4], colG = v[5], colH = v[6], colI = v[7];

    if (!colB && !colC && !colD && !colE && !colF && !colG && !colH && !colI) continue;

    // Categorías raíz sin código
    if (CATEGORIAS_NORM.indexOf(normalizarTexto_(colB)) !== -1) continue;

    const mN0 = colB.match(CONFIG_A1.REGEX_NIVEL0);
    const mN1 = colB.match(CONFIG_A1.REGEX_NIVEL1);
    const mProd = colB.match(CONFIG_A1.REGEX_PRODUCTO);

    // Encabezado de Nivel 0
    if (mN0 && !mN1 && !mProd) {
      procN0Actual = colB;
      n0Encontrados[normalizarTexto_(mN0[1])] = true;
      continue;
    }

    // Encabezado de Nivel 1
    if (mN1 && !mProd) continue;

    // [C5] Proceso de Nivel 0 registrado con profundidad de producto.
    if (mProd && esDenominacionDeProcesoN0_(mProd[3])) {
      const n0 = buscarNivel0PorNombre_(mProd[3]);
      if (n0) n0Encontrados[normalizarTexto_(n0.codigo)] = true;
      procN0Actual = mProd[3];
      continue;
    }

    // ── Fila candidata a producto ──
    const codigoProd = mProd ? mProd[1] : "(sin código)";
    const nombreProd = mProd ? mProd[3] : colB;

    const checks = [
      validarCodigo_(colB, mProd),
      validarTipoProducto_(colC),
      validarAccionEstrategica_(colD),
      validarActividadOperativa_(colE),
      validarListaCerrada_(colF, CONFIG_A1.TIPOS_ENTREGABLE,      "Col F", "Clasificación"),
      validarListaCerrada_(colG, CONFIG_A1.ROLES_INSTITUCIONALES, "Col G", "Atributo institucional"),
      validarListaAbierta_(colH, CONFIG_A1.VARIABLES_CALIDAD,     "Col H", "Variables de calidad"),
      validarListaAbierta_(colI, CONFIG_A1.CRITERIOS_IMPACTO,     "Col I", "Criterios de validación")
    ];

    const correctos = checks.filter(function (c) { return c.ok; }).length;
    const obs = checks.filter(function (c) { return !c.ok; }).map(function (c) { return c.obs; });

    const todoVacio = !colC && !colD && !colE && !colF && !colG && !colH && !colI;
    let estado;
    if (correctos === TOTAL_CRITERIOS) estado = "COMPLETO";
    else if (todoVacio) estado = "PENDIENTE";
    else estado = "PARCIAL";

    const pct = Math.round((correctos / TOTAL_CRITERIOS) * 100);

    productos.push({
      estado: estado,
      fila: [
        sigla, filaReal, procN0Actual, codigoProd, nombreProd,
        colC || "(vacío)", estado, pct + "%",
        correctos + "/" + TOTAL_CRITERIOS,
        obs.length ? obs.join("  ||  ") : "Cumple los 8 criterios."
      ]
    });
  }

  const total      = productos.length;
  const completos  = productos.filter(function (p) { return p.estado === "COMPLETO"; }).length;
  const parciales  = productos.filter(function (p) { return p.estado === "PARCIAL"; }).length;
  const pendientes = productos.filter(function (p) { return p.estado === "PENDIENTE"; }).length;

  const avance = total > 0 ? Math.round(((completos + parciales * 0.5) / total) * 100) : 0;
  let estadoGeneral;
  if (avance === 100) estadoGeneral = "COMPLETO";
  else if (avance >= 75) estadoGeneral = "AVANZADO";
  else if (avance >= 40) estadoGeneral = "EN DESARROLLO";
  else estadoGeneral = "CRÍTICO";

  // [C6] Cobertura de los 16 procesos de Nivel 0
  const cobertura = construirCobertura_(sigla, n0Encontrados);
  const faltantes = cobertura.filter(function (c) { return c[4] === "FALTANTE"; });

  let diagnostico = completos + " completos, " + parciales + " con observaciones, " + pendientes + " pendientes.";
  if (faltantes.length) {
    diagnostico += " Faltan " + faltantes.length + " procesos de Nivel 0 obligatorios: " +
                   faltantes.map(function (f) { return f[1]; }).join(", ") + ".";
  }

  return {
    resumenFila: [sigla, fac.nombre, total, completos, parciales, pendientes, avance + "%", estadoGeneral, diagnostico],
    detalleFilas: productos.map(function (p) { return p.fila; }),
    coberturaFilas: cobertura
  };
}

function buscarNivel0PorNombre_(nombre) {
  const tokens = esqueleto_(nombre);
  if (!tokens.length) return null;
  for (let i = 0; i < NIVEL0_ESQUELETOS.length; i++) {
    if (empiezaPor_(tokens, NIVEL0_ESQUELETOS[i].tokens)) return NIVEL0_ESQUELETOS[i].proceso;
  }
  return null;
}

function construirCobertura_(sigla, encontrados) {
  return CONFIG_A1.PROCESOS_NIVEL0.map(function (p) {
    const presente = !!encontrados[normalizarTexto_(p.codigo)];
    let estado, nota;
    if (presente) {
      estado = "PRESENTE";
      nota = "";
    } else if (p.opcional) {
      estado = "NO APLICA";
      nota = "Según las directrices del Anexo 1, la ejecución de " + p.codigo + " no aplica a todas las facultades. No se computa como incumplimiento.";
    } else {
      estado = "FALTANTE";
      nota = "Regla 2.1: los 16 procesos de Nivel 0 son obligatorios. Registre el encabezado " + p.codigo + "_F## " + p.nombre + " y catalogue sus productos.";
    }
    return [sigla, p.codigo, p.nombre, p.opcional ? "Opcional" : "Obligatorio", estado, nota];
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   ESCRITURA DEL DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */

function escribirEnDashboard_(filasResumen, filasDetalle, filasCobertura) {
  const ss = SpreadsheetApp.openById(CONFIG_A1.ID_DASHBOARD);

  const COLORES = {
    "COMPLETO": "#d9ead3", "AVANZADO": "#cfe2f3", "EN DESARROLLO": "#fff2cc",
    "CRÍTICO": "#f4cccc", "PARCIAL": "#fff2cc", "PENDIENTE": "#fce5cd",
    "NO INICIADO": "#f4cccc", "VACÍO": "#f4cccc",
    "PRESENTE": "#d9ead3", "NO APLICA": "#efefef", "FALTANTE": "#f4cccc"
  };

  volcarHoja_(ss, "RESUMEN_EJECUTIVO_A1",
    ["FACULTAD", "NOMBRE", "TOTAL PRODUCTOS", "COMPLETOS", "PARCIALES", "PENDIENTES", "AVANCE", "ESTADO GENERAL", "DIAGNÓSTICO"],
    filasResumen, 7, COLORES, "#1c4587");

  volcarHoja_(ss, "DETALLADO_PRODUCTOS_A1",
    ["FACULTAD", "FILA", "PROCESO NIVEL 0", "CÓDIGO PRODUCTO", "NOMBRE PRODUCTO", "TIPO", "ESTADO", "CUMPLIMIENTO", "CRITERIOS", "OBSERVACIONES Y CORRECCIONES"],
    filasDetalle, 6, COLORES, "#0d3472");

  volcarHoja_(ss, "COBERTURA_PROCESOS_A1",
    ["FACULTAD", "CÓDIGO", "PROCESO NIVEL 0", "EXIGENCIA", "ESTADO", "OBSERVACIÓN"],
    filasCobertura, 4, COLORES, "#3d2b56");
}

/**
 * Vuelca un bloque de filas en una hoja del dashboard.
 * `idxEstado` es el índice de la columna cuyo valor decide el color de la fila.
 */
function volcarHoja_(ss, nombre, encabezados, filas, idxEstado, colores, colorCabecera) {
  let hoja = ss.getSheetByName(nombre);
  if (!hoja) hoja = ss.insertSheet(nombre);
  hoja.clear();

  const nCols = encabezados.length;

  hoja.getRange(1, 1, 1, nCols)
      .setValues([encabezados])
      .setFontWeight("bold")
      .setBackground(colorCabecera)
      .setFontColor("#ffffff")
      .setVerticalAlignment("middle");

  if (filas.length) {
    hoja.getRange(2, 1, filas.length, nCols).setValues(filas);

    const fondos = filas.map(function (f) {
      const col = colores[f[idxEstado]] || "#ffffff";
      return new Array(nCols).fill(col);
    });
    hoja.getRange(2, 1, filas.length, nCols).setBackgrounds(fondos);

    // La columna de observaciones es larga: ancho fijo y ajuste de texto.
    hoja.getRange(2, nCols, filas.length, 1).setWrap(true);
  }

  hoja.setFrozenRows(1);
  hoja.autoResizeColumns(1, Math.max(1, nCols - 1));
  hoja.setColumnWidth(nCols, 520);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENTRADA DESDE LA INTERFAZ  [C7]
   ═══════════════════════════════════════════════════════════════════════════ */

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("Auditoría OGPL")
      .addItem("Ejecutar auditoría del Anexo 1", "ejecutarAuditoriaAnexo1")
      .addToUi();
  } catch (e) {
    // Sin interfaz disponible: no hay menú que crear.
  }
}

/**
 * Notifica al usuario si hay interfaz. Bajo un activador por tiempo no la hay,
 * y `getUi()` lanza excepción — que en la v2 marcaba como fallida una ejecución
 * que en realidad había terminado bien.
 */
function notificar_(mensaje) {
  try {
    SpreadsheetApp.getUi().alert(mensaje);
  } catch (e) {
    Logger.log(mensaje);
  }
}
