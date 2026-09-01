/**
 * Pruebas del historial de revisiones.
 *
 * Apps Script no corre fuera de Google, así que el .gs se carga en Node con
 * stubs de SpreadsheetApp y Logger. El libro se simula con una hoja en memoria,
 * de modo que se puede comprobar qué filas quedan escritas.
 *
 *   node tests/historial.test.js
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const FUENTE = path.join(__dirname, "..", "apps-script", "HistorialRevisiones.gs");

const SHIM = `
module.exports = {
  CONFIG_HISTORIAL_REVISIONES, registrarRevision, historialParaJSON, normalizarPorcentaje_,
  libroDelHistorial_,
  _stubs: function (nuevo) { SpreadsheetApp = nuevo.SpreadsheetApp; Logger = nuevo.Logger; }
};
`;

function cargarModulo() {
  const destino = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "hist-")), "modulo.js");
  fs.writeFileSync(destino, "var SpreadsheetApp, Logger;\n" + fs.readFileSync(FUENTE, "utf8") + SHIM);
  return require(destino);
}

const M = cargarModulo();

let total = 0;
let fallas = 0;
const registro = [];

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

/** Libro simulado: guarda las filas que se le escriben. */
function libroFalso(opciones) {
  const op = opciones || {};
  const hojas = {};
  if (op.conHoja) hojas[M.CONFIG_HISTORIAL_REVISIONES.HOJA] = { nombre: M.CONFIG_HISTORIAL_REVISIONES.HOJA, filas: [M.CONFIG_HISTORIAL_REVISIONES.ENCABEZADOS] };

  function envolver(h) {
    return {
      appendRow: function (fila) { h.filas.push(fila); },
      getDataRange: function () { return { getValues: function () { return h.filas; } }; },
      getRange: function () { return { setFontWeight: function () { return this; } }; },
      setFrozenRows: function () {}
    };
  }
  return {
    getName: function () { return op.nombre || "LIBRO DE PRUEBA"; },
    getSheetByName: function (n) { return hojas[n] ? envolver(hojas[n]) : null; },
    insertSheet: function (n) { hojas[n] = { nombre: n, filas: [] }; return envolver(hojas[n]); },
    _filas: function () { return hojas[M.CONFIG_HISTORIAL_REVISIONES.HOJA] ? hojas[M.CONFIG_HISTORIAL_REVISIONES.HOJA].filas : null; }
  };
}

function montar(opciones) {
  const op = opciones || {};
  const porId = op.porId === undefined ? libroFalso(op) : op.porId;
  const activo = op.activo === undefined ? null : op.activo;
  registro.length = 0;
  M._stubs({
    SpreadsheetApp: {
      openById: function (id) {
        if (!porId) throw new Error("sin acceso al libro " + id);
        return porId;
      },
      getActiveSpreadsheet: function () { return activo; }
    },
    Logger: { log: function (m) { registro.push(m); } }
  });
  return porId;
}

/* ────────────────────────────────────────────────────────────────────────── */

bloque("Normalización del porcentaje", function () {
  montar({});
  chequear("un número se conserva", M.normalizarPorcentaje_(81.3) === 81.3);
  chequear("el texto con signo se convierte", M.normalizarPorcentaje_("85%") === 85);
  chequear("la coma decimal también", M.normalizarPorcentaje_("85,5%") === 85.5);
  chequear("una fracción de celda con formato pasa a porcentaje",
    M.normalizarPorcentaje_(0.85) === 85);
  chequear("el 1 se lee como 100%, no como 1%", M.normalizarPorcentaje_(1) === 100);
  chequear("el 100 se conserva", M.normalizarPorcentaje_(100) === 100);
  chequear("el cero es un dato válido", M.normalizarPorcentaje_(0) === 0);
  chequear("un vacío no es cero", M.normalizarPorcentaje_("") === null);
  chequear("un texto cualquiera tampoco", M.normalizarPorcentaje_("NO INICIADO") === null);
});

bloque("Registro de una revisión", function () {
  const libro = montar({ conHoja: true });
  chequear("se registra y lo confirma", M.registrarRevision("Anexo 1", 81.3) === true);

  const filas = libro._filas();
  chequear("se agrega una fila", filas.length === 2);
  chequear("con la fecha", filas[1][0] instanceof Date);
  chequear("el nombre del anexo", filas[1][1] === "Anexo 1");
  chequear("y el porcentaje como número", filas[1][2] === 81.3);

  M.registrarRevision("Anexo 3", 0.85);
  chequear("una fracción se guarda ya convertida", libro._filas()[2][2] === 85);

  chequear("sin porcentaje utilizable no se inventa un cero",
    M.registrarRevision("Anexo 4", "sin datos") === false);
  chequear("y la hoja no crece", libro._filas().length === 3);
  chequear("pero queda dicho en el registro",
    registro.some(function (m) { return m.indexOf("Anexo 4") !== -1; }));
  chequear("sin nombre de anexo tampoco se registra",
    M.registrarRevision("", 50) === false);
});

bloque("La hoja se crea si no existe", function () {
  const libro = montar({ conHoja: false });
  chequear("el registro funciona igual", M.registrarRevision("Anexo 3", 70) === true);
  chequear("con encabezados",
    libro._filas()[0].join() === M.CONFIG_HISTORIAL_REVISIONES.ENCABEZADOS.join());
  chequear("y la fila del anexo debajo", libro._filas()[1][1] === "Anexo 3");
});

bloque("El libro se abre por ID, no por el que esté abierto", function () {
  const porId = libroFalso({ conHoja: true, nombre: "LIBRO DE REVISIÓN" });
  const otro = libroFalso({ conHoja: true, nombre: "OTRO LIBRO CUALQUIERA" });
  montar({ porId: porId, activo: otro });

  M.registrarRevision("Anexo 1", 80);
  chequear("escribe en el libro declarado", porId._filas().length === 2);
  chequear("y no en el que está abierto", otro._filas().length === 1);

  // Ejecutando desde el editor no hay libro activo: antes esto fallaba.
  montar({ porId: porId, activo: null });
  chequear("funciona sin libro activo", M.registrarRevision("Anexo 3", 60) === true);

  // Si el ID no se puede abrir, el activo sirve de respaldo.
  const respaldo = libroFalso({ conHoja: true });
  montar({ porId: null, activo: respaldo });
  chequear("con el ID inaccesible usa el libro activo",
    M.registrarRevision("Anexo 1", 50) === true);
  chequear("y deja la fila ahí", respaldo._filas().length === 2);
});

bloque("Los dos anexos conviven en el historial", function () {
  const libro = montar({ conHoja: true });
  M.registrarRevision("Anexo 1", 81.3);
  M.registrarRevision("Anexo 3", 74.6);

  const filas = libro._filas();
  chequear("quedan las dos filas", filas.length === 3);
  chequear("una por anexo",
    filas[1][1] === "Anexo 1" && filas[2][1] === "Anexo 3");
  chequear("cada una con su porcentaje",
    filas[1][2] === 81.3 && filas[2][2] === 74.6);

  const json = M.historialParaJSON();
  chequear("el tablero los ve", json.length >= 1);
  const anexos = json.reduce(function (a, g) {
    return a.concat(g.revisiones.map(function (r) { return r.anexo; }));
  }, []);
  chequear("y aparecen los dos", anexos.indexOf("Anexo 1") !== -1 && anexos.indexOf("Anexo 3") !== -1);
});

bloque("Historial vacío o con filas rotas", function () {
  montar({ conHoja: false });
  chequear("sin hoja devuelve una lista vacía", M.historialParaJSON().length === 0);

  const libro = montar({ conHoja: true });
  chequear("solo con encabezados también", M.historialParaJSON().length === 0);

  libro._filas().push(["no es una fecha", "Anexo 1", 50]);
  libro._filas().push([new Date(), "Anexo 3", 70]);
  const json = M.historialParaJSON();
  chequear("una fila con fecha inválida se descarta sin romper nada", json.length === 1);
  chequear("y la buena se conserva", json[0].revisiones[0].anexo === "Anexo 3");
});

/* ────────────────────────────────────────────────────────────────────────── */

console.log("\n" + total + " comprobaciones, " + fallas + " fallas.");
process.exit(fallas ? 1 : 0);
