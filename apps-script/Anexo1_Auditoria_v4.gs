/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  AUDITORÍA AUTOMÁTICA DEL ANEXO 1 — INVENTARIO DE PRODUCTOS Y PROCESOS
 *  Oficina de Racionalización — OGPL (UNMSM)
 *
 *  VERSIÓN 4 — incorpora las contra observaciones del revisor
 *  ─────────────────────────────────────────────────────────────────────────────
 *   [C8]  Las columnas añadidas a mano en el dashboard (CONTRA OBSERVACIÓN y
 *         cualquier otra) SE CONSERVAN entre corridas. La v3 las borraba.
 *   [C9]  La profundidad del código de producto deja de ser fija. Un código es
 *         PROCESO si otro código de la hoja lo tiene como prefijo, y PRODUCTO si
 *         no tiene descendientes. Resuelve los códigos de 5 niveles de la FDCP.
 *   [C10] Un proceso de Nivel 0 se reconoce por su denominación o por un código
 *         embebido en cualquier posición de la celda, no solo por el código
 *         inicial. Resuelve los 13 falsos faltantes de FFB, FO, FE y FQIQ.
 *   [C11] Regla nueva: la denominación de todo proceso debe ir en MAYÚSCULAS.
 *   [C12] La columna E admite "NINGUNO": la regla solo exige texto.
 *   [C13] Se reportan las discrepancias entre el código y la denominación de un
 *         proceso, y las celdas que arrastran dos códigos.
 *
 *  Especificación: reglas/ANEXO-1_reglas-v4.md
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const CONFIG_A1 = {

  ID_ANEXO1:    '1SUMuS32zUweN_o7WfdBhXq-ipvvaFXYTcxKF1hmhPww',
  ID_DASHBOARD: '1oYBAHp-Bd0V8un5hUAWdK1jKbcbdsROH4IOyM0MAmFk',

  FILA_INICIO: 5,
  COL_INICIO: 2,   // Columna B
  NUM_COLUMNAS: 8, // B..I

  // [C12] Contra observación del revisor: «la regla dice que la columna E solo
  // será texto, por lo que NINGUNO no viola esa regla». Poner en true para
  // volver al criterio estricto de la v3.
  RECHAZAR_NULOS_EN_E: false,

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
    "PROCESOS ESTRATÉGICOS", "PROCESOS MISIONALES", "PROCESOS DE SOPORTE"
  ],

  TIPOS_ENTREGABLE:      ["Regulación", "Servicio", "Bien"],
  ROLES_INSTITUCIONALES: ["Ente rector", "Calidad"],
  VARIABLES_CALIDAD: [
    "Tiempo de atención", "Cumplimiento de plazos", "Claridad",
    "Trato recibido", "Facilidad de acceso"
  ],
  CRITERIOS_IMPACTO: [
    "solucionar un problema público", "funciones sustantivas", "misión, estrategia",
    "necesidades de las personas", "desarrollo y fortalecimiento"
  ],

  VALORES_NULOS: [
    "NINGUNO", "NINGUNA", "NINGUN", "N/A", "NA", "N.A.",
    "NO APLICA", "NO APLICABLE", "SIN DATO", "SIN DATOS",
    "-", "--", "---", ".", "X", "0", "PENDIENTE", "POR DEFINIR"
  ],

  /**
   * [C9][C10] Un código es `PE|PM|PS` seguido de uno o más grupos numéricos y,
   * opcionalmente, del sufijo de formato. Los datos traen el sufijo escrito de
   * cuatro maneras: "_F04", "-F04", ".F07" y "_04" (sin la F).
   */
  REGEX_CODIGO: /(PE|PM|PS)((?:\.\d{1,2})+)(?:[_\-.]\s?[Ff]?\d{1,2})?/gi,

  REGEX_AE_PARSE: /^AE[\s.\-]?(\d{1,2})(?:\s*[.\-]\s*(\d{1,2}))?([\s\S]*)$/i,
  REGEX_LETRA:    /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/,

  SIGLAS_INVALIDAS_D: [
    {
      sigla: "AEI",
      regex: /^AEI\b|^AEI[\s.\-]?\d/i,
      motivo:
        'Sigla incorrecta "AEI". La regla 3.1 del Anexo 1 normaliza la Acción ' +
        'Estratégica con la sigla "AE"; "AEI" (Acción Estratégica Institucional) ' +
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
        'a AE.02.01, seguida de su descripción. Por eso corresponde AE.02.01 y no OE.02.'
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
      motivo: 'Sigla no reconocida "AS". No corresponde a ninguna nomenclatura del ' +
              'planeamiento institucional aplicable al Anexo 1, que solo admite "AE".',
      correccion: 'Reemplace por la Acción Estratégica correspondiente en formato AE.##.## ' +
                  'seguida de su descripción. Nota: estos registros además vienen sin texto ' +
                  'descriptivo, solo con el código.'
    },
    {
      sigla: "AM",
      regex: /^AM[\s.\-]?\d/i,
      motivo: 'Sigla no reconocida "AM". No corresponde a ninguna nomenclatura del ' +
              'planeamiento institucional aplicable al Anexo 1, que solo admite "AE".',
      correccion: 'Reemplace por la Acción Estratégica correspondiente en formato AE.##.## ' +
                  'seguida de su descripción. Nota: estos registros además vienen sin texto ' +
                  'descriptivo, solo con el código.'
    }
  ],

  ENCABEZADO_CONTRA: "CONTRA OBSERVACIÓN"
};

const TOTAL_CRITERIOS = 8;

/* ═══════════════════════════════════════════════════════════════════════════
   UTILIDADES DE TEXTO
   ═══════════════════════════════════════════════════════════════════════════ */

function normalizarTexto_(txt) {
  return (txt || "").toString().trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}

function normalizarCodigo_(txt) {
  return (txt || "").toString().trim().toUpperCase().replace(/\s+/g, "");
}

function esValorNulo_(txt) {
  const n = normalizarTexto_(txt).replace(/[.\s]+$/, "");
  return CONFIG_A1.VALORES_NULOS.some(function (v) {
    return normalizarTexto_(v).replace(/[.\s]+$/, "") === n;
  });
}

function recortar_(txt) {
  const t = (txt || "").toString().trim().replace(/\s+/g, " ");
  return t.length > 60 ? t.substring(0, 57) + "..." : t;
}

const PALABRAS_VACIAS = ["DE", "DEL", "LA", "LAS", "EL", "LOS", "Y", "E", "A"];

function esqueleto_(txt) {
  return normalizarTexto_(txt).split(/[^A-Z0-9]+/).filter(function (t) {
    return t && PALABRAS_VACIAS.indexOf(t) === -1;
  });
}

function empiezaPor_(tokens, prefijo) {
  if (!prefijo.length || tokens.length < prefijo.length) return false;
  for (let i = 0; i < prefijo.length; i++) if (tokens[i] !== prefijo[i]) return false;
  return true;
}

const NIVEL0_ESQUELETOS = CONFIG_A1.PROCESOS_NIVEL0.map(function (p) {
  return { proceso: p, tokens: esqueleto_(p.nombre) };
});

const CATEGORIAS_NORM = CONFIG_A1.CATEGORIAS_NO_PRODUCTO.map(normalizarTexto_);

/* ═══════════════════════════════════════════════════════════════════════════
   ANÁLISIS DE LA COLUMNA B  [C9][C10][C13]
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Extrae TODOS los códigos presentes en la celda, no solo el primero.
 *
 * Varias facultades arrastran dos códigos en la misma celda: el de la posición
 * en que quedó la fila y el que de verdad le corresponde. Por ejemplo
 * "PM.03.19_F05 PS.01 GESTIÓN DE ADMISIÓN Y MATRÍCULA" (FO) o
 * "PE.01.03.06_F04 PE.02_04 GESTIÓN DE LA CALIDAD Y MEJORA CONTINUA" (FFB).
 * Si solo se leyera el primero, el proceso de Nivel 0 quedaría invisible.
 */
function extraerCodigos_(texto) {
  const salida = [];
  if (!texto) return salida;
  const re = new RegExp(CONFIG_A1.REGEX_CODIGO.source, "gi");
  let m;
  while ((m = re.exec(texto)) !== null) {
    const grupos = m[2].split(".").filter(String);
    salida.push({
      completo: m[0],
      base: (m[1] + m[2]).toUpperCase(),
      profundidad: grupos.length,
      inicio: m.index
    });
  }
  return salida;
}

/** Denominación: lo que queda de la celda tras quitarle todos los códigos. */
function denominacionDe_(texto, codigos) {
  let t = texto || "";
  for (let i = codigos.length - 1; i >= 0; i--) {
    const c = codigos[i];
    t = t.substring(0, c.inicio) + " " + t.substring(c.inicio + c.completo.length);
  }
  return t.replace(/\s+/g, " ").trim();
}

function buscarNivel0PorNombre_(nombre) {
  const tokens = esqueleto_(nombre);
  if (!tokens.length) return null;
  for (let i = 0; i < NIVEL0_ESQUELETOS.length; i++) {
    if (empiezaPor_(tokens, NIVEL0_ESQUELETOS[i].tokens)) return NIVEL0_ESQUELETOS[i].proceso;
  }
  return null;
}

function buscarNivel0PorCodigo_(base) {
  const b = normalizarCodigo_(base);
  for (let i = 0; i < CONFIG_A1.PROCESOS_NIVEL0.length; i++) {
    if (normalizarCodigo_(CONFIG_A1.PROCESOS_NIVEL0[i].codigo) === b) return CONFIG_A1.PROCESOS_NIVEL0[i];
  }
  return null;
}

function esDenominacionDeProcesoN0_(nombre) {
  return buscarNivel0PorNombre_(nombre) !== null;
}

/**
 * Clasifica una fila de la columna B.
 *
 * Devuelve { tipo, codigo, denominacion, nivel0, observaciones }
 * donde tipo ∈ { "vacia", "categoria", "nivel0", "proceso", "producto" }.
 *
 * `esPadre` responde si un código tiene descendientes en la misma hoja: es lo
 * que distingue un proceso de un producto sin fijar la profundidad, porque la
 * jerarquía no es igual en todas las facultades (la FDCP llega a cinco niveles
 * y la FO resuelve algunos procesos en dos).
 */
function clasificarFila_(colB, esPadre) {
  const texto = (colB || "").toString().trim();
  if (!texto) return { tipo: "vacia", observaciones: [] };

  if (CATEGORIAS_NORM.indexOf(normalizarTexto_(texto)) !== -1) {
    return { tipo: "categoria", observaciones: [] };
  }

  const codigos = extraerCodigos_(texto);
  const denominacion = denominacionDe_(texto, codigos);
  const obs = [];

  const n0PorNombre = buscarNivel0PorNombre_(denominacion);
  let n0PorCodigo = null;
  for (let i = 0; i < codigos.length; i++) {
    if (codigos[i].profundidad === 1) {
      n0PorCodigo = buscarNivel0PorCodigo_(codigos[i].base);
      if (n0PorCodigo) break;
    }
  }

  // [C13] Dos códigos en la misma celda.
  if (codigos.length > 1) {
    obs.push('Col B — La celda arrastra ' + codigos.length + ' códigos ("' +
             codigos.map(function (c) { return c.completo; }).join('", "') +
             '"). Debe quedar un único código seguido de la denominación.');
  }

  if (n0PorNombre || n0PorCodigo) {
    const elegido = n0PorNombre || n0PorCodigo;

    // [C13] El código dice un proceso y la denominación dice otro.
    if (n0PorNombre && n0PorCodigo && n0PorNombre.codigo !== n0PorCodigo.codigo) {
      obs.push('Col B — Discrepancia entre código y denominación: el código "' +
               n0PorCodigo.codigo + '" corresponde a "' + n0PorCodigo.nombre +
               '", pero la denominación registrada es la de "' + n0PorNombre.codigo +
               ' ' + n0PorNombre.nombre + '". Se toma la denominación; corrija el código.');
    }

    // [C11] Regla nueva: denominación de proceso en MAYÚSCULAS.
    if (denominacion && denominacion !== denominacion.toUpperCase()) {
      obs.push('Col B — La denominación del proceso debe escribirse íntegramente en ' +
               'MAYÚSCULAS. Registrada como "' + recortar_(denominacion) + '"; ' +
               'corresponde "' + recortar_(denominacion.toUpperCase()) + '".');
    }

    return { tipo: "nivel0", codigo: elegido.codigo, denominacion: denominacion,
             nivel0: elegido, observaciones: obs };
  }

  if (!codigos.length) {
    return { tipo: "producto", codigo: null, denominacion: texto, observaciones: obs };
  }

  const principal = codigos[0];

  // Nivel 1 o 2: el código tiene descendientes en esta misma hoja.
  if (esPadre(principal.base)) {
    if (denominacion && denominacion !== denominacion.toUpperCase()) {
      obs.push('Col B — La denominación del proceso debe escribirse íntegramente en ' +
               'MAYÚSCULAS. Registrada como "' + recortar_(denominacion) + '"; ' +
               'corresponde "' + recortar_(denominacion.toUpperCase()) + '".');
    }
    return { tipo: "proceso", codigo: principal.completo, denominacion: denominacion,
             observaciones: obs };
  }

  // Un código de un solo nivel nunca es un producto.
  if (principal.profundidad < 2) {
    return { tipo: "proceso", codigo: principal.completo, denominacion: denominacion,
             observaciones: obs };
  }

  return { tipo: "producto", codigo: principal.completo, denominacion: denominacion,
           observaciones: obs };
}

/* ═══════════════════════════════════════════════════════════════════════════
   VALIDADORES POR COLUMNA
   ═══════════════════════════════════════════════════════════════════════════ */

function validarCodigo_(clasificacion) {
  if (clasificacion.codigo) return { ok: true, obs: "" };
  return {
    ok: false,
    obs: 'Col B — Código ausente. El producto debe llevar su código jerárquico ' +
         '(PE|PM|PS seguido de los niveles y del sufijo _F##) delante de la denominación, ' +
         'p. ej. PE.01.01.01_F01 PLAN ESTRATÉGICO APROBADO.'
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
         'Debe contener "Final" (producto de salida del proceso) o "Parcial" (registro intermedio).'
  };
}

function validarAccionEstrategica_(colD) {
  if (!colD) {
    return { ok: false, obs: 'Col D — Acción Estratégica vacía. Debe registrarse el código AE.##.## seguido de la descripción de la acción.' };
  }
  if (esValorNulo_(colD)) {
    return {
      ok: false,
      obs: 'Col D — "' + recortar_(colD) + '" es un marcador de vacío, no una Acción ' +
           'Estratégica. Todo producto se alinea a una AE del PEI; registre AE.##.## + descripción.'
    };
  }
  for (let i = 0; i < CONFIG_A1.SIGLAS_INVALIDAS_D.length; i++) {
    const s = CONFIG_A1.SIGLAS_INVALIDAS_D[i];
    if (s.regex.test(colD)) return { ok: false, obs: 'Col D — ' + s.motivo + ' CORRECCIÓN: ' + s.correccion };
  }

  const m = colD.match(CONFIG_A1.REGEX_AE_PARSE);
  if (!m) {
    return { ok: false, obs: 'Col D — "' + recortar_(colD) + '" no corresponde a una Acción Estratégica. Formato exigido: AE.##.## seguido de su descripción.' };
  }
  if (!m[2]) {
    return {
      ok: false,
      obs: 'Col D — "' + recortar_(colD) + '" tiene numeración incompleta. La Acción ' +
           'Estratégica requiere dos niveles: AE.<objetivo>.<acción>, p. ej. AE.02.01. ' +
           'Un solo nivel identifica el objetivo, no la acción que deriva de él.'
    };
  }
  const descripcion = m[3].replace(/^[\s:.\-–—]+/, "").trim();
  if (!CONFIG_A1.REGEX_LETRA.test(descripcion)) {
    return {
      ok: false,
      obs: 'Col D — "' + recortar_(colD) + '" registra el código pero omite la descripción. ' +
           'La regla 3.1 exige el código AE.##.## SEGUIDO del texto de la acción ' +
           '(ej. "AE.02.01 Formación académica de calidad").'
    };
  }
  return { ok: true, obs: "" };
}

/**
 * [C12] Columna E — Actividad Operativa.
 *
 * Contra observación del revisor: la regla solo exige que la columna E sea
 * texto, de modo que "NINGUNO" no la incumple. Se acepta salvo que se active
 * CONFIG_A1.RECHAZAR_NULOS_EN_E.
 */
function validarActividadOperativa_(colE) {
  if (!colE) {
    return { ok: false, obs: 'Col E — Actividad Operativa vacía. Registre la actividad operativa del POI que ejecuta este producto.' };
  }
  if (CONFIG_A1.RECHAZAR_NULOS_EN_E && esValorNulo_(colE)) {
    return {
      ok: false,
      obs: 'Col E — "' + recortar_(colE) + '" es un marcador de vacío, no una Actividad Operativa.'
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
  if (lista.some(function (x) { return normalizarTexto_(x) === v; })) return { ok: true, obs: "" };
  return {
    ok: false,
    obs: etiquetaCol + ' — "' + recortar_(valor) + '" no es un valor admitido. Debe ser exactamente uno de: ' + lista.join(" · ") + '.'
  };
}

function validarListaAbierta_(valor, lista, etiquetaCol, etiquetaCampo) {
  if (!valor || esValorNulo_(valor)) {
    return { ok: false, obs: etiquetaCol + ' — ' + etiquetaCampo + ' sin registrar. Debe aparecer al menos uno de: ' + lista.join(" · ") + '.' };
  }
  const v = normalizarTexto_(valor);
  if (lista.some(function (x) { return v.indexOf(normalizarTexto_(x)) !== -1; })) return { ok: true, obs: "" };
  return {
    ok: false,
    obs: etiquetaCol + ' — "' + recortar_(valor) + '" no coincide con ninguna opción válida. Debe incluir al menos uno de: ' + lista.join(" · ") + '.'
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOCALIZACIÓN DE PESTAÑAS
   ═══════════════════════════════════════════════════════════════════════════ */

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
      if (an && nom.indexOf(an) !== -1 && (!mejor || an.length > mejor.peso)) {
        mejor = { fac: f, peso: an.length };
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

  const resumen = [];
  let detalle = [];
  let cobertura = [];
  let procesos = [];
  const yaAsignadas = {};

  CONFIG_A1.FACULTADES.forEach(function (fac) {
    const hoja = localizarHoja_(hojas, fac, yaAsignadas);
    if (!hoja) {
      resumen.push([fac.sigla, fac.nombre, 0, 0, 0, 0, "0%", "NO INICIADO",
        "Pestaña no encontrada en el Anexo 1. Verifique que exista una hoja cuyo nombre contenga la sigla " + fac.sigla + "."]);
      cobertura = cobertura.concat(construirCobertura_(fac.sigla, {}));
      return;
    }
    yaAsignadas[hoja.getSheetId()] = true;

    const r = procesarFacultad_(hoja, fac);
    resumen.push(r.resumenFila);
    detalle = detalle.concat(r.detalleFilas);
    cobertura = cobertura.concat(r.coberturaFilas);
    procesos = procesos.concat(r.procesoFilas);
  });

  escribirEnDashboard_(resumen, detalle, cobertura, procesos);
  notificar_("Auditoría del Anexo 1 completada. " + detalle.length + " productos evaluados en " +
             CONFIG_A1.FACULTADES.length + " facultades.");
}

function procesarFacultad_(hoja, fac) {
  const sigla = fac.sigla;
  const ultimaFila = hoja.getLastRow();

  if (ultimaFila < CONFIG_A1.FILA_INICIO) {
    return {
      resumenFila: [sigla, fac.nombre, 0, 0, 0, 0, "0%", "VACÍO", "Sin datos registrados a partir de la fila " + CONFIG_A1.FILA_INICIO + "."],
      detalleFilas: [], coberturaFilas: construirCobertura_(sigla, {}), procesoFilas: []
    };
  }

  const numFilas = ultimaFila - CONFIG_A1.FILA_INICIO + 1;
  const datos = hoja.getRange(CONFIG_A1.FILA_INICIO, CONFIG_A1.COL_INICIO, numFilas, CONFIG_A1.NUM_COLUMNAS).getValues();

  // ── PASADA 1: inventario de códigos, para saber cuáles tienen descendientes ──
  const bases = {};
  datos.forEach(function (fila) {
    extraerCodigos_(fila[0] ? fila[0].toString() : "").forEach(function (c) { bases[c.base] = true; });
  });
  const listaBases = Object.keys(bases);
  const cachePadre = {};
  const esPadre = function (base) {
    const b = normalizarCodigo_(base);
    if (cachePadre[b] !== undefined) return cachePadre[b];
    const prefijo = b + ".";
    let padre = false;
    for (let i = 0; i < listaBases.length; i++) {
      if (listaBases[i] !== b && listaBases[i].indexOf(prefijo) === 0) { padre = true; break; }
    }
    cachePadre[b] = padre;
    return padre;
  };

  // ── PASADA 2: clasificación y validación ──
  const productos = [];
  const procesoFilas = [];
  const n0Encontrados = {};
  let procN0Actual = "(sin proceso asignado)";

  for (let i = 0; i < datos.length; i++) {
    const filaReal = i + CONFIG_A1.FILA_INICIO;
    const v = datos[i].map(function (c) { return c === null || c === undefined ? "" : c.toString().trim(); });
    const colB = v[0], colC = v[1], colD = v[2], colE = v[3],
          colF = v[4], colG = v[5], colH = v[6], colI = v[7];

    if (!colB && !colC && !colD && !colE && !colF && !colG && !colH && !colI) continue;

    const cls = clasificarFila_(colB, esPadre);

    if (cls.tipo === "vacia" || cls.tipo === "categoria") continue;

    if (cls.tipo === "nivel0") {
      n0Encontrados[normalizarCodigo_(cls.nivel0.codigo)] = true;
      procN0Actual = cls.nivel0.codigo + " " + cls.nivel0.nombre;
      procesoFilas.push([sigla, filaReal, cls.codigo || "(sin código)", cls.denominacion, "Nivel 0",
        cls.observaciones.length ? cls.observaciones.join("  ||  ") : "Sin observaciones de formato."]);
      continue;
    }

    if (cls.tipo === "proceso") {
      procesoFilas.push([sigla, filaReal, cls.codigo || "(sin código)", cls.denominacion, "Subproceso",
        cls.observaciones.length ? cls.observaciones.join("  ||  ") : "Sin observaciones de formato."]);
      continue;
    }

    // ── Producto ──
    const checks = [
      validarCodigo_(cls),
      validarTipoProducto_(colC),
      validarAccionEstrategica_(colD),
      validarActividadOperativa_(colE),
      validarListaCerrada_(colF, CONFIG_A1.TIPOS_ENTREGABLE,      "Col F", "Clasificación"),
      validarListaCerrada_(colG, CONFIG_A1.ROLES_INSTITUCIONALES, "Col G", "Atributo institucional"),
      validarListaAbierta_(colH, CONFIG_A1.VARIABLES_CALIDAD,     "Col H", "Variables de calidad"),
      validarListaAbierta_(colI, CONFIG_A1.CRITERIOS_IMPACTO,     "Col I", "Criterios de validación")
    ];

    const correctos = checks.filter(function (c) { return c.ok; }).length;
    const obs = checks.filter(function (c) { return !c.ok; }).map(function (c) { return c.obs; })
                      .concat(cls.observaciones);

    const todoVacio = !colC && !colD && !colE && !colF && !colG && !colH && !colI;
    let estado;
    if (correctos === TOTAL_CRITERIOS && !cls.observaciones.length) estado = "COMPLETO";
    else if (todoVacio) estado = "PENDIENTE";
    else estado = "PARCIAL";

    productos.push({
      estado: estado,
      fila: [sigla, filaReal, procN0Actual, cls.codigo || "(sin código)", cls.denominacion,
             colC || "(vacío)", estado, Math.round((correctos / TOTAL_CRITERIOS) * 100) + "%",
             correctos + "/" + TOTAL_CRITERIOS,
             obs.length ? obs.join("  ||  ") : "Cumple los 8 criterios."]
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
    coberturaFilas: cobertura,
    procesoFilas: procesoFilas
  };
}

function construirCobertura_(sigla, encontrados) {
  return CONFIG_A1.PROCESOS_NIVEL0.map(function (p) {
    const presente = !!encontrados[normalizarCodigo_(p.codigo)];
    let estado, nota;
    if (presente) {
      estado = "PRESENTE"; nota = "";
    } else if (p.opcional) {
      estado = "NO APLICA";
      nota = "Según las directrices del Anexo 1, la ejecución de " + p.codigo +
             " no aplica a todas las facultades. No se computa como incumplimiento.";
    } else {
      estado = "FALTANTE";
      nota = "Regla 2.1: los 16 procesos de Nivel 0 son obligatorios. Registre el encabezado " +
             p.codigo + "_F## " + p.nombre + " y catalogue sus productos.";
    }
    return [sigla, p.codigo, p.nombre, p.opcional ? "Opcional" : "Obligatorio", estado, nota];
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   ESCRITURA DEL DASHBOARD  [C8]
   ═══════════════════════════════════════════════════════════════════════════ */

const COLORES_ESTADO = {
  "COMPLETO": "#d9ead3", "AVANZADO": "#cfe2f3", "EN DESARROLLO": "#fff2cc",
  "CRÍTICO": "#f4cccc", "PARCIAL": "#fff2cc", "PENDIENTE": "#fce5cd",
  "NO INICIADO": "#f4cccc", "VACÍO": "#f4cccc",
  "PRESENTE": "#d9ead3", "NO APLICA": "#efefef", "FALTANTE": "#f4cccc",
  "Nivel 0": "#d0e2f3", "Subproceso": "#f3f3f3"
};

function escribirEnDashboard_(resumen, detalle, cobertura, procesos) {
  const ss = SpreadsheetApp.openById(CONFIG_A1.ID_DASHBOARD);

  volcarHoja_(ss, "RESUMEN_EJECUTIVO_A1",
    ["FACULTAD", "NOMBRE", "TOTAL PRODUCTOS", "COMPLETOS", "PARCIALES", "PENDIENTES", "AVANCE", "ESTADO GENERAL", "DIAGNÓSTICO"],
    resumen, 7, "#1c4587", function (f) { return f[0]; });

  volcarHoja_(ss, "DETALLADO_PRODUCTOS_A1",
    ["FACULTAD", "FILA", "PROCESO NIVEL 0", "CÓDIGO PRODUCTO", "NOMBRE PRODUCTO", "TIPO", "ESTADO", "CUMPLIMIENTO", "CRITERIOS", "OBSERVACIONES Y CORRECCIONES"],
    detalle, 6, "#0d3472",
    function (f) { return f[0] + "␟" + normalizarTexto_(f[3] + " " + f[4]); },
    function (f) { return f[0] + "␟#" + f[1]; });

  volcarHoja_(ss, "COBERTURA_PROCESOS_A1",
    ["FACULTAD", "CÓDIGO", "PROCESO NIVEL 0", "EXIGENCIA", "ESTADO", "OBSERVACIÓN"],
    cobertura, 4, "#3d2b56",
    function (f) { return f[0] + "␟" + f[1]; });

  volcarHoja_(ss, "OBSERVACIONES_PROCESOS_A1",
    ["FACULTAD", "FILA", "CÓDIGO", "DENOMINACIÓN", "NIVEL", "OBSERVACIONES DE FORMATO"],
    procesos, 4, "#0f5132",
    function (f) { return f[0] + "␟" + normalizarTexto_(f[2] + " " + f[3]); },
    function (f) { return f[0] + "␟#" + f[1]; });
}

/**
 * [C8] Lee las columnas que el revisor añadió a mano a la derecha de las que
 * genera el script — CONTRA OBSERVACIÓN y cualquier otra — y las devuelve
 * indexadas por una clave estable de fila, para poder reponerlas después del
 * `clear()`. Sin esto, cada corrida borraría el trabajo de revisión.
 */
function rescatarColumnasManuales_(hoja, encabezadosGenerados, clave, claveAlterna) {
  const vacio = { encabezados: [], porClave: {}, porAlterna: {} };
  if (!hoja || hoja.getLastRow() < 2) return vacio;

  const ancho = hoja.getLastColumn();
  if (ancho <= encabezadosGenerados.length) return vacio;

  const previos = hoja.getRange(1, 1, hoja.getLastRow(), ancho).getValues();
  const cabecera = previos[0].map(function (c) { return (c || "").toString().trim(); });

  const generados = encabezadosGenerados.map(normalizarTexto_);
  const manuales = [];
  for (let c = 0; c < cabecera.length; c++) {
    if (cabecera[c] && generados.indexOf(normalizarTexto_(cabecera[c])) === -1) {
      manuales.push({ indice: c, titulo: cabecera[c] });
    }
  }
  if (!manuales.length) return vacio;

  const porClave = {};
  const porAlterna = {};
  for (let r = 1; r < previos.length; r++) {
    const fila = previos[r];
    const valores = manuales.map(function (m) { return (fila[m.indice] || "").toString(); });
    if (!valores.some(function (x) { return x.trim(); })) continue;
    try {
      const k = clave(fila);
      if (k) porClave[k] = valores;
      if (claveAlterna) {
        const ka = claveAlterna(fila);
        if (ka) porAlterna[ka] = valores;
      }
    } catch (e) {
      // Una fila previa con formato distinto no debe abortar el rescate.
    }
  }

  return { encabezados: manuales.map(function (m) { return m.titulo; }), porClave: porClave, porAlterna: porAlterna };
}

function volcarHoja_(ss, nombre, encabezados, filas, idxEstado, colorCabecera, clave, claveAlterna) {
  let hoja = ss.getSheetByName(nombre);

  const rescate = rescatarColumnasManuales_(hoja, encabezados, clave, claveAlterna);
  const manuales = rescate.encabezados.length
    ? rescate.encabezados
    : [CONFIG_A1.ENCABEZADO_CONTRA];

  if (!hoja) hoja = ss.insertSheet(nombre);
  hoja.clear();

  const cabecera = encabezados.concat(manuales);
  const nCols = cabecera.length;
  const nGen = encabezados.length;

  hoja.getRange(1, 1, 1, nCols).setValues([cabecera])
      .setFontWeight("bold").setBackground(colorCabecera)
      .setFontColor("#ffffff").setVerticalAlignment("middle").setWrap(true);

  if (filas.length) {
    hoja.getRange(2, 1, filas.length, nGen).setValues(filas);

    const recuperadas = filas.map(function (f) {
      let v = rescate.porClave[clave(f)];
      if (!v && claveAlterna) v = rescate.porAlterna[claveAlterna(f)];
      const salida = new Array(manuales.length).fill("");
      if (v) for (let i = 0; i < manuales.length && i < v.length; i++) salida[i] = v[i];
      return salida;
    });
    hoja.getRange(2, nGen + 1, filas.length, manuales.length).setValues(recuperadas);

    const fondos = filas.map(function (f) {
      return new Array(nCols).fill(COLORES_ESTADO[f[idxEstado]] || "#ffffff");
    });
    hoja.getRange(2, 1, filas.length, nCols).setBackgrounds(fondos);

    hoja.getRange(2, nGen, filas.length, 1 + manuales.length).setWrap(true);
  }

  hoja.setFrozenRows(1);
  hoja.autoResizeColumns(1, Math.max(1, nGen - 1));
  hoja.setColumnWidth(nGen, 520);
  for (let i = 0; i < manuales.length; i++) hoja.setColumnWidth(nGen + 1 + i, 340);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENTRADA DESDE LA INTERFAZ
   ═══════════════════════════════════════════════════════════════════════════ */

function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu("Auditoría OGPL")
      .addItem("Ejecutar auditoría del Anexo 1", "ejecutarAuditoriaAnexo1").addToUi();
  } catch (e) {
    // Sin interfaz disponible: no hay menú que crear.
  }
}

function notificar_(mensaje) {
  try {
    SpreadsheetApp.getUi().alert(mensaje);
  } catch (e) {
    Logger.log(mensaje);
  }
}
