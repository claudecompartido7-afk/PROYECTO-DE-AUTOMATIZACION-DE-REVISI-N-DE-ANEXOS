/**
 * Registra cada revisión del Anexo en la hoja HISTORIAL_REVISIONES.
 * Se llama una vez por anexo después de que el auditor completa su ejecución.
 *
 * @param {string} anexo - Identificador: 'Anexo 1', 'Anexo 3', 'Anexo 4'
 * @param {number} porcentaje - Porcentaje de cumplimiento (ej: 81.3)
 */
function registrarRevision(anexo, porcentaje) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let hojaHistorial = doc.getSheetByName('HISTORIAL_REVISIONES');

  if (!hojaHistorial) {
    hojaHistorial = doc.insertSheet('HISTORIAL_REVISIONES');
    hojaHistorial.appendRow(['FECHA_HORA', 'ANEXO', 'PORCENTAJE']);
  }

  const ahora = new Date();
  hojaHistorial.appendRow([ahora, anexo, porcentaje]);
}

/**
 * Lee el historial completo de revisiones y lo retorna como array de objetos.
 * Agrupa por timestamp para mostrar revisiones multiples del mismo momento.
 *
 * @return {Array} Array de objetos {etiqueta, fecha-hora, revisiones: [{anexo, porcentaje}]}
 */
function historialParaJSON() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const hojaHistorial = doc.getSheetByName('HISTORIAL_REVISIONES');

  if (!hojaHistorial) return [];

  const datos = hojaHistorial.getDataRange().getValues();
  if (datos.length <= 1) return []; // Solo encabezados

  // Agrupar por fecha-hora
  const grupos = {};
  for (let i = 1; i < datos.length; i++) {
    const fechaHora = datos[i][0];
    const anexo = datos[i][1];
    const porcentaje = datos[i][2];

    const key = fechaHora.toISOString();
    if (!grupos[key]) {
      grupos[key] = [];
    }
    grupos[key].push({ anexo, porcentaje });
  }

  // Convertir a array ordenado cronológicamente
  return Object.keys(grupos)
    .sort()
    .map((iso, idx, arr) => {
      const fecha = new Date(iso);
      const esUltima = idx === arr.length - 1;
      return {
        etiqueta: esUltima ? 'Revisión actual' : `Revisión ${idx + 1}`,
        'fecha-hora': iso,
        revisiones: grupos[iso]
      };
    });
}
