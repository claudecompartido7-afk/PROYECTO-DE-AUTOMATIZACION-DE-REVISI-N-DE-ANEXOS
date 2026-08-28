# Automatización de revisión de anexos — OGPL / UNMSM

Auditoría automática de los anexos de inventario de productos y procesos de las
20 facultades, sobre Google Sheets + Google Apps Script.

## Estado

| Anexo | Estado |
|---|---|
| Anexo 1 — Inventario de productos y procesos | en desarrollo |
| Anexo 2 — (migrado al Anexo 1) | fuera de alcance |
| Anexo 3 — Ficha técnica | en desarrollo — 20 facultades |

## Contenido

```
apps-script/Anexo3_Revision_v2.gs        Revisión del Anexo 3 — VERSIÓN VIGENTE
apps-script/Anexo3_Revision.gs           v1 (piloto FDCP), conservada como referencia
apps-script/Anexo1_Auditoria_v6.gs       Auditor del Anexo 1 — VERSIÓN VIGENTE
apps-script/Anexo1_Auditoria_v5.gs       v5, conservada como referencia
apps-script/Anexo1_Auditoria_v4.gs       v4, conservada como referencia
apps-script/Anexo1_Auditoria_v3.gs       v3, conservada como referencia
apps-script/Anexo1_Auditoria.gs          v2, conservada como referencia
reglas/ANEXO-3_reglas-v2.md              Reglas vigentes del Anexo 3
reglas/ANEXO-3_reglas-v1.md              v1 (piloto FDCP), conservada como referencia
reglas/ANEXO-1_reglas-v6.md              Reglas vigentes
reglas/ANEXO-1_reglas-v5.md              Reglas previas
docs/ANALISIS_reglas-vs-codigo.md        Comparación hoja de reglas vs. script
docs/CONTRA_OBSERVACIONES.md             Respuesta a cada contra observación
tests/validadores.test.js                Pruebas de los validadores del Anexo 1 (Node)
tests/anexo3.test.js                     Pruebas de los validadores del Anexo 3 (Node)
```

## Pruebas

```
node tests/validadores.test.js
node tests/anexo3.test.js
```

Anexo 1: 218 comprobaciones sobre las funciones puras: validadores de las columnas C a I,
localización de pestañas con los 20 títulos reales, jerarquía de profundidad
variable, detección de procesos de Nivel 0 por código embebido o denominación,
regla de mayúsculas, catálogo oficial de facultades y formularios, puntuación de
las filas de proceso y preservación de las columnas del revisor.

Anexo 3: 246 comprobaciones sobre los validadores de codificación, la partición
de la pestaña en fichas técnicas, la excepción de las facultades de nivel 2, la
regla de fuente exigida, el registro maestro de códigos, el cotejo con el Anexo 1
la detección automática de las pestañas `F##_SIGLA`, el producto final
obligatorio, el emparejado de código y denominación por líneas, la coherencia fila por
fila de la descripción, los códigos duplicados, la clasificación en cuatro niveles, el
semáforo de avance por facultad y la ubicación (fila y celda) de cada campo.

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

## Anexo 3 — revisión de fichas técnicas

1. Abrir el Anexo 3 → **Extensiones › Apps Script**
2. Pegar el contenido de `apps-script/Anexo3_Revision_v2.gs`
3. Revisar el bloque `CONFIG_A3` del inicio (carpeta de salida y Anexo 1 para el
   cotejo). Las pestañas de facultad se detectan solas por su nombre
   `F##_SIGLA`; deje `SOURCE_TAB_NAME` vacío para revisarlas todas, o escriba
   siglas separadas por coma para revisar solo algunas. También puede
   configurarse desde una pestaña `CONFIG_A3` del propio Anexo 3: columna A =
   clave, columna B = valor.
4. Ejecutar `ejecutarRevisionAnexo3` y autorizar los permisos

Si alguna facultad no aparece en el reporte, ejecute `listarPestanasA3`: escribe
en el registro (Ver › Registro) cada pestaña y si se reconoce como facultad.
Casi siempre es que su nombre no sigue el formato `F##_SIGLA`.

En cada corrida se **crea** un Google Sheets nuevo dentro de la carpeta
`OUTPUT_FOLDER_ID`, con el nombre `Revision_Anexo3_TODAS_<fecha_hora>`, para no
pisar corridas anteriores. Trae cuatro hojas: `DETALLE_REVISION`,
`RESUMEN_FICHAS`, `RESUMEN_20_FACULTADES` y `REGISTRO_MAESTRO_CODIGOS`. Todas
abren con la sigla y el nombre de la facultad, en el orden F01 → F20.

Cada fila va pintada según su estado — **verde** correcta, **ámbar** incompleta o
por verificar, **rojo** con algo que corregir, **gris** campo opcional — y ese
mismo estado se escribe en la columna `ESTADO`, de modo que la hoja se lea igual
impresa en blanco y negro. El `DASHBOARD` cierra con la leyenda.

Los hallazgos se clasifican en cuatro niveles —**Correcto**, **Incompleto**,
**Observación** y **Crítico**— y el resumen de las 20 facultades lleva semáforo
de avance (95–100 verde, 80–94 ámbar, 60–79 naranja, 0–59 rojo). Una facultad
con hallazgos críticos no se considera satisfactoria por alto que sea su
porcentaje.

La FDCP trabaja procesos y productos de nivel 2: el nivel adicional de código se
admite como excepción y se anota, no se marca como error.

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
