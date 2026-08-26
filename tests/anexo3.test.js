/**
 * Pruebas de los validadores del Anexo 3.
 *
 * Apps Script no corre fuera de Google, así que el .gs se carga en Node con
 * stubs de SpreadsheetApp, DriveApp, Utilities, Session y Logger. Solo se
 * prueban las funciones puras: validadores de codificación, parseo de la
 * pestaña en fichas técnicas, registro maestro y cotejo con el Anexo 1.
 *
 *   node tests/anexo3.test.js
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const FUENTE = path.join(__dirname, "..", "apps-script", "Anexo3_Revision.gs");

const SHIM = `
var SpreadsheetApp = { getUi: function () { throw new Error("sin interfaz"); } };
var DriveApp = {};
var Utilities = { formatDate: function () { return "2026-01-01 00:00"; } };
var Session = { getScriptTimeZone: function () { return "America/Lima"; } };
var Logger = { log: function () {} };
module.exports = {
  CONFIG_A3, normalizar_, esVacio_, esEtiqueta_, nivelDeCodigo_, extraerCodigosA3_,
  denominacionDeA3_, nivelesEsperados_, validarCodigoA3_, validarCeldaA3_,
  siglaDePestana_, facultadPorSigla_, formularioDominante_, esInicioDeFicha_,
  localizarFichas_, buscarFilaEtiqueta_, valorDeEtiqueta_, catalogoDeEtiquetas_,
  construirMaestro_, construirCotejo_, revisarFicha_, letraColumna_,
  localizarPestanaA3_, estadoDeDetalle_, estadoDeFicha_, estadoDeMaestro_, estadoDeCotejo_
};
`;

function cargarModulo() {
  const destino = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "a3-")), "modulo.js");
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

bloque("Normalización y celdas vacías", function () {
  chequear("quita tildes y mayúsculiza", M.normalizar_("Definición") === "DEFINICION");
  chequear("quita los dos puntos finales", M.normalizar_("DEFINICIÓN DEL PROCESO:") === "DEFINICION DEL PROCESO");
  chequear("colapsa espacios", M.normalizar_("  NOMBRE   Y  APELLIDOS ") === "NOMBRE Y APELLIDOS");
  chequear("celda en blanco es vacía", M.esVacio_("   "));
  chequear("NINGUNO cuenta como vacío", M.esVacio_("Ninguno"));
  chequear("un guion cuenta como vacío", M.esVacio_("-"));
  chequear("el cero NO es vacío (versión 0)", !M.esVacio_("0"));
  chequear("un texto normal no es vacío", !M.esVacio_("Decano de Facultad"));
  chequear("etiqueta reconocida sin tildes", M.esEtiqueta_("Vinculación", ["VINCULACION"]));
  chequear("etiqueta no coincide por subcadena", !M.esEtiqueta_("NOMBRE Y APELLIDOS", ["NOMBRE"]));
});

bloque("Extracción de códigos y denominación", function () {
  chequear("código suelto", M.extraerCodigosA3_("PR.01_F02").length === 1);
  chequear("dos códigos en una celda",
    M.extraerCodigosA3_("PE.03.01.01_F02  PE.03.01.04_F02").length === 2);
  chequear("código con denominación pegada",
    M.extraerCodigosA3_("PR.122_F02 OFICINA DE PLANES Y PROGRAMAS - OGPL")[0] === "PR.122_F02");
  chequear("celda sin código", M.extraerCodigosA3_("Rectorado, Unidad de Matrícula").length === 0);
  chequear("denominación separada del código",
    M.denominacionDeA3_("PR.122_F02 OFICINA DE PLANES") === "OFICINA DE PLANES");
  chequear("denominación vacía si solo hay código",
    M.denominacionDeA3_("PM.01.05.01_F02") === "");
  chequear("nivel 1", M.nivelDeCodigo_("PE.02_F02") === 1);
  chequear("nivel 2", M.nivelDeCodigo_("PE.02.01_F02") === 2);
  chequear("nivel 3", M.nivelDeCodigo_("PM.01.03.02_F02") === 3);
  chequear("nivel 4 de la FDCP", M.nivelDeCodigo_("PM.01.01.02.05_F02") === 4);
  chequear("un texto no es código", M.nivelDeCodigo_("GESTIÓN DE PLANES") === 0);
  chequear("A → 1 en la letra de columna", M.letraColumna_(1) === "A");
  chequear("K → 11", M.letraColumna_(11) === "K");
  chequear("AA → 27", M.letraColumna_(27) === "AA");
});

bloque("Reglas 2, 3 y 6 — PR / EN / BE", function () {
  chequear("proveedor válido", M.validarCodigoA3_("PR.01_F02", "PR", "F02", true).ok);
  chequear("correlativo de tres dígitos", M.validarCodigoA3_("PR.122_F02", "PR", "F02", true).ok);
  chequear("entrada válida", M.validarCodigoA3_("EN.196_F02", "EN", "F02", true).ok);
  chequear("beneficiario válido", M.validarCodigoA3_("BE.07_F02", "BE", "F02", true).ok);
  chequear("prefijo cambiado se rechaza", !M.validarCodigoA3_("BE.01_F02", "PR", "F02", true).ok);
  chequear("formulario de otra facultad se rechaza",
    !M.validarCodigoA3_("PR.01_F05", "PR", "F02", true).ok);
  chequear("sin sufijo de formulario se rechaza", !M.validarCodigoA3_("PR.01", "PR", "F02", true).ok);
  chequear("guion en lugar de guion bajo se rechaza",
    !M.validarCodigoA3_("PR.01-F02", "PR", "F02", true).ok);
  chequear("el motivo nombra la estructura esperada",
    M.validarCodigoA3_("PR1_F02", "PR", "F02", true).motivo.indexOf("PR.XX_FYY") !== -1);
  chequear("la corrección propone el formulario de la facultad",
    M.validarCodigoA3_("PR1_F02", "PR", "F02", true).correccion.indexOf("F02") !== -1);
});

bloque("Niveles esperados por campo", function () {
  chequear("definición › código: un nivel",
    M.nivelesEsperados_("PROCESO_N1", false).join() === "1");
  chequear("descripción › procesos: dos niveles",
    M.nivelesEsperados_("PROCESO_N2", false).join() === "2");
  chequear("descripción › salidas: tres niveles",
    M.nivelesEsperados_("SALIDA", false).join() === "3");
  chequear("registros: tres niveles", M.nivelesEsperados_("REGISTRO", false).join() === "3");
  chequear("facultad de nivel 2: procesos admiten 2 y 3",
    M.nivelesEsperados_("PROCESO_N2", true).join() === "2,3");
  chequear("facultad de nivel 2: salidas admiten 3 y 4",
    M.nivelesEsperados_("SALIDA", true).join() === "3,4");
});

bloque("Reglas 4 y 5 — procesos y salidas", function () {
  chequear("proceso de nivel 1 válido en la definición",
    M.validarCodigoA3_("PE.02_F02", "PROCESO_N1", "F02", true).ok);
  chequear("la definición NO admite el desagregado de salidas",
    !M.validarCodigoA3_("PE.02.01_F02", "PROCESO_N1", "F02", true).ok);
  chequear("proceso de la columna F válido",
    M.validarCodigoA3_("PE.01.01_F02", "PROCESO_N2", "F02", false).ok);
  chequear("salida de la columna H válida",
    M.validarCodigoA3_("PE.01.01.01_F02", "SALIDA", "F02", false).ok);
  chequear("salida de un solo nivel se rechaza",
    !M.validarCodigoA3_("PE.01_F02", "SALIDA", "F02", false).ok);

  const varios = M.validarCeldaA3_("PE.03.01_F02 GESTIÓN DE CONVENIOS  PE.03.02_F02 PRÁCTICAS",
                                   "PROCESO_N2", "F02", true, true);
  chequear("regla 4: dos procesos en una celda es error", varios.errores.length === 1);
  chequear("regla 4: el mensaje cita la regla", varios.errores[0].correccion.indexOf("Regla 4") !== -1);

  const salidas = M.validarCeldaA3_("PE.03.01.01_F02  PE.03.01.04_F02", "SALIDA", "F02", true, false);
  chequear("varias salidas en una celda son válidas", salidas.errores.length === 0);
  chequear("se recuperan las dos salidas", salidas.codigos.length === 2);

  const sinCodigo = M.validarCeldaA3_("Rectorado, Unidad de Matrícula", "PR", "F02", true, false);
  chequear("celda sin código se observa", sinCodigo.errores.length === 1);

  const vacia = M.validarCeldaA3_("", "PR", "F02", true, false);
  chequear("celda vacía se marca como vacía, no como error", vacia.vacio && vacia.errores.length === 0);
});

bloque("Excepción de la FDCP — facultad de nivel 2", function () {
  const conExcepcion = M.validarCodigoA3_("PM.01.01.02.05_F02", "REGISTRO", "F02", true);
  chequear("registro de cuatro niveles se admite", conExcepcion.ok);
  chequear("y queda marcado como excepción", conExcepcion.excepcionNivel2 === true);
  chequear("el mismo código en una facultad de nivel 1 es error",
    !M.validarCodigoA3_("PM.01.01.02.05_F02", "REGISTRO", "F02", false).ok);

  const proceso = M.validarCodigoA3_("PE.01.01.01_F02", "PROCESO_N2", "F02", true);
  chequear("proceso de tres niveles convive con los de dos", proceso.ok && proceso.excepcionNivel2);

  const celda = M.validarCeldaA3_("PM.01.01.02.05_F02 CONSTANCIA OFICIAL", "REGISTRO", "F02", true, false);
  chequear("la celda no acumula errores por la excepción", celda.errores.length === 0);
  chequear("pero sí deja nota", celda.notas.length === 1);

  const dosNiveles = M.validarCodigoA3_("PE.02.01_F02", "PROCESO_N2", "F02", true);
  chequear("el nivel normal sigue sin generar nota", dosNiveles.ok && !dosNiveles.excepcionNivel2);
});

bloque("Localización de la pestaña a revisar", function () {
  function libroCon(nombres) {
    const hojas = nombres.map(function (n) { return { getName: function () { return n; } }; });
    return {
      getSheets: function () { return hojas; },
      getSheetByName: function (n) {
        let h = null;
        hojas.forEach(function (x) { if (x.getName() === n) h = x; });
        return h;
      }
    };
  }
  chequear("nombre exacto",
    M.localizarPestanaA3_(libroCon(["1.FM", "2.FDCP"]), "2.FDCP").getName() === "2.FDCP");
  chequear("espacio de más",
    M.localizarPestanaA3_(libroCon(["2. FDCP"]), "2.FDCP").getName() === "2. FDCP");
  chequear("espacio al final",
    M.localizarPestanaA3_(libroCon(["2.FDCP "]), "2.FDCP").getName() === "2.FDCP ");
  chequear("sin el número de orden",
    M.localizarPestanaA3_(libroCon(["FDCP"]), "2.FDCP").getName() === "FDCP");
  chequear("separador distinto",
    M.localizarPestanaA3_(libroCon(["2-FDCP"]), "2.FDCP").getName() === "2-FDCP");
  chequear("no confunde con otra facultad",
    (function () {
      try { M.localizarPestanaA3_(libroCon(["1.FM", "3.FLCH"]), "2.FDCP"); return false; }
      catch (e) { return true; }
    })());
  chequear("el error enumera las pestañas disponibles",
    (function () {
      try { M.localizarPestanaA3_(libroCon(["1.FM"]), "2.FDCP"); return false; }
      catch (e) { return e.message.indexOf('"1.FM"') !== -1; }
    })());
});

bloque("Facultad y formulario", function () {
  chequear("sigla desde 2.FDCP", M.siglaDePestana_("2.FDCP") === "FDCP");
  chequear("sigla desde 1.FM", M.siglaDePestana_("1.FM") === "FM");
  chequear("FMV no se confunde con FM", M.siglaDePestana_("8.FMV") === "FMV");
  chequear("FCCSS no se confunde con FCC", M.siglaDePestana_("15.FCCSS") === "FCCSS");
  chequear("pestaña ajena no devuelve sigla", M.siglaDePestana_("DASHBOARD") === null);
  chequear("formulario oficial de la FDCP", M.facultadPorSigla_("FDCP").formulario === "F02");
  chequear("sufijo dominante de la pestaña",
    M.formularioDominante_([["PR.01_F02"], ["EN.02_F02"], ["BE.03_F05"]]) === "F02");
  chequear("sin códigos no hay dominante", M.formularioDominante_([["texto"]]) === null);
});

/* ── Pestaña de prueba con la forma real de la hoja 2.FDCP ──────────────── */

const V = [
  ["", "", "", "", "", "", "", "", "", "", ""],
  ["", "F02- FACULTAD DE DERECHO Y CIENCIAS POLÍTICAS - ANEXO 3", "", "", "", "", "", "", "", "", ""],
  ["Nombre", "Gestión de la Calidad y Mejora Continua", "", "", "", "", "Codigo", "PE.02_F02", "", "", ""],
  ["Responsable", "Jefe de Oficina de Calidad", "", "", "", "", "Tipo", "Estratégico", "", "", ""],
  ["Alcance", "El proceso abarca…", "", "", "", "", "Versión", "1", "", "", ""],
  ["Vinculación", "OEI.01 - Mejorar la formación", "", "", "", "", "", "", "", "", ""],
  ["Objetivo", "Gestionar la mejora continua", "", "", "", "", "", "", "", "", ""],
  ["DESCRIPCIÓN DEL PROCESO", "", "", "", "", "", "", "", "", "", ""],
  ["", "Proveedores", "", "Entradas", "", "Proceso", "", "Salidas", "", "Beneficiarios", ""],
  ["", "PR.04_F02", "SINEACE", "EN.07_F02", "Modelo de acreditación", "PE.02.01_F02", "Gestión de la cultura",
   "PE.02.01.01_F02", "Plan de capacitación", "BE.01_F02", "Autoridades"],
  ["", "PR.05_F02", "OCCAA", "EN.08_F02", "Lineamientos", "PE.02.02_F02", "Aseguramiento",
   "PE.02.02.02_F02", "Programas acreditados", "BE.02_F02", "Docentes"],
  ["EJECUCIÓN DEL PROCESO", "", "", "", "", "", "", "", "", "", ""],
  ["RECURSOS", "Humanos", "1 jefe 1 técnico", "Registros", "PE.02.01.02_F02 Informe de desarrollo", "",
   "Indicadores", "- Porcentaje de informes", "", "", ""],
  ["RECURSOS", "Físicos", "1 oficina", "", "", "", "", "", "", "", ""],
  ["RECURSOS", "Tecnológicos", "2 computadoras", "Riesgos", "- Baja participación", "", "Controles",
   "- Registro de asistencia", "", "", ""],
  ["RECURSOS", "Informáticos", "Quipucamayoc, SGD", "", "", "", "", "", "", "", ""],
  ["FORMALIZACIÓN DEL PROCESO", "", "", "", "", "", "", "", "", "", ""],
  ["", "Unidad", "", "Cargo", "", "Nombre y Apellidos", "", "Firma", "", "", ""],
  ["Elaboración", "Unidad de Planificación", "", "Jefe", "", "Juan Reyes", "", "", "", "", ""],
  ["Revisión", "Oficina de Calidad", "", "Jefe", "", "Ana Torres", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", ""],
  ["FICHA TÉCNICA DE PRODUCTO Y PROCESO", "", "", "", "", "", "", "", "", "", ""],
  ["DEFINICIÓN DEL PROCESO:", "Gestión de Relaciones Interinstitucionales", "", "", "", "", "", "", "", "", ""],
  ["Nombre", "Gestión de Relaciones Interinstitucionales", "", "", "", "", "Codigo", "PE.03_F02", "", "", ""],
  ["Responsable", "Decano de Facultad", "", "", "", "", "Tipo", "Estratégico", "", "", ""],
  ["Alcance", "", "", "", "", "", "Versión", "1", "", "", ""],
  ["Vinculación", "OEI.02 – Fortalecer la investigación", "", "", "", "", "", "", "", "", ""],
  ["Objetivo", "Gestionar alianzas", "", "", "", "", "", "", "", "", ""],
  ["DESCRIPCIÓN DEL PROCESO", "", "", "", "", "", "", "", "", "", ""],
  ["", "Proveedores", "", "Entradas", "", "Proceso", "", "Salidas", "", "Beneficiarios", ""],
  ["", "PR.04_F02", "SINEACE Perú", "EN.12_F02", "Solicitud de convenio",
   "PE.03.01_F02 Gestión de convenios  PE.03.02_F02 Prácticas", "",
   "PE.03.01.01_F02", "Convenios firmados", "BE.01_F05", "Autoridades"],
  ["EJECUCIÓN DEL PROCESO", "", "", "", "", "", "", "", "", "", ""],
  ["RECURSOS", "Humanos", "1 director", "Registros", "PM.01.01.02.05_F02 Constancia de ayudantía", "",
   "Indicadores", "- Porcentaje de convenios", "", "", ""],
  ["RECURSOS", "Físicos", "1 oficina", "", "", "", "", "", "", "", ""],
  ["RECURSOS", "Tecnológicos", "", "Riesgos", "", "", "Controles", "", "", "", ""],
  ["RECURSOS", "Informáticos", "SGD", "", "", "", "", "", "", "", ""],
  ["FORMALIZACIÓN DEL PROCESO", "", "", "", "", "", "", "", "", "", ""],
  ["", "Unidad", "", "Cargo", "", "Nombre y Apellidos", "", "Firma", "", "", ""],
  ["Elaboración", "Unidad de Planificación", "", "", "", "", "", "", "", "", ""],
  ["Revisión", "", "", "", "", "", "", "", "", "", ""]
];

const CTX = {
  valores: V,
  fuentes: V.map(function (fila) { return fila.map(function () { return "Arial"; }); }),
  formulario: "F02",
  permiteNivel2: true,
  etiquetas: M.catalogoDeEtiquetas_()
};

const BLOQUES = M.localizarFichas_(V);
const F1 = M.revisarFicha_(CTX, BLOQUES[0], 1);
const F2 = M.revisarFicha_(CTX, BLOQUES[1], 2);

bloque("Partición de la pestaña en fichas técnicas", function () {
  chequear("dos fichas técnicas", BLOQUES.length === 2);
  chequear("la primera empieza en la fila del NOMBRE", BLOQUES[0].inicio === 2);
  chequear("la primera no invade el título de la segunda", BLOQUES[0].fin === 19);
  chequear("la segunda empieza en su fila de NOMBRE", BLOQUES[1].inicio === 23);
  chequear("una ficha se reconoce sin el título", M.esInicioDeFicha_(V[2]));
  chequear("una fila cualquiera no abre ficha", !M.esInicioDeFicha_(V[9]));
  chequear("se ubica la sección de ejecución",
    M.buscarFilaEtiqueta_(V, 2, 20, ["EJECUCION DEL PROCESO"]).fila === 11);
  chequear("valor a la derecha de la etiqueta",
    M.valorDeEtiqueta_(V[3], 0, CTX.etiquetas).valor === "Jefe de Oficina de Calidad");
  chequear("una etiqueta contigua no se toma por valor",
    M.valorDeEtiqueta_(V[25], 0, CTX.etiquetas).valor === "");
});

bloque("Ficha completa — sin hallazgos", function () {
  chequear("nombre recuperado", F1.nombre === "Gestión de la Calidad y Mejora Continua");
  chequear("código recuperado", F1.codigo === "PE.02_F02");
  chequear("sin campos faltantes", F1.faltantes.length === 0);
  chequear("sin errores de codificación", F1.erroresCodificacion === 0);
  chequear("marcada como completa", F1.completa === true);
  chequear("avance del 100%", F1.avance === 100);
  chequear("todas las secciones aparecen en el detalle",
    ["Definición", "Descripción", "Ejecución", "Formalización"].every(function (s) {
      return F1.detalle.some(function (d) { return d.seccion === s; });
    }));
  chequear("la firma no cuenta como campo faltante",
    !F1.faltantes.some(function (x) { return x.indexOf("Firma") !== -1; }));
  chequear("la firma sí se informa como opcional",
    F1.detalle.some(function (d) { return d.campo.indexOf("Firma") !== -1 && d.completo === "Opcional"; }));
  chequear("los proveedores llegan al registro maestro",
    F1.codigosMaestro.filter(function (c) { return c.tipo === "Proveedores"; }).length === 2);
  chequear("salidas y registros llegan al cotejo",
    F1.cotejo.filter(function (c) { return c.tipo === "Salida"; }).length === 2 &&
    F1.cotejo.filter(function (c) { return c.tipo === "Registro"; }).length === 1);
});

bloque("Ficha con defectos", function () {
  function faltaReportada(nombre) {
    return F2.faltantes.some(function (x) { return x.indexOf(nombre) === 0; });
  }
  chequear("el alcance vacío se reporta", faltaReportada("Definición › Alcance"));
  chequear("los riesgos vacíos se reportan", faltaReportada("Ejecución › Riesgos"));
  chequear("los controles vacíos se reportan", faltaReportada("Ejecución › Controles"));
  chequear("el cargo faltante en Elaboración se reporta",
    faltaReportada("Formalización › Elaboracion › Cargo"));
  chequear("la unidad faltante en Revisión se reporta",
    faltaReportada("Formalización › Revision › Unidad"));
  chequear("dos procesos en una celda cuentan como error",
    F2.detalle.some(function (d) { return d.observacion.indexOf("Regla 4") !== -1; }));
  chequear("el beneficiario con formulario ajeno cuenta como error",
    F2.detalle.some(function (d) { return d.observacion.indexOf("F05") !== -1; }));
  chequear("hay al menos dos errores de codificación", F2.erroresCodificacion >= 2);
  chequear("no está completa", F2.completa === false);
  chequear("el avance queda por debajo del 100%", F2.avance < 100);
  chequear("el registro de cuatro niveles no suma error",
    !F2.detalle.some(function (d) {
      return d.campo === "Registros" && d.estructura === "No";
    }));
  chequear("y queda anotado como excepción de nivel 2",
    F2.notas.some(function (n) { return n.indexOf("nivel 2") !== -1; }));
});

bloque("Ubicación de cada campo revisado", function () {
  function buscar(ficha, seccion, campo) {
    let hallada = null;
    ficha.detalle.forEach(function (d) {
      if (!hallada && d.seccion === seccion && d.campo === campo) hallada = d;
    });
    return hallada;
  }

  chequear("la fila del campo es la que se ve en la hoja (base 1)",
    buscar(F1, "Definición", "Responsable").fila === 4);
  chequear("y la celda apunta al valor, no a la etiqueta",
    buscar(F1, "Definición", "Responsable").celda === "B4");
  chequear("el código de la definición se ubica en su propia celda",
    buscar(F1, "Definición", "Código").celda === "H3");
  chequear("un campo de ejecución trae su celda",
    buscar(F1, "Ejecución", "Registros").celda === "E13");
  chequear("un campo de formalización trae su celda",
    buscar(F1, "Formalización", "Elaboracion › Unidad").celda === "B19");
  chequear("una columna de la descripción informa el rango de filas",
    buscar(F1, "Descripción", "Proveedores").fila === "10–11");
  chequear("un hallazgo de una celda de la descripción trae la celda exacta",
    (function () {
      let d = null;
      F2.detalle.forEach(function (x) {
        if (!d && x.seccion === "Descripción" && x.estructura === "No") d = x;
      });
      return d && d.celda === "F31";
    })());
  chequear("un campo vacío también trae su ubicación",
    buscar(F2, "Definición", "Alcance").fila === 26);
  chequear("la ubicación ya no se repite dentro del texto de la observación",
    buscar(F2, "Definición", "Alcance").observacion.indexOf("fila") === -1);
  chequear("el campo revisado ya no arrastra la fila en su nombre",
    F2.detalle.every(function (d) { return d.campo.indexOf("(fila") === -1; }));
  chequear("el resumen de faltantes indica dónde completar",
    F2.faltantes.some(function (x) { return x.indexOf("(celda ") !== -1; }));
  chequear("toda fila del detalle trae fila o rango",
    F1.detalle.every(function (d) { return d.fila !== "" && d.fila !== undefined; }));
});

bloque("Regla 1 — fuente Arial", function () {
  const fuentes = V.map(function (fila) { return fila.map(function () { return "Arial"; }); });
  fuentes[3][1] = "Calibri";
  const ctx = Object.assign({}, CTX, { fuentes: fuentes });
  const f = M.revisarFicha_(ctx, BLOQUES[0], 1);
  chequear("se cuenta la celda fuera de Arial", f.fueraDeArial === 1);
  chequear("se reporta como observación de formato",
    f.detalle.some(function (d) { return d.seccion === "Formato" && d.observacion.indexOf("Regla 1") !== -1; }));
  chequear("con la celda exacta que hay que corregir",
    f.detalle.some(function (d) { return d.seccion === "Formato" && d.celda === "B4"; }));
  chequear("y nombrando la fuente encontrada",
    f.detalle.some(function (d) { return d.seccion === "Formato" && d.observacion.indexOf("Calibri") !== -1; }));
  chequear("una celda vacía en otra fuente no se observa",
    M.revisarFicha_(Object.assign({}, CTX, {
      fuentes: (function () { const x = V.map(function (fila) { return fila.map(function () { return "Arial"; }); });
                              x[5][10] = "Times New Roman"; return x; })()
    }), BLOQUES[0], 1).fueraDeArial === 0);
});

bloque("Hoja 4 — registro maestro de códigos", function () {
  const maestro = M.construirMaestro_([
    { tipo: "Proveedores", codigo: "PR.04_F02", denominacion: "SINEACE", ficha: 1 },
    { tipo: "Proveedores", codigo: "PR.04_F02", denominacion: "SINEACE Perú", ficha: 2 },
    { tipo: "Proveedores", codigo: "PR.05_F02", denominacion: "OCCAA", ficha: 1 },
    { tipo: "Beneficiarios", codigo: "BE.01_F02", denominacion: "Autoridades", ficha: 1 },
    { tipo: "Beneficiarios", codigo: "BE.09_F02", denominacion: "Autoridades", ficha: 3 }
  ]);
  const porCodigo = {};
  maestro.forEach(function (m) { porCodigo[m.tipo + "|" + m.codigo] = m; });

  chequear("una fila por código y tipo", maestro.length === 4);
  chequear("un código con dos denominaciones es inconsistente",
    porCodigo["Proveedores|PR.04_F02"].consistente === "No");
  chequear("y se explica el defecto",
    porCodigo["Proveedores|PR.04_F02"].observacion.indexOf("denominaciones distintas") !== -1);
  chequear("un código usado igual siempre es consistente",
    porCodigo["Proveedores|PR.05_F02"].consistente === "Sí");
  chequear("una denominación con dos códigos también se detecta",
    porCodigo["Beneficiarios|BE.01_F02"].consistente === "No");
  chequear("se listan las fichas donde aparece",
    porCodigo["Proveedores|PR.04_F02"].fichas === "1, 2");
});

bloque("Hoja 5 — cotejo contra el Anexo 1", function () {
  const anexo1 = {
    disponible: true,
    hoja: "FDCP",
    catalogo: {
      "PE.02.01.01_F02": { denominacion: "Plan de capacitación", tipo: "Final / Salida (producto final)" },
      "PE.02.01.02_F02": { denominacion: "Informe de desarrollo", tipo: "Parcial / Registro" },
      "PE.02.02.02_F02": { denominacion: "Programas acreditados y certificados", tipo: "Final / Salida" }
    }
  };
  const cotejo = M.construirCotejo_([
    { tipo: "Salida",   codigo: "PE.02.01.01_F02", denominacion: "Plan de capacitación", ficha: 1 },
    { tipo: "Salida",   codigo: "PE.02.02.02_F02", denominacion: "Programas acreditados", ficha: 1 },
    { tipo: "Salida",   codigo: "PE.03.01.01_F02", denominacion: "Convenios firmados", ficha: 2 },
    { tipo: "Registro", codigo: "PE.02.01.02_F02", denominacion: "Informe de desarrollo", ficha: 1 },
    { tipo: "Registro", codigo: "PE.02.01.01_F02", denominacion: "Plan de capacitación", ficha: 2 }
  ], anexo1);
  const por = {};
  cotejo.forEach(function (c) { por[c.tipo + "|" + c.codigo] = c; });

  chequear("la salida que coincide se marca Sí", por["Salida|PE.02.01.01_F02"].existe === "Sí");
  chequear("la denominación distinta se distingue del ausente",
    por["Salida|PE.02.02.02_F02"].existe === "Sí (denominación distinta)");
  chequear("y se transcribe la denominación del Anexo 1",
    por["Salida|PE.02.02.02_F02"].observacion.indexOf("Programas acreditados y certificados") !== -1);
  chequear("la salida ausente se marca No", por["Salida|PE.03.01.01_F02"].existe === "No");
  chequear("y se cita la regla 5", por["Salida|PE.03.01.01_F02"].observacion.indexOf("Regla 5") !== -1);
  chequear("el registro que coincide se marca Sí", por["Registro|PE.02.01.02_F02"].existe === "Sí");
  chequear("un registro tipificado como final se observa",
    por["Registro|PE.02.01.01_F02"].observacion.indexOf("productos parciales") !== -1);

  const sinA1 = M.construirCotejo_(
    [{ tipo: "Salida", codigo: "PE.01.01.01_F02", denominacion: "X", ficha: 1 }],
    { disponible: false, motivo: "No se pudo leer el Anexo 1: sin permiso." });
  chequear("sin Anexo 1 no se afirma nada", sinA1[0].existe === "No verificable");
  chequear("y se explica por qué", sinA1[0].observacion.indexOf("sin permiso") !== -1);

  const repetida = M.construirCotejo_([
    { tipo: "Salida", codigo: "PE.02.01.01_F02", denominacion: "Plan de capacitación", ficha: 1 },
    { tipo: "Salida", codigo: "PE.02.01.01_F02", denominacion: "Plan de capacitación", ficha: 3 }
  ], anexo1);
  chequear("una salida repetida da una sola fila", repetida.length === 1);
  chequear("con las dos fichas listadas", repetida[0].fichas === "1, 3");
});

bloque("Semáforo — estado de cada fila", function () {
  chequear("campo correcto en verde",
    M.estadoDeDetalle_({ seccion: "Definición", estructura: "Sí", completo: "Sí" }) === "ok");
  chequear("campo sin código a validar también en verde",
    M.estadoDeDetalle_({ seccion: "Definición", estructura: "N/A", completo: "Sí" }) === "ok");
  chequear("campo vacío en ámbar",
    M.estadoDeDetalle_({ seccion: "Ejecución", estructura: "N/A", completo: "No" }) === "incompleto");
  chequear("codificación fuera de estructura en rojo",
    M.estadoDeDetalle_({ seccion: "Descripción", estructura: "No", completo: "Sí" }) === "error");
  chequear("la fuente distinta de Arial es rojo, no ámbar",
    M.estadoDeDetalle_({ seccion: "Formato", estructura: "N/A", completo: "No" }) === "error");
  chequear("la firma queda en neutro",
    M.estadoDeDetalle_({ seccion: "Formalización", estructura: "N/A", completo: "Opcional" }) === "neutro");
  chequear("un campo con código mal escrito Y vacío pesa como error",
    M.estadoDeDetalle_({ seccion: "Ejecución", estructura: "No", completo: "No" }) === "error");

  chequear("ficha sin hallazgos en verde",
    M.estadoDeFicha_({ erroresCodificacion: 0, fueraDeArial: 0, faltantes: [] }) === "ok");
  chequear("ficha con campos pendientes en ámbar",
    M.estadoDeFicha_({ erroresCodificacion: 0, fueraDeArial: 0, faltantes: ["x"] }) === "incompleto");
  chequear("ficha con error de codificación en rojo",
    M.estadoDeFicha_({ erroresCodificacion: 1, fueraDeArial: 0, faltantes: [] }) === "error");
  chequear("ficha fuera de Arial en rojo",
    M.estadoDeFicha_({ erroresCodificacion: 0, fueraDeArial: 3, faltantes: [] }) === "error");
  chequear("el error manda sobre lo incompleto",
    M.estadoDeFicha_({ erroresCodificacion: 2, fueraDeArial: 0, faltantes: ["x"] }) === "error");

  chequear("código consistente en verde", M.estadoDeMaestro_({ consistente: "Sí" }) === "ok");
  chequear("código inconsistente en rojo", M.estadoDeMaestro_({ consistente: "No" }) === "error");

  chequear("salida que coincide con el Anexo 1 en verde",
    M.estadoDeCotejo_({ existe: "Sí" }) === "ok");
  chequear("salida ausente del Anexo 1 en rojo",
    M.estadoDeCotejo_({ existe: "No" }) === "error");
  chequear("denominación distinta en ámbar",
    M.estadoDeCotejo_({ existe: "Sí (denominación distinta)" }) === "incompleto");
  chequear("lo no verificable en ámbar, nunca en rojo",
    M.estadoDeCotejo_({ existe: "No verificable" }) === "incompleto");

  chequear("la ficha completa del ejemplo sale verde", M.estadoDeFicha_(F1) === "ok");
  chequear("la ficha con defectos del ejemplo sale roja", M.estadoDeFicha_(F2) === "error");
  chequear("cada fila del detalle tiene un estado conocido",
    F2.detalle.every(function (d) {
      return ["ok", "incompleto", "error", "neutro"].indexOf(M.estadoDeDetalle_(d)) !== -1;
    }));
  chequear("hay filas de los tres colores en la ficha con defectos",
    ["ok", "incompleto", "error"].every(function (e) {
      return F2.detalle.some(function (d) { return M.estadoDeDetalle_(d) === e; });
    }));
  chequear("la paleta define fondo, texto y rótulo para los cuatro estados",
    ["ok", "incompleto", "error", "neutro"].every(function (k) {
      const c = M.CONFIG_A3.COLORES[k];
      return c && c.fondo && c.texto && c.rotulo;
    }));
});

/* ────────────────────────────────────────────────────────────────────────── */

console.log("\n" + total + " comprobaciones, " + fallas + " fallas.");
process.exit(fallas ? 1 : 0);
