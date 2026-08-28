// @ts-nocheck
/**
 * ============================================================
 * SIGA - Archivo de configuración global
 * Sistema Integral de Actas - OGPL UNMSM
 * ============================================================
 *
 * Contiene el logo institucional de la UNMSM codificado en Base64.
 * Se usa en Codigo.gs (generarActaPDF) para:
 *   1. La cabecera del PDF del acta.
 *   2. El sello de la Firma Digital Automática de cada asistente.
 *
 * ------------------------------------------------------------
 * ⚠️  PENDIENTE: PEGAR EL BASE64 REAL DEL LOGO
 * ------------------------------------------------------------
 * El valor de abajo es un PNG transparente de 1x1 px (marcador de
 * posición) para que el script no falle al ejecutarse.
 *
 * El logo original es un PNG de 960 x 1134 px cuyo Base64 ocupa
 * ~55 000 caracteres. Para restaurarlo:
 *
 *   1. Abre tu proyecto original de Apps Script.
 *   2. Copia el valor completo de LOGO_UNMSM (la cadena que empieza
 *      con "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA8AAAARu...").
 *   3. Reemplaza con él la cadena de la línea LOGO_UNMSM de abajo.
 *
 * Verificación rápida: la cadena correcta empieza por
 *   data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA8AAAARuCAYAAAAcZ16L
 * y termina por
 *   ...ojUbepj63eaif1e2XCiJgssM4kltJqAcuoDvOFtAyzXsB2xxDXjP1umV2VDidgQ==
 * ------------------------------------------------------------
 */

const LOGO_UNMSM = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
