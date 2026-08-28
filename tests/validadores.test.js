/**
 * Pruebas de los validadores del Anexo 1.
 *
 * Apps Script no se puede ejecutar fuera de Google, así que se carga el .gs en
 * Node con stubs de SpreadsheetApp y Logger. Solo se prueban las funciones
 * puras (validadores, localización de pestañas, jerarquía y cobertura); la
 * lectura y escritura de hojas queda fuera de alcance.
 *
 *   node tests/validadores.test.js
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const FUENTE = path.join(__dirname, "..", "apps-script", "Anexo1_Auditoria_v10.gs");

const SHIM = `
var SpreadsheetApp = { getUi: function () { throw new Error("sin interfaz"); } };
var Logger = { log: function () {} };
module.exports = {
  CONFIG_A1, validarCodigo_, validarTipoProducto_, validarAccionEstrategica_,
  validarActividadOperativa_, validarListaCerrada_, validarListaAbierta_,
  esDenominacionDeProcesoN0_, buscarNivel0PorNombre_, facultadDeLaHoja_,
  localizarHoja_, esValorNulo_, normalizarTexto_, normalizarCodigo_,
  clasificarFila_, extraerCodigos_, denominacionDe_, rescatarColumnasManuales_,
  filasNivel0_, filaDeProceso_, puntuarProceso_, sufijoDe_, CRITERIOS_PROCESO,
  TOTAL_CRITERIOS_PROCESO, celdaFormulario_, avanceSobreCriterios_, estadoGeneral_,
  esCatalogacion_, abrePorProceso_, unirObservaciones_, SEPARADOR_OBS
};
`;

function cargarModulo() {
  const destino = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "a1-")), "modulo.js");
  fs.writeFileSync(destino, fs.readFileSync(FUENTE, "utf8") + SHIM);
  return require(destino);
}

const M = cargarModulo();

let total = 0;
let fallas = 0;

function chequear(descripcion, condicion) {
  total++;
  if (!condicion) {
    fallas++;
    console.log("  ✗ " + descripcion);
  }
}

function bloque(titulo, fn) {
  console.log("\n" + titulo);
  const antes = fallas;
  fn();
  console.log(antes === fallas ? "  todo correcto" : "  " + (fallas - antes) + " fallas");
}

/* ────────────────────────────────────────────────────────────────────────── */

bloque("Columna D — Acción Estratégica", function () {
  const validos = [
    "AE.04.01 Simplificación administrativa",
    "AE 04.01 Simplificación administrativa",
    "AE.02.02: Programa de fortalecimiento",
    "AE 01.01Actualización continua para la formación",
    "AE-01-02 Difusión del conocimiento"
  ];
  validos.forEach(function (v) {
    chequear("acepta " + JSON.stringify(v), M.validarAccionEstrategica_(v).ok);
  });

  const invalidos = [
    ["", "vacía"],
    ["NINGUNO", "marcador de vacío"],
    ["AE.04.02", "código sin descripción"],
    ["AE.02", "numeración de un solo nivel"],
    ["AEI.04.03 Gestión por Procesos", "sigla AEI"],
    ["OE.02", "objetivo en vez de acción"],
    ["AS.06.01", "sigla AS"],
    ["AM.01.01", "sigla AM"],
    ["AO. Gestión del Planeamiento", "actividad operativa en la columna D"]
  ];
  invalidos.forEach(function (par) {
    chequear("rechaza " + par[1], !M.validarAccionEstrategica_(par[0]).ok);
  });
});

bloque("Columna D — el diagnóstico explica el error", function () {
  const aei = M.validarAccionEstrategica_("AEI.04.03 Gestión por Procesos").obs;
  chequear("AEI indica que la sigla correcta es AE", /sigla "AE"/.test(aei));
  chequear("AEI advierte que no basta con quitar la I", /NO basta con eliminar/.test(aei));
  chequear("AEI da la evidencia de la discrepancia", /Simplificación administrativa/.test(aei));

  const oe = M.validarAccionEstrategica_("OE.02").obs;
  chequear("OE explica el nivel jerárquico", /Objetivo Estratégico/.test(oe));
  chequear("OE indica la corrección concreta", /AE\.02\.01/.test(oe));

  const ao = M.validarAccionEstrategica_("AO. Gestión del Planeamiento").obs;
  chequear("AO señala la columna correcta", /COLUMNA E/i.test(ao));

  const as = M.validarAccionEstrategica_("AS.06.01").obs;
  chequear("AS indica el formato exigido", /AE\.##\.##/.test(as));

  const unNivel = M.validarAccionEstrategica_("AE.02").obs;
  chequear("un nivel explica objetivo vs acción", /dos niveles/.test(unNivel));
});

bloque("Columna E — Actividad Operativa (contra observación: solo exige texto)", function () {
  chequear("acepta texto real", M.validarActividadOperativa_("Gestión del planeamiento institucional").ok);
  chequear("acepta NINGUNO", M.validarActividadOperativa_("NINGUNO").ok);
  chequear("acepta N/A", M.validarActividadOperativa_("N/A").ok);
  chequear("rechaza vacía", !M.validarActividadOperativa_("").ok);
  chequear("rechaza una AE mal ubicada", !M.validarActividadOperativa_("AE.01.02 algo").ok);
  chequear("rechaza un texto de dos caracteres", !M.validarActividadOperativa_("ok").ok);
});

bloque("Columnas C, F, G, H, I", function () {
  chequear("C acepta Final", M.validarTipoProducto_("Final / Salida (Programa)").ok);
  chequear("C acepta Parcial", M.validarTipoProducto_("Parcial /  Registro (Informes)").ok);
  chequear("C rechaza la nota de proceso",
    !M.validarTipoProducto_("(No combinar las celdas de los procesos ni de los sub porcesos)").ok);

  chequear("F acepta Regulación", M.validarListaCerrada_("Regulación", M.CONFIG_A1.TIPOS_ENTREGABLE, "Col F", "x").ok);
  chequear("F rechaza un valor libre", !M.validarListaCerrada_("Producto", M.CONFIG_A1.TIPOS_ENTREGABLE, "Col F", "x").ok);
  chequear("G acepta Ente rector", M.validarListaCerrada_("Ente rector", M.CONFIG_A1.ROLES_INSTITUCIONALES, "Col G", "x").ok);

  chequear("H tolera el prefijo numérico",
    M.validarListaAbierta_("2. Cumplimiento de plazos, 3. Claridad", M.CONFIG_A1.VARIABLES_CALIDAD, "Col H", "x").ok);
  chequear("H rechaza NINGUNO",
    !M.validarListaAbierta_("NINGUNO", M.CONFIG_A1.VARIABLES_CALIDAD, "Col H", "x").ok);
  chequear("I reconoce el criterio c",
    M.validarListaAbierta_("3. Contribuye al cumplimiento de la misión, estrategia, objetivos y metas",
      M.CONFIG_A1.CRITERIOS_IMPACTO, "Col I", "x").ok);
});

bloque("Localización de pestañas — títulos reales del Anexo 1", function () {
  const titulos = [
    ["Facultad de Medicina", "FM"],
    ["Facultad de Medicina Veterinaria", "FMV"],
    ["Facultad de Derecho y Ciencia Política", "FDCP"],
    ["Facultad de Letras y Ciencias Humanas", "FLCH"],
    ["Facultad de Farmacia y Bioquimica", "FFB"],
    ["Facultad de Odontologia", "FO"],
    ["Facultad de Educación", "FE"],
    ["Facultad de Química e Ingeniería Química", "FQIQ"],
    ["Facultad de Ciencias Administrativa", "FCA"],
    ["Facultad de Ciencias Biológicas", "FCB"],
    ["Facultad de Ciencias Contables", "FCC"],
    ["Facultad de Ciencias Económicas", "FCE"],
    ["Facultad de Ciencias Fisicas", "FCF"],
    ["Facultad de Ciencias Matemáticas", "FCM"],
    ["Facultad de Ciencias Sociales", "FCCSS"],
    ["Facultad de Ingeniería Geológica", "FIGMMG"],
    ["Facultad de Ingeniería Industrial", "FII"],
    ["Facultad de Psicología", "FPSIC"],
    ["Facultad de Ingeniería Eléctrica Electrónica", "FIEE"],
    ["Facultad de Ingeniería de Sistemas e Informática", "FISI"]
  ];
  titulos.forEach(function (par) {
    const f = M.facultadDeLaHoja_(par[0]);
    chequear(par[0] + " → " + par[1], f !== null && f.sigla === par[1]);
  });

  chequear("las 20 pestañas se asignan a facultades distintas",
    new Set(titulos.map(function (p) { return M.facultadDeLaHoja_(p[0]).sigla; })).size === 20);
});

bloque("Localización de pestañas — colisiones de la v2", function () {
  const hoja = function (n, id) { return { getName: function () { return n; }, getSheetId: function () { return id; } }; };
  const fac = function (s) { return M.CONFIG_A1.FACULTADES.find(function (f) { return f.sigla === s; }); };

  const hojas = [hoja("Facultad de Medicina Veterinaria", 1), hoja("Facultad de Medicina", 2)];
  const asignadas = {};
  const hFM = M.localizarHoja_(hojas, fac("FM"), asignadas);
  chequear("FM no captura la pestaña de FMV", hFM.getName() === "Facultad de Medicina");
  asignadas[hFM.getSheetId()] = true;
  chequear("FMV conserva la suya",
    M.localizarHoja_(hojas, fac("FMV"), asignadas).getName() === "Facultad de Medicina Veterinaria");

  chequear("ANEXO 1 - FCCSS no lo toma FCC", M.facultadDeLaHoja_("ANEXO 1 - FCCSS").sigla === "FCCSS");
  chequear("ANEXO 1 - FCC va a FCC", M.facultadDeLaHoja_("ANEXO 1 - FCC").sigla === "FCC");
  chequear("la sigla prevalece sobre el alias", M.facultadDeLaHoja_("FMV - Medicina").sigla === "FMV");
});

bloque("Jerarquía — procesos con código de producto", function () {
  const procesos = [
    "GESTIÓN DE CALIDAD Y MEJORA CONTINUA",
    "GESTIÓN DE LA CALIDAD Y MEJORA CONTINUA",
    "GESTIÓN DE LA FORMACIÓN ACADÉMICA",
    "GESTIÓN DE LA INVESTIGACIÓN",
    "GESTIÓN DE RECURSOS BIBLIOGRAFICOS",
    "GESTIÓN DE RESPONSABILIDAD Y VINCULACIÓN SOCIAL",
    "GESTIÓN DE TECNOLOGÍA DE LA INFORMACIÓN Y COMUNICACIÓN"
  ];
  procesos.forEach(function (n) {
    chequear("reconoce el proceso N0 " + JSON.stringify(n), M.esDenominacionDeProcesoN0_(n));
  });

  const productos = [
    "PLAN ESTRATÉGICO APROBADO", "MAGPROF APROBADO", "CONVENIOS DE COOPERACIÓN",
    "TUTORIAS ACADÉMICAS", "SILABO DE ESTUDIOS", "GESTIÓN DE GRADOS Y TÍTULOS"
  ];
  productos.forEach(function (n) {
    chequear("no confunde el producto " + JSON.stringify(n), !M.esDenominacionDeProcesoN0_(n));
  });
});

bloque("Cobertura de los 16 procesos de Nivel 0", function () {
  const vacia = M.filasNivel0_("FM", {});
  const porCodigo = function (c) { return vacia.find(function (f) { return f[1] === c; }); };

  chequear("son 16 procesos", vacia.length === 16);
  chequear("PE.03 se reporta como NO APLICA", porCodigo("PE.03")[6] === "NO APLICA");
  chequear("PS.08 se reporta como NO APLICA", porCodigo("PS.08")[6] === "NO APLICA");
  chequear("quedan 14 obligatorios faltantes",
    vacia.filter(function (f) { return f[6] === "FALTANTE"; }).length === 14);
  chequear("un faltante puntúa 0", porCodigo("PE.01")[8] === "0/" + M.TOTAL_CRITERIOS_PROCESO);
  chequear("un opcional ausente no puntúa", porCodigo("PE.03")[8] === "—");

  const conforme = M.clasificarFila_("PE.01_F01 GESTIÓN ESTRATÉGICA", function () { return true; }, "F01");
  const llena = M.filasNivel0_("FM", { "PE.01": { fila: 7, cls: conforme } });
  chequear("un Nivel 0 correcto sale CONFORME al 100%",
    llena[0][6] === "CONFORME" && llena[0][7] === "100%");
  chequear("y registra la fila del Anexo 1", llena[0][5] === 7);
});


/* ─── Bloques añadidos en la v4, a partir de las contra observaciones ─────── */

/** Construye el predicado `esPadre` a partir de una lista de códigos. */
function padreEntre(codigos) {
  const normalizados = codigos.map(M.normalizarCodigo_);
  return function (base) {
    const b = M.normalizarCodigo_(base);
    return normalizados.some(function (x) { return x !== b && x.indexOf(b + ".") === 0; });
  };
}

bloque("Jerarquía de profundidad variable (contra observación FDCP)", function () {
  const fdcp = padreEntre([
    "PM.01", "PM.01.01", "PM.01.01.01", "PM.01.01.01.01", "PM.01.01.01.02",
    "PM.01.02.02", "PM.01.02.02.05"
  ]);

  const subproceso = M.clasificarFila_("PM.01.01.01_F02 DISEÑO Y ACTUALIZACIÓN CURRICULAR", fdcp);
  chequear("un código con descendientes es proceso, no producto", subproceso.tipo === "proceso");

  const cinco = M.clasificarFila_("PM.01.01.01.01_F02 PLAN CURRICULAR DE PREGRADO DE LAS ESCUELAS", fdcp);
  chequear("un código de cinco niveles es producto", cinco.tipo === "producto");
  chequear("y conserva su código", cinco.codigo && cinco.codigo.indexOf("PM.01.01.01.01") === 0);

  const hoja = M.clasificarFila_("PM.01.02.02.05_F02 INFORME DE ACTIVIDADES DEL DOCENTE CONTRATADO VALIDADO", fdcp);
  chequear("PM.01.02.02.05 es producto con código", hoja.tipo === "producto" && !!hoja.codigo);

  const fm = padreEntre(["PE.01", "PE.01.01", "PE.01.01.01", "PE.01.02", "PE.01.02.01"]);
  chequear("regresión FM: PE.01.01.01 sigue siendo producto",
    M.clasificarFila_("PE.01.01.01_F01 PLAN ESTRATÉGICO APROBADO", fm).tipo === "producto");
  chequear("regresión FM: PE.01.02 sigue siendo proceso",
    M.clasificarFila_("PE.01.02_F01 MODERNIZACIÓN DE LA FACULTAD", fm).tipo === "proceso");
  chequear("FO: un código de dos niveles sin hijos es producto",
    M.clasificarFila_("PM.02.01_F05 ARTÍCULOS CIENTÍFICOS PUBLICADOS.", padreEntre(["PM.02", "PM.02.01"])).tipo === "producto");
  chequear("un código de un solo nivel sin hijos no es producto",
    M.clasificarFila_("PS.11_F03 ALGO NO CATALOGADO", padreEntre(["PS.11"])).tipo === "proceso");
  chequear("un código de Nivel 0 sin hijos se clasifica como nivel0",
    M.clasificarFila_("PS.08_F03 GESTIÓN DE ACTIVIDADES PRODUCTIVAS", padreEntre(["PS.08"])).tipo === "nivel0");
});

bloque("Nivel 0 por código embebido o denominación (contra observaciones de cobertura)", function () {
  const fo = M.clasificarFila_("PM.03.19_F05 PS.01 GESTIÓN DE ADMISIÓN Y MATRÍCULA", padreEntre(["PM.03", "PM.03.19"]));
  chequear("FO: reconoce PS.01 pese al código PM.03.19", fo.tipo === "nivel0" && fo.nivel0.codigo === "PS.01");
  chequear("FO: declara la codificación errónea",
    fo.observaciones.some(function (o) { return /CODIFICACIÓN ERRÓNEA/.test(o); }));

  const ffb = M.clasificarFila_("PE.01.03.06_F04 PE.02_04 GESTIÓN DE LA CALIDAD Y MEJORA CONTINUA",
    padreEntre(["PE.01", "PE.01.03", "PE.01.03.06"]));
  chequear("FFB: reconoce PE.02", ffb.tipo === "nivel0" && ffb.nivel0.codigo === "PE.02");

  const fqiq = M.clasificarFila_("PM.01.04.07_F07 PM.02.F07 GESTIÓN DE LA INVESTIGACIÓN",
    padreEntre(["PM.01", "PM.01.04", "PM.01.04.07"]));
  chequear("FQIQ: reconoce PM.02 con sufijo .F07", fqiq.tipo === "nivel0" && fqiq.nivel0.codigo === "PM.02");

  const fe = M.clasificarFila_("PS.09_F06 Gestión de Comunicación", padreEntre(["PS.09"]));
  chequear("FE: la denominación manda sobre el código", fe.tipo === "nivel0" && fe.nivel0.codigo === "PS.10");
  chequear("FE: reporta la discrepancia código/denominación",
    fe.observaciones.some(function (o) { return /Discrepancia entre código y denominación/.test(o); }));

  chequear("acepta el sufijo _04 sin la F",
    M.extraerCodigos_("PE.02_04 GESTIÓN").length === 1);
  chequear("la denominación sale limpia de códigos",
    M.denominacionDe_("PM.03.19_F05 PS.01 GESTIÓN DE ADMISIÓN Y MATRÍCULA",
      M.extraerCodigos_("PM.03.19_F05 PS.01 GESTIÓN DE ADMISIÓN Y MATRÍCULA")) === "GESTIÓN DE ADMISIÓN Y MATRÍCULA");
});

bloque("Denominación de proceso en MAYÚSCULAS (regla pedida por el revisor)", function () {
  const minuscula = M.clasificarFila_("PS.09_F06 Gestión de Comunicación", padreEntre(["PS.09"]));
  chequear("detecta la denominación en minúsculas",
    minuscula.observaciones.some(function (o) { return /MAYÚSCULAS/.test(o); }));

  const correcta = M.clasificarFila_("PE.01_F05 GESTIÓN ESTRATÉGICA", padreEntre(["PE.01"]));
  chequear("no marca las que ya están bien",
    !correcta.observaciones.some(function (o) { return /MAYÚSCULAS/.test(o); }));

  const subproceso = M.clasificarFila_("PE.02.01_F05 Aseguramiento de la Calidad",
    padreEntre(["PE.02.01", "PE.02.01.01"]));
  chequear("también aplica a los subprocesos",
    subproceso.tipo === "proceso" && subproceso.observaciones.some(function (o) { return /MAYÚSCULAS/.test(o); }));
});

bloque("Preservación de las columnas del revisor", function () {
  const hojaSimulada = function (valores) {
    return {
      getLastRow: function () { return valores.length; },
      getLastColumn: function () { return valores[0].length; },
      getRange: function (r, c, nr, nc) {
        return { getValues: function () {
          return valores.slice(r - 1, r - 1 + nr).map(function (f) { return f.slice(c - 1, c - 1 + nc); });
        } };
      }
    };
  };

  const encabezados = ["FACULTAD", "CÓDIGO", "PROCESO NIVEL 0", "EXIGENCIA", "ESTADO", "OBSERVACIÓN"];
  const clave = function (f) { return f[0] + "␟" + f[1]; };

  const previas = [
    encabezados.concat(["CONTRA OBSERVACIÓN"]),
    ["FFB", "PE.02", "GESTIÓN DE LA CALIDAD", "Obligatorio", "FALTANTE", "obs", "Sí tiene la denominación"],
    ["FO", "PS.01", "GESTIÓN DE ADMISIÓN", "Obligatorio", "FALTANTE", "obs", ""]
  ];
  const rescate = M.rescatarColumnasManuales_(hojaSimulada(previas), encabezados, clave);

  chequear("detecta la columna añadida a mano",
    rescate.encabezados.length === 1 && rescate.encabezados[0] === "CONTRA OBSERVACIÓN");
  chequear("recupera el texto del revisor", rescate.porClave["FFB␟PE.02"][0] === "Sí tiene la denominación");
  chequear("ignora las filas sin contra observación", rescate.porClave["FO␟PS.01"] === undefined);

  const sinExtras = M.rescatarColumnasManuales_(
    hojaSimulada([encabezados, ["FFB", "PE.02", "a", "b", "c", "d"]]), encabezados, clave);
  chequear("sin columnas extra no rescata nada", sinExtras.encabezados.length === 0);

  chequear("una hoja inexistente no rompe el rescate",
    M.rescatarColumnasManuales_(null, encabezados, clave).encabezados.length === 0);
});


bloque("Codificación errónea con el código correcto en la misma celda", function () {
  const fo = M.clasificarFila_("PM.03.173_F05 PS.08 GESTIÓN DE ACTIVIDADES PRODUCTIVAS",
    padreEntre(["PM.03", "PM.03.173"]), "F05");

  chequear("reconoce PS.08", fo.tipo === "nivel0" && fo.nivel0.codigo === "PS.08");

  const obs = fo.observaciones.join(" ");
  chequear("declara la codificación errónea", /CODIFICACIÓN ERRÓNEA/.test(obs));
  chequear("nombra el código que sobra", /PM\.03\.173_F05/.test(obs));
  chequear("nombra el código que debe quedar", /PS\.08_F05/.test(obs));
  chequear("marca fallado el criterio de código único", fo.checks.unico === false);

  const ps10 = M.clasificarFila_("PM.03.180_F05 PS.10 GESTIÓN DE LA COMUNICACIÓN",
    padreEntre(["PM.03", "PM.03.180"]), "F05");
  chequear("el mismo diagnóstico aplica a PS.10",
    ps10.nivel0.codigo === "PS.10" && /CODIFICACIÓN ERRÓNEA/.test(ps10.observaciones.join(" ")));

  const corregido = M.clasificarFila_("PS.10_F05 GESTIÓN DE LA COMUNICACIÓN", padreEntre(["PS.10"]), "F05");
  chequear("una vez corregido el código, no hay observación",
    corregido.tipo === "nivel0" && corregido.nivel0.codigo === "PS.10" && corregido.observaciones.length === 0);
});

bloque("Sufijo de formulario consistente en la pestaña", function () {
  chequear("extrae el sufijo con guion bajo", M.sufijoDe_("PS.10_F04") === "F04");
  chequear("extrae el sufijo con punto", M.sufijoDe_("PM.02.F07") === "F07");
  chequear("acepta el sufijo sin la F tras guion bajo", M.sufijoDe_("PE.02_04") === "F04");
  chequear("no confunde el último grupo del código con un sufijo", M.sufijoDe_("PM.03.173") === null);
  chequear("sin sufijo devuelve null", M.sufijoDe_("PS.10") === null);

  const ajeno = M.clasificarFila_("PS.10_F04 GESTIÓN DE LA COMUNICACIÓN", padreEntre(["PS.10"]), "F05");
  chequear("detecta el sufijo que no corresponde a la hoja", ajeno.checks.sufijo === false);
  chequear("y lo explica", /Sufijo de formulario incorrecto/.test(ajeno.observaciones.join(" ")));

  const propio = M.clasificarFila_("PS.10_F05 GESTIÓN DE LA COMUNICACIÓN", padreEntre(["PS.10"]), "F05");
  chequear("no marca el sufijo correcto", propio.checks.sufijo === true);

  const sinEsperado = M.clasificarFila_("PS.10_F04 GESTIÓN DE LA COMUNICACIÓN", padreEntre(["PS.10"]), null);
  chequear("sin sufijo dominante no inventa observaciones", sinEsperado.checks.sufijo === true);
});

bloque("Puntuación de las filas de proceso", function () {
  chequear("son 5 criterios", M.TOTAL_CRITERIOS_PROCESO === 5 && M.CRITERIOS_PROCESO.length === 5);

  const todoBien = { unico: true, coherente: true, sufijo: true, mayusculas: true };
  chequear("todo correcto y registrado puntúa 5", M.puntuarProceso_(todoBien, true) === 5);
  chequear("no registrado pierde un punto", M.puntuarProceso_(todoBien, false) === 4);
  chequear("dos fallos restan dos puntos",
    M.puntuarProceso_({ unico: false, coherente: true, sufijo: false, mayusculas: true }, true) === 3);

  const cls = M.clasificarFila_("PS.09_F04 Gestión de Recursos Bibliográficos", padreEntre(["PS.09"]), "F05");
  const fila = M.filaDeProceso_("FO", "PS.09", "GESTIÓN DE RECURSOS BIBLIOGRÁFICOS", "Nivel 0", "Obligatorio", 292, cls);
  chequear("una fila con dos fallos sale OBSERVADO", fila[6] === "OBSERVADO");
  chequear("y muestra el detalle puntuado", fila[8] === "3/5");
  chequear("con el porcentaje correspondiente", fila[7] === "60%");
  chequear("y las observaciones en la misma fila",
    /Sufijo de formulario/.test(fila[9]) && /MAYÚSCULAS/.test(fila[9]));
});

bloque("Rescate de columnas tras el cambio de formato de la hoja", function () {
  const hojaSimulada = function (valores) {
    return {
      getLastRow: function () { return valores.length; },
      getLastColumn: function () { return valores[0].length; },
      getRange: function (r, c, nr, nc) {
        return { getValues: function () {
          return valores.slice(r - 1, r - 1 + nr).map(function (f) { return f.slice(c - 1, c - 1 + nc); });
        } };
      }
    };
  };

  // Hoja COBERTURA_PROCESOS_A1 de la v4: 6 columnas generadas + la del revisor.
  const previaV4 = [
    ["FACULTAD", "CÓDIGO", "PROCESO NIVEL 0", "EXIGENCIA", "ESTADO", "OBSERVACIÓN", "CONTRA OBSERVACIÓN"],
    ["FO", "PS.09", "GESTIÓN DE RECURSOS BIBLIOGRÁFICOS", "Obligatorio", "FALTANTE", "obs", "Corregido en B292"],
    ["FO", "PS.10", "GESTIÓN DE LA COMUNICACIÓN", "Obligatorio", "FALTANTE", "obs", "Corregido en B324"]
  ];
  // La hoja nueva tiene 10 columnas generadas: más que la previa.
  const encabezadosV5 = ["FACULTAD", "CÓDIGO", "PROCESO", "NIVEL", "EXIGENCIA", "FILA",
                         "ESTADO", "CUMPLIMIENTO", "CRITERIOS", "OBSERVACIONES Y CORRECCIONES"];
  const clave = function (f) { return f[0] + "␟" + M.normalizarCodigo_(f[1]); };

  const rescate = M.rescatarColumnasManuales_(hojaSimulada(previaV4), encabezadosV5, clave);

  chequear("rescata aunque la hoja previa sea más angosta que la nueva",
    rescate.encabezados.length === 1 && rescate.encabezados[0] === "CONTRA OBSERVACIÓN");
  chequear("conserva la contra observación de PS.09", rescate.porClave["FO␟PS.09"][0] === "Corregido en B292");
  chequear("conserva la contra observación de PS.10", rescate.porClave["FO␟PS.10"][0] === "Corregido en B324");
  chequear("no confunde PROCESO NIVEL 0 ni OBSERVACIÓN con columnas del revisor",
    rescate.encabezados.indexOf("PROCESO NIVEL 0") === -1 && rescate.encabezados.indexOf("OBSERVACIÓN") === -1);
});



bloque("El formulario oficial manda sobre el uso de la pestaña", function () {
  const fo = M.CONFIG_A1.FACULTADES.find(function (f) { return f.sigla === "FO"; });

  const ajeno = M.clasificarFila_("PS.10_F04 GESTIÓN DE LA COMUNICACIÓN",
    padreEntre(["PS.10"]), fo.formulario);
  chequear("_F04 en una hoja de la FO se marca", ajeno.checks.sufijo === false);
  chequear("y el mensaje nombra el que usa el resto de la pestaña",
    /resto de la pestaña usa "_F05"/.test(ajeno.observaciones.join(" ")));

  const propio = M.clasificarFila_("PS.10_F05 GESTIÓN DE LA COMUNICACIÓN",
    padreEntre(["PS.10"]), fo.formulario);
  chequear("_F05 no se marca", propio.checks.sufijo === true);

  // Pestañas cuyo uso observado no coincide con el formulario oficial.
  const desfase = { FCF: "F02", FCCSS: "F02", FIGMMG: "F06", FII: "F17",
                    FPSIC: "F18", FIEE: "F17", FISI: "F02" };
  Object.keys(desfase).forEach(function (sigla) {
    const f = M.CONFIG_A1.FACULTADES.find(function (x) { return x.sigla === sigla; });
    chequear(sigla + ": el uso observado (" + desfase[sigla] + ") difiere del oficial (" + f.formulario + ")",
      f.formulario !== desfase[sigla]);
  });
});

bloque("Los nombres oficiales no rompen la localización de pestañas", function () {
  const titulos = [
    ["Facultad de Ingeniería Eléctrica Electrónica", "FIEE"],
    ["FACULTAD DE INGENIERÍA ELECTRÓNICA Y ELÉCTRICA", "FIEE"],
    ["FACULTAD DE INGENIERÍA DE SISTEMAS E INFORMÁTICA", "FISI"],
    ["FACULTAD DE INGENIERÍA INDUSTRIAL", "FII"],
    ["FACULTAD DE PSICOLOGÍA", "FPSIC"],
    ["FACULTAD DE CIENCIAS FÍSICAS", "FCF"],
    ["FACULTAD DE CIENCIAS SOCIALES", "FCCSS"],
    ["FACULTAD DE INGENIERÍA GEOLÓGICA, MINERA, METALÚRGICA Y GEOGRÁFICA", "FIGMMG"],
    ["FACULTAD DE MEDICINA", "FM"],
    ["FACULTAD DE MEDICINA VETERINARIA", "FMV"]
  ];
  titulos.forEach(function (par) {
    const f = M.facultadDeLaHoja_(par[0]);
    chequear(par[0].slice(0, 46) + " → " + par[1], f !== null && f.sigla === par[1]);
  });

  const siglas = M.CONFIG_A1.FACULTADES.map(function (f) {
    return M.facultadDeLaHoja_(f.nombre) ? M.facultadDeLaHoja_(f.nombre).sigla : null;
  });
  chequear("cada nombre oficial resuelve a su propia facultad",
    siglas.join(",") === M.CONFIG_A1.FACULTADES.map(function (f) { return f.sigla; }).join(","));
});



bloque("La pestaña titulada con el nombre oficial también resuelve", function () {
  M.CONFIG_A1.FACULTADES.forEach(function (f) {
    const hallada = M.facultadDeLaHoja_(f.nombre);
    chequear(f.nombre.slice(0, 40) + " → " + f.sigla, hallada !== null && hallada.sigla === f.sigla);
  });
  chequear("la FIEE resuelve con el orden invertido del título real",
    M.facultadDeLaHoja_("Facultad de Ingeniería Eléctrica Electrónica").sigla === "FIEE");
});


bloque("Formularios oficiales por facultad", function () {
  const F = function (sigla) {
    return M.CONFIG_A1.FACULTADES.find(function (f) { return f.sigla === sigla; });
  };

  chequear("son 20 facultades", M.CONFIG_A1.FACULTADES.length === 20);

  const oficiales = {
    FM: "F01", FDCP: "F02", FLCH: "F03", FFB: "F04", FO: "F05", FE: "F06",
    FQIQ: "F07", FMV: "F08", FCA: "F09", FCB: "F10", FCC: "F11", FCE: "F12",
    FCF: "F13", FCM: "F14", FCCSS: "F15", FIGMMG: "F16", FII: "F20",
    FPSIC: "F17", FIEE: "F18", FISI: "F19"
  };
  Object.keys(oficiales).forEach(function (sigla) {
    chequear(sigla + " = " + oficiales[sigla], F(sigla).formulario === oficiales[sigla]);
  });

  chequear("los 20 formularios están declarados",
    M.CONFIG_A1.FACULTADES.every(function (f) { return !!f.formulario; }));
  chequear("la numeración no es posicional: FII lleva F20",
    F("FII").formulario === "F20" && M.CONFIG_A1.FACULTADES.indexOf(F("FII")) === 16);

  chequear("los 20 formularios son distintos",
    new Set(M.CONFIG_A1.FACULTADES.map(function (f) { return f.formulario; })).size === 20);
  chequear("cubren F01..F20 sin huecos", (function () {
    const n = M.CONFIG_A1.FACULTADES.map(function (f) { return parseInt(f.formulario.slice(1), 10); })
      .sort(function (a, b) { return a - b; });
    return n.every(function (v, i) { return v === i + 1; });
  })());

  chequear("los nombres oficiales están en mayúsculas",
    M.CONFIG_A1.FACULTADES.every(function (f) { return f.nombre === f.nombre.toUpperCase(); }));
  chequear("FIEE lleva el nombre oficial",
    F("FIEE").nombre === "FACULTAD DE INGENIERÍA ELECTRÓNICA Y ELÉCTRICA");
  chequear("FCA lleva el nombre oficial en plural",
    F("FCA").nombre === "FACULTAD DE CIENCIAS ADMINISTRATIVAS");

  // El título de la pestaña no coincide con el nombre oficial en varias hojas.
  chequear("FIEE se localiza pese al orden invertido del título",
    M.facultadDeLaHoja_("Facultad de Ingeniería Eléctrica Electrónica").sigla === "FIEE");
  chequear("FIEE también con el nombre oficial",
    M.facultadDeLaHoja_("FACULTAD DE INGENIERÍA ELECTRÓNICA Y ELÉCTRICA").sigla === "FIEE");
  chequear("FCA se localiza con el título en singular",
    M.facultadDeLaHoja_("Facultad de Ciencias Administrativa").sigla === "FCA");
});

bloque("Celda FORMULARIO del resumen", function () {
  const fo = { sigla: "FO", formulario: "F05" };
  chequear("coincidencia: solo el oficial", M.celdaFormulario_(fo, "F05") === "F05");
  chequear("discrepancia: señala el que usa la hoja",
    M.celdaFormulario_(fo, "F02") === "F05 (la hoja usa F02)");

  const sinDeclarar = { sigla: "FISI", formulario: null };
  chequear("sin declarar: muestra el dominante",
    M.celdaFormulario_(sinDeclarar, "F02") === "F02 (oficial sin declarar)");
  chequear("sin declarar y sin códigos", M.celdaFormulario_(sinDeclarar, null) === "— (oficial sin declarar)");
});

bloque("Hoja mal numerada: hallazgo de hoja, no de fila", function () {
  // La FII usa _F17 en toda la pestaña y su formulario oficial es _F20.
  // Ninguna fila debe salir observada por el sufijo: el defecto es de la hoja.
  const fila = M.clasificarFila_("PM.01_F17 GESTIÓN DE LA FORMACIÓN ACADÉMICA",
    padreEntre(["PM.01"]), "F17", "F20");
  chequear("la fila no se marca por el sufijo", fila.checks.sufijo === true);
  chequear("ni genera observación de sufijo",
    !fila.observaciones.some(function (o) { return /Sufijo de formulario/.test(o); }));

  // Una fila suelta que se aparta del dominante sí se marca.
  const suelta = M.clasificarFila_("PS.10_F04 GESTIÓN DE LA COMUNICACIÓN",
    padreEntre(["PS.10"]), "F05", "F05");
  chequear("la fila suelta sí se marca", suelta.checks.sufijo === false);

  // El código sugerido usa el formulario OFICIAL, no el dominante equivocado.
  const erronea = M.clasificarFila_("PM.03.173_F17 PS.08 GESTIÓN DE ACTIVIDADES PRODUCTIVAS",
    padreEntre(["PM.03", "PM.03.173"]), "F17", "F20");
  chequear("la corrección sugerida usa el formulario oficial",
    /PS\.08_F20/.test(erronea.observaciones.join(" ")));
});

bloque("Coherencia entre encabezados y filas del dashboard", function () {
  // Un desajuste entre encabezados y celdas desplaza las columnas del revisor.
  // Se cuentan los elementos de cada literal respetando comillas y paréntesis.
  const fuente = require("fs").readFileSync(FUENTE, "utf8");

  function contarElementos(literal) {
    let nivel = 0, comillas = null, n = 1;
    for (let i = 0; i < literal.length; i++) {
      const c = literal[i];
      if (comillas) {
        if (c === "\\") i++;
        else if (c === comillas) comillas = null;
      } else if (c === '"' || c === "'") comillas = c;
      else if (c === "(" || c === "[") nivel++;
      else if (c === ")" || c === "]") nivel--;
      else if (c === "," && nivel === 0) n++;
    }
    return n;
  }

  function literalTras(marca) {
    const i = fuente.indexOf(marca);
    if (i === -1) return null;
    const ini = fuente.indexOf("[", i);
    let nivel = 0;
    for (let j = ini; j < fuente.length; j++) {
      if (fuente[j] === "[") nivel++;
      else if (fuente[j] === "]") { nivel--; if (!nivel) return fuente.slice(ini + 1, j); }
    }
    return null;
  }

  const enc = literalTras('volcarHoja_(ss, "RESUMEN_EJECUTIVO_A1"');
  chequear("se encuentran los encabezados del resumen", enc !== null);
  const nEnc = contarElementos(enc);
  chequear("el resumen declara 18 columnas", nEnc === 18);

  const construcciones = [];
  let desde = 0;
  while (true) {
    const i = fuente.indexOf("resumenFila", desde);
    if (i === -1) break;
    desde = i + 1;
    if (fuente.slice(i - 20, i).indexOf("r.") !== -1) continue;
    const ini = fuente.indexOf("[", i);
    if (ini === -1 || ini - i > 40) continue;
    let nivel = 0;
    for (let j = ini; j < fuente.length; j++) {
      if (fuente[j] === "[") nivel++;
      else if (fuente[j] === "]") { nivel--; if (!nivel) { construcciones.push(fuente.slice(ini + 1, j)); break; } }
    }
  }
  const pushResumen = literalTras("resumen.push(");
  if (pushResumen) construcciones.push(pushResumen);

  chequear("se localizan las tres construcciones de fila", construcciones.length === 3);
  construcciones.forEach(function (c, i) {
    const n = contarElementos(c);
    chequear("la fila de resumen #" + (i + 1) + " tiene " + nEnc + " celdas (tiene " + n + ")", n === nEnc);
  });
});


bloque("Vocabulario único CONFORME / OBSERVADO", function () {
  chequear("estadoGeneral_ al 100 % es CONFORME, no COMPLETO", M.estadoGeneral_(100) === "CONFORME");
  chequear("75 % es AVANZADO", M.estadoGeneral_(75) === "AVANZADO");
  chequear("40 % es EN DESARROLLO", M.estadoGeneral_(40) === "EN DESARROLLO");
  chequear("39 % es CRÍTICO", M.estadoGeneral_(39) === "CRÍTICO");

  const fuente = require("fs").readFileSync(FUENTE, "utf8");
  const cuerpo = fuente.replace(/VALORES_NULOS:[\s\S]*?\],/, "");
  ["COMPLETO", "PARCIAL", "PENDIENTE"].forEach(function (t) {
    chequear("ya no se usa el estado " + t, cuerpo.indexOf('"' + t + '"') === -1);
  });
  chequear("los colores cubren CONFORME y OBSERVADO",
    /"CONFORME":/.test(fuente) && /"OBSERVADO":/.test(fuente));
});

bloque("Avance sobre criterios cumplidos", function () {
  chequear("todo cumplido es 100 %", M.avanceSobreCriterios_([8, 8, 8], 8) === 100);
  chequear("nada cumplido es 0 %", M.avanceSobreCriterios_([0, 0], 8) === 0);
  chequear("mitad de criterios es 50 %", M.avanceSobreCriterios_([4, 4], 8) === 50);
  chequear("sin filas devuelve 0", M.avanceSobreCriterios_([], 8) === 0);

  // Lo que la ponderación por estado no distinguía: a un producto le falta un
  // criterio y el otro está vacío. Ambos eran "observados"; ahora pesan distinto.
  const casiCompleto = M.avanceSobreCriterios_([7], 8);
  const vacio = M.avanceSobreCriterios_([1], 8);
  chequear("un producto casi completo pesa mucho más que uno vacío",
    casiCompleto === 88 && vacio === 13);

  chequear("los procesos se miden sobre 5 criterios",
    M.avanceSobreCriterios_([5, 5], M.TOTAL_CRITERIOS_PROCESO) === 100 &&
    M.avanceSobreCriterios_([3], M.TOTAL_CRITERIOS_PROCESO) === 60);
});



bloque("Prefijo de las observaciones (contra observación de la FFB)", function () {
  const muestras = [
    M.validarAccionEstrategica_("").obs,
    M.validarAccionEstrategica_("AEI.04.03 x").obs,
    M.validarActividadOperativa_("").obs,
    M.validarTipoProducto_("").obs,
    M.validarListaCerrada_("", M.CONFIG_A1.TIPOS_ENTREGABLE, "Columna F", "Clasificación").obs,
    M.validarListaAbierta_("", M.CONFIG_A1.VARIABLES_CALIDAD, "Columna H", "Variables").obs,
    M.clasificarFila_("PS.10_F04 GESTIÓN DE LA COMUNICACIÓN", function () { return false; }, "F05")
      .observaciones.join(" ")
  ];

  muestras.forEach(function (o, i) {
    chequear("la observación #" + (i + 1) + " usa \"Columna X -->\"", /Columna [A-I] -->/.test(o));
    chequear("la observación #" + (i + 1) + " ya no usa \"Col X —\"", !/\bCol [A-I] —/.test(o));
  });

  const fuente = require("fs").readFileSync(FUENTE, "utf8");
  const cuerpo = fuente.slice(fuente.indexOf("const CONFIG_A1"));
  chequear("no queda ningún \"Col X —\" en el código", !/'Col [A-I] — /.test(cuerpo));
  chequear("las etiquetas de columna son \"Columna X\"",
    /"Columna F"/.test(cuerpo) && /"Columna I"/.test(cuerpo));
});

bloque("Resumen ejecutivo: columnas pedidas por el revisor", function () {
  const fuente = require("fs").readFileSync(FUENTE, "utf8");
  const i = fuente.indexOf('volcarHoja_(ss, "RESUMEN_EJECUTIVO_A1"');
  const ini = fuente.indexOf("[", i);
  let nivel = 0, fin = ini;
  for (let j = ini; j < fuente.length; j++) {
    if (fuente[j] === "[") nivel++;
    else if (fuente[j] === "]") { nivel--; if (!nivel) { fin = j; break; } }
  }
  const cab = fuente.slice(ini, fin + 1);

  [
    "FACULTAD", "NOMBRE", "TOTAL PRODUCTOS", "PRODUCTOS CONFORMES", "PRODUCTOS OBSERVADOS",
    "PRODUCTOS SIN REGISTRO", "TOTAL PROCESOS",
    "PROCESOS NIVEL 0 CONFORMES", "PROCESOS NIVEL 0 OBSERVADOS",
    "SUBPROCESOS CONFORMES", "SUBPROCESOS OBSERVADOS", "CÓDIGO DE LA HOJA"
  ].forEach(function (e) {
    chequear("declara " + e, cab.indexOf('"' + e + '"') !== -1);
  });

  const veces = function (t) { return (cab.match(new RegExp('"' + t + '"', "g")) || []).length; };
  chequear("AVANCE aparece dos veces", veces("AVANCE") === 2);
  chequear("ESTADO GENERAL aparece dos veces", veces("ESTADO GENERAL") === 2);
  chequear("DIAGNÓSTICO aparece dos veces", veces("DIAGNÓSTICO") === 2);
  chequear("SUBPROCESOS CONFORMES aparece una sola vez", veces("SUBPROCESOS CONFORMES") === 1);
  chequear("ya no se llama FORMULARIO", cab.indexOf('"FORMULARIO"') === -1);
  chequear("la contraobservación no se genera: la repone el rescate",
    cab.indexOf("OBSERVACIÓN") === -1 || cab.indexOf("CONTRA") === -1);

  // Los nuevos encabezados deben estar en el histórico, o el rescate los tomaría
  // por columnas del revisor y los duplicaría en cada corrida.
  ["PRODUCTOS SIN REGISTRO", "PROCESOS NIVEL 0 CONFORMES", "SUBPROCESOS OBSERVADOS",
   "CÓDIGO DE LA HOJA"].forEach(function (e) {
    chequear(e + " está en ENCABEZADOS_HISTORICOS",
      M.CONFIG_A1.ENCABEZADOS_HISTORICOS.indexOf(e) !== -1);
  });
});


bloque("Catalogaciones y procesos mal codificados (contra observaciones del detallado)", function () {
  // Las 13 filas que el revisor marcó en DETALLADO_PRODUCTOS_A1, con la lista de
  // códigos que existe en su pestaña para poder resolver la relación padre-hijo.
  const casos = [
    [397,  "PE.02.01.05_F04 PE.02.01_04 ASEGURAMIENTO DE LA CALIDAD", "proceso",
     ["PE.02.01", "PE.02.01.01", "PE.02.01.05"]],
    [470,  "PM.03.04.04_F04 PROCESOS DE SOPORTE", "categoria", []],
    [630,  "PS.10.02_F04 PROCESO DE ARTICULACIÓN Y DIFUSIÓN INFORMATIVA", "proceso", ["PS.10.02"]],
    [633,  "PS.10.03_F04 PROCESO DE COBERTURA Y SOPORTE PROTOCOLAR", "proceso", ["PS.10.03"]],
    [666,  "PE.03.02.05_F05 PROCESOS MISIONALES", "categoria", []],
    [712,  "PM.03.18_F05 PROCESOS DE SOPORTE", "categoria", []],
    [928,  "F06 PROCESOS MISIONALES", "categoria", []],
    [942,  "PM.03.05_F06 PROCESOS DE SOPORTE", "categoria", []],
    [1087, "PM.03.03.04_F07 PROCESOS DE SOPORTE", "categoria", []],
    [1224, "PROCESO MISIONAL", "categoria", []],
    [1244, "PROCESO DE SOPORTE", "categoria", []],
    [2327, "PE.03.02.07_F17 PROCESOS MISIONALES", "categoria", []],
    [1420, "PE.02.01.01_F10 PE.02.01.01 — MANTENIMIENTO DEL SISTEMA DE GESTIÓN DE CALIDAD",
     "producto", ["PE.02.01", "PE.02.01.01"]]
  ];

  casos.forEach(function (c) {
    const r = M.clasificarFila_(c[1], padreEntre(c[3]), "F04", "F04");
    chequear("fila " + c[0] + " se clasifica como " + c[2] + " (sale " + r.tipo + ")", r.tipo === c[2]);
  });

  // Una catalogación con código debe pedir que se retire.
  const conCodigo = M.clasificarFila_("PM.03.04.04_F04 PROCESOS DE SOPORTE", padreEntre([]), "F04", "F04");
  chequear("la catalogación con código lo reporta",
    /NO LE CORRESPONDE UNA CODIFICACIÓN/.test(conCodigo.observaciones.join(" ")));
  chequear("y nombra el código que sobra", /PM\.03\.04\.04_F04/.test(conCodigo.observaciones.join(" ")));
  chequear("marca fallado el criterio de código", conCodigo.checks.unico === false);

  // Sin código no hay nada que corregir.
  const sinCodigo = M.clasificarFila_("PROCESO DE SOPORTE", padreEntre([]), "F04", "F04");
  chequear("la catalogación sin código no se observa", sinCodigo.observaciones.length === 0);

  // El número de formulario suelto también es una codificación que no toca.
  const sueltoF = M.clasificarFila_("F06 PROCESOS MISIONALES", padreEntre([]), "F06", "F06");
  chequear("el F## suelto se reporta",
    /NO LE CORRESPONDE UNA CODIFICACIÓN/.test(sueltoF.observaciones.join(" ")));

  // Un proceso codificado como producto pide corregir la codificación.
  const malCod = M.clasificarFila_("PS.10.03_F04 PROCESO DE COBERTURA Y SOPORTE PROTOCOLAR",
    padreEntre(["PS.10.03"]), "F04", "F04");
  chequear("el proceso mal codificado lo dice",
    /CODIFICACIÓN A CORREGIR/.test(malCod.observaciones.join(" ")));
});

bloque("Singular y plural en las catalogaciones", function () {
  ["PROCESOS ESTRATÉGICOS", "PROCESOS MISIONALES", "PROCESOS DE SOPORTE",
   "PROCESO MISIONAL", "PROCESO DE SOPORTE", "PROCESO ESTRATÉGICO"
  ].forEach(function (t) {
    chequear("reconoce la catalogación " + JSON.stringify(t), M.esCatalogacion_(t));
  });

  ["PLAN ESTRATÉGICO APROBADO", "GESTIÓN DE LA INVESTIGACIÓN",
   "PROCESOS DE ADQUISICIÓN TRAMITADOS", "PROCESO DE COBERTURA Y SOPORTE PROTOCOLAR"
  ].forEach(function (t) {
    chequear("no confunde " + JSON.stringify(t), !M.esCatalogacion_(t));
  });

  chequear("PROCESO DE ... en singular nombra un proceso",
    M.abrePorProceso_("PROCESO DE COBERTURA Y SOPORTE PROTOCOLAR"));
  chequear("SUBPROCESO ... nombra un proceso", M.abrePorProceso_("SUBPROCESO DE ALGO"));

  // El plural describe entregables: "PROCESOS DE ADQUISICIÓN TRAMITADOS" es un
  // producto real de la FO y no debe irse a la hoja de procesos.
  chequear("el plural NO nombra un proceso",
    !M.abrePorProceso_("PROCESOS DE ADQUISICIÓN TRAMITADOS"));
  chequear("una denominación normal tampoco",
    !M.abrePorProceso_("PLAN ESTRATÉGICO APROBADO"));
});

bloque("Cierre de los productos sin registro", function () {
  const fuente = require("fs").readFileSync(FUENTE, "utf8");
  chequear("se añade la recomendación de los desplegables",
    /Observación final --> Para las columnas C a I utilice los desplegables/.test(fuente));
  chequear("ya no encabeza con PRODUCTO SIN REGISTRAR",
    fuente.indexOf("PRODUCTO SIN REGISTRAR:") === -1);
});


bloque("Una observación por renglón", function () {
  chequear("el separador es un salto de línea", M.SEPARADOR_OBS === "\n");
  chequear("ya no se encadena con ||",
    require("fs").readFileSync(FUENTE, "utf8").indexOf('join("  ||  ")') === -1);

  chequear("sin observaciones devuelve el texto de relleno",
    M.unirObservaciones_([], "Cumple los 8 criterios.") === "Cumple los 8 criterios.");
  chequear("una sola observación no lleva salto",
    M.unirObservaciones_(["Columna C --> algo"], "x").indexOf("\n") === -1);
  chequear("dos observaciones van en dos renglones",
    M.unirObservaciones_(["a", "b"], "x").split("\n").length === 2);

  // El caso que señaló el revisor: FCB, fila 57 del Anexo 1, sin nada en C a I
  // y con dos códigos en la columna B.
  const colB = "PE.03.01.05_F10 PE.03.01.03 — REVISIÓN OCRI/OGAL Y EMISIÓN DE RR";
  const cls = M.clasificarFila_(colB, padreEntre(["PE.03.01", "PE.03.01.03", "PE.03.01.05"]), "F10", "F10");
  chequear("la fila sigue siendo un producto", cls.tipo === "producto");

  const checks = [
    M.validarCodigo_(cls),
    M.validarTipoProducto_(""),
    M.validarAccionEstrategica_(""),
    M.validarActividadOperativa_(""),
    M.validarListaCerrada_("", M.CONFIG_A1.TIPOS_ENTREGABLE, "Columna F", "Clasificación"),
    M.validarListaCerrada_("", M.CONFIG_A1.ROLES_INSTITUCIONALES, "Columna G", "Atributo institucional"),
    M.validarListaAbierta_("", M.CONFIG_A1.VARIABLES_CALIDAD, "Columna H", "Variables de calidad"),
    M.validarListaAbierta_("", M.CONFIG_A1.CRITERIOS_IMPACTO, "Columna I", "Criterios de validación")
  ];
  const obs = cls.observaciones.concat(
    checks.filter(function (c) { return !c.ok; }).map(function (c) { return c.obs; }));
  obs.push("Observación final --> Para las columnas C a I utilice los desplegables de la hoja.");

  const celda = M.unirObservaciones_(obs, "");
  const renglones = celda.split("\n");

  chequear("son nueve renglones", renglones.length === 9);
  chequear("el primero es la columna B", /^Columna B -->/.test(renglones[0]));
  chequear("el último es la observación final", /^Observación final -->/.test(renglones[8]));

  // De la C a la I, en el orden de la hoja.
  ["C", "D", "E", "F", "G", "H", "I"].forEach(function (col, i) {
    chequear("el renglón " + (i + 2) + " es la columna " + col,
      renglones[i + 1].indexOf("Columna " + col + " -->") === 0);
  });

  chequear("ningún renglón conserva el separador viejo", celda.indexOf("||") === -1);
});

bloque("Ajuste de texto en las hojas del dashboard", function () {
  const fuente = require("fs").readFileSync(FUENTE, "utf8");
  // Sin ajuste de texto el salto de línea no se ve, y el resumen lleva sus dos
  // columnas de DIAGNÓSTICO en medio de la tabla, no al final.
  chequear("el ajuste cubre todo el bloque de datos",
    /getRange\(2, 1, filas\.length, nCols\)\s*\.setWrap\(true\)/.test(fuente));
  chequear("las celdas se alinean arriba", /setVerticalAlignment\("top"\)/.test(fuente));
});

/* ────────────────────────────────────────────────────────────────────────── */

console.log("\n" + (fallas === 0
  ? "TODAS LAS PRUEBAS PASAN (" + total + ")"
  : fallas + " FALLAS de " + total));

process.exit(fallas === 0 ? 0 : 1);
