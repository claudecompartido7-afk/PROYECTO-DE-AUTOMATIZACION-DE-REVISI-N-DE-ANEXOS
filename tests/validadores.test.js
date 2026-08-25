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

const FUENTE = path.join(__dirname, "..", "apps-script", "Anexo1_Auditoria_v6.gs");

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
  TOTAL_CRITERIOS_PROCESO
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
  chequear("AO señala la columna correcta", /COLUMNA E/.test(ao));

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


bloque("Catálogo oficial de facultades", function () {
  const oficial = {
    FM: "F01", FDCP: "F02", FLCH: "F03", FFB: "F04", FO: "F05",
    FE: "F06", FQIQ: "F07", FMV: "F08", FCA: "F09", FCB: "F10",
    FCC: "F11", FCE: "F12", FCF: "F13", FCM: "F14", FCCSS: "F15",
    FIGMMG: "F16", FPSIC: "F17", FIEE: "F18", FISI: "F19", FII: "F20"
  };

  chequear("son 20 facultades", M.CONFIG_A1.FACULTADES.length === 20);

  Object.keys(oficial).forEach(function (sigla) {
    const f = M.CONFIG_A1.FACULTADES.find(function (x) { return x.sigla === sigla; });
    chequear(sigla + " existe en el catálogo", !!f);
    if (f) chequear(sigla + " lleva el formulario " + oficial[sigla], f.formulario === oficial[sigla]);
  });

  const formularios = M.CONFIG_A1.FACULTADES.map(function (f) { return f.formulario; });
  chequear("no hay formularios repetidos", new Set(formularios).size === 20);
  chequear("la numeración va de F01 a F20",
    formularios.slice().sort().join(",") === Object.values(oficial).sort().join(","));

  chequear("todas llevan denominación oficial",
    M.CONFIG_A1.FACULTADES.every(function (f) { return /^FACULTAD DE /.test(f.nombre); }));
  chequear("FIEE es Electrónica y Eléctrica",
    M.CONFIG_A1.FACULTADES.find(function (f) { return f.sigla === "FIEE"; }).nombre ===
    "FACULTAD DE INGENIERÍA ELECTRÓNICA Y ELÉCTRICA");
  chequear("FIGMMG lleva su nombre completo",
    /GEOLÓGICA, MINERA, METALÚRGICA Y GEOGRÁFICA/.test(
      M.CONFIG_A1.FACULTADES.find(function (f) { return f.sigla === "FIGMMG"; }).nombre));
});

bloque("El formulario oficial manda sobre el uso de la pestaña", function () {
  const fo = M.CONFIG_A1.FACULTADES.find(function (f) { return f.sigla === "FO"; });

  const ajeno = M.clasificarFila_("PS.10_F04 GESTIÓN DE LA COMUNICACIÓN",
    padreEntre(["PS.10"]), fo.formulario);
  chequear("_F04 en una hoja de la FO se marca", ajeno.checks.sufijo === false);
  chequear("y el mensaje nombra el que corresponde",
    /corresponde "_F05"/.test(ajeno.observaciones.join(" ")));

  const propio = M.clasificarFila_("PS.10_F05 GESTIÓN DE LA COMUNICACIÓN",
    padreEntre(["PS.10"]), fo.formulario);
  chequear("_F05 no se marca", propio.checks.sufijo === true);

  // Las siglas cuyo uso en la hoja no coincide con el formulario oficial.
  const desfase = { FCF: "F02", FCCSS: "F02", FIGMMG: "F06", FPSIC: "F18", FIEE: "F17", FISI: "F02", FII: "F17" };
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


bloque("Catálogo oficial de facultades", function () {
  const F = M.CONFIG_A1.FACULTADES;
  chequear("son 20 facultades", F.length === 20);

  const oficiales = {
    FM: "F01", FDCP: "F02", FLCH: "F03", FFB: "F04", FO: "F05", FE: "F06",
    FQIQ: "F07", FMV: "F08", FCA: "F09", FCB: "F10", FCC: "F11", FCE: "F12",
    FCF: "F13", FCM: "F14", FCCSS: "F15", FIGMMG: "F16", FPSIC: "F17",
    FIEE: "F18", FISI: "F19", FII: "F20"
  };
  Object.keys(oficiales).forEach(function (sigla) {
    const f = F.find(function (x) { return x.sigla === sigla; });
    chequear(sigla + " lleva el formulario " + oficiales[sigla],
      f && f.formulario === oficiales[sigla]);
  });

  chequear("los 20 formularios son distintos",
    new Set(F.map(function (f) { return f.formulario; })).size === 20);
  chequear("todas llevan denominación oficial",
    F.every(function (f) { return /^FACULTAD DE /.test(f.nombre); }));

  chequear("FII es F20 y no F17", F.find(function (f) { return f.sigla === "FII"; }).formulario === "F20");
  chequear("FPSIC es F17 y no F18", F.find(function (f) { return f.sigla === "FPSIC"; }).formulario === "F17");
  chequear("FIEE es F18 y no F19", F.find(function (f) { return f.sigla === "FIEE"; }).formulario === "F18");
  chequear("FISI es F19 y no F20", F.find(function (f) { return f.sigla === "FISI"; }).formulario === "F19");
});

bloque("La pestaña titulada con el nombre oficial también resuelve", function () {
  M.CONFIG_A1.FACULTADES.forEach(function (f) {
    const hallada = M.facultadDeLaHoja_(f.nombre);
    chequear(f.nombre.slice(0, 40) + " → " + f.sigla, hallada !== null && hallada.sigla === f.sigla);
  });
  chequear("la FIEE resuelve con el orden invertido del título real",
    M.facultadDeLaHoja_("Facultad de Ingeniería Eléctrica Electrónica").sigla === "FIEE");
});

/* ────────────────────────────────────────────────────────────────────────── */

console.log("\n" + (fallas === 0
  ? "TODAS LAS PRUEBAS PASAN (" + total + ")"
  : fallas + " FALLAS de " + total));

process.exit(fallas === 0 ? 0 : 1);
