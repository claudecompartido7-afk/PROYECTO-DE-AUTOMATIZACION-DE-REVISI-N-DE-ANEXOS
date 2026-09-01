/**
 * Configuración de nombres de hojas origen para exportación.
 * Modifica los valores TODO con los nombres reales de tus pestañas.
 */
const CONFIG_HISTORIAL = {
  catalogoFacultades: 'TODO: nombre de la pestaña con N°/SIGLA/FACULTAD/CODIGO',
  resumenAnexo1: 'RESUMEN_EJECUTIVO_A1',
  detalleProductosAnexo1: 'DETALLADO_PRODUCTOS_A1',
  detalleProcesosAnexo1: 'OBSERVACIONES_DE_PROCESO_A1',
  resumenAnexo3: 'TODO: nombre de la pestaña de resumen del Anexo 3',
  detalleFichasAnexo3: 'TODO: nombre de la pestaña de detalle de fichas',
  indicadoresAnexo4: 'TODO: nombre de la pestaña de indicadores',
  historialRevisiones: 'HISTORIAL_REVISIONES'
};

/**
 * Exporta todos los datos del dashboard como JSON y los carga en Google Drive.
 * Lee el contenido completo de cada hoja (sin la limitación de 250 líneas de exportación),
 * lo empaqueta en un único JSON y lo guarda/sobrescribe en Drive.
 *
 * Ejecución: Desde el editor de Apps Script, ejecutar exportarDashboardJSON()
 */
function exportarDashboardJSON() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const drive = DriveApp;

  // Leer catálogo de facultades
  const hojaCatalogo = doc.getSheetByName(CONFIG_HISTORIAL.catalogoFacultades);
  const catalogo = hojaCatalogo
    ? hojaCatalogo.getDataRange().getValues().slice(1) // Saltar encabezados
    : [];

  // Leer Anexo 1
  const hojaResumenA1 = doc.getSheetByName(CONFIG_HISTORIAL.resumenAnexo1);
  const resumenA1 = hojaResumenA1
    ? hojaResumenA1.getDataRange().getValues().slice(1)
    : [];

  const hojaDetalleProductos = doc.getSheetByName(CONFIG_HISTORIAL.detalleProductosAnexo1);
  const detalleProductos = hojaDetalleProductos
    ? hojaDetalleProductos.getDataRange().getValues().slice(1)
    : [];

  const hojaDetalleProcesos = doc.getSheetByName(CONFIG_HISTORIAL.detalleProcesosAnexo1);
  const detalleProcesos = hojaDetalleProcesos
    ? hojaDetalleProcesos.getDataRange().getValues().slice(1)
    : [];

  // Leer Anexo 3 (si existen)
  const hojaResumenA3 = doc.getSheetByName(CONFIG_HISTORIAL.resumenAnexo3);
  const resumenA3 = hojaResumenA3
    ? hojaResumenA3.getDataRange().getValues().slice(1)
    : [];

  const hojaDetalleFichas = doc.getSheetByName(CONFIG_HISTORIAL.detalleFichasAnexo3);
  const detalleFichas = hojaDetalleFichas
    ? hojaDetalleFichas.getDataRange().getValues().slice(1)
    : [];

  // Leer Anexo 4
  const hojaIndicadores = doc.getSheetByName(CONFIG_HISTORIAL.indicadoresAnexo4);
  const indicadores = hojaIndicadores
    ? hojaIndicadores.getDataRange().getValues().slice(1)
    : [];

  // Leer historial de revisiones
  const historial = historialParaJSON();

  // Empaquetar todo
  const exportacion = {
    generado: new Date().toISOString(),
    catalogo: catalogo,
    resumenAnexo1: resumenA1,
    detalleProductos: detalleProductos,
    detalleProcesos: detalleProcesos,
    resumenAnexo3: resumenA3,
    detalleFichas: detalleFichas,
    indicadoresAnexo4: indicadores,
    revisiones: historial
  };

  const jsonStr = JSON.stringify(exportacion, null, 2);
  const nombreArchivo = 'Dashboard_Datos_' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd_HHmmss') + '.json';

  // Buscar si ya existe un archivo con nombre similar (últimos 10 días)
  const carpetaRaiz = drive.getRootFolder();
  const archivosExistentes = carpetaRaiz.getFilesByName('Dashboard_Datos.json');

  if (archivosExistentes.hasNext()) {
    const archivo = archivosExistentes.next();
    archivo.setContent(jsonStr);
    Logger.log('Archivo actualizado: ' + archivo.getName() + ' (ID: ' + archivo.getId() + ')');
    return archivo.getId();
  } else {
    const archivo = carpetaRaiz.createFile('Dashboard_Datos.json', jsonStr);
    Logger.log('Archivo creado: ' + archivo.getName() + ' (ID: ' + archivo.getId() + ')');
    return archivo.getId();
  }
}

/**
 * Calcula el porcentaje general del Anexo 1 desde el resumen.
 * Suma todos los productos conformes de todas las facultades, suma el total,
 * y calcula la proporción.
 *
 * @param {Array} resumenArray - Array de filas del RESUMEN_EJECUTIVO_A1
 * @return {number} Porcentaje de cumplimiento (0-100)
 */
function calcularPorcentajeGeneralAnexo1_(resumenArray) {
  let totalConforme = 0;
  let totalProductos = 0;

  // Asumiendo que el formato es: [SIGLA, FACULTAD, CONFORME, TOTAL, PORCENTAJE, ...]
  // Ajusta los índices según tu estructura real
  resumenArray.forEach(function(fila) {
    const conforme = Number(fila[2]) || 0;
    const total = Number(fila[3]) || 0;
    totalConforme += conforme;
    totalProductos += total;
  });

  return totalProductos > 0
    ? Math.round((totalConforme / totalProductos) * 1000) / 10
    : 0;
}

/**
 * Calcula el porcentaje general del Anexo 3 desde el resumen.
 * Adaptable según la estructura de tu hoja de Anexo 3.
 *
 * @param {Array} resumenArray - Array de filas del resumen del Anexo 3
 * @return {number} Porcentaje de cumplimiento (0-100)
 */
function calcularPorcentajeGeneralAnexo3_(resumenArray) {
  // TODO: Adaptate esta función a la estructura real de tu Anexo 3
  let totalConforme = 0;
  let totalFichas = 0;

  resumenArray.forEach(function(fila) {
    const conforme = Number(fila[2]) || 0;
    const total = Number(fila[3]) || 0;
    totalConforme += conforme;
    totalFichas += total;
  });

  return totalFichas > 0
    ? Math.round((totalConforme / totalFichas) * 1000) / 10
    : 0;
}

/**
 * Calcula el porcentaje del Anexo 4 desde los indicadores.
 * Cuenta indicadores aprobados sobre total.
 *
 * @param {Array} indicadoresArray - Array de filas de indicadores
 * @return {number} Porcentaje de cumplimiento (0-100)
 */
function calcularPorcentajeGeneralAnexo4_(indicadoresArray) {
  // TODO: Adaptate según la estructura de tu hoja de indicadores
  // Asumiendo que una columna indica estado "Aprobado", "Pendiente", etc.
  let aprobados = 0;
  let total = indicadoresArray.length;

  indicadoresArray.forEach(function(fila) {
    const estado = (fila[fila.length - 1] || '').toLowerCase();
    if (estado.includes('aprobado')) {
      aprobados++;
    }
  });

  return total > 0
    ? Math.round((aprobados / total) * 1000) / 10
    : 0;
}
