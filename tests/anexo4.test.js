/**
 * Pruebas del auditor del Anexo 4 (INDICADORES ESTANDARIZADOS).
 *
 * Los datos de los fixtures están copiados de la hoja real: la tabla del
 * resumen con su recuento de aprobados arriba y su PROMEDIO TOTAL abajo, y una
 * ficha de indicador con sus etiquetas tal como aparecen.
 *
 *   node tests/anexo4.test.js
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const FUENTE = path.join(__dirname, "..", "apps-script", "Anexo4_Revision_v2.gs");

const SHIM = `
var SpreadsheetApp = { getUi: function () { throw new Error("sin interfaz"); },
                       openById: function () { throw new Error("sin libro"); } };
var Logger = { log: function () {} };
module.exports = {
  CONFIG_A4, normalizarA4_, esVacioA4_, porcentajeA4_, porcentajeDelEstado_,
  esFilaDeCierre_, leerResumenA4_, revisarIndicadorA4_, tipoDeHojaA4_,
  revisarFichaA4_, peorSeveridadA4_, estadoDelAvanceA4_, avanceGeneralAnexo4_
};
`;

function cargarModulo() {
  const destino = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "a4-")), "modulo.js");
  fs.writeFileSync(destino, fs.readFileSync(FUENTE, "utf8") + SHIM);
  return require(destino);
}

const M = cargarModulo();

let total = 0;
let fallas = 0;

function chequear(descripcion, condicion) {
  total++;
  if (!condicion) { fallas++; console.log("  ✗ " + descripcion); }
}

function bloque(titulo, fn) {
  console.log("\n" + titulo);
  const antes = fallas;
  fn();
  console.log(antes === fallas ? "  todo correcto" : "  " + (fallas - antes) + " fallas");
}

/* ── La hoja «Resumen de Indicadores», tal como está ─────────────────────── */

const RESUMEN = [
  ["", "", "", "", "", "", ""],
  ["Total de Indicadores Aprobados:", 7, "", "", "", "", ""],
  ["", "", "", "", "", "", ""],
  ["Reporte de Avance de Indicadores", "", "", "", "", "", ""],
  ["CÓDIGO", "PROCESO", "HOJA", "INDICADOR", "ESTADO ACTUAL", "PORCENTAJE", "OBSERVACIÓN"],
  ["PE.01", "GESTIÓN ESTRATÉGICA", "PE.01 -% Pres. Recursos directamente recaudados",
   "Porcentaje de ejecución presupuestaria de los recursos directamente recaudados (RDR)",
   "Aprobado", "100%", ""],
  ["PE.02", "GESTIÓN DE LA CALIDAD Y MEJORA CONTINUA", "PE.02 - %de cumplimiento de indicadores de CONEAU",
   "Porcentaje de cumplimiento de indicadores del CONEAU", "Aprobado", "100%", ""],
  ["PM2", "GESTIÓN DE INVESTIGACIÓN", "PM2 - GESTIÓN DE INVESTIGACIÓN", "", "Propuesto", "25%", ""],
  ["PS", "GESTIÓN DOCUMENTAL", "PS-GESTIÓN DOCUMENTAL", "", "Propuesto", "25%", ""],
  ["", "", "", "", "PROMEDIO TOTAL:", "62.5%", ""]
];

const HOJAS_DEL_LIBRO = [
  "Resumen de Indicadores",
  "PE.01 -% Pres. Recursos directamente recaudados",
  "PE.02 - %de cumplimiento de indicadores de CONEAU",
  "PM2 - GESTIÓN DE INVESTIGACIÓN",
  "PS-GESTIÓN DOCUMENTAL"
];

const leido = M.leerResumenA4_(RESUMEN);

/* ────────────────────────────────────────────────────────────────────────── */

bloque("Lectura del resumen de indicadores", function () {
  chequear("se ubica la fila de encabezados, que no es la primera",
    leido.filaEncabezado === 4);
  chequear("se leen los cuatro indicadores", leido.indicadores.length === 4);
  chequear("el recuento de aprobados de la hoja", leido.aprobadosDeclarados === 7);
  chequear("y el promedio que la hoja declara", leido.promedioDeclarado === 62.5);
  chequear("la fila PROMEDIO TOTAL no se cuenta como indicador",
    leido.indicadores.every(function (i) { return i.codigo !== ""; }));

  const primero = leido.indicadores[0];
  chequear("el código", primero.codigo === "PE.01");
  chequear("el proceso", primero.proceso.indexOf("ESTRATÉGICA") !== -1);
  chequear("la pestaña", primero.hoja.indexOf("Pres. Recursos") !== -1);
  chequear("el estado", primero.estado === "Aprobado");
  chequear("el porcentaje como número", primero.porcentaje === 100);
  chequear("y la fila real de la hoja", primero.fila === 6);

  const movido = M.leerResumenA4_([
    ["PORCENTAJE", "ESTADO ACTUAL", "HOJA", "INDICADOR", "PROCESO", "CÓDIGO"],
    ["50%", "Propuesto", "HOJA X", "IND X", "PROC X", "PX"]
  ]);
  chequear("las columnas se ubican por su nombre, en cualquier orden",
    movido.indicadores[0].codigo === "PX" && movido.indicadores[0].porcentaje === 50);
  chequear("sin la tabla no se inventan indicadores",
    M.leerResumenA4_([["hola", "mundo"]]).indicadores.length === 0);
});

bloque("Porcentajes y estados", function () {
  chequear("texto con signo", M.porcentajeA4_("100%") === 100);
  chequear("con espacio", M.porcentajeA4_(" 25 % ") === 25);
  chequear("número suelto", M.porcentajeA4_(25) === 25);
  chequear("fracción de celda con formato", M.porcentajeA4_(0.25) === 25);
  chequear("el cero se conserva", M.porcentajeA4_(0) === 0);
  chequear("un vacío no es cero", M.porcentajeA4_("") === null);
  chequear("Aprobado vale 100", M.porcentajeDelEstado_("Aprobado") === 100);
  chequear("Propuesto vale 25", M.porcentajeDelEstado_("propuesto") === 25);
  chequear("un estado no previsto se distingue", M.porcentajeDelEstado_("Vencido") === null);
  chequear("PROMEDIO TOTAL es fila de cierre", M.esFilaDeCierre_("PROMEDIO TOTAL:"));
  chequear("un código no lo es", !M.esFilaDeCierre_("PE.01"));
});

bloque("Revisión de cada fila del resumen", function () {
  const sinProblemas = M.revisarIndicadorA4_(leido.indicadores[0], HOJAS_DEL_LIBRO);
  chequear("un indicador completo no genera hallazgos", sinProblemas.length === 0);

  // Los "Propuesto" de la hoja real vienen sin el nombre del indicador.
  const sinNombre = M.revisarIndicadorA4_(leido.indicadores[2], HOJAS_DEL_LIBRO);
  chequear("falta el nombre del indicador y se dice",
    sinNombre.some(function (h) { return h.campo === "Indicador" && h.severidad === "incompleto"; }));

  const sinPestana = M.revisarIndicadorA4_(
    { codigo: "PX", proceso: "P", hoja: "NO EXISTE", indicador: "I", estado: "Aprobado", porcentaje: 100 },
    HOJAS_DEL_LIBRO);
  chequear("una pestaña declarada que no existe es crítica",
    sinPestana.some(function (h) { return h.severidad === "critico"; }));
  chequear("y el mensaje nombra la pestaña",
    sinPestana.some(function (h) { return h.observacion.indexOf("NO EXISTE") !== -1; }));

  const descuadre = M.revisarIndicadorA4_(
    { codigo: "PX", proceso: "P", hoja: HOJAS_DEL_LIBRO[1], indicador: "I",
      estado: "Aprobado", porcentaje: 25 }, HOJAS_DEL_LIBRO);
  chequear("un estado que no cuadra con su porcentaje se observa",
    descuadre.some(function (h) { return h.campo === "Porcentaje" && h.severidad === "observacion"; }));
  chequear("sin corregir el dato, solo señalándolo",
    descuadre.some(function (h) { return h.observacion.indexOf("cuál de los dos manda") !== -1; }));

  const estadoRaro = M.revisarIndicadorA4_(
    { codigo: "PX", proceso: "P", hoja: HOJAS_DEL_LIBRO[1], indicador: "I",
      estado: "Vencido", porcentaje: 40 }, HOJAS_DEL_LIBRO);
  chequear("un estado no previsto se observa",
    estadoRaro.some(function (h) { return h.campo === "Estado"; }));

  const fuera = M.revisarIndicadorA4_(
    { codigo: "PX", proceso: "P", hoja: HOJAS_DEL_LIBRO[1], indicador: "I",
      estado: "Aprobado", porcentaje: 150 }, HOJAS_DEL_LIBRO);
  chequear("un porcentaje fuera de rango se observa",
    fuera.some(function (h) { return h.observacion.indexOf("fuera del rango") !== -1; }));
});

/* ── Una ficha de indicador, con sus etiquetas reales ────────────────────── */

const FICHA = [
  ["", "PROCESO ESTRATÉGICO", "INDICADOR", "", "", "ESTADO"],
  ["", "GESTIÓN ESTRATÉGICA", "Porcentaje de ejecución presupuestaria", "", "", "Aprobado"],
  ["", "PROPUESTA DE INDICADOR DEL PROCESO NIVEL 0", "", "", "", ""],
  ["", "1. INDENTIFICACIÓN DE PROCESO", "", "", "", ""],
  ["", "Nombre del Proceso: GESTIÓN ESTRATÉGICA", "", "", "", ""],
  ["", "Subproceso: GESTIÓN PRESUPUESTAL", "", "", "", ""],
  ["", "RESPONSABLE DEL PROCESOS : Jefe de la Unidad de Planificación", "", "", "", ""],
  ["", "Código: PE.01.03_F02", "", "", "", ""],
  ["", "3. INDICADOR", "", "", "", ""],
  ["", "Nombre:", "Porcentaje de Ejecución Presupuestaria", "", "", ""],
  ["", "Frecuencia de medida:", "Trimestral", "", "", ""],
  ["", "Fórmula:", "I = ((Presupuesto Devengado) / (PIM o PIA))*100", "", "", ""],
  ["", "FICHA DE INDICADOR", "", "", "", ""],
  ["", "Variables", "N : Presupuesto ejecutado. D : Presupuesto asignado.", "", "", ""]
];

const REPORTE = [
  ["", "HOJA DE REPORTE DE RECURSOS ORDINARIOS (R.O.)", "", ""],
  ["", "1. INFORMACIÓN GENERAL DEL PERIODO", "", ""],
  ["", "Facultad :", "FCA", ""],
  ["", "Semestre de Reporte :", "2026 I", ""]
];

bloque("Formato de cada pestaña", function () {
  chequear("una ficha de indicador se reconoce", M.tipoDeHojaA4_(FICHA) === "ficha");
  chequear("una hoja de reporte se distingue de la ficha",
    M.tipoDeHojaA4_(REPORTE) === "reporte");
  chequear("una pestaña cualquiera queda sin identificar",
    M.tipoDeHojaA4_([["algo", "otra cosa"]]) === "otro");
});

bloque("Campos de la ficha de indicador", function () {
  const r = M.revisarFichaA4_(FICHA);
  const por = {};
  r.campos.forEach(function (c) { por[c.campo] = c; });

  chequear("la etiqueta pegada al valor se lee",
    por["Nombre del proceso"].completo && por["Nombre del proceso"].valor.indexOf("ESTRATÉGICA") !== -1);
  chequear("el subproceso también", por["Subproceso"].valor === "GESTIÓN PRESUPUESTAL");
  chequear("el responsable, aunque la etiqueta lleve espacio antes de los dos puntos",
    por["Responsable"].completo);
  chequear("el código", por["Código"].valor === "PE.01.03_F02");
  chequear("la etiqueta con el valor en la celda de al lado",
    por["Nombre del indicador"].valor === "Porcentaje de Ejecución Presupuestaria");
  chequear("la frecuencia", por["Frecuencia"].valor === "Trimestral");
  chequear("la fórmula", por["Fórmula"].completo);
  chequear("las variables", por["Variables"].completo);
  chequear("se cuentan los campos completos", r.completos === r.total);

  const incompleta = M.revisarFichaA4_([
    ["", "PROPUESTA DE INDICADOR DEL PROCESO NIVEL 0"],
    ["", "Nombre del Proceso: GESTIÓN ESTRATÉGICA"],
    ["", "Subproceso:"],
    ["", "Fórmula:", ""]
  ]);
  chequear("un campo vacío se marca incompleto",
    incompleta.campos.filter(function (c) { return c.completo; }).length === 1);
  chequear("y el resto queda pendiente", incompleta.completos < incompleta.total);
});

bloque("Avance del Anexo 4", function () {
  chequear("es el promedio de los porcentajes",
    M.avanceGeneralAnexo4_(leido.indicadores) === 62.5);

  // Los 35 indicadores reales: 7 aprobados al 100% y 28 propuestos al 25%.
  const reales = [];
  for (let i = 0; i < 7; i++) reales.push({ porcentaje: 100 });
  for (let i = 0; i < 28; i++) reales.push({ porcentaje: 25 });
  chequear("con los 35 indicadores reales da el 40% que muestra la hoja",
    M.avanceGeneralAnexo4_(reales) === 40);

  chequear("sin indicadores no divide por cero", M.avanceGeneralAnexo4_([]) === 0);
  chequear("los que no tienen porcentaje no cuentan",
    M.avanceGeneralAnexo4_([{ porcentaje: 100 }, { porcentaje: null }]) === 100);

  chequear("95% es satisfactorio", M.estadoDelAvanceA4_(95, 0).clave === "correcto");
  chequear("40% es crítico", M.estadoDelAvanceA4_(40, 0).clave === "critico");
  const conCriticos = M.estadoDelAvanceA4_(99, 2);
  chequear("con hallazgos críticos no puede ser satisfactorio",
    conCriticos.clave !== "correcto");
  chequear("y el rótulo dice cuántos son",
    conCriticos.rotulo.indexOf("2 hallazgo(s) crítico(s)") !== -1);
});

/* ────────────────────────────────────────────────────────────────────────── */

console.log("\n" + total + " comprobaciones, " + fallas + " fallas.");
process.exit(fallas ? 1 : 0);
