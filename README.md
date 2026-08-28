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
apps-script/Anexo1_Auditoria_v8.gs       Auditor del Anexo 1 — VERSIÓN VIGENTE
apps-script/Anexo1_Auditoria_v7.gs       v7, conservada como referencia
apps-script/Anexo1_Auditoria_v6.gs       v6, conservada como referencia
apps-script/Anexo1_Auditoria_v5.gs       v5, conservada como referencia
apps-script/Anexo1_Auditoria_v4.gs       v4, conservada como referencia
apps-script/Anexo1_Auditoria_v3.gs       v3, conservada como referencia
apps-script/Anexo1_Auditoria.gs          v2, conservada como referencia
reglas/ANEXO-1_reglas-v8.md              Reglas vigentes
reglas/ANEXO-1_reglas-v7.md              Reglas previas
docs/ANALISIS_reglas-vs-codigo.md        Comparación hoja de reglas vs. script
docs/CONTRA_OBSERVACIONES.md             Respuesta a cada contra observación
tests/validadores.test.js                Pruebas de los validadores (Node)
dashboard/dashboard.html                 Dashboard visual de la última corrida
```

## Pruebas

```
node tests/validadores.test.js
```

276 comprobaciones sobre las funciones puras: validadores de las columnas C a I,
localización de pestañas con los 20 títulos reales, jerarquía de profundidad
variable, detección de procesos de Nivel 0 por código embebido o denominación,
regla de mayúsculas, catálogo oficial de facultades y formularios, puntuación de
las filas de proceso y preservación de las columnas del revisor.

## Cómo se ejecuta

1. Abrir el Anexo 1 → **Extensiones › Apps Script**
2. Pegar el contenido de `apps-script/Anexo1_Auditoria_v8.gs`
3. Ejecutar `ejecutarAuditoriaAnexo1` y autorizar los permisos
4. El resultado se escribe en el dashboard, pestañas
   `RESUMEN_EJECUTIVO_A1`, `DETALLADO_PRODUCTOS_A1` y
   `OBSERVACIONES_DE_PROCESO_A1`

La hoja `COBERTURA_PROCESOS_A1` se **renombra** a `OBSERVACIONES_DE_PROCESO_A1`
en la primera corrida de la v5; no se crea una hoja nueva, para que las contra
observaciones ya escritas viajen con ella.

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
