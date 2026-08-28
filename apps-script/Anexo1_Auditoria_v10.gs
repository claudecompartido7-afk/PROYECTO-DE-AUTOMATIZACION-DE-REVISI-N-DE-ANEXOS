/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  AUDITORÍA AUTOMÁTICA DEL ANEXO 1 — INVENTARIO DE PRODUCTOS Y PROCESOS
 *  Oficina de Racionalización — OGPL (UNMSM)
 *
 *  VERSIÓN 10
 *  ─────────────────────────────────────────────────────────────────────────────
 *   [C30] Cada observación va en su propia línea dentro de la celda, en vez de
 *         encadenarse con " || ". Se ordenan por columna: primero la B, luego de
 *         la C a la I, y al final la recomendación de cierre.
 *
 *  Arrastra de la v9: catalogaciones y procesos mal codificados fuera del
 *  detallado, prefijo "Columna X -->", resumen con productos sin registro.
 *
 *  Arrastra de la v4: profundidad de código variable, Nivel 0 por código
 *  embebido o denominación, columna E que admite NINGUNO, y la regla de
 *  MAYÚSCULAS en la denominación de los procesos.
 *
 *  Especificación: reglas/ANEXO-1_reglas-v10.md
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

  /**
   * Catálogo oficial de facultades.
   *
   *  - `formulario`: número de formulario oficial, el sufijo `_F##` que deben
   *    llevar todos los códigos de su pestaña.
   *  - `nombre`: denominación oficial completa.
   *  - `alias`: formas con que aparece el nombre en los títulos de las pestañas.
   *    Se elige siempre la coincidencia más larga, de modo que "MEDICINA
   *    VETERINARIA" gana sobre "MEDICINA".
   */
  /**
   * Facultades según la relación oficial.
   *
   * `formulario` es el número de formulario asignado a la facultad. Fuente: hoja
   * CODIFICACION_DE_LAS_FACULTADES del dashboard, columna E. Los 20 están
   * declarados; nótese que la numeración no sigue el orden de la relación: la
   * FII lleva F20 y las tres últimas F17, F18 y F19.
   *
   * `alias` conserva la forma en que el título aparece HOY en cada pestaña, que
   * no siempre coincide con el nombre oficial (la FIEE lo lleva con las
   * palabras invertidas y la FCA en singular). Se usan raíces sin plural.
   */
  FACULTADES: [
    { sigla: "FM",     formulario: "F01", nombre: "FACULTAD DE MEDICINA",
      alias: ["MEDICINA"] },
    { sigla: "FDCP",   formulario: "F02", nombre: "FACULTAD DE DERECHO Y CIENCIA POLÍTICA",
      alias: ["DERECHO Y CIENCIA POLITICA", "DERECHO"] },
    { sigla: "FLCH",   formulario: "F03", nombre: "FACULTAD DE LETRAS Y CIENCIAS HUMANAS",
      alias: ["LETRAS Y CIENCIAS HUMANAS", "LETRAS"] },
    { sigla: "FFB",    formulario: "F04", nombre: "FACULTAD DE FARMACIA Y BIOQUÍMICA",
      alias: ["FARMACIA Y BIOQUIMICA", "FARMACIA"] },
    { sigla: "FO",     formulario: "F05", nombre: "FACULTAD DE ODONTOLOGÍA",
      alias: ["ODONTOLOGIA"] },
    { sigla: "FE",     formulario: "F06", nombre: "FACULTAD DE EDUCACIÓN",
      alias: ["EDUCACION"] },
    { sigla: "FQIQ",   formulario: "F07", nombre: "FACULTAD DE QUÍMICA E INGENIERÍA QUÍMICA",
      alias: ["QUIMICA E INGENIERIA QUIMICA"] },
    { sigla: "FMV",    formulario: "F08", nombre: "FACULTAD DE MEDICINA VETERINARIA",
      alias: ["MEDICINA VETERINARIA", "VETERINARIA"] },
    { sigla: "FCA",    formulario: "F09", nombre: "FACULTAD DE CIENCIAS ADMINISTRATIVAS",
      alias: ["CIENCIAS ADMINISTRATIVA"] },
    { sigla: "FCB",    formulario: "F10", nombre: "FACULTAD DE CIENCIAS BIOLÓGICAS",
      alias: ["CIENCIAS BIOLOGICA"] },
    { sigla: "FCC",    formulario: "F11", nombre: "FACULTAD DE CIENCIAS CONTABLES",
      alias: ["CIENCIAS CONTABLE"] },
    { sigla: "FCE",    formulario: "F12", nombre: "FACULTAD DE CIENCIAS ECONÓMICAS",
      alias: ["CIENCIAS ECONOMICA"] },
    { sigla: "FCF",    formulario: "F13", nombre: "FACULTAD DE CIENCIAS FÍSICAS",
      alias: ["CIENCIAS FISICA"] },
    { sigla: "FCM",    formulario: "F14", nombre: "FACULTAD DE CIENCIAS MATEMÁTICAS",
      alias: ["CIENCIAS MATEMATICA"] },
    { sigla: "FCCSS",  formulario: "F15", nombre: "FACULTAD DE CIENCIAS SOCIALES",
      alias: ["CIENCIAS SOCIALE"] },
    { sigla: "FIGMMG", formulario: "F16", nombre: "FACULTAD DE INGENIERÍA GEOLÓGICA, MINERA, METALÚRGICA Y GEOGRÁFICA",
      alias: ["INGENIERIA GEOLOGICA", "GEOLOGICA"] },
    { sigla: "FII",    formulario: "F20", nombre: "FACULTAD DE INGENIERÍA INDUSTRIAL",
      alias: ["INGENIERIA INDUSTRIAL", "INDUSTRIAL"] },
    { sigla: "FPSIC",  formulario: "F17", nombre: "FACULTAD DE PSICOLOGÍA",
      alias: ["PSICOLOGIA"] },
    { sigla: "FIEE",   formulario: "F18", nombre: "FACULTAD DE INGENIERÍA ELECTRÓNICA Y ELÉCTRICA",
      alias: ["INGENIERIA ELECTRONICA Y ELECTRICA", "INGENIERIA ELECTRICA ELECTRONICA", "ELECTRONICA"] },
    { sigla: "FISI",   formulario: "F19", nombre: "FACULTAD DE INGENIERÍA DE SISTEMAS E INFORMÁTICA",
      alias: ["INGENIERIA DE SISTEMAS", "SISTEMAS"] }
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

  /**
   * [C26] Catalogaciones: encabezan cada grupo de procesos de Nivel 0. No son
   * productos ni procesos, y no les corresponde codificación. Se comparan por su
   * esqueleto, de modo que "PROCESO MISIONAL" y "PROCESOS MISIONALES" son la
   * misma cosa y el código que algunas facultades les antepusieron no estorba.
   */
  CATEGORIAS_NO_PRODUCTO: [
    "PROCESOS ESTRATÉGICOS", "PROCESOS MISIONALES", "PROCESOS DE SOPORTE"
  ],

  /**
   * [C27] Una denominación que abre con estas palabras nombra un proceso.
   *
   * Solo en SINGULAR. El plural describe entregables —"PROCESOS DE ADQUISICIÓN
   * TRAMITADOS" es un producto de la FO—, mientras que el singular nombra la
   * actividad: "PROCESO DE COBERTURA Y SOPORTE PROTOCOLAR". Los plurales que sí
   * son catalogación (PROCESOS MISIONALES y compañía) los atrapa antes
   * `esCatalogacion_`.
   */
  PREFIJOS_DE_PROCESO: ["PROCESO", "SUBPROCESO", "SUB PROCESO"],

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
  // Los grupos numéricos admiten hasta tres dígitos: la FO llega a PM.03.173.
  REGEX_CODIGO: /(PE|PM|PS)((?:\.\d{1,3})+)(?:[_\-]\s?[Ff]?\d{1,2}|\.\s?[Ff]\d{1,2})?/gi,

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

  ENCABEZADO_CONTRA: "CONTRA OBSERVACIÓN",

  HOJA_PROCESOS: "OBSERVACIONES_DE_PROCESO_A1",

  // [C14] Nombres que tuvo la hoja de procesos. Se renombran al vigente para no
  // perder las contra observaciones ya escritas.
  HOJAS_PROCESOS_ANTERIORES: ["COBERTURA_PROCESOS_A1", "OBSERVACIONES_PROCESOS_A1"],

  /**
   * [C17] Todo encabezado que el script haya generado en cualquier versión.
   * Sirve para no confundir una columna heredada con una columna del revisor
   * cuando el formato de una hoja cambia entre versiones.
   */
  ENCABEZADOS_HISTORICOS: [
    "FACULTAD", "NOMBRE", "NOMBRE DE FACULTAD", "FILA", "CÓDIGO", "EXIGENCIA",
    "ESTADO", "OBSERVACIÓN", "OBSERVACIONES", "OBSERVACIONES DETALLADAS",
    "OBSERVACIONES Y CORRECCIONES", "OBSERVACIONES DE FORMATO",
    "PROCESO NIVEL 0", "PROCESO", "DENOMINACIÓN", "NIVEL",
    "CÓDIGO PRODUCTO", "NOMBRE PRODUCTO", "TIPO", "TIPO PRODUCTO",
    "CUMPLIMIENTO", "CUMPLIMIENTO (%)", "CRITERIOS", "AVANCE", "AVANCE (%)",
    "TOTAL PRODUCTOS", "COMPLETOS", "COMPLETOS (100%)", "PARCIALES",
    "PARCIALES (CON OBS.)", "PENDIENTES", "PENDIENTES (VACÍOS)",
    "PRODUCTOS CONFORMES", "PRODUCTOS OBSERVADOS", "PRODUCTOS SIN REGISTRO",
    "TOTAL PROCESOS", "PROCESOS CONFORMES", "PROCESOS OBSERVADOS",
    "PROCESOS NIVEL 0 CONFORMES", "PROCESOS NIVEL 0 OBSERVADOS",
    "SUBPROCESOS CONFORMES", "SUBPROCESOS OBSERVADOS", "CÓDIGO DE LA HOJA",
    "ESTADO GENERAL", "DIAGNÓSTICO", "FORMULARIO"
  ]
};

/** [C14] Criterios que se puntúan en cada fila de proceso. */
const CRITERIOS_PROCESO = [
  "Registro",
  "Código único en la celda",
  "Código coherente con la denominación",
  "Sufijo de formulario consistente",
  "Denominación en MAYÚSCULAS"
];
const TOTAL_CRITERIOS_PROCESO = CRITERIOS_PROCESO.length;

const TOTAL_CRITERIOS = 8;

/**
 * [C30] Separador entre observaciones de una misma fila.
 *
 * Un salto de línea dentro de la celda: cada observación queda en su renglón.
 * Las hojas del dashboard se escriben con `setWrap(true)` en esa columna, que es
 * lo que hace visible el salto.
 */
const SEPARADOR_OBS = "\n";

/** Une las observaciones de una fila respetando el orden en que se pasaron. */
function unirObservaciones_(obs, siNoHay) {
  return obs.length ? obs.join(SEPARADOR_OBS) : siNoHay;
}

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

/** Reduce plurales simples para que "MISIONAL" y "MISIONALES" coincidan. */
function singularizar_(t) {
  return t.replace(/ES$/, "").replace(/S$/, "");
}

const CATEGORIAS_ESQUELETOS = CONFIG_A1.CATEGORIAS_NO_PRODUCTO.map(function (c) {
  return esqueleto_(c).map(singularizar_);
});

/**
 * [C26] ¿La denominación es una de las tres catalogaciones raíz?
 *
 * Se descarta un token de formulario suelto: la FE registró la suya como
 * "F06 PROCESOS MISIONALES", con el número de formulario pegado delante y sin
 * un código que `extraerCodigos_` pueda retirar.
 */
function esCatalogacion_(denominacion) {
  const t = esqueleto_(denominacion)
    .filter(function (x) { return !/^F\d{1,2}$/.test(x); })
    .map(singularizar_);
  if (!t.length) return false;
  return CATEGORIAS_ESQUELETOS.some(function (c) {
    return c.length === t.length && c.every(function (x, i) { return x === t[i]; });
  });
}

/** [C27] ¿La denominación abre nombrando un proceso? */
function abrePorProceso_(denominacion) {
  const t = esqueleto_(denominacion);
  if (t.length < 2) return false;
  return CONFIG_A1.PREFIJOS_DE_PROCESO.some(function (pre) {
    const pt = esqueleto_(pre);
    return empiezaPor_(t, pt);
  });
}

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
 * Sufijo de formulario del código; null si no lo lleva.
 *
 * Tras `_` o `-` la F es opcional, porque la FFB escribe "PE.02_04". Tras un
 * punto la F es obligatoria: sin ella, el último grupo del propio código
 * ("PS.10") se confundiría con un sufijo.
 */
function sufijoDe_(codigoCompleto) {
  const m = (codigoCompleto || "").match(/(?:[_\-]\s?[Ff]?|\.\s?[Ff])(\d{1,2})\s*$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return "F" + (n < 10 ? "0" + n : n);
}

/**
 * Clasifica una fila de la columna B y evalúa su formato.
 *
 * Devuelve { tipo, codigo, codigoRegistrado, denominacion, nivel0, sufijo,
 *            checks, observaciones }
 * con tipo ∈ { "vacia", "categoria", "nivel0", "proceso", "producto" }.
 *
 * `esPadre` responde si un código tiene descendientes en la misma hoja: es lo
 * que distingue un proceso de un producto sin fijar la profundidad, porque la
 * jerarquía no es igual en todas las facultades (la FDCP llega a cinco niveles
 * y la FO resuelve algunos procesos en dos).
 *
 * `sufijoDominante` es el sufijo mayoritario de la pestaña: es el que gobierna
 * la observación por fila, para que una hoja entera mal numerada se reporte una
 * sola vez a nivel de hoja y no en cada una de sus filas. `sufijoOficial`, si se
 * declara, solo se usa para redactar la corrección sugerida.
 */
function clasificarFila_(colB, esPadre, sufijoDominante, sufijoOficial) {
  const texto = (colB || "").toString().trim();
  const checks = { unico: true, coherente: true, sufijo: true, mayusculas: true };

  if (!texto) return { tipo: "vacia", observaciones: [], checks: checks };

  const codigos = extraerCodigos_(texto);
  const denominacion = denominacionDe_(texto, codigos);
  const obs = [];

  // [C26] Catalogación: encabeza un grupo de procesos y no le corresponde código.
  if (esCatalogacion_(denominacion)) {
    // La FE dejó el número de formulario suelto delante ("F06 PROCESOS
    // MISIONALES"): no es un código que extraerCodigos_ pueda retirar, pero es
    // igualmente una codificación que no corresponde.
    const sueltoF = denominacion.match(/\bF\d{1,2}\b/);
    if (codigos.length || sueltoF) {
      checks.unico = false;
      const registrado = codigos.length ? codigos[0].completo : sueltoF[0];
      obs.push('Columna B --> NO LE CORRESPONDE UNA CODIFICACIÓN. "' +
               denominacion.replace(/\bF\d{1,2}\b\s*/, "").trim() +
               '" no es un producto ni un proceso: es la catalogación que encabeza un ' +
               'grupo de procesos de Nivel 0. Retire "' + registrado +
               '" y deje solo la denominación.');
    }
    if (denominacion && denominacion !== denominacion.toUpperCase()) {
      checks.mayusculas = false;
      obs.push('Columna B --> La catalogación debe escribirse íntegramente en MAYÚSCULAS. ' +
               'Registrada como "' + recortar_(denominacion) + '".');
    }
    return { tipo: "categoria", codigo: codigos.length ? codigos[0].completo : null,
             codigoRegistrado: codigos.length ? codigos[0].completo : "(sin código)",
             denominacion: denominacion, sufijo: null, checks: checks, observaciones: obs };
  }

  const n0PorNombre = buscarNivel0PorNombre_(denominacion);
  let n0PorCodigo = null;
  let codigoN0 = null;
  for (let i = 0; i < codigos.length; i++) {
    if (codigos[i].profundidad === 1) {
      const p = buscarNivel0PorCodigo_(codigos[i].base);
      if (p) { n0PorCodigo = p; codigoN0 = codigos[i]; break; }
    }
  }

  // [C28] Cuando la celda arrastra varios códigos, el más superficial indica el
  // nivel real de la fila: "PE.02.01.05_F04 PE.02.01_04 ASEGURAMIENTO DE LA
  // CALIDAD" es el subproceso PE.02.01, no un producto de cuatro niveles.
  let principal = codigos.length ? codigos[0] : null;
  for (let i = 1; i < codigos.length; i++) {
    if (codigos[i].profundidad < principal.profundidad) principal = codigos[i];
  }
  const esNivel0 = !!(n0PorNombre || n0PorCodigo);
  const elegido = n0PorNombre || n0PorCodigo;

  // ── [C15] Codificación errónea: la celda arrastra un código que no toca ──
  if (codigos.length > 1) {
    checks.unico = false;

    // El código que sobra es el que NO es el del proceso de Nivel 0. Ojo: desde
    // [C28] `principal` ya es el más superficial, que suele ser el correcto, así
    // que el sobrante hay que buscarlo aparte.
    let sobrante = null;
    if (codigoN0) {
      for (let i = 0; i < codigos.length; i++) {
        if (codigos[i].base !== codigoN0.base) { sobrante = codigos[i]; break; }
      }
    }

    if (esNivel0 && codigoN0 && sobrante) {
      const sufijoSugerido = sufijoOficial || sufijoDominante;
      const correcto = elegido.codigo + (sufijoSugerido ? "_" + sufijoSugerido : "_F##");
      obs.push('Columna B --> CODIFICACIÓN ERRÓNEA. El código "' + sobrante.completo +
               '" no corresponde a esta fila: la denominación "' + recortar_(denominacion) +
               '" es la del proceso de Nivel 0 ' + elegido.codigo +
               ', y ese código aparece también dentro de la misma celda ("' + codigoN0.completo +
               '"). Debe quedar un único código: ' + correcto + ' ' + denominacion.toUpperCase() + '.');
    } else {
      obs.push('Columna B --> La celda arrastra ' + codigos.length + ' códigos ("' +
               codigos.map(function (c) { return c.completo; }).join('", "') +
               '"). Debe quedar un único código seguido de la denominación.');
    }
  }

  // ── Coherencia entre el código y la denominación ──
  if (n0PorNombre && n0PorCodigo && n0PorNombre.codigo !== n0PorCodigo.codigo) {
    checks.coherente = false;
    obs.push('Columna B --> Discrepancia entre código y denominación: el código "' +
             n0PorCodigo.codigo + '" corresponde a "' + n0PorCodigo.nombre +
             '", pero la denominación registrada es la de "' + n0PorNombre.codigo +
             ' ' + n0PorNombre.nombre + '". Se toma la denominación; corrija el código.');
  }

  // ── [C16] Sufijo de formulario ──
  const sufijo = principal ? sufijoDe_(principal.completo) : null;
  if (sufijoDominante && sufijo && sufijo !== sufijoDominante) {
    checks.sufijo = false;
    obs.push('Columna B --> Sufijo de formulario incorrecto. Esta fila usa "_' + sufijo +
             '" y el resto de la pestaña usa "_' + sufijoDominante + '". El sufijo ' +
             'identifica el formulario de la facultad y debe ser el mismo en todos ' +
             'los códigos de la hoja.');
  }

  // ── [C11] Denominación de proceso en MAYÚSCULAS ──
  // [C27] La denominación también decide: "PROCESO DE COBERTURA Y SOPORTE
  // PROTOCOLAR" nombra un proceso aunque su código no tenga descendientes.
  const esProcesoPorNombre = abrePorProceso_(denominacion);
  const esProcesoPorCodigo = principal && (esPadre(principal.base) || principal.profundidad < 2);
  if ((esNivel0 || esProcesoPorCodigo || esProcesoPorNombre) &&
      denominacion && denominacion !== denominacion.toUpperCase()) {
    checks.mayusculas = false;
    obs.push('Columna B --> La denominación del proceso debe escribirse íntegramente en ' +
             'MAYÚSCULAS. Registrada como "' + recortar_(denominacion) + '"; ' +
             'corresponde "' + recortar_(denominacion.toUpperCase()) + '".');
  }

  if (esNivel0) {
    return { tipo: "nivel0", codigo: elegido.codigo,
             codigoRegistrado: principal ? principal.completo : "(sin código)",
             denominacion: denominacion, nivel0: elegido, sufijo: sufijo,
             checks: checks, observaciones: obs };
  }

  if (!principal) {
    return { tipo: "producto", codigo: null, codigoRegistrado: "(sin código)",
             denominacion: texto, sufijo: null, checks: checks, observaciones: obs };
  }

  if (esProcesoPorCodigo || esProcesoPorNombre) {
    if (esProcesoPorNombre && !esProcesoPorCodigo) {
      checks.coherente = false;
      obs.push('Columna B --> CODIFICACIÓN A CORREGIR. "' + recortar_(denominacion) +
               '" nombra un proceso, no un producto, pero está codificado como producto ' +
               '("' + principal.completo + '"). Debe llevar el código del nivel que le ' +
               'corresponde dentro de su proceso de Nivel 0.');
    }
    return { tipo: "proceso", codigo: principal.completo, codigoRegistrado: principal.completo,
             denominacion: denominacion, sufijo: sufijo, checks: checks, observaciones: obs };
  }

  return { tipo: "producto", codigo: principal.completo, codigoRegistrado: principal.completo,
           denominacion: denominacion, sufijo: sufijo, checks: checks, observaciones: obs };
}

/* ═══════════════════════════════════════════════════════════════════════════
   VALIDADORES POR COLUMNA
   ═══════════════════════════════════════════════════════════════════════════ */

function validarCodigo_(clasificacion) {
  if (clasificacion.codigo) return { ok: true, obs: "" };
  return {
    ok: false,
    obs: 'Columna B --> Código ausente. El producto debe llevar su código jerárquico ' +
         '(PE|PM|PS seguido de los niveles y del sufijo _F##) delante de la denominación, ' +
         'p. ej. PE.01.01.01_F01 PLAN ESTRATÉGICO APROBADO.'
  };
}

function validarTipoProducto_(colC) {
  if (!colC) {
    return { ok: false, obs: 'Columna C --> Tipo de producto vacío. Debe indicarse "Final / Salida" o "Parcial / Registro".' };
  }
  const c = colC.toLowerCase();
  if (c.indexOf("final") !== -1 || c.indexOf("parcial") !== -1) return { ok: true, obs: "" };
  return {
    ok: false,
    obs: 'Columna C --> "' + recortar_(colC) + '" no identifica el tipo de producto. ' +
         'Debe contener "Final" (producto de salida del proceso) o "Parcial" (registro intermedio).'
  };
}

function validarAccionEstrategica_(colD) {
  if (!colD) {
    return { ok: false, obs: 'Columna D --> Acción Estratégica vacía. Debe registrarse el código AE.##.## seguido de la descripción de la acción.' };
  }
  if (esValorNulo_(colD)) {
    return {
      ok: false,
      obs: 'Columna D --> "' + recortar_(colD) + '" es un marcador de vacío, no una Acción ' +
           'Estratégica. Todo producto se alinea a una AE del PEI; registre AE.##.## + descripción.'
    };
  }
  for (let i = 0; i < CONFIG_A1.SIGLAS_INVALIDAS_D.length; i++) {
    const s = CONFIG_A1.SIGLAS_INVALIDAS_D[i];
    if (s.regex.test(colD)) return { ok: false, obs: 'Columna D --> ' + s.motivo + ' CORRECCIÓN: ' + s.correccion };
  }

  const m = colD.match(CONFIG_A1.REGEX_AE_PARSE);
  if (!m) {
    return { ok: false, obs: 'Columna D --> "' + recortar_(colD) + '" no corresponde a una Acción Estratégica. Formato exigido: AE.##.## seguido de su descripción.' };
  }
  if (!m[2]) {
    return {
      ok: false,
      obs: 'Columna D --> "' + recortar_(colD) + '" tiene numeración incompleta. La Acción ' +
           'Estratégica requiere dos niveles: AE.<objetivo>.<acción>, p. ej. AE.02.01. ' +
           'Un solo nivel identifica el objetivo, no la acción que deriva de él.'
    };
  }
  const descripcion = m[3].replace(/^[\s:.\-–—]+/, "").trim();
  if (!CONFIG_A1.REGEX_LETRA.test(descripcion)) {
    return {
      ok: false,
      obs: 'Columna D --> "' + recortar_(colD) + '" registra el código pero omite la descripción. ' +
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
    return { ok: false, obs: 'Columna E --> Actividad Operativa vacía. Registre la actividad operativa del POI que ejecuta este producto.' };
  }
  if (CONFIG_A1.RECHAZAR_NULOS_EN_E && esValorNulo_(colE)) {
    return {
      ok: false,
      obs: 'Columna E --> "' + recortar_(colE) + '" es un marcador de vacío, no una Actividad Operativa.'
    };
  }
  if (/^AE[\s.\-]?\d/i.test(colE)) {
    return {
      ok: false,
      obs: 'Columna E --> Contiene una Acción Estratégica ("' + recortar_(colE) + '"), que ' +
           'corresponde a la columna D. La columna E espera la Actividad Operativa en texto libre.'
    };
  }
  if (colE.length <= 2) {
    return { ok: false, obs: 'Columna E --> "' + recortar_(colE) + '" es demasiado breve para ser una Actividad Operativa.' };
  }
  return { ok: true, obs: "" };
}

function validarListaCerrada_(valor, lista, etiquetaCol, etiquetaCampo) {
  if (!valor) {
    return { ok: false, obs: etiquetaCol + ' --> ' + etiquetaCampo + ' vacío. Valores admitidos: ' + lista.join(" · ") + '.' };
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
    return { ok: false, obs: etiquetaCol + ' --> ' + etiquetaCampo + ' sin registrar. Debe aparecer al menos uno de: ' + lista.join(" · ") + '.' };
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
  let procesos = [];
  const yaAsignadas = {};

  CONFIG_A1.FACULTADES.forEach(function (fac) {
    const hoja = localizarHoja_(hojas, fac, yaAsignadas);
    if (!hoja) {
      const sinHoja = "Pestaña no encontrada en el Anexo 1. Verifique que exista una hoja " +
                      "cuyo nombre contenga la sigla " + fac.sigla + ".";
      resumen.push([fac.sigla, fac.nombre,
                    0, 0, 0, 0, "0%", "NO INICIADO", sinHoja,
                    0, 0, 0, 0, 0, "0%", "NO INICIADO", sinHoja,
                    fac.formulario || "—"]);
      procesos = procesos.concat(filasNivel0_(fac.sigla, {}));
      return;
    }
    yaAsignadas[hoja.getSheetId()] = true;

    const r = procesarFacultad_(hoja, fac);
    resumen.push(r.resumenFila);
    detalle = detalle.concat(r.detalleFilas);
    procesos = procesos.concat(r.procesoFilas);
  });

  escribirEnDashboard_(resumen, detalle, procesos);
  notificar_("Auditoría del Anexo 1 completada. " + detalle.length + " productos y " +
             procesos.length + " procesos evaluados en " + CONFIG_A1.FACULTADES.length + " facultades.");
}

/** Puntúa una fila de proceso sobre los 5 criterios de CRITERIOS_PROCESO. */
function puntuarProceso_(checks, registrado) {
  const resultados = [registrado, checks.unico, checks.coherente, checks.sufijo, checks.mayusculas];
  return resultados.filter(Boolean).length;
}

function filaDeProceso_(sigla, codigo, denominacion, nivel, exigencia, fila, cls) {
  if (!cls) {
    return [sigla, codigo, denominacion, nivel, exigencia, "—", "FALTANTE", "0%",
            "0/" + TOTAL_CRITERIOS_PROCESO,
            "Regla 2.1: los 16 procesos de Nivel 0 son obligatorios. Registre el encabezado " +
            codigo + "_F## " + denominacion + " y catalogue sus productos."];
  }

  const puntos = puntuarProceso_(cls.checks, true);
  const estado = puntos === TOTAL_CRITERIOS_PROCESO ? "CONFORME" : "OBSERVADO";
  const obs = cls.observaciones.slice();

  if (cls.codigoRegistrado && normalizarCodigo_(cls.codigoRegistrado).indexOf(normalizarCodigo_(codigo)) !== 0) {
    obs.push('Registrado en la hoja como "' + cls.codigoRegistrado + '".');
  }

  return [sigla, codigo, denominacion, nivel, exigencia, fila, estado,
          Math.round((puntos / TOTAL_CRITERIOS_PROCESO) * 100) + "%",
          puntos + "/" + TOTAL_CRITERIOS_PROCESO,
          unirObservaciones_(obs, "Sin observaciones.")];
}

/** Las 16 filas de Nivel 0 de una facultad, presentes o no. */
function filasNivel0_(sigla, encontrados) {
  return CONFIG_A1.PROCESOS_NIVEL0.map(function (p) {
    const hallado = encontrados[normalizarCodigo_(p.codigo)];
    const exigencia = p.opcional ? "Opcional" : "Obligatorio";

    if (!hallado) {
      if (p.opcional) {
        return [sigla, p.codigo, p.nombre, "Nivel 0", exigencia, "—", "NO APLICA", "—", "—",
                "Según las directrices del Anexo 1, la ejecución de " + p.codigo +
                " no aplica a todas las facultades. No se computa como incumplimiento."];
      }
      return filaDeProceso_(sigla, p.codigo, p.nombre, "Nivel 0", exigencia, "—", null);
    }
    return filaDeProceso_(sigla, p.codigo, p.nombre, "Nivel 0", exigencia, hallado.fila, hallado.cls);
  });
}

/**
 * Contenido de la columna FORMULARIO del resumen: el número oficial y, entre
 * paréntesis, el que realmente usa la pestaña cuando no coinciden.
 */
function celdaFormulario_(fac, sufijoDominante) {
  if (!fac.formulario) return (sufijoDominante || "—") + " (oficial sin declarar)";
  if (sufijoDominante && sufijoDominante !== fac.formulario) {
    return fac.formulario + " (la hoja usa " + sufijoDominante + ")";
  }
  return fac.formulario;
}

function procesarFacultad_(hoja, fac) {
  const sigla = fac.sigla;
  const ultimaFila = hoja.getLastRow();

  if (ultimaFila < CONFIG_A1.FILA_INICIO) {
    const vacia = "Sin datos registrados a partir de la fila " + CONFIG_A1.FILA_INICIO + ".";
    return {
      resumenFila: [sigla, fac.nombre,
                    0, 0, 0, 0, "0%", "VACÍO", vacia,
                    0, 0, 0, 0, 0, "0%", "VACÍO", vacia,
                    fac.formulario || "—"],
      detalleFilas: [], procesoFilas: filasNivel0_(sigla, {})
    };
  }

  const numFilas = ultimaFila - CONFIG_A1.FILA_INICIO + 1;
  const datos = hoja.getRange(CONFIG_A1.FILA_INICIO, CONFIG_A1.COL_INICIO, numFilas, CONFIG_A1.NUM_COLUMNAS).getValues();

  // ── PASADA 1: inventario de códigos y sufijo dominante de la pestaña ──
  const bases = {};
  const sufijos = {};
  datos.forEach(function (fila) {
    extraerCodigos_(fila[0] ? fila[0].toString() : "").forEach(function (c) {
      bases[c.base] = true;
      const suf = sufijoDe_(c.completo);
      if (suf) sufijos[suf] = (sufijos[suf] || 0) + 1;
    });
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

  const sufijoDominante = Object.keys(sufijos).sort(function (a, b) {
    return sufijos[b] - sufijos[a];
  })[0] || null;

  // [C18] La pestaña entera con el formulario de otra facultad.
  const hojaConFormularioAjeno = !!(fac.formulario && sufijoDominante &&
                                    sufijoDominante !== fac.formulario);

  // ── PASADA 2: clasificación y validación ──
  const productos = [];
  const subprocesos = [];
  const n0Encontrados = {};
  let procN0Actual = "(sin proceso asignado)";

  for (let i = 0; i < datos.length; i++) {
    const filaReal = i + CONFIG_A1.FILA_INICIO;
    const v = datos[i].map(function (c) { return c === null || c === undefined ? "" : c.toString().trim(); });
    const colB = v[0], colC = v[1], colD = v[2], colE = v[3],
          colF = v[4], colG = v[5], colH = v[6], colI = v[7];

    if (!colB && !colC && !colD && !colE && !colF && !colG && !colH && !colI) continue;

    const cls = clasificarFila_(colB, esPadre, sufijoDominante, fac.formulario);
    if (cls.tipo === "vacia") continue;

    // [C26] La catalogación no se puntúa como producto, pero sí se reporta.
    if (cls.tipo === "categoria") {
      subprocesos.push(filaDeProceso_(sigla, cls.codigo || "(sin código)", cls.denominacion,
                                      "Catalogación", "—", filaReal, cls));
      continue;
    }

    if (cls.tipo === "nivel0") {
      const k = normalizarCodigo_(cls.nivel0.codigo);
      // Si el proceso aparece varias veces, se conserva la primera aparición.
      if (!n0Encontrados[k]) n0Encontrados[k] = { fila: filaReal, cls: cls };
      procN0Actual = cls.nivel0.codigo + " " + cls.nivel0.nombre;
      continue;
    }

    if (cls.tipo === "proceso") {
      subprocesos.push(filaDeProceso_(sigla, cls.codigo || "(sin código)", cls.denominacion,
                                      "Subproceso", "—", filaReal, cls));
      continue;
    }

    // ── Producto ──
    const checks = [
      validarCodigo_(cls),
      validarTipoProducto_(colC),
      validarAccionEstrategica_(colD),
      validarActividadOperativa_(colE),
      validarListaCerrada_(colF, CONFIG_A1.TIPOS_ENTREGABLE,      "Columna F", "Clasificación"),
      validarListaCerrada_(colG, CONFIG_A1.ROLES_INSTITUCIONALES, "Columna G", "Atributo institucional"),
      validarListaAbierta_(colH, CONFIG_A1.VARIABLES_CALIDAD,     "Columna H", "Variables de calidad"),
      validarListaAbierta_(colI, CONFIG_A1.CRITERIOS_IMPACTO,     "Columna I", "Criterios de validación")
    ];

    const correctos = checks.filter(function (c) { return c.ok; }).length;

    // [C30] Orden de lectura: la columna B primero —es la que identifica la
    // fila—, después de la C a la I en el orden de la hoja, y el cierre al final.
    const obs = cls.observaciones.concat(
      checks.filter(function (c) { return !c.ok; }).map(function (c) { return c.obs; }));

    // [C20] Dos estados, los mismos que usan los procesos. Un producto sin
    // registrar es OBSERVADO como cualquier otro; que esté enteramente vacío se
    // dice en la observación, así el dato no se pierde al desaparecer PENDIENTE.
    const sinRegistro = !colC && !colD && !colE && !colF && !colG && !colH && !colI;
    if (sinRegistro) {
      // [C29] El hecho ya se cuenta en la columna PRODUCTOS SIN REGISTRO del
      // resumen; aquí cierra la recomendación operativa.
      obs.push("Observación final --> Para las columnas C a I utilice los desplegables de la hoja.");
    }

    const conforme = correctos === TOTAL_CRITERIOS && !cls.observaciones.length;
    const estado = conforme ? "CONFORME" : "OBSERVADO";

    productos.push({
      estado: estado,
      correctos: correctos,
      sinRegistro: sinRegistro,
      fila: [sigla, filaReal, procN0Actual, cls.codigo || "(sin código)", cls.denominacion,
             colC || "(vacío)", estado, Math.round((correctos / TOTAL_CRITERIOS) * 100) + "%",
             correctos + "/" + TOTAL_CRITERIOS,
             unirObservaciones_(obs, "Cumple los 8 criterios.")]
    });
  }

  // ── Bloque de PRODUCTOS ──
  const totalProd = productos.length;
  const prodConformes = productos.filter(function (p) { return p.estado === "CONFORME"; }).length;
  const prodObservados = totalProd - prodConformes;
  // [C24] Un producto sin registro es el que no tiene NADA en las columnas C a I.
  // Se marca en la validación, no se deduce del puntaje.
  const sinRegistro = productos.filter(function (p) { return p.sinRegistro; }).length;

  const avanceProd = avanceSobreCriterios_(
    productos.map(function (p) { return p.correctos; }), TOTAL_CRITERIOS);

  let diagProd = prodConformes + " conformes y " + prodObservados + " observados de " +
                 totalProd + " productos.";
  if (sinRegistro) {
    diagProd += " De los observados, " + sinRegistro +
                " están sin registro (columnas C a I vacías).";
  }

  // ── Bloque de PROCESOS ──
  const nivel0 = filasNivel0_(sigla, n0Encontrados);
  const procesos = nivel0.concat(subprocesos);
  // Los NO APLICA (PE.03 y PS.08 ausentes) no se puntúan ni se cuentan.
  const n0Evaluables = nivel0.filter(function (f) { return f[6] !== "NO APLICA"; });
  const evaluables = n0Evaluables.concat(subprocesos);

  const n0Conformes = n0Evaluables.filter(function (f) { return f[6] === "CONFORME"; }).length;
  const n0Observados = n0Evaluables.length - n0Conformes;
  const subConformes = subprocesos.filter(function (f) { return f[6] === "CONFORME"; }).length;
  const subObservados = subprocesos.length - subConformes;

  const faltantes = nivel0.filter(function (f) { return f[6] === "FALTANTE"; });

  const avanceProc = avanceSobreCriterios_(
    evaluables.map(function (f) { return parseInt(f[8], 10) || 0; }), TOTAL_CRITERIOS_PROCESO);

  let diagProc = "Nivel 0: " + n0Conformes + " conformes y " + n0Observados + " observados de " +
                 n0Evaluables.length + ". Subprocesos: " + subConformes + " conformes y " +
                 subObservados + " observados de " + subprocesos.length + ".";
  if (faltantes.length) {
    diagProc += " Faltan " + faltantes.length + " procesos de Nivel 0 obligatorios: " +
                faltantes.map(function (f) { return f[1]; }).join(", ") + ".";
  }
  if (hojaConFormularioAjeno) {
    diagProc += " FORMULARIO AJENO: la pestaña usa mayoritariamente el sufijo _" +
                sufijoDominante + ", que corresponde a otra facultad; el formulario oficial de " +
                sigla + " es _" + fac.formulario + ". Debe corregirse en toda la hoja.";
  }

  return {
    resumenFila: [sigla, fac.nombre,
                  totalProd, prodConformes, prodObservados, sinRegistro,
                  avanceProd + "%", estadoGeneral_(avanceProd), diagProd,
                  evaluables.length, n0Conformes, n0Observados, subConformes, subObservados,
                  avanceProc + "%", estadoGeneral_(avanceProc), diagProc,
                  celdaFormulario_(fac, sufijoDominante)],
    detalleFilas: productos.map(function (p) { return p.fila; }),
    procesoFilas: procesos
  };
}

/**
 * [C22] Avance sobre los criterios realmente cumplidos, no sobre una
 * ponderación por estado. Con dos estados —conforme y observado— repartir medio
 * punto a todo lo observado daría lo mismo a un producto al que le falta un
 * criterio que a uno enteramente vacío.
 */
function avanceSobreCriterios_(cumplidos, porFila) {
  if (!cumplidos.length) return 0;
  const suma = cumplidos.reduce(function (a, b) { return a + b; }, 0);
  return Math.round((suma / (cumplidos.length * porFila)) * 100);
}

function estadoGeneral_(avance) {
  if (avance === 100) return "CONFORME";
  if (avance >= 75) return "AVANZADO";
  if (avance >= 40) return "EN DESARROLLO";
  return "CRÍTICO";
}

/* ═══════════════════════════════════════════════════════════════════════════
   ESCRITURA DEL DASHBOARD  [C8][C14][C17]
   ═══════════════════════════════════════════════════════════════════════════ */

const COLORES_ESTADO = {
  "CONFORME": "#d9ead3", "AVANZADO": "#cfe2f3", "EN DESARROLLO": "#fff2cc",
  "OBSERVADO": "#fff2cc", "CRÍTICO": "#f4cccc",
  "NO INICIADO": "#f4cccc", "VACÍO": "#f4cccc",
  "NO APLICA": "#efefef", "FALTANTE": "#f4cccc"
};

/**
 * [C14] Renombra la hoja de procesos si viene de una versión anterior, para que
 * las contra observaciones ya escritas viajen con ella.
 */
function migrarNombreHoja_(ss, nombresAnteriores, nombreNuevo) {
  if (ss.getSheetByName(nombreNuevo)) return;
  for (let i = 0; i < nombresAnteriores.length; i++) {
    const h = ss.getSheetByName(nombresAnteriores[i]);
    if (h) { h.setName(nombreNuevo); return; }
  }
}

function escribirEnDashboard_(resumen, detalle, procesos) {
  const ss = SpreadsheetApp.openById(CONFIG_A1.ID_DASHBOARD);

  volcarHoja_(ss, "RESUMEN_EJECUTIVO_A1",
    ["FACULTAD", "NOMBRE",
     "TOTAL PRODUCTOS", "PRODUCTOS CONFORMES", "PRODUCTOS OBSERVADOS", "PRODUCTOS SIN REGISTRO",
     "AVANCE", "ESTADO GENERAL", "DIAGNÓSTICO",
     "TOTAL PROCESOS", "PROCESOS NIVEL 0 CONFORMES", "PROCESOS NIVEL 0 OBSERVADOS",
     "SUBPROCESOS CONFORMES", "SUBPROCESOS OBSERVADOS",
     "AVANCE", "ESTADO GENERAL", "DIAGNÓSTICO",
     "CÓDIGO DE LA HOJA"],
    resumen, 7, "#1c4587", function (f) { return f[0]; });
  escribirLeyenda_(ss.getSheetByName("RESUMEN_EJECUTIVO_A1"), resumen.length);

  volcarHoja_(ss, "DETALLADO_PRODUCTOS_A1",
    ["FACULTAD", "FILA", "PROCESO NIVEL 0", "CÓDIGO PRODUCTO", "NOMBRE PRODUCTO", "TIPO", "ESTADO", "CUMPLIMIENTO", "CRITERIOS", "OBSERVACIONES Y CORRECCIONES"],
    detalle, 6, "#0d3472",
    function (f) { return f[0] + "␟" + normalizarTexto_(f[3] + " " + f[4]); },
    function (f) { return f[0] + "␟#" + f[1]; });

  migrarNombreHoja_(ss, CONFIG_A1.HOJAS_PROCESOS_ANTERIORES, CONFIG_A1.HOJA_PROCESOS);
  volcarHoja_(ss, CONFIG_A1.HOJA_PROCESOS,
    ["FACULTAD", "CÓDIGO", "PROCESO", "NIVEL", "EXIGENCIA", "FILA", "ESTADO", "CUMPLIMIENTO", "CRITERIOS", "OBSERVACIONES Y CORRECCIONES"],
    procesos, 6, "#3d2b56",
    function (f) { return f[0] + "␟" + normalizarCodigo_(f[1]); },
    function (f) { return f[0] + "␟" + normalizarTexto_(f[2]); });
}

/**
 * [C8][C17] Lee las columnas que el revisor añadió a mano a la derecha de las
 * que genera el script y las devuelve indexadas por una clave estable de fila,
 * para reponerlas después del `clear()`. Sin esto, cada corrida borraría el
 * trabajo de revisión.
 *
 * Se descartan los encabezados que el script generó en cualquier versión, para
 * que un cambio de formato entre versiones no resucite columnas obsoletas.
 */
function rescatarColumnasManuales_(hoja, encabezadosGenerados, clave, claveAlterna) {
  const vacio = { encabezados: [], porClave: {}, porAlterna: {} };
  if (!hoja || hoja.getLastRow() < 2 || hoja.getLastColumn() < 1) return vacio;

  const previos = hoja.getRange(1, 1, hoja.getLastRow(), hoja.getLastColumn()).getValues();
  const cabecera = previos[0].map(function (c) { return (c || "").toString().trim(); });

  const conocidos = encabezadosGenerados.concat(CONFIG_A1.ENCABEZADOS_HISTORICOS).map(normalizarTexto_);
  const manuales = [];
  for (let c = 0; c < cabecera.length; c++) {
    if (cabecera[c] && conocidos.indexOf(normalizarTexto_(cabecera[c])) === -1) {
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
  const manuales = rescate.encabezados.length ? rescate.encabezados : [CONFIG_A1.ENCABEZADO_CONTRA];

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
    // [C30] El salto de línea dentro de la celda solo se ve con el ajuste de
    // texto activado. Se aplica a todo el bloque de datos porque las columnas
    // largas no están siempre al final: el resumen lleva dos DIAGNÓSTICO en
    // medio de la tabla.
    hoja.getRange(2, 1, filas.length, nCols).setWrap(true).setVerticalAlignment("top");
  }

  hoja.setFrozenRows(1);
  hoja.autoResizeColumns(1, Math.max(1, nGen - 1));
  hoja.setColumnWidth(nGen, 520);
  for (let i = 0; i < manuales.length; i++) hoja.setColumnWidth(nGen + 1 + i, 340);
}

/**
 * [C25] Leyenda al pie del resumen ejecutivo.
 *
 * Se escribe debajo de la tabla, separada por una fila en blanco. No estorba al
 * rescate de columnas manuales: sus filas no llevan nada en las columnas del
 * revisor, y el rescate descarta toda fila cuyas celdas manuales estén vacías.
 */
function escribirLeyenda_(hoja, numFilas) {
  if (!hoja) return;

  const bloques = [
    ["TIPOS DE PRODUCTO", "Se registran en la columna C del Anexo 1.", [
      ["Final / Salida",
       "Producto que sale del proceso y llega al beneficiario. En el Anexo 3 va en las Salidas de la ficha SIPOC."],
      ["Parcial / Registro",
       "Producto intermedio que documenta la ejecución: informes, actas, listas. En el Anexo 3 va en la sección de Registros."]
    ]],
    ["ESTADO DE UN PRODUCTO O PROCESO", "Columnas ESTADO de las hojas de detalle.", [
      ["CONFORME", "Cumple todos sus criterios: 8 en un producto, 5 en un proceso."],
      ["OBSERVADO", "Incumple al menos un criterio. La fila explica cuál y cómo corregirlo."],
      ["SIN REGISTRO", "Producto observado que además tiene vacías las columnas C a I. Se cuenta aparte en el resumen."],
      ["FALTANTE", "Proceso de Nivel 0 obligatorio que no está registrado en la pestaña."],
      ["NO APLICA", "PE.03 y PS.08 ausentes. No se puntúan ni cuentan como incumplimiento."]
    ]],
    ["ESTADO GENERAL DE LA FACULTAD", "Se calcula sobre los criterios cumplidos, no sobre el número de filas conformes.", [
      ["CONFORME", "Avance del 100 %."],
      ["AVANZADO", "Avance igual o mayor al 75 %."],
      ["EN DESARROLLO", "Avance igual o mayor al 40 %."],
      ["CRÍTICO", "Avance menor al 40 %."]
    ]],
    ["CÓDIGO DE LA HOJA", "Sufijo _F## que deben llevar todos los códigos de la pestaña.", [
      ["F##", "Coincide con el formulario oficial de la facultad."],
      ["F## (la hoja usa F@@)", "La pestaña usa el formulario de otra facultad. Debe corregirse en toda la hoja."]
    ]]
  ];

  let fila = numFilas + 3;
  hoja.getRange(fila, 1).setValue("LEYENDA")
      .setFontWeight("bold").setFontSize(12);
  fila += 2;

  bloques.forEach(function (b) {
    hoja.getRange(fila, 1, 1, 3).merge().setValue(b[0])
        .setFontWeight("bold").setBackground("#1c4587").setFontColor("#ffffff");
    fila++;
    hoja.getRange(fila, 1, 1, 3).merge().setValue(b[1])
        .setFontStyle("italic").setFontColor("#666666");
    fila++;

    const filas = b[2];
    hoja.getRange(fila, 1, filas.length, 2).setValues(filas);
    hoja.getRange(fila, 1, filas.length, 1).setFontWeight("bold");
    hoja.getRange(fila, 2, filas.length, 1).setWrap(true);
    fila += filas.length + 1;
  });

  hoja.setColumnWidth(2, Math.max(hoja.getColumnWidth(2), 520));
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
