/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  REVISIÓN INTERNA DE FICHAS TÉCNICAS — ANEXO 3 (PRODUCTO Y PROCESO)
 *  Oficina de Racionalización — OGPL (UNMSM)
 *
 *  VERSIÓN 1 — piloto sobre la Facultad de Derecho y Ciencias Políticas
 *  (pestaña "2.FDCP"). El código de facultad viaja en el sufijo `_F##` de cada
 *  código, así que la misma corrida sirve para el resto de facultades sin más
 *  cambio que el nombre de la pestaña (o `revisarTodasLasFacultadesA3`).
 *
 *  Qué hace
 *  ─────────────────────────────────────────────────────────────────────────────
 *   1. Lee la pestaña del Anexo 3 indicada en CONFIG_A3 (valores + fuente).
 *   2. Parte la pestaña en fichas técnicas y revisa las cuatro secciones:
 *      Descripción, Definición, Ejecución y Formalización.
 *   3. Valida la codificación de proveedores, entradas, procesos, salidas,
 *      beneficiarios y registros, y las 7 reglas obligatorias de consignación.
 *   4. Coteja salidas y registros contra el Anexo 1.
 *   5. Crea un Google Sheets nuevo dentro de la carpeta de salida con seis
 *      hojas: detalle, resumen ejecutivo, dashboard, registro maestro de
 *      códigos, cotejo con el Anexo 1 y la vista de solo observaciones.
 *
 *  Uso
 *  ─────────────────────────────────────────────────────────────────────────────
 *   Extensiones › Apps Script sobre el propio Anexo 3, pegar este archivo y
 *   ejecutar `ejecutarRevisionAnexo3`. La configuración se puede editar aquí
 *   abajo o en una pestaña `CONFIG_A3` del propio Anexo 3 (columna A = clave,
 *   columna B = valor), que tiene prioridad sobre lo escrito en el código.
 *
 *  Especificación: reglas/ANEXO-3_reglas-v1.md
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const CONFIG_A3 = {

  /* ── Entradas ─────────────────────────────────────────────────────────── */

  SOURCE_SHEET_ID:  '1BYqg7p-8DoEJQGf_APxCZkieu6nrM1aPGPdXdblHyUI',
  SOURCE_TAB_NAME:  '2.FDCP',

  /** Carpeta de Drive "Revisión Interna de Avances del A3". */
  OUTPUT_FOLDER_ID: '1zSwJCoMFhI1J2jg7Aq7qroLHjT0QLwTA',

  /** Anexo 1, para el cotejo de salidas y registros (hoja 5). */
  ANEXO1_SHEET_ID:  '1SUMuS32zUweN_o7WfdBhXq-ipvvaFXYTcxKF1hmhPww',
  /** Pestaña del Anexo 1; null = se localiza por la sigla de la facultad. */
  ANEXO1_TAB_NAME:  null,

  /* ── Facultad ─────────────────────────────────────────────────────────── */

  /** Sigla de la facultad revisada; null = se deduce del nombre de la pestaña. */
  FACULTAD_SIGLA: null,
  /**
   * Sufijo de formulario esperado en todos los códigos (`F02` para la FDCP);
   * null = se toma el sufijo dominante de la pestaña.
   */
  FORMULARIO: null,

  /**
   * Facultades que trabajan procesos y productos de NIVEL 2: su desagregado
   * llega a un nivel más (`PM.XX.YY.ZZ.AA_FWW`) y en el encabezado de una ficha
   * pueden convivir códigos de 2 y de 3 niveles. Se admite como excepción
   * válida, nunca como error.
   */
  FACULTADES_NIVEL_2: ['FDCP'],

  /* ── Salida ───────────────────────────────────────────────────────────── */

  PREFIJO_ARCHIVO: 'Revision_Anexo3',
  /** true = reutiliza el archivo del día si ya existe; false = crea uno nuevo. */
  REUTILIZAR_ARCHIVO_DEL_DIA: false,

  HOJAS: {
    DETALLE:   'DETALLE_REVISION',
    RESUMEN:   'RESUMEN_EJECUTIVO',
    DASHBOARD: 'DASHBOARD',
    MAESTRO:   'REGISTRO_MAESTRO_CODIGOS',
    COTEJO:    'COTEJO_ANEXO1',
    ERRORES:   'SOLO_OBSERVACIONES'
  },

  FUENTE_OBLIGATORIA: 'Arial',
  /** Máximo de celdas fuera de Arial que se detallan una por una por ficha. */
  MAX_CELDAS_FUENTE: 25,

  /**
   * Semáforo de las hojas de salida. Cada fila se pinta según su estado:
   * verde = correcto, ámbar = incompleto o por verificar, rojo = con error.
   * El color va acompañado siempre de la columna ESTADO en texto, para que la
   * hoja siga leyéndose impresa en blanco y negro o por quien no distinga los
   * colores.
   */
  COLORES: {
    ok:         { fondo: '#d9ead3', texto: '#274e13', rotulo: 'Correcto'   },
    incompleto: { fondo: '#fff2cc', texto: '#7f6000', rotulo: 'Incompleto' },
    error:      { fondo: '#f4cccc', texto: '#990000', rotulo: 'Con error'  },
    neutro:     { fondo: '#f3f3f3', texto: '#666666', rotulo: 'Opcional'   }
  },
  /** Pestaña opcional de configuración dentro del propio Anexo 3. */
  TAB_CONFIG: 'CONFIG_A3',

  /* ── Vocabulario de la ficha ──────────────────────────────────────────── */

  ETIQUETAS: {
    TITULO_FICHA:  ['FICHA TECNICA DE PRODUCTO Y PROCESO'],
    SEC_DESCRIPCION: ['DESCRIPCION DEL PROCESO'],
    SEC_DEFINICION:  ['DEFINICION DEL PROCESO', 'DEFINICION DEL PROCESO:'],
    SEC_EJECUCION:   ['EJECUCION DEL PROCESO'],
    SEC_FORMALIZACION: ['FORMALIZACION DEL PROCESO']
  },

  /** Campos de "Definición del Proceso". */
  CAMPOS_DEFINICION: [
    { campo: 'Nombre',      etiquetas: ['NOMBRE'] },
    { campo: 'Responsable', etiquetas: ['RESPONSABLE'] },
    { campo: 'Alcance',     etiquetas: ['ALCANCE'] },
    { campo: 'Vinculación', etiquetas: ['VINCULACION'] },
    { campo: 'Objetivo',    etiquetas: ['OBJETIVO'] },
    { campo: 'Código',      etiquetas: ['CODIGO'], codigo: 'PROCESO_N1' },
    { campo: 'Tipo',        etiquetas: ['TIPO'] },
    { campo: 'Versión',     etiquetas: ['VERSION'] }
  ],

  /**
   * Campos de "Ejecución del Proceso". Las pestañas escriben la etiqueta de
   * recursos partida en dos celdas ("RECURSOS" | "HUMANOS") y con nombres que
   * varían entre facultades, así que se admite más de una forma.
   */
  CAMPOS_EJECUCION: [
    { campo: 'Recursos Humanos',      etiquetas: ['HUMANOS', 'RECURSOS HUMANOS'] },
    { campo: 'Recursos Físicos',      etiquetas: ['FISICOS', 'RECURSOS FISICOS'] },
    { campo: 'Equipos Tecnológicos',  etiquetas: ['TECNOLOGICOS', 'EQUIPOS TECNOLOGICOS', 'RECURSOS TECNOLOGICOS'] },
    { campo: 'Sistemas Informáticos', etiquetas: ['INFORMATICOS', 'SISTEMAS INFORMATICOS', 'RECURSOS INFORMATICOS'] },
    { campo: 'Registros',             etiquetas: ['REGISTROS'], codigo: 'REGISTRO' },
    { campo: 'Riesgos',               etiquetas: ['RIESGOS'] },
    { campo: 'Indicadores',           etiquetas: ['INDICADORES'] },
    { campo: 'Controles',             etiquetas: ['CONTROLES'] }
  ],

  /** Columnas de "Descripción del Proceso": etiqueta del encabezado y código. */
  COLUMNAS_DESCRIPCION: [
    { campo: 'Proveedores',   etiquetas: ['PROVEEDORES', 'PROVEEDOR'], codigo: 'PR', columna: 'B' },
    { campo: 'Entradas',      etiquetas: ['ENTRADAS', 'ENTRADA'],      codigo: 'EN', columna: 'D' },
    { campo: 'Procesos',      etiquetas: ['PROCESO', 'PROCESOS'],      codigo: 'PROCESO_N2', columna: 'F' },
    { campo: 'Salidas',       etiquetas: ['SALIDAS', 'SALIDA'],        codigo: 'SALIDA', columna: 'H' },
    { campo: 'Beneficiarios', etiquetas: ['BENEFICIARIOS', 'BENEFICIARIO'], codigo: 'BE', columna: 'J' }
  ],

  /** Filas de "Formalización del Proceso". La firma es una foto: es opcional. */
  BLOQUES_FORMALIZACION: ['ELABORACION', 'REVISION'],
  CAMPOS_FORMALIZACION: [
    { campo: 'Unidad',            etiquetas: ['UNIDAD'],             obligatorio: true },
    { campo: 'Cargo',             etiquetas: ['CARGO'],              obligatorio: true },
    { campo: 'Nombre y Apellido', etiquetas: ['NOMBRE Y APELLIDOS', 'NOMBRE Y APELLIDO'], obligatorio: true },
    { campo: 'Firma',             etiquetas: ['FIRMA'],              obligatorio: false }
  ],

  VALORES_NULOS: [
    'NINGUNO', 'NINGUNA', 'NINGUN', 'N/A', 'NA', 'N.A.', 'NO APLICA',
    'NO APLICABLE', 'SIN DATO', 'SIN DATOS', '-', '--', '---', '.', 'X',
    'PENDIENTE', 'POR DEFINIR', 'POR COMPLETAR'
  ],

  /** Facultades: sigla ↔ formulario oficial, igual que en el Anexo 1. */
  FACULTADES: [
    { sigla: 'FM',     formulario: 'F01', nombre: 'FACULTAD DE MEDICINA' },
    { sigla: 'FDCP',   formulario: 'F02', nombre: 'FACULTAD DE DERECHO Y CIENCIA POLÍTICA' },
    { sigla: 'FLCH',   formulario: 'F03', nombre: 'FACULTAD DE LETRAS Y CIENCIAS HUMANAS' },
    { sigla: 'FFB',    formulario: 'F04', nombre: 'FACULTAD DE FARMACIA Y BIOQUÍMICA' },
    { sigla: 'FO',     formulario: 'F05', nombre: 'FACULTAD DE ODONTOLOGÍA' },
    { sigla: 'FE',     formulario: 'F06', nombre: 'FACULTAD DE EDUCACIÓN' },
    { sigla: 'FQIQ',   formulario: 'F07', nombre: 'FACULTAD DE QUÍMICA E INGENIERÍA QUÍMICA' },
    { sigla: 'FMV',    formulario: 'F08', nombre: 'FACULTAD DE MEDICINA VETERINARIA' },
    { sigla: 'FCA',    formulario: 'F09', nombre: 'FACULTAD DE CIENCIAS ADMINISTRATIVAS' },
    { sigla: 'FCB',    formulario: 'F10', nombre: 'FACULTAD DE CIENCIAS BIOLÓGICAS' },
    { sigla: 'FCC',    formulario: 'F11', nombre: 'FACULTAD DE CIENCIAS CONTABLES' },
    { sigla: 'FCE',    formulario: 'F12', nombre: 'FACULTAD DE CIENCIAS ECONÓMICAS' },
    { sigla: 'FCF',    formulario: 'F13', nombre: 'FACULTAD DE CIENCIAS FÍSICAS' },
    { sigla: 'FCM',    formulario: 'F14', nombre: 'FACULTAD DE CIENCIAS MATEMÁTICAS' },
    { sigla: 'FCCSS',  formulario: 'F15', nombre: 'FACULTAD DE CIENCIAS SOCIALES' },
    { sigla: 'FIGMMG', formulario: 'F16', nombre: 'FACULTAD DE INGENIERÍA GEOLÓGICA, MINERA, METALÚRGICA Y GEOGRÁFICA' },
    { sigla: 'FII',    formulario: 'F20', nombre: 'FACULTAD DE INGENIERÍA INDUSTRIAL' },
    { sigla: 'FPSIC',  formulario: null,  nombre: 'FACULTAD DE PSICOLOGÍA' },
    { sigla: 'FIEE',   formulario: null,  nombre: 'FACULTAD DE INGENIERÍA ELECTRÓNICA Y ELÉCTRICA' },
    { sigla: 'FISI',   formulario: null,  nombre: 'FACULTAD DE INGENIERÍA DE SISTEMAS E INFORMÁTICA' }
  ]
};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPRESIONES REGULARES DE CODIFICACIÓN
   ═══════════════════════════════════════════════════════════════════════════ */

/** `PR.01_F02`, `EN.196_F02`, `BE.07_F02` — correlativo de 1 a 3 dígitos. */
const REGEX_SIMPLE_A3 = /^(PR|EN|BE)\.(\d{1,3})_F(\d{2})$/;

/** `PE.01_F02`, `PM.01.03.02_F02`, `PM.01.01.02.05_F02`. */
const REGEX_PROCESO_A3 = /^(PE|PM|PS)((?:\.\d{1,3})+)_F(\d{2})$/;

/** Barrido de códigos dentro de una celda con varios códigos y su denominación. */
const REGEX_BARRIDO_A3 = /\b(PR|EN|BE|PE|PM|PS)((?:\.\d{1,3})+)(?:[_\-.]\s?[Ff]?\d{1,2})?/g;

/* ═══════════════════════════════════════════════════════════════════════════
   UTILIDADES DE TEXTO
   ═══════════════════════════════════════════════════════════════════════════ */

function normalizar_(txt) {
  return (txt === null || txt === undefined ? '' : txt).toString().trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').replace(/[:.]+$/, '');
}

function normalizarCodigoA3_(txt) {
  return (txt === null || txt === undefined ? '' : txt).toString().trim().toUpperCase()
    .replace(/\s+/g, '').replace(/[–—]/g, '-');
}

function esVacio_(valor) {
  const t = (valor === null || valor === undefined ? '' : valor).toString().trim();
  if (!t) return true;
  const n = normalizar_(t);
  return CONFIG_A3.VALORES_NULOS.some(function (v) { return normalizar_(v) === n; });
}

function recortarA3_(txt, largo) {
  const t = (txt === null || txt === undefined ? '' : txt).toString().trim().replace(/\s+/g, ' ');
  const max = largo || 120;
  return t.length > max ? t.substring(0, max - 3) + '...' : t;
}

/** ¿La celda es exactamente una de las etiquetas dadas? */
function esEtiqueta_(valor, etiquetas) {
  const n = normalizar_(valor);
  if (!n) return false;
  return etiquetas.some(function (e) { return normalizar_(e) === n; });
}

/* ═══════════════════════════════════════════════════════════════════════════
   VALIDADORES DE CODIFICACIÓN  (funciones puras — cubiertas por las pruebas)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Número de grupos numéricos de un código de proceso: `PM.01.03` → 2. */
function nivelDeCodigo_(codigo) {
  const m = REGEX_PROCESO_A3.exec(normalizarCodigoA3_(codigo));
  return m ? m[2].split('.').filter(String).length : 0;
}

/**
 * Extrae los códigos presentes en una celda. Devuelve el código tal cual se
 * escribió, sin la denominación que lo acompaña.
 */
function extraerCodigosA3_(celda) {
  const texto = (celda === null || celda === undefined ? '' : celda).toString();
  const encontrados = [];
  let m;
  REGEX_BARRIDO_A3.lastIndex = 0;
  while ((m = REGEX_BARRIDO_A3.exec(texto)) !== null) {
    encontrados.push(normalizarCodigoA3_(m[0]));
  }
  return encontrados;
}

/**
 * Denominación que acompaña a un código dentro de una celda: lo que queda tras
 * quitar todos los códigos.
 */
function denominacionDeA3_(celda) {
  return (celda === null || celda === undefined ? '' : celda).toString()
    .replace(REGEX_BARRIDO_A3, ' ')
    .replace(/[\s\-–—:;,.]+/g, ' ')
    .trim();
}

/** Niveles de código admitidos para cada tipo de campo. */
function nivelesEsperados_(tipo, permiteNivel2) {
  switch (tipo) {
    // La Definición exige siempre dos niveles de código (`PE.XX_FYY`), sin el
    // desagregado de salidas, también en las facultades de nivel 2.
    case 'PROCESO_N1': return [1];                            // Definición › Código
    case 'PROCESO_N2': return permiteNivel2 ? [2, 3] : [2];   // Descripción › Procesos
    case 'SALIDA':     return permiteNivel2 ? [3, 4] : [3];   // Descripción › Salidas
    case 'REGISTRO':   return permiteNivel2 ? [3, 4] : [3];   // Ejecución › Registros
    default:           return [];
  }
}

/**
 * Valida un código suelto contra el tipo de campo que lo contiene.
 *
 * Devuelve `{ ok, motivo, correccion, excepcionNivel2 }`. `excepcionNivel2`
 * marca los casos que la FDCP puede tener por trabajar a nivel 2 y que, por
 * tanto, no se cuentan como error.
 */
function validarCodigoA3_(codigo, tipo, formulario, permiteNivel2) {
  const c = normalizarCodigoA3_(codigo);
  if (!c) return { ok: false, motivo: 'Sin código.', correccion: 'Consigne el código correspondiente.' };

  if (tipo === 'PR' || tipo === 'EN' || tipo === 'BE') {
    const m = REGEX_SIMPLE_A3.exec(c);
    if (!m) {
      return {
        ok: false,
        motivo: 'El código "' + c + '" no sigue la estructura ' + tipo + '.XX_FYY.',
        correccion: 'Escríbalo como ' + tipo + '.01_' + (formulario || 'F##') +
                    ' seguido de la denominación, sin espacios dentro del código.'
      };
    }
    if (m[1] !== tipo) {
      return {
        ok: false,
        motivo: 'Prefijo "' + m[1] + '" en un campo de tipo ' + tipo + '.',
        correccion: 'Use el prefijo ' + tipo + ' que corresponde a esta columna.'
      };
    }
    if (formulario && 'F' + m[3] !== formulario) {
      return {
        ok: false,
        motivo: 'Sufijo de formulario "F' + m[3] + '" distinto del de la facultad (' + formulario + ').',
        correccion: 'Reemplace el sufijo por ' + formulario + '.'
      };
    }
    return { ok: true };
  }

  const m = REGEX_PROCESO_A3.exec(c);
  if (!m) {
    return {
      ok: false,
      motivo: 'El código "' + c + '" no sigue la estructura PE|PM|PS.##…_FYY.',
      correccion: 'Escríbalo con prefijo PE, PM o PS, los grupos numéricos separados por punto ' +
                  'y el sufijo ' + (formulario || 'F##') + '.'
    };
  }
  if (formulario && 'F' + m[3] !== formulario) {
    return {
      ok: false,
      motivo: 'Sufijo de formulario "F' + m[3] + '" distinto del de la facultad (' + formulario + ').',
      correccion: 'Reemplace el sufijo por ' + formulario + '.'
    };
  }

  const nivel = m[2].split('.').filter(String).length;
  const esperados = nivelesEsperados_(tipo, permiteNivel2);
  if (esperados.indexOf(nivel) === -1) {
    return {
      ok: false,
      motivo: 'El código "' + c + '" tiene ' + nivel + ' nivel(es); este campo exige ' +
              esperados.join(' o ') + '.',
      correccion: 'Ajuste la profundidad del código al nivel que corresponde al campo.'
    };
  }
  // El nivel adicional que solo tienen las facultades de nivel 2 es excepción
  // válida: se deja anotado, nunca como error.
  if (permiteNivel2 && nivelesEsperados_(tipo, false).indexOf(nivel) === -1) {
    return { ok: true, excepcionNivel2: true,
             motivo: 'Código de ' + nivel + ' niveles admitido por tratarse de una facultad ' +
                     'que trabaja procesos y productos de nivel 2.' };
  }
  return { ok: true };
}

/**
 * Valida el contenido completo de una celda: puede traer varios códigos
 * (permitido en salidas, registros y beneficiarios) y su denominación.
 *
 * `unicoPorCelda` aplica la regla 4: un proceso por celda.
 */
function validarCeldaA3_(celda, tipo, formulario, permiteNivel2, unicoPorCelda) {
  const texto = (celda === null || celda === undefined ? '' : celda).toString();
  const res = { codigos: [], errores: [], notas: [], vacio: esVacio_(texto) };
  if (res.vacio) return res;

  const codigos = extraerCodigosA3_(texto);
  if (!codigos.length) {
    res.errores.push({
      motivo: 'La celda no contiene ningún código reconocible.',
      correccion: 'Anteponga la codificación correspondiente a la denominación.'
    });
    return res;
  }
  if (unicoPorCelda && codigos.length > 1) {
    res.errores.push({
      motivo: 'La celda agrupa ' + codigos.length + ' códigos (' + codigos.join(', ') + ').',
      correccion: 'Regla 4: registre un proceso por celda, sin combinar ni agrupar.'
    });
  }
  codigos.forEach(function (c) {
    const v = validarCodigoA3_(c, tipo, formulario, permiteNivel2);
    if (!v.ok) res.errores.push({ codigo: c, motivo: v.motivo, correccion: v.correccion });
    else if (v.excepcionNivel2) res.notas.push({ codigo: c, motivo: v.motivo });
    res.codigos.push(c);
  });
  return res;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOCALIZACIÓN DE FACULTAD Y PESTAÑAS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Sigla de la facultad a partir del nombre de la pestaña ("2.FDCP" → FDCP). */
function siglaDePestana_(nombrePestana) {
  const n = normalizar_(nombrePestana).replace(/^\d+\s*[.\-]?\s*/, '');
  let exacta = null;
  let contenida = null;
  CONFIG_A3.FACULTADES.forEach(function (f) {
    if (n === f.sigla) exacta = f.sigla;
    // Coincidencia por subcadena solo como respaldo, y siempre la más larga:
    // así "FCCSS" gana sobre "FCC" y "FMV" sobre "FM".
    else if (new RegExp('\\b' + f.sigla + '\\b').test(n) &&
             (!contenida || f.sigla.length > contenida.length)) contenida = f.sigla;
  });
  return exacta || contenida;
}

function facultadPorSigla_(sigla) {
  let encontrada = null;
  CONFIG_A3.FACULTADES.forEach(function (f) { if (f.sigla === sigla) encontrada = f; });
  return encontrada;
}

/** Sufijo `F##` que más se repite en la pestaña, para cuando no está declarado. */
function formularioDominante_(valores) {
  const cuenta = {};
  valores.forEach(function (fila) {
    fila.forEach(function (celda) {
      extraerCodigosA3_(celda).forEach(function (c) {
        const m = /_F(\d{2})$/.exec(c);
        if (m) cuenta['F' + m[1]] = (cuenta['F' + m[1]] || 0) + 1;
      });
    });
  });
  let mejor = null;
  Object.keys(cuenta).forEach(function (k) {
    if (!mejor || cuenta[k] > cuenta[mejor]) mejor = k;
  });
  return mejor;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PARSEO DE LA PESTAÑA EN FICHAS TÉCNICAS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * ¿La fila abre una ficha técnica? Es la fila que lleva la etiqueta NOMBRE y,
 * más a la derecha, la etiqueta CODIGO. Se usa esta fila y no el título
 * "FICHA TÉCNICA DE PRODUCTO Y PROCESO" porque la primera ficha de la pestaña
 * suele venir sin título.
 */
function esInicioDeFicha_(fila) {
  let nombre = -1;
  for (let i = 0; i < fila.length; i++) {
    if (nombre === -1 && esEtiqueta_(fila[i], ['NOMBRE'])) nombre = i;
    else if (nombre !== -1 && esEtiqueta_(fila[i], ['CODIGO'])) return true;
  }
  return false;
}

/** Índices de fila (base 0) donde empieza cada ficha técnica de la pestaña. */
function localizarFichas_(valores) {
  const inicios = [];
  for (let i = 0; i < valores.length; i++) if (esInicioDeFicha_(valores[i])) inicios.push(i);
  return inicios.map(function (inicio, k) {
    let fin = (k + 1 < inicios.length ? inicios[k + 1] : valores.length) - 1;
    // La fila de "FICHA TÉCNICA…" y la de "DEFINICIÓN DEL PROCESO" de la ficha
    // siguiente no pertenecen a esta.
    while (fin > inicio && filaEsPreambulo_(valores[fin])) fin--;
    return { inicio: inicio, fin: fin };
  });
}

function filaEsPreambulo_(fila) {
  const textos = fila.filter(function (c) { return !esVacio_(c); });
  if (!textos.length) return true;
  // Basta con que la fila ABRA con el título de la ficha o con "DEFINICIÓN DEL
  // PROCESO:": esa segunda fila lleva a su derecha el nombre del proceso, y aun
  // así pertenece a la ficha siguiente.
  return esEtiqueta_(textos[0], CONFIG_A3.ETIQUETAS.TITULO_FICHA) ||
         esEtiqueta_(textos[0], CONFIG_A3.ETIQUETAS.SEC_DEFINICION);
}

/** Primera fila del bloque (dentro del rango) cuya etiqueta coincide. */
function buscarFilaEtiqueta_(valores, desde, hasta, etiquetas) {
  for (let f = desde; f <= hasta && f < valores.length; f++) {
    for (let c = 0; c < valores[f].length; c++) {
      if (esEtiqueta_(valores[f][c], etiquetas)) return { fila: f, col: c };
    }
  }
  return null;
}

/**
 * Valor asociado a una etiqueta: la primera celda no vacía a su derecha,
 * saltando las repeticiones que dejan las celdas combinadas y las etiquetas
 * de otro campo de la misma fila.
 */
function valorDeEtiqueta_(fila, colEtiqueta, etiquetasOtrosCampos) {
  const etiqueta = normalizar_(fila[colEtiqueta]);
  for (let c = colEtiqueta + 1; c < fila.length; c++) {
    const v = fila[c];
    if (esVacio_(v)) continue;
    const n = normalizar_(v);
    if (n === etiqueta) continue;                       // celda combinada
    if (etiquetasOtrosCampos && etiquetasOtrosCampos.indexOf(n) !== -1) return { valor: '', col: c };
    return { valor: v.toString().trim(), col: c };
  }
  return { valor: '', col: -1 };
}

/** Todas las etiquetas conocidas, para no confundir un valor con otro campo. */
function catalogoDeEtiquetas_() {
  const todas = [];
  function agregar(lista) { lista.forEach(function (e) { todas.push(normalizar_(e)); }); }
  CONFIG_A3.CAMPOS_DEFINICION.forEach(function (c) { agregar(c.etiquetas); });
  CONFIG_A3.CAMPOS_EJECUCION.forEach(function (c) { agregar(c.etiquetas); });
  CONFIG_A3.CAMPOS_FORMALIZACION.forEach(function (c) { agregar(c.etiquetas); });
  CONFIG_A3.COLUMNAS_DESCRIPCION.forEach(function (c) { agregar(c.etiquetas); });
  agregar(CONFIG_A3.BLOQUES_FORMALIZACION);
  agregar(['RECURSOS']);
  return todas;
}

/* ═══════════════════════════════════════════════════════════════════════════
   REVISIÓN DE UNA FICHA TÉCNICA
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Revisa una ficha y devuelve sus hallazgos.
 *
 * `ctx` = { valores, fuentes, formulario, permiteNivel2, etiquetas }.
 */
function revisarFicha_(ctx, bloque, numero) {
  const V = ctx.valores;
  const detalle = [];       // filas de la hoja 1
  const codigosMaestro = []; // { tipo, codigo, denominacion }
  const cotejo = [];         // { tipo, codigo, denominacion }
  const ficha = {
    numero: numero,
    nombre: '',
    codigo: '',
    filaInicio: bloque.inicio + 1,
    filaFin: bloque.fin + 1,
    campos: 0,
    completos: 0,
    faltantes: [],
    erroresCodificacion: 0,
    notas: [],
    fueraDeArial: 0,
    detalle: detalle,
    codigosMaestro: codigosMaestro,
    cotejo: cotejo
  };

  /**
   * Registra una fila del detalle.
   *
   * `ubicacion` = { fila, col } en base 0, tal como vienen del recorrido de la
   * matriz. Se traduce a la fila y la celda que el revisor ve en la hoja, para
   * que pueda ir directo al dato sin tener que buscarlo. Cuando el hallazgo no
   * cuelga de una celda concreta (una columna entera sin registros, la revisión
   * de fuente de toda la ficha) se deja el rango de filas de la ficha.
   */
  function anotar(seccion, campo, codigo, estructura, completo, obs, ubicacion) {
    let fila = '';
    let celda = '';
    if (ubicacion && ubicacion.fila !== undefined && ubicacion.fila !== null && ubicacion.fila >= 0) {
      fila = ubicacion.fila + 1;
      if (ubicacion.col !== undefined && ubicacion.col !== null && ubicacion.col >= 0) {
        celda = letraColumna_(ubicacion.col + 1) + fila;
      }
    } else if (ubicacion && ubicacion.rango) {
      fila = ubicacion.rango;
    }
    detalle.push({
      ficha: numero, nombre: ficha.nombre, seccion: seccion, campo: campo,
      fila: fila, celda: celda,
      codigo: recortarA3_(codigo, 90),
      estructura: estructura, completo: completo,
      observacion: obs || ''
    });
  }

  /** Rango de filas de la ficha, para los hallazgos que no son de una celda. */
  const rangoFicha = { rango: (bloque.inicio + 1) + '–' + (bloque.fin + 1) };

  /**
   * Anota un campo pendiente y le adjunta dónde está, para que el resumen
   * ejecutivo sirva de lista de tareas sin tener que abrir el detalle.
   */
  function faltante(nombre, ubicacion) {
    let donde = '';
    if (ubicacion && ubicacion.fila !== undefined && ubicacion.fila !== null && ubicacion.fila >= 0) {
      donde = (ubicacion.col !== undefined && ubicacion.col !== null && ubicacion.col >= 0)
        ? ' (celda ' + letraColumna_(ubicacion.col + 1) + (ubicacion.fila + 1) + ')'
        : ' (fila ' + (ubicacion.fila + 1) + ')';
    } else if (ubicacion && ubicacion.rango) {
      donde = ' (filas ' + ubicacion.rango + ')';
    }
    ficha.faltantes.push(nombre + donde);
  }

  /* ── 3.2 Definición del Proceso ─────────────────────────────────────── */

  CONFIG_A3.CAMPOS_DEFINICION.forEach(function (def) {
    const pos = buscarFilaEtiqueta_(V, bloque.inicio, bloque.fin, def.etiquetas);
    ficha.campos++;
    if (!pos) {
      faltante('Definición › ' + def.campo, rangoFicha);
      anotar('Definición', def.campo, '', 'N/A', 'No',
             'No se encontró la etiqueta "' + def.campo + '" en la ficha.', rangoFicha);
      return;
    }
    const v = valorDeEtiqueta_(V[pos.fila], pos.col, ctx.etiquetas);
    if (esVacio_(v.valor)) {
      faltante('Definición › ' + def.campo, { fila: pos.fila, col: pos.col });
      anotar('Definición', def.campo, '', def.codigo ? 'No' : 'N/A', 'No',
             'Campo obligatorio vacío.', { fila: pos.fila, col: pos.col });
      return;
    }
    ficha.completos++;
    if (def.campo === 'Nombre') ficha.nombre = v.valor.toString().trim();

    if (!def.codigo) {
      anotar('Definición', def.campo, recortarA3_(v.valor, 90), 'N/A', 'Sí', '',
             { fila: pos.fila, col: v.col });
      return;
    }

    const r = validarCeldaA3_(v.valor, def.codigo, ctx.formulario, ctx.permiteNivel2, true);
    if (def.campo === 'Código' && r.codigos.length) ficha.codigo = r.codigos[0];
    if (r.errores.length) {
      ficha.erroresCodificacion += r.errores.length;
      anotar('Definición', def.campo, v.valor, 'No', 'Sí',
             r.errores.map(function (e) { return e.motivo + ' ' + e.correccion; }).join(' | '),
             { fila: pos.fila, col: v.col });
    } else {
      anotar('Definición', def.campo, v.valor, 'Sí', 'Sí',
             r.notas.map(function (n) { return n.motivo; }).join(' | '),
             { fila: pos.fila, col: v.col });
      r.notas.forEach(function (n) { ficha.notas.push(def.campo + ': ' + n.motivo); });
    }
  });

  /* ── 3.1 Descripción del Proceso ────────────────────────────────────── */

  const posDesc = buscarFilaEtiqueta_(V, bloque.inicio, bloque.fin, CONFIG_A3.ETIQUETAS.SEC_DESCRIPCION);
  const posEjec = buscarFilaEtiqueta_(V, bloque.inicio, bloque.fin, CONFIG_A3.ETIQUETAS.SEC_EJECUCION);
  const finDesc = posEjec ? posEjec.fila - 1 : bloque.fin;

  if (!posDesc) {
    ficha.campos++;
    faltante('Descripción › sección completa', rangoFicha);
    anotar('Descripción', 'Sección', '', 'N/A', 'No',
           'No se encontró "DESCRIPCIÓN DEL PROCESO" en la ficha.', rangoFicha);
  } else {
    // Fila de encabezados (PROVEEDORES … BENEFICIARIOS) y columna de cada uno.
    let filaEnc = -1;
    const columnas = {};
    for (let f = posDesc.fila; f <= finDesc; f++) {
      const encontradas = {};
      CONFIG_A3.COLUMNAS_DESCRIPCION.forEach(function (col) {
        for (let c = 0; c < V[f].length; c++) {
          if (esEtiqueta_(V[f][c], col.etiquetas) && encontradas[col.campo] === undefined) {
            encontradas[col.campo] = c;
          }
        }
      });
      if (Object.keys(encontradas).length >= 3) { filaEnc = f; Object.keys(encontradas).forEach(function (k) { columnas[k] = encontradas[k]; }); break; }
    }

    CONFIG_A3.COLUMNAS_DESCRIPCION.forEach(function (col) {
      ficha.campos++;
      if (filaEnc === -1 || columnas[col.campo] === undefined) {
        faltante('Descripción › ' + col.campo, filaEnc === -1 ? rangoFicha : { fila: filaEnc });
        anotar('Descripción', col.campo, '', 'N/A', 'No',
               'No se ubicó la columna "' + col.campo + '" (columna ' + col.columna + ').',
               filaEnc === -1 ? rangoFicha : { fila: filaEnc });
        return;
      }
      const c = columnas[col.campo];
      let conDatos = 0;
      for (let f = filaEnc + 1; f <= finDesc; f++) {
        const celda = V[f][c];
        if (esVacio_(celda)) continue;
        if (esEtiqueta_(celda, col.etiquetas)) continue;
        conDatos++;
        const unico = (col.campo === 'Procesos');   // regla 4
        const r = validarCeldaA3_(celda, col.codigo, ctx.formulario, ctx.permiteNivel2, unico);
        const denom = denominacionDeA3_(celda) || denominacionVecina_(V[f], c);
        if (r.errores.length) {
          ficha.erroresCodificacion += r.errores.length;
          anotar('Descripción', col.campo, celda, 'No', 'Sí',
                 r.errores.map(function (e) { return e.motivo + ' ' + e.correccion; }).join(' | '),
                 { fila: f, col: c });
        } else if (r.notas.length) {
          r.notas.forEach(function (n) { ficha.notas.push(col.campo + ': ' + n.motivo); });
          anotar('Descripción', col.campo, celda, 'Sí', 'Sí',
                 r.notas.map(function (n) { return n.motivo; }).join(' | '),
                 { fila: f, col: c });
        }
        // Registro maestro (reglas 2, 3 y 6) y cotejo con el Anexo 1 (regla 5).
        r.codigos.forEach(function (cod) {
          if (col.codigo === 'PR' || col.codigo === 'EN' || col.codigo === 'BE') {
            codigosMaestro.push({ tipo: col.campo, codigo: cod, denominacion: denom, ficha: numero });
          } else if (col.codigo === 'SALIDA') {
            cotejo.push({ tipo: 'Salida', codigo: cod, denominacion: denom, ficha: numero });
          }
        });
      }
      if (conDatos === 0) {
        faltante('Descripción › ' + col.campo, { rango: (filaEnc + 2) + '–' + (finDesc + 1) });
        anotar('Descripción', col.campo, '', 'N/A', 'No',
               'La columna ' + col.columna + ' (' + col.campo + ') no tiene ningún registro.',
               { rango: (filaEnc + 2) + '–' + (finDesc + 1) });
      } else {
        ficha.completos++;
        anotar('Descripción', col.campo, conDatos + ' registro(s)', 'Sí', 'Sí', '',
               { rango: (filaEnc + 2) + '–' + (finDesc + 1) });
      }
    });
  }

  /* ── 3.3 Ejecución del Proceso ──────────────────────────────────────── */

  const posForm = buscarFilaEtiqueta_(V, bloque.inicio, bloque.fin, CONFIG_A3.ETIQUETAS.SEC_FORMALIZACION);
  const iniEjec = posEjec ? posEjec.fila : bloque.inicio;
  const finEjec = posForm ? posForm.fila - 1 : bloque.fin;

  CONFIG_A3.CAMPOS_EJECUCION.forEach(function (def) {
    ficha.campos++;
    let valor = '';
    let filaHallada = -1;
    let colEtiqueta = -1;
    let colValor = -1;
    for (let f = iniEjec; f <= finEjec && f < V.length; f++) {
      for (let c = 0; c < V[f].length; c++) {
        if (!esEtiqueta_(V[f][c], def.etiquetas)) continue;
        const v = valorDeEtiqueta_(V[f], c, ctx.etiquetas);
        if (!esVacio_(v.valor)) { valor = v.valor; filaHallada = f; colEtiqueta = c; colValor = v.col; break; }
        // La etiqueta existe pero está vacía: se recuerda su posición por si no
        // aparece llena más abajo (las celdas combinadas la repiten por fila).
        if (filaHallada === -1) { filaHallada = f; colEtiqueta = c; }
      }
      if (valor) break;
    }
    if (filaHallada === -1) {
      faltante('Ejecución › ' + def.campo, rangoFicha);
      anotar('Ejecución', def.campo, '', 'N/A', 'No',
             'No se encontró la etiqueta "' + def.campo + '".', rangoFicha);
      return;
    }
    if (esVacio_(valor)) {
      faltante('Ejecución › ' + def.campo, { fila: filaHallada, col: colEtiqueta });
      anotar('Ejecución', def.campo, '', def.codigo ? 'No' : 'N/A', 'No',
             'Campo obligatorio vacío.', { fila: filaHallada, col: colEtiqueta });
      return;
    }
    ficha.completos++;
    if (!def.codigo) {
      anotar('Ejecución', def.campo, recortarA3_(valor, 90), 'N/A', 'Sí', '',
             { fila: filaHallada, col: colValor });
      return;
    }

    const r = validarCeldaA3_(valor, def.codigo, ctx.formulario, ctx.permiteNivel2, false);
    if (r.errores.length) {
      ficha.erroresCodificacion += r.errores.length;
      anotar('Ejecución', def.campo, valor, 'No', 'Sí',
             r.errores.map(function (e) { return e.motivo + ' ' + e.correccion; }).join(' | '),
             { fila: filaHallada, col: colValor });
    } else {
      anotar('Ejecución', def.campo, valor, 'Sí', 'Sí',
             r.notas.map(function (n) { return n.motivo; }).join(' | '),
             { fila: filaHallada, col: colValor });
      r.notas.forEach(function (n) { ficha.notas.push(def.campo + ': ' + n.motivo); });
    }
    // Regla 7: los registros se cotejan contra los productos parciales del A1.
    r.codigos.forEach(function (cod) {
      cotejo.push({ tipo: 'Registro', codigo: cod,
                    denominacion: denominacionDeA3_(valor), ficha: numero });
    });
  });

  /* ── 3.4 Formalización del Proceso ──────────────────────────────────── */

  if (!posForm) {
    ficha.campos++;
    faltante('Formalización › sección completa', rangoFicha);
    anotar('Formalización', 'Sección', '', 'N/A', 'No',
           'No se encontró "FORMALIZACIÓN DEL PROCESO" en la ficha.', rangoFicha);
  } else {
    // Encabezado Unidad | Cargo | Nombre y Apellidos | Firma.
    let filaEnc = -1;
    const columnas = {};
    for (let f = posForm.fila; f <= bloque.fin; f++) {
      const encontradas = {};
      CONFIG_A3.CAMPOS_FORMALIZACION.forEach(function (campo) {
        for (let c = 0; c < V[f].length; c++) {
          if (esEtiqueta_(V[f][c], campo.etiquetas) && encontradas[campo.campo] === undefined) {
            encontradas[campo.campo] = c;
          }
        }
      });
      if (Object.keys(encontradas).length >= 2) { filaEnc = f; Object.keys(encontradas).forEach(function (k) { columnas[k] = encontradas[k]; }); break; }
    }

    CONFIG_A3.BLOQUES_FORMALIZACION.forEach(function (bloqueNombre) {
      let filaBloque = -1;
      for (let f = (filaEnc === -1 ? posForm.fila : filaEnc); f <= bloque.fin; f++) {
        for (let c = 0; c < V[f].length; c++) {
          if (esEtiqueta_(V[f][c], [bloqueNombre])) { filaBloque = f; break; }
        }
        if (filaBloque !== -1) break;
      }
      const rotulo = bloqueNombre.charAt(0) + bloqueNombre.substring(1).toLowerCase();

      CONFIG_A3.CAMPOS_FORMALIZACION.forEach(function (campo) {
        if (!campo.obligatorio) {
          // La firma va como foto: se informa, no se computa ni se exige.
          anotar('Formalización', rotulo + ' › ' + campo.campo, '', 'N/A', 'Opcional',
                 'La firma es una imagen; no se computa como campo faltante.',
                 filaBloque === -1 ? rangoFicha
                                   : { fila: filaBloque, col: columnas[campo.campo] });
          return;
        }
        ficha.campos++;
        if (filaBloque === -1) {
          faltante('Formalización › ' + rotulo + ' › ' + campo.campo, rangoFicha);
          anotar('Formalización', rotulo + ' › ' + campo.campo, '', 'N/A', 'No',
                 'No se encontró la fila "' + rotulo + '".', rangoFicha);
          return;
        }
        let valor = '';
        if (columnas[campo.campo] !== undefined) {
          const bruto = V[filaBloque][columnas[campo.campo]];
          if (!esVacio_(bruto) && !esEtiqueta_(bruto, [bloqueNombre])) valor = bruto.toString().trim();
        }
        if (!valor) {
          // Sin encabezado ubicable, se recorre la fila de izquierda a derecha.
          const v = valorDeEtiqueta_(V[filaBloque], indiceDe_(V[filaBloque], bloqueNombre), ctx.etiquetas);
          if (campo.campo === 'Unidad') valor = v.valor;
        }
        if (esVacio_(valor)) {
          faltante('Formalización › ' + rotulo + ' › ' + campo.campo, { fila: filaBloque, col: columnas[campo.campo] });
          anotar('Formalización', rotulo + ' › ' + campo.campo, '', 'N/A', 'No',
                 'Campo obligatorio vacío.',
                 { fila: filaBloque, col: columnas[campo.campo] });
        } else {
          ficha.completos++;
          anotar('Formalización', rotulo + ' › ' + campo.campo, recortarA3_(valor, 90), 'N/A', 'Sí', '',
                 { fila: filaBloque, col: columnas[campo.campo] });
        }
      });
    });
  }

  /* ── Regla 1: fuente Arial ──────────────────────────────────────────── */

  if (ctx.fuentes) {
    // Una fila por celda infractora, para que el revisor tenga la celda exacta.
    // Si son muchas se listan las primeras y se cierra con el total, para no
    // inundar el detalle con cientos de filas de una misma ficha.
    let listadas = 0;
    for (let f = bloque.inicio; f <= bloque.fin && f < ctx.fuentes.length; f++) {
      for (let c = 0; c < ctx.fuentes[f].length; c++) {
        if (esVacio_(V[f][c])) continue;
        const fuente = (ctx.fuentes[f][c] || '').toString();
        if (normalizar_(fuente) === normalizar_(CONFIG_A3.FUENTE_OBLIGATORIA)) continue;
        ficha.fueraDeArial++;
        if (listadas < CONFIG_A3.MAX_CELDAS_FUENTE) {
          listadas++;
          anotar('Formato', 'Fuente Arial', recortarA3_(V[f][c], 60), 'N/A', 'No',
                 'Regla 1: la celda usa la fuente "' + fuente + '" en lugar de Arial.',
                 { fila: f, col: c });
        }
      }
    }
    if (ficha.fueraDeArial > listadas) {
      anotar('Formato', 'Fuente Arial', '', 'N/A', 'No',
             'Regla 1: ' + ficha.fueraDeArial + ' celda(s) fuera de Arial en la ficha; ' +
             'se detallan las ' + listadas + ' primeras.', rangoFicha);
    }
  }

  ficha.avance = ficha.campos ? Math.round(ficha.completos * 1000 / ficha.campos) / 10 : 0;
  ficha.completa = (ficha.faltantes.length === 0 && ficha.erroresCodificacion === 0);
  if (!ficha.nombre) ficha.nombre = ficha.codigo || ('Ficha ' + numero);
  detalle.forEach(function (d) { d.nombre = ficha.nombre; });
  return ficha;
}

/** Denominación tomada de la celda contigua cuando el código va solo. */
function denominacionVecina_(fila, col) {
  for (let c = col + 1; c < fila.length; c++) {
    if (esVacio_(fila[c])) continue;
    const t = fila[c].toString().trim();
    if (extraerCodigosA3_(t).length) return '';
    return t;
  }
  return '';
}

function indiceDe_(fila, etiqueta) {
  for (let c = 0; c < fila.length; c++) if (esEtiqueta_(fila[c], [etiqueta])) return c;
  return 0;
}

/** 1 → A, 27 → AA. */
function letraColumna_(n) {
  let s = '';
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONSOLIDACIONES  (hojas 4 y 5)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Registro maestro de proveedores, entradas y beneficiarios. Detecta los dos
 * defectos de las reglas 2, 3 y 6: un mismo código con denominaciones distintas
 * y una misma denominación con códigos distintos.
 */
function construirMaestro_(entradas) {
  const porCodigo = {};
  const porDenominacion = {};

  entradas.forEach(function (e) {
    if (!e.codigo) return;
    const k = e.tipo + '|' + e.codigo;
    if (!porCodigo[k]) porCodigo[k] = { tipo: e.tipo, codigo: e.codigo, denominaciones: [], fichas: [] };
    const reg = porCodigo[k];
    const dn = normalizar_(e.denominacion);
    if (dn && reg.denominaciones.indexOf(dn) === -1) reg.denominaciones.push(dn);
    if (reg.fichas.indexOf(e.ficha) === -1) reg.fichas.push(e.ficha);

    if (dn) {
      const kd = e.tipo + '|' + dn;
      if (!porDenominacion[kd]) porDenominacion[kd] = [];
      if (porDenominacion[kd].indexOf(e.codigo) === -1) porDenominacion[kd].push(e.codigo);
    }
  });

  return Object.keys(porCodigo).sort().map(function (k) {
    const r = porCodigo[k];
    const observaciones = [];
    if (r.denominaciones.length > 1) {
      observaciones.push('El código se usa con ' + r.denominaciones.length +
        ' denominaciones distintas: ' + r.denominaciones.map(function (d) { return '"' + recortarA3_(d, 50) + '"'; }).join(', ') +
        '. Unifique la denominación o asigne códigos distintos.');
    }
    r.denominaciones.forEach(function (d) {
      const codigos = porDenominacion[r.tipo + '|' + d] || [];
      if (codigos.length > 1) {
        observaciones.push('La denominación "' + recortarA3_(d, 50) + '" aparece con los códigos ' +
          codigos.join(', ') + '. Debe conservarse un único código correlativo en toda la facultad.');
      }
    });
    return {
      tipo: r.tipo,
      codigo: r.codigo,
      denominacion: r.denominaciones.join(' | '),
      fichas: r.fichas.join(', '),
      consistente: observaciones.length ? 'No' : 'Sí',
      observacion: observaciones.join(' ')
    };
  });
}

/**
 * Catálogo del Anexo 1: código → { denominación, tipo }. Se lee la columna B
 * (código + denominación) y la columna C (tipo de producto).
 */
function leerCatalogoAnexo1_(sigla) {
  const catalogo = {};
  let hoja = null;
  try {
    const libro = SpreadsheetApp.openById(CONFIG_A3.ANEXO1_SHEET_ID);
    if (CONFIG_A3.ANEXO1_TAB_NAME) hoja = libro.getSheetByName(CONFIG_A3.ANEXO1_TAB_NAME);
    if (!hoja) {
      libro.getSheets().forEach(function (h) {
        if (!hoja && siglaDePestana_(h.getName()) === sigla) hoja = h;
      });
    }
    if (!hoja) return { disponible: false, motivo: 'No se ubicó la pestaña de ' + sigla + ' en el Anexo 1.', catalogo: catalogo };

    const datos = hoja.getRange(1, 2, hoja.getLastRow(), 2).getValues();  // B y C
    datos.forEach(function (fila) {
      extraerCodigosA3_(fila[0]).forEach(function (c) {
        if (!catalogo[c]) {
          catalogo[c] = { denominacion: denominacionDeA3_(fila[0]), tipo: (fila[1] || '').toString().trim() };
        }
      });
    });
    return { disponible: true, hoja: hoja.getName(), catalogo: catalogo };
  } catch (e) {
    return { disponible: false, motivo: 'No se pudo leer el Anexo 1: ' + e.message, catalogo: catalogo };
  }
}

/** Cotejo de salidas y registros contra el Anexo 1 (reglas 5 y 7). */
function construirCotejo_(entradas, anexo1) {
  const vistos = {};
  const filas = [];
  entradas.forEach(function (e) {
    const k = e.tipo + '|' + e.codigo + '|' + normalizar_(e.denominacion);
    if (vistos[k]) { vistos[k].fichas.push(e.ficha); return; }
    vistos[k] = { fichas: [e.ficha] };
    filas.push({ ref: vistos[k], tipo: e.tipo, codigo: e.codigo, denominacion: e.denominacion });
  });

  return filas.map(function (f) {
    let existe = 'No verificable';
    let observacion = '';
    if (!anexo1.disponible) {
      observacion = anexo1.motivo;
    } else {
      const enA1 = anexo1.catalogo[f.codigo];
      if (!enA1) {
        existe = 'No';
        observacion = f.tipo === 'Registro'
          ? 'Regla 7: producto parcial no registrado en el Anexo 1. Debe incorporarse con la misma denominación en ambos anexos.'
          : 'Regla 5: la salida no figura en el Anexo 1. Use la codificación y denominación ya establecidas allí.';
      } else if (f.denominacion && normalizar_(f.denominacion) !== normalizar_(enA1.denominacion)) {
        existe = 'Sí (denominación distinta)';
        observacion = 'El Anexo 1 lo denomina "' + recortarA3_(enA1.denominacion, 70) +
                      '". Debe consignarse la misma denominación en ambos anexos.';
      } else {
        existe = 'Sí';
      }
      if (enA1 && f.tipo === 'Registro' && enA1.tipo && normalizar_(enA1.tipo).indexOf('PARCIAL') === -1) {
        observacion += (observacion ? ' ' : '') +
          'En el Anexo 1 está tipificado como "' + enA1.tipo + '"; los registros deben ser productos parciales.';
      }
    }
    return {
      tipo: f.tipo, codigo: f.codigo, denominacion: recortarA3_(f.denominacion, 120),
      fichas: f.ref.fichas.join(', '), existe: existe, observacion: observacion
    };
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   ESCRITURA DEL ARCHIVO DE SALIDA
   ═══════════════════════════════════════════════════════════════════════════ */

function crearArchivoSalida_(sigla) {
  const marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
  const nombre = CONFIG_A3.PREFIJO_ARCHIVO + '_' + sigla + '_' + marca;
  const carpeta = DriveApp.getFolderById(CONFIG_A3.OUTPUT_FOLDER_ID);

  if (CONFIG_A3.REUTILIZAR_ARCHIVO_DEL_DIA) {
    const dia = CONFIG_A3.PREFIJO_ARCHIVO + '_' + sigla + '_' +
                Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const it = carpeta.getFiles();
    while (it.hasNext()) {
      const f = it.next();
      if (f.getName().indexOf(dia) === 0) return SpreadsheetApp.openById(f.getId());
    }
  }

  const ss = SpreadsheetApp.create(nombre);
  const archivo = DriveApp.getFileById(ss.getId());
  carpeta.addFile(archivo);
  DriveApp.getRootFolder().removeFile(archivo);
  return ss;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEMÁFORO DE ESTADOS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Estado de una fila del detalle.
 *  - `error`      → la codificación no cumple la estructura exigida.
 *  - `incompleto` → el campo obligatorio está vacío o no se encontró.
 *  - `neutro`     → campo opcional (la firma).
 *  - `ok`         → nada que corregir.
 *
 * El formato manda sobre lo demás: una celda fuera de Arial es un
 * incumplimiento de la regla 1, no un campo a medio llenar.
 */
function estadoDeDetalle_(d) {
  if (d.seccion === 'Formato') return 'error';
  if (d.estructura === 'No') return 'error';
  if (d.completo === 'Opcional') return 'neutro';
  if (d.completo === 'No') return 'incompleto';
  return 'ok';
}

/** Estado de una ficha en el resumen ejecutivo. */
function estadoDeFicha_(f) {
  if (f.erroresCodificacion > 0 || f.fueraDeArial > 0) return 'error';
  if (f.faltantes.length > 0) return 'incompleto';
  return 'ok';
}

/** Estado de una fila del registro maestro de códigos. */
function estadoDeMaestro_(m) {
  return m.consistente === 'No' ? 'error' : 'ok';
}

/**
 * Estado de una fila del cotejo con el Anexo 1. Lo que no se pudo verificar y
 * lo que existe con otra denominación quedan en ámbar: son cosas por resolver,
 * no incumplimientos probados.
 */
function estadoDeCotejo_(c) {
  if (c.existe === 'No') return 'error';
  if (c.existe === 'Sí') return 'ok';
  return 'incompleto';
}

/**
 * Escribe una hoja del archivo de salida.
 *
 * `estados` es opcional: una entrada por fila con la clave del semáforo
 * (`ok`, `incompleto`, `error`, `neutro`). Cuando se pasa, se añade la columna
 * ESTADO al final y cada fila se pinta con el color que le corresponde.
 */
function escribirHoja_(ss, nombre, encabezados, filas, estados) {
  let hoja = ss.getSheetByName(nombre);
  if (!hoja) hoja = ss.insertSheet(nombre);
  hoja.clear();

  const conEstado = !!estados;
  const cabecera = conEstado ? encabezados.concat(['ESTADO']) : encabezados.slice();
  const cuerpo = filas.map(function (fila, i) {
    if (!conEstado) return fila;
    const clave = estados[i] || 'ok';
    return fila.concat([(CONFIG_A3.COLORES[clave] || CONFIG_A3.COLORES.ok).rotulo]);
  });

  const datos = [cabecera].concat(cuerpo.length ? cuerpo : [cabecera.map(function () { return ''; })]);
  const ancho = cabecera.length;
  hoja.getRange(1, 1, datos.length, ancho).setValues(datos);
  hoja.getRange(1, 1, datos.length, ancho)
      .setFontFamily(CONFIG_A3.FUENTE_OBLIGATORIA).setVerticalAlignment('top').setWrap(true);
  hoja.getRange(1, 1, 1, ancho).setFontWeight('bold')
      .setFontColor('#ffffff').setBackground('#1f3864');
  hoja.setFrozenRows(1);

  if (conEstado && cuerpo.length) {
    // Se pintan tramos contiguos del mismo estado en lugar de fila por fila:
    // una hoja de miles de filas haría miles de llamadas al servicio.
    let inicio = 0;
    for (let i = 1; i <= cuerpo.length; i++) {
      if (i < cuerpo.length && estados[i] === estados[inicio]) continue;
      const color = CONFIG_A3.COLORES[estados[inicio]] || CONFIG_A3.COLORES.ok;
      hoja.getRange(inicio + 2, 1, i - inicio, ancho)
          .setBackground(color.fondo).setFontColor(color.texto);
      inicio = i;
    }
    hoja.getRange(2, ancho, cuerpo.length, 1).setFontWeight('bold').setHorizontalAlignment('center');
  }

  for (let c = 1; c <= ancho; c++) {
    hoja.setColumnWidth(c, c <= 2 ? 140 : (conEstado && c === ancho ? 110 : 260));
  }
  if (cuerpo.length) hoja.getRange(1, 1, cuerpo.length + 1, ancho).createFilter();
  return hoja;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUNTO DE ENTRADA
   ═══════════════════════════════════════════════════════════════════════════ */

/** Lee la pestaña CONFIG_A3 del Anexo 3, si existe, y sobrescribe la config. */
function aplicarConfigDeHoja_(libro) {
  const hoja = libro.getSheetByName(CONFIG_A3.TAB_CONFIG);
  if (!hoja || hoja.getLastRow() < 1) return;
  hoja.getRange(1, 1, hoja.getLastRow(), 2).getValues().forEach(function (fila) {
    const clave = (fila[0] || '').toString().trim();
    if (!clave || !(clave in CONFIG_A3)) return;
    let valor = fila[1];
    if (typeof valor === 'string') {
      const t = valor.trim();
      if (t === '') return;
      if (t.toUpperCase() === 'TRUE')  valor = true;
      else if (t.toUpperCase() === 'FALSE') valor = false;
      else valor = t;
    }
    CONFIG_A3[clave] = valor;
  });
}

/**
 * Localiza la pestaña a revisar. `getSheetByName` exige el nombre exacto, y en
 * la práctica los títulos traen espacios de más, espacios duros, tildes o el
 * número de orden escrito de otra forma ("2. FDCP", "2.FDCP ", "FDCP"). Se
 * busca en tres pasadas, de la más estricta a la más tolerante.
 */
function localizarPestanaA3_(libro, nombrePestana) {
  const hojas = libro.getSheets();

  // 1) Nombre exacto.
  const exacta = libro.getSheetByName(nombrePestana);
  if (exacta) return exacta;

  // 2) Mismo nombre salvo espacios, tildes y mayúsculas.
  const compacto = function (t) {
    return normalizar_(t).replace(/\u00a0/g, ' ').replace(/[\s.]/g, '');
  };
  const buscado = compacto(nombrePestana);
  for (let i = 0; i < hojas.length; i++) {
    if (compacto(hojas[i].getName()) === buscado) return hojas[i];
  }

  // 3) Misma sigla de facultad ("2. FDCP", "FDCP", "2-FDCP").
  const sigla = CONFIG_A3.FACULTAD_SIGLA || siglaDePestana_(nombrePestana);
  if (sigla) {
    for (let i = 0; i < hojas.length; i++) {
      if (siglaDePestana_(hojas[i].getName()) === sigla) return hojas[i];
    }
  }

  const disponibles = hojas.map(function (h) { return '"' + h.getName() + '"'; }).join(', ');
  throw new Error('No existe la pestaña "' + nombrePestana + '" en el Anexo 3. ' +
                  'Pestañas disponibles: ' + disponibles + '. ' +
                  'Copie el nombre exacto en CONFIG_A3.SOURCE_TAB_NAME.');
}

/**
 * Lista en el registro los nombres de todas las pestañas del Anexo 3, con el
 * nombre entre comillas para que se vean los espacios sobrantes. Sirve para
 * saber qué escribir en `SOURCE_TAB_NAME` cuando la pestaña no aparece.
 */
function listarPestanasA3() {
  const libro = SpreadsheetApp.openById(CONFIG_A3.SOURCE_SHEET_ID);
  const nombres = libro.getSheets().map(function (h, i) {
    const sigla = siglaDePestana_(h.getName());
    return (i + 1) + '. "' + h.getName() + '"' + (sigla ? '  → facultad ' + sigla : '');
  });
  Logger.log('Pestañas del Anexo 3:\n' + nombres.join('\n'));
  return nombres;
}

/**
 * Revisa una pestaña del Anexo 3 y devuelve el resultado consolidado, sin
 * escribir nada. Reutilizable para revisar varias facultades en una corrida.
 */
function revisarPestanaA3_(libro, nombrePestana) {
  const hoja = localizarPestanaA3_(libro, nombrePestana);

  const rango = hoja.getDataRange();
  const valores = rango.getValues();
  let fuentes = null;
  try { fuentes = rango.getFontFamilies(); } catch (e) { fuentes = null; }

  const sigla = CONFIG_A3.FACULTAD_SIGLA || siglaDePestana_(nombrePestana) || nombrePestana;
  const facultad = facultadPorSigla_(sigla);
  const formulario = CONFIG_A3.FORMULARIO ||
                     (facultad && facultad.formulario) ||
                     formularioDominante_(valores);
  const permiteNivel2 = CONFIG_A3.FACULTADES_NIVEL_2.indexOf(sigla) !== -1;

  const ctx = {
    valores: valores, fuentes: fuentes, formulario: formulario,
    permiteNivel2: permiteNivel2, etiquetas: catalogoDeEtiquetas_()
  };

  const bloques = localizarFichas_(valores);
  const fichas = bloques.map(function (b, i) { return revisarFicha_(ctx, b, i + 1); });

  const maestroEntradas = [];
  const cotejoEntradas = [];
  fichas.forEach(function (f) {
    f.codigosMaestro.forEach(function (e) { maestroEntradas.push(e); });
    f.cotejo.forEach(function (e) { cotejoEntradas.push(e); });
  });

  const anexo1 = leerCatalogoAnexo1_(sigla);

  return {
    pestana: nombrePestana,
    sigla: sigla,
    formulario: formulario,
    permiteNivel2: permiteNivel2,
    fichas: fichas,
    maestro: construirMaestro_(maestroEntradas),
    cotejo: construirCotejo_(cotejoEntradas, anexo1),
    anexo1: anexo1
  };
}

/** Escribe las seis hojas del archivo de salida. */
function escribirResultado_(ss, resultado) {
  const H = CONFIG_A3.HOJAS;

  /* Hoja 1 — Detalle */
  const detalle = [];
  const estadosDetalle = [];
  resultado.fichas.forEach(function (f) {
    f.detalle.forEach(function (d) {
      detalle.push([f.numero + '. ' + f.nombre, d.seccion, d.campo, d.fila, d.celda,
                    d.codigo, d.estructura, d.completo, d.observacion]);
      estadosDetalle.push(estadoDeDetalle_(d));
    });
  });
  escribirHoja_(ss, H.DETALLE,
    ['N° FICHA / PROCESO', 'SECCIÓN', 'CAMPO REVISADO', 'N° DE FILA', 'CELDA',
     'CÓDIGO ENCONTRADO', '¿CUMPLE ESTRUCTURA?', '¿CAMPO COMPLETO?', 'OBSERVACIÓN ESPECÍFICA'],
    detalle, estadosDetalle);

  /* Hoja 2 — Resumen ejecutivo */
  const resumen = resultado.fichas.map(function (f) {
    const sugerencias = [];
    if (f.faltantes.length) sugerencias.push('Complete ' + f.faltantes.length + ' campo(s) pendiente(s).');
    if (f.erroresCodificacion) sugerencias.push('Corrija ' + f.erroresCodificacion + ' error(es) de codificación.');
    if (f.fueraDeArial) sugerencias.push('Regla 1: uniformice ' + f.fueraDeArial + ' celda(s) a fuente Arial.');
    if (f.notas.length) sugerencias.push('Excepción de nivel 2 admitida: ' + f.notas.slice(0, 3).join('; ') + '.');
    if (!sugerencias.length) sugerencias.push('Sin observaciones.');
    return [f.numero + '. ' + f.nombre, f.codigo, f.completa ? 'Sí' : 'No', f.avance / 100,
            f.faltantes.join('\n') || '—', f.erroresCodificacion, sugerencias.join(' ')];
  });
  const hojaResumen = escribirHoja_(ss, H.RESUMEN,
    ['N° FICHA / PROCESO', 'CÓDIGO', '¿COMPLETA?', '% DE AVANCE',
     'CAMPOS/CELDAS FALTANTES', 'ERRORES DE CODIFICACIÓN', 'OBSERVACIONES Y CORRECCIONES'],
    resumen, resultado.fichas.map(estadoDeFicha_));
  if (resumen.length) hojaResumen.getRange(2, 4, resumen.length, 1).setNumberFormat('0.0%');

  /* Hoja 3 — Dashboard */
  const total = resultado.fichas.length;
  const completas = resultado.fichas.filter(function (f) { return f.completa; }).length;
  const campos = resultado.fichas.reduce(function (a, f) { return a + f.campos; }, 0);
  const completos = resultado.fichas.reduce(function (a, f) { return a + f.completos; }, 0);
  const errores = resultado.fichas.reduce(function (a, f) { return a + f.erroresCodificacion; }, 0);
  const arial = resultado.fichas.reduce(function (a, f) { return a + f.fueraDeArial; }, 0);

  const porSeccion = {};
  resultado.fichas.forEach(function (f) {
    f.faltantes.forEach(function (x) {
      const sec = x.split(' › ')[0];
      porSeccion[sec] = (porSeccion[sec] || 0) + 1;
    });
  });
  const top = Object.keys(porSeccion).sort(function (a, b) { return porSeccion[b] - porSeccion[a]; })
    .map(function (s) { return s + ' (' + porSeccion[s] + ')'; }).join(', ') || '—';

  const inconsistencias = resultado.maestro.filter(function (m) { return m.consistente === 'No'; }).length;
  const sinAnexo1 = resultado.cotejo.filter(function (c) { return c.existe === 'No'; }).length;

  const indicadores = [
      ['Facultad', resultado.sigla + ' — formulario ' + (resultado.formulario || 'sin determinar')],
      ['Pestaña revisada', resultado.pestana],
      ['Fecha de la revisión', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')],
      ['Fichas técnicas revisadas', total],
      ['Fichas completas', completas],
      ['Fichas incompletas', total - completas],
      ['% de avance global', campos ? (Math.round(completos * 1000 / campos) / 10) + '%' : '0%'],
      ['Campos aplicables / completos', campos + ' / ' + completos],
      ['Errores de codificación', errores],
      ['Celdas fuera de Arial (regla 1)', arial],
      ['Secciones con más campos faltantes', top],
      ['Códigos con uso inconsistente (reglas 2, 3 y 6)', inconsistencias],
      ['Salidas/registros ausentes del Anexo 1 (reglas 5 y 7)', sinAnexo1],
      ['Cotejo con el Anexo 1', resultado.anexo1.disponible ? 'Pestaña ' + resultado.anexo1.hoja : resultado.anexo1.motivo],
      ['Excepción de nivel 2', resultado.permiteNivel2 ? 'Activa: se admiten códigos con un nivel adicional' : 'No aplica'],
      ['', ''],
      ['LEYENDA DEL SEMÁFORO', '']
    ];

  const leyenda = [
    { clave: 'ok',         texto: 'La fila cumple: campo completo y codificación correcta.' },
    { clave: 'incompleto', texto: 'Falta completar el campo, o el dato está por verificar contra el Anexo 1.' },
    { clave: 'error',      texto: 'Hay algo que corregir: codificación fuera de estructura o fuente distinta de Arial.' },
    { clave: 'neutro',     texto: 'Campo opcional (la firma va como imagen): no baja el porcentaje de avance.' }
  ];

  const hojaDashboard = escribirHoja_(ss, H.DASHBOARD, ['INDICADOR', 'VALOR'],
    indicadores.concat(leyenda.map(function (l) {
      return [CONFIG_A3.COLORES[l.clave].rotulo, l.texto];
    })));

  // La leyenda se pinta con los mismos colores que usan las demás hojas. Su
  // primera fila se calcula, no se fija: encabezado + indicadores.
  const filaLeyenda = indicadores.length + 1;
  hojaDashboard.getRange(filaLeyenda, 1, 1, 2).setFontWeight('bold');
  leyenda.forEach(function (l, i) {
    const color = CONFIG_A3.COLORES[l.clave];
    hojaDashboard.getRange(filaLeyenda + 1 + i, 1, 1, 2)
                 .setBackground(color.fondo).setFontColor(color.texto);
  });

  /* Hoja 4 — Registro maestro de códigos */
  escribirHoja_(ss, H.MAESTRO,
    ['TIPO', 'CÓDIGO', 'DENOMINACIÓN', 'FICHAS EN QUE APARECE', '¿DENOMINACIÓN CONSISTENTE?', 'OBSERVACIÓN'],
    resultado.maestro.map(function (m) {
      return [m.tipo, m.codigo, m.denominacion, m.fichas, m.consistente, m.observacion];
    }),
    resultado.maestro.map(estadoDeMaestro_));

  /* Hoja 5 — Cotejo contra el Anexo 1 */
  escribirHoja_(ss, H.COTEJO,
    ['TIPO', 'CÓDIGO (ANEXO 3)', 'DENOMINACIÓN (ANEXO 3)', 'FICHAS', '¿EXISTE EN EL ANEXO 1?', 'OBSERVACIÓN'],
    resultado.cotejo.map(function (c) {
      return [c.tipo, c.codigo, c.denominacion, c.fichas, c.existe, c.observacion];
    }),
    resultado.cotejo.map(estadoDeCotejo_));

  /* Hoja 6 — Solo observaciones */
  const soloErrores = [];
  const estadosErrores = [];
  function agregarHallazgo(fila, estado) { soloErrores.push(fila); estadosErrores.push(estado); }

  resultado.fichas.forEach(function (f) {
    f.detalle.forEach(function (d) {
      const estado = estadoDeDetalle_(d);
      if (estado === 'ok' || estado === 'neutro') return;
      agregarHallazgo([CONFIG_A3.HOJAS.DETALLE, f.numero + '. ' + f.nombre,
                       d.seccion + ' › ' + d.campo, d.celda || d.fila, d.codigo,
                       d.observacion], estado);
    });
  });
  resultado.maestro.forEach(function (m) {
    if (estadoDeMaestro_(m) !== 'ok') {
      agregarHallazgo([CONFIG_A3.HOJAS.MAESTRO, m.fichas, m.tipo, '', m.codigo, m.observacion], 'error');
    }
  });
  resultado.cotejo.forEach(function (c) {
    const estado = estadoDeCotejo_(c);
    if (estado !== 'ok') {
      agregarHallazgo([CONFIG_A3.HOJAS.COTEJO, c.fichas, c.tipo, '', c.codigo, c.observacion], estado);
    }
  });
  escribirHoja_(ss, H.ERRORES,
    ['HOJA DE ORIGEN', 'FICHA(S)', 'SECCIÓN / TIPO', 'FILA / CELDA', 'CÓDIGO', 'OBSERVACIÓN'],
    soloErrores, estadosErrores);

  // La hoja que crea Google por defecto sobra.
  const inicial = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja1');
  if (inicial && ss.getSheets().length > 1) ss.deleteSheet(inicial);
  ss.setActiveSheet(ss.getSheetByName(H.DASHBOARD));
}

/**
 * Revisa la pestaña configurada y escribe el archivo de salida.
 * Devuelve la URL del archivo creado.
 */
function ejecutarRevisionAnexo3() {
  const libro = SpreadsheetApp.openById(CONFIG_A3.SOURCE_SHEET_ID);
  aplicarConfigDeHoja_(libro);

  const resultado = revisarPestanaA3_(libro, CONFIG_A3.SOURCE_TAB_NAME);
  const ss = crearArchivoSalida_(resultado.sigla);
  escribirResultado_(ss, resultado);

  const url = ss.getUrl();
  Logger.log('Revisión del Anexo 3 — ' + resultado.sigla + ': ' + url);
  try {
    SpreadsheetApp.getUi().alert('Revisión terminada.\n\n' + resultado.fichas.length +
      ' ficha(s) revisada(s).\n\nArchivo: ' + url);
  } catch (e) { /* sin interfaz: ejecución desde el editor o por disparador */ }
  return url;
}

/**
 * Misma revisión para todas las pestañas de facultad del Anexo 3. Cada
 * facultad recibe su propio archivo dentro de la carpeta de salida.
 */
function revisarTodasLasFacultadesA3() {
  const libro = SpreadsheetApp.openById(CONFIG_A3.SOURCE_SHEET_ID);
  aplicarConfigDeHoja_(libro);

  const urls = [];
  libro.getSheets().forEach(function (hoja) {
    const sigla = siglaDePestana_(hoja.getName());
    if (!sigla) return;
    const resultado = revisarPestanaA3_(libro, hoja.getName());
    if (!resultado.fichas.length) return;
    const ss = crearArchivoSalida_(resultado.sigla);
    escribirResultado_(ss, resultado);
    urls.push(resultado.sigla + ': ' + ss.getUrl());
  });
  Logger.log(urls.join('\n'));
  return urls;
}
