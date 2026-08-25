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

const FUENTE = path.join(__dirname, "..", "apps-script", "Anexo1_Auditoria_v3.gs");

const SHIM = `
var SpreadsheetApp = { getUi: function () { throw new Error("sin interfaz"); } };
var Logger = { log: function () {} };
module.exports = {
  CONFIG_A1, validarCodigo_, validarTipoProducto_, validarAccionEstrategica_,
  validarActividadOperativa_, validarListaCerrada_, validarListaAbierta_,
  esDenominacionDeProcesoN0_, buscarNivel0PorNombre_, facultadDeLaHoja_,
  localizarHoja_, construirCobertura_, esValorNulo_, normalizarTexto_
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

bloque("Columna E — Actividad Operativa", function () {
  chequear("acepta texto real", M.validarActividadOperativa_("Gestión del planeamiento institucional").ok);
  chequear("rechaza NINGUNO", !M.validarActividadOperativa_("NINGUNO").ok);
  chequear("rechaza N/A", !M.validarActividadOperativa_("N/A").ok);
  chequear("rechaza vacía", !M.validarActividadOperativa_("").ok);
  chequear("rechaza una AE mal ubicada", !M.validarActividadOperativa_("AE.01.02 algo").ok);
  chequear("el mensaje de NINGUNO lo llama marcador de vacío",
    /marcador de vacío/.test(M.validarActividadOperativa_("NINGUNO").obs));
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
  const vacia = M.construirCobertura_("FM", {});
  chequear("son 16 procesos", vacia.length === 16);
  chequear("PE.03 se reporta como NO APLICA", vacia.find(function (c) { return c[1] === "PE.03"; })[4] === "NO APLICA");
  chequear("PS.08 se reporta como NO APLICA", vacia.find(function (c) { return c[1] === "PS.08"; })[4] === "NO APLICA");
  chequear("quedan 14 obligatorios faltantes",
    vacia.filter(function (c) { return c[4] === "FALTANTE"; }).length === 14);

  const completa = {};
  M.CONFIG_A1.PROCESOS_NIVEL0.forEach(function (p) { completa[M.normalizarTexto_(p.codigo)] = true; });
  chequear("con los 16 presentes no hay faltantes",
    M.construirCobertura_("FM", completa).filter(function (c) { return c[4] === "FALTANTE"; }).length === 0);
});

/* ────────────────────────────────────────────────────────────────────────── */

console.log("\n" + (fallas === 0
  ? "TODAS LAS PRUEBAS PASAN (" + total + ")"
  : fallas + " FALLAS de " + total));

process.exit(fallas === 0 ? 0 : 1);
