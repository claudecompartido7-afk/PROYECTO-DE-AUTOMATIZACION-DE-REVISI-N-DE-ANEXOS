/**
 * Configuración de nombres de hojas origen para exportación.
 * Modifica los valores TODO con los nombres reales de tus pestañas.
 *
 * Se llama CONFIG_EXPORTACION y no CONFIG_HISTORIAL porque ese nombre pertenece
 * a `HistorialRevisiones.gs`: en Apps Script todos los archivos comparten un
 * único ámbito global y dos `const` iguales son un SyntaxError que impide
 * ejecutar cualquier función del proyecto.
 */
const CONFIG_EXPORTACION = {
  catalogoFacultades: 'TODO: nombre de la pestaña con N°/SIGLA/FACULTAD/CODIGO',
  resumenAnexo1: 'RESUMEN_EJECUTIVO_A1',
  detalleProductosAnexo1: 'DETALLADO_PRODUCTOS_A1',
  detalleProcesosAnexo1: 'OBSERVACIONES_DE_PROCESO_A1',
  resumenAnexo3: 'RESUMEN_EJECUTIVO_A3',
  detalleFichasAnexo3: 'RESUMEN_FICHAS_A3',
  indicadoresAnexo4: 'RESUMEN_INDICADORES',
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
  const hojaCatalogo = doc.getSheetByName(CONFIG_EXPORTACION.catalogoFacultades);
  const catalogo = hojaCatalogo
    ? hojaCatalogo.getDataRange().getValues().slice(1) // Saltar encabezados
    : [];

  // Leer Anexo 1
  const hojaResumenA1 = doc.getSheetByName(CONFIG_EXPORTACION.resumenAnexo1);
  const resumenA1 = hojaResumenA1
    ? hojaResumenA1.getDataRange().getValues().slice(1)
    : [];

  const hojaDetalleProductos = doc.getSheetByName(CONFIG_EXPORTACION.detalleProductosAnexo1);
  const detalleProductos = hojaDetalleProductos
    ? hojaDetalleProductos.getDataRange().getValues().slice(1)
    : [];

  const hojaDetalleProcesos = doc.getSheetByName(CONFIG_EXPORTACION.detalleProcesosAnexo1);
  const detalleProcesos = hojaDetalleProcesos
    ? hojaDetalleProcesos.getDataRange().getValues().slice(1)
    : [];

  // Leer Anexo 3 (si existen)
  const hojaResumenA3 = doc.getSheetByName(CONFIG_EXPORTACION.resumenAnexo3);
  const resumenA3 = hojaResumenA3
    ? hojaResumenA3.getDataRange().getValues().slice(1)
    : [];

  const hojaDetalleFichas = doc.getSheetByName(CONFIG_EXPORTACION.detalleFichasAnexo3);
  const detalleFichas = hojaDetalleFichas
    ? hojaDetalleFichas.getDataRange().getValues().slice(1)
    : [];

  // Leer Anexo 4
  const hojaIndicadores = doc.getSheetByName(CONFIG_EXPORTACION.indicadoresAnexo4);
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

/*
 * NOTA — funciones retiradas de este archivo.
 *
 * Aquí vivían `calcularPorcentajeGeneralAnexo1_`, `_Anexo3_` y `_Anexo4_`, con
 * índices de columna supuestos y marcados como TODO. No se usaban en esta
 * exportación, pero sí PISABAN a las de los auditores: Apps Script comparte un
 * ámbito global y, cuando dos archivos declaran la misma función, se queda con
 * la del que carga después —y "Exportar JSON" va después de "Anexo 1" y
 * "Anexo 3"—. Por eso el historial registraba porcentajes que no correspondían.
 *
 * Cada auditor calcula el suyo con sus propios datos:
 *   · Anexo 1 → `avanceGeneralAnexo1_()` en Anexo1_Auditoria_v17.gs
 *   · Anexo 3 → `calcularPorcentajeGeneralAnexo3_()` en Anexo3_Revision_v3.gs
 *   · Anexo 4 → `calcularPorcentajeGeneralAnexo4_()` en Anexo4_Revision_v1.gs
 */
