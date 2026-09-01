/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  REVISIÓN DE INDICADORES — ANEXO 4
 *  Oficina de Racionalización — OGPL (UNMSM)
 *
 *  VERSIÓN 1 — integración con historial de revisiones
 *  ─────────────────────────────────────────────────────────────────────────────
 *   · Auditoría automática de indicadores del Anexo 4
 *   · Registro de cada revisión en HISTORIAL_REVISIONES
 *   · Exportación de datos a JSON sin limitación de 250 líneas
 *
 *  Uso
 *  ─────────────────────────────────────────────────────────────────────────────
 *   Extensiones › Apps Script sobre el propio Anexo 4, pegar este archivo y
 *   ejecutar `ejecutarRevisionAnexo4`. El contenido de esta función debe adaptarse
 *   a tu estructura específica de indicadores.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const CONFIG_A4 = {

  /* ── Entradas ─────────────────────────────────────────────────────────── */

  /**
   * Anexo 4 (Indicadores). Si el script está enlazado al propio Anexo 4
   * (Extensiones › Apps Script desde dentro del archivo) se usa el libro ACTIVO.
   */
  SOURCE_SHEET_ID:  'TODO: reemplaza con ID del Anexo 4',

  /**
   * Libro donde se escribe el reporte: `4_REVISIÓN_INTERNA DE_AVANCES_ACTIVIDADES`,
   * el mismo donde el auditor del Anexo 1 deja sus hojas `*_A1`.
   */
  DESTINO_SHEET_ID: '1oYBAHp-Bd0V8un5hUAWdK1jKbcbdsROH4IOyM0MAmFk',

  /* ── Salida ───────────────────────────────────────────────────────────── */

  HOJAS: {
    RESUMEN:    'RESUMEN_EJECUTIVO_A4',
    DETALLE:    'DETALLE_INDICADORES_A4',
  }
};

/**
 * Función principal de revisión del Anexo 4.
 * IMPORTANTE: Adapta esta función a tu estructura específica de indicadores.
 *
 * La estructura esperada es:
 *   1. Leer datos de indicadores del Anexo 4
 *   2. Procesar/validar según tus reglas
 *   3. Escribir resultados en el libro destino
 *   4. Llamar a registrarRevision() con el porcentaje calculado
 */
function ejecutarRevisionAnexo4() {
  // TODO: Reemplaza el contenido de esta función con tu lógica de auditoría

  // Ejemplo básico:
  const libro = SpreadsheetApp.openById(CONFIG_A4.SOURCE_SHEET_ID);
  const hoja = libro.getActiveSheet();
  const datos = hoja.getDataRange().getValues();

  // Aquí va tu lógica de validación y procesamiento
  // ...

  // Ejemplo: calcular porcentaje desde indicadores
  const indicadores = datos.slice(1);  // sin encabezados
  const porcentaje = calcularPorcentajeGeneralAnexo4_(indicadores);

  // Escribir resultados en el destino
  const ss = SpreadsheetApp.openById(CONFIG_A4.DESTINO_SHEET_ID);
  // escribirResultadoAnexo4_(ss, indicadores);  // Implementar según tu estructura

  // Registrar la revisión
  registrarRevision('Anexo 4', porcentaje);

  notificarA4_('Revisión del Anexo 4 completada. ' +
               'Porcentaje: ' + porcentaje + '%');

  return ss.getUrl();
}

/**
 * Calcula el porcentaje general del Anexo 4 desde los indicadores.
 * Cuenta indicadores aprobados sobre total.
 *
 * IMPORTANTE: Adapta esta función a tu estructura de indicadores.
 * La estructura por defecto asume que existe una columna de "Estado" o similar.
 *
 * @param {Array} indicadoresArray - Array de filas de indicadores (sin encabezados)
 * @return {number} Porcentaje de cumplimiento (0-100)
 */
function calcularPorcentajeGeneralAnexo4_(indicadoresArray) {
  if (!Array.isArray(indicadoresArray) || indicadoresArray.length === 0) return 0;

  let aprobados = 0;
  let total = indicadoresArray.length;

  indicadoresArray.forEach(function(fila) {
    // TODO: Ajusta según tu estructura. Ejemplo:
    // Si el estado está en la última columna y es "Aprobado":
    const estado = (fila[fila.length - 1] || '').toString().toLowerCase();
    if (estado.includes('aprobado') || estado.includes('conforme') || estado === '✓') {
      aprobados++;
    }
  });

  return total > 0
    ? Math.round((aprobados / total) * 1000) / 10
    : 0;
}

/**
 * Registra cada revisión del Anexo 4 en la hoja HISTORIAL_REVISIONES.
 * (Esta función está definida en HistorialRevisiones.gs)
 */
// function registrarRevision(anexo, porcentaje) { ... }

/** Aviso al usuario cuando hay interfaz; al registro cuando no la hay. */
function notificarA4_(mensaje) {
  try {
    SpreadsheetApp.getUi().alert(mensaje);
  } catch (e) {
    Logger.log(mensaje);   // ejecución desde el editor o por disparador
  }
}
