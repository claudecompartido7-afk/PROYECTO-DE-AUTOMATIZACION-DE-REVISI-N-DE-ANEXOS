# Automatización de revisión de anexos — OGPL / UNMSM

Auditoría automática de los anexos de inventario de productos y procesos de las
20 facultades, sobre Google Sheets + Google Apps Script.

## Estado

| Anexo | Estado |
|---|---|
| Anexo 1 — Inventario de productos y procesos | en desarrollo |
| Anexo 2 — (migrado al Anexo 1) | fuera de alcance |
| Anexo 3 — Ficha técnica | pendiente |

## Contenido

```
apps-script/Anexo1_Auditoria_v6.gs              Auditor del Anexo 1 — VERSIÓN VIGENTE
apps-script/Anexo1_Auditoria_v5.gs              v5, conservada como referencia
apps-script/Anexo1_Auditoria_v4.gs              v4, conservada como referencia
apps-script/Anexo1_Auditoria_v3.gs              v3, conservada como referencia
apps-script/Anexo1_Auditoria.gs                 v2, conservada como referencia
apps-script/Anexo3_Revision_v3.gs               Auditor del Anexo 3 — VERSIÓN VIGENTE (con historial)
apps-script/HistorialRevisiones.gs              Registro de revisiones por anexo
apps-script/ExportarJSON.gs                     Exporta datos completos a Drive (bypass 250 líneas)
reglas/ANEXO-1_reglas-v6.md                     Reglas vigentes
reglas/ANEXO-1_reglas-v5.md                     Reglas previas
docs/ANALISIS_reglas-vs-codigo.md               Comparación hoja de reglas vs. script
docs/CONTRA_OBSERVACIONES.md                    Respuesta a cada contra observación
docs/INTEGRACION_HISTORIAL_REVISIONES.md        Guía de integración (Anexo 1/3/4)
tests/validadores.test.js                       Pruebas de los validadores (Node)
publico/editor.html                             Editor de la portada pública
publico/portada.js                              Contenido, generador y revisor previo
publico/index.html                              Portada publicada (se genera)
publico/plan.html                               Plan de Gestión publicado (se genera)
publico/LEEME.md                                Cómo editar y publicar
tests/portada.test.js                           Pruebas de la portada (Node)
```

## Portada pública

Lo que ven los jefes, los dueños de proceso y los decanos se edita en
`publico/editor.html`, que se abre en el navegador sin instalar nada: muestra en
vivo las páginas que se van a publicar y revisa los textos antes de dejar
descargarlas. Son dos, y se publican juntas: la portada (`index.html`) y el Plan
de Gestión del Proyecto (`plan.html`), que se abre desde ella. El detalle está
en [`publico/LEEME.md`](publico/LEEME.md).

En `publico/` va **solo contenido público** —cifras agregadas y enlaces a
documentos vigentes—. El diagnóstico interno no vive ahí y no debe añadirse.

## Pruebas

```
node tests/validadores.test.js
node tests/portada.test.js
```

218 comprobaciones sobre las funciones puras: validadores de las columnas C a I,
localización de pestañas con los 20 títulos reales, jerarquía de profundidad
variable, detección de procesos de Nivel 0 por código embebido o denominación,
regla de mayúsculas, catálogo oficial de facultades y formularios, puntuación de
las filas de proceso y preservación de las columnas del revisor.

## Cómo se ejecuta

1. Abrir el Anexo 1 → **Extensiones › Apps Script**
2. Pegar el contenido de `apps-script/Anexo1_Auditoria_v6.gs`
3. Ejecutar `ejecutarAuditoriaAnexo1` y autorizar los permisos
4. El resultado se escribe en el dashboard, pestañas
   `RESUMEN_EJECUTIVO_A1`, `DETALLADO_PRODUCTOS_A1` y
   `OBSERVACIONES_DE_PROCESO_A1`

La hoja `COBERTURA_PROCESOS_A1` se **renombra** a `OBSERVACIONES_DE_PROCESO_A1`
en la primera corrida de la v5; no se crea una hoja nueva, para que las contra
observaciones ya escritas viajen con ella.

## Historial de revisiones y exportación JSON

Los auditors de Anexo 1, 3 y 4 pueden registrar automáticamente cada ejecución
para rastrear la evolución del cumplimiento en el tiempo. Ver
[`docs/INTEGRACION_HISTORIAL_REVISIONES.md`](docs/INTEGRACION_HISTORIAL_REVISIONES.md)
para configurar y usar:

- **`HistorialRevisiones.gs`**: Registra cada revisión (fecha-hora, anexo, %)
- **`ExportarJSON.gs`**: Exporta datos completos a Drive, bypaseando la limitación
  de 250 líneas del conector de Google Drive

## Columna CONTRA OBSERVACIÓN

El revisor puede añadir columnas propias a la derecha de las que genera el
script. **Se conservan entre corridas**: antes de reescribir cada hoja, el
script las lee y las repone reidentificando la fila por su contenido. No hace
falta volver a escribirlas después de cada auditoría.

## Lectura del Anexo 1 desde fuera de Google

El conector de Google Drive corta cada pestaña en **250 filas**. Siete pestañas
superan ese límite (FDCP, FFB, FO, FQIQ, FCC, FCM, FPSIC), así que cualquier
análisis hecho sobre esa exportación da mínimos, no totales. Las cifras válidas
son las que produce el script al ejecutarse dentro de Google.

## Nota sobre las reglas

La hoja `REGLAS DE AUTOMATIZACIÓN` quedó desactualizada cuando el contenido del
Anexo 2 se migró al Anexo 1 (se insertó la columna `TIPO DE PRODUCTO` y todo el
mapa de columnas se corrió un lugar). **La especificación vigente es
`reglas/ANEXO-1_reglas-v3.md`**; el detalle está en `docs/ANALISIS_reglas-vs-codigo.md`.
