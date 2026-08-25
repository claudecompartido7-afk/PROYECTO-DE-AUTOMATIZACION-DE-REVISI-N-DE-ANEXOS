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
apps-script/Anexo1_Auditoria_v3.gs       Auditor del Anexo 1 — VERSIÓN VIGENTE
apps-script/Anexo1_Auditoria.gs          v2, conservada como referencia
reglas/ANEXO-1_reglas-v3.md              Reglas consolidadas y verificadas
docs/ANALISIS_reglas-vs-codigo.md        Comparación hoja de reglas vs. script
tests/validadores.test.js                Pruebas de los validadores (Node)
```

## Pruebas

```
node tests/validadores.test.js
```

81 comprobaciones sobre las funciones puras: validadores de las columnas C a I,
localización de pestañas con los 20 títulos reales, detección de procesos
registrados con código de producto y cobertura de los 16 procesos de Nivel 0.

## Cómo se ejecuta

1. Abrir el Anexo 1 → **Extensiones › Apps Script**
2. Pegar el contenido de `apps-script/Anexo1_Auditoria_v3.gs`
3. Ejecutar `ejecutarAuditoriaAnexo1` y autorizar los permisos
4. El resultado se escribe en el dashboard, pestañas
   `RESUMEN_EJECUTIVO_A1`, `DETALLADO_PRODUCTOS_A1` y `COBERTURA_PROCESOS_A1`

## Nota sobre las reglas

La hoja `REGLAS DE AUTOMATIZACIÓN` quedó desactualizada cuando el contenido del
Anexo 2 se migró al Anexo 1 (se insertó la columna `TIPO DE PRODUCTO` y todo el
mapa de columnas se corrió un lugar). **La especificación vigente es
`reglas/ANEXO-1_reglas-v3.md`**; el detalle está en `docs/ANALISIS_reglas-vs-codigo.md`.
