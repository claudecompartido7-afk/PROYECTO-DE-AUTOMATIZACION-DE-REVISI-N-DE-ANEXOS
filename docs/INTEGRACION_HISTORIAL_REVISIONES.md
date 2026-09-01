# Integración de Historial de Revisiones y Exportación JSON

Este documento describe cómo integrar el historial automático de revisiones en los scripts de Apps Script para Anexo 1, Anexo 3 y Anexo 4.

## Archivos nuevos

### 1. `HistorialRevisiones.gs`

Módulo independiente que registra cada ejecución de auditoría. Proporciona:

- **`registrarRevision(anexo, porcentaje)`**: Guarda un registro en la hoja `HISTORIAL_REVISIONES`
  - `anexo`: string como 'Anexo 1', 'Anexo 3', 'Anexo 4'
  - `porcentaje`: número entre 0 y 100
  - Crea automáticamente la hoja `HISTORIAL_REVISIONES` en la primera llamada

- **`historialParaJSON()`**: Lee el historial completo y lo agrupa por timestamp
  - Retorna array de objetos con `etiqueta`, `fecha-hora` (ISO 8601), y array de `revisiones`
  - La última entrada recibe etiqueta 'Revisión actual'

### 2. `ExportarJSON.gs`

Exportador que bypass la limitación de 250 líneas de Google Drive. Proporciona:

- **`exportarDashboardJSON()`**: Lee el contenido completo de las hojas (sin truncamiento), empaqueta todo en un JSON y lo sube/sobrescribe en Google Drive
  - Lee: catálogo, resumen de Anexo 1/3/4, detalle de productos/procesos/fichas/indicadores, historial
  - Genera un archivo llamado `Dashboard_Datos.json` en la raíz de Drive
  - Devuelve el ID del archivo generado/actualizado

- **Funciones de cálculo ponderado**:
  - `calcularPorcentajeGeneralAnexo1_(resumenArray)`: suma conformes / suma total de todas las facultades
  - `calcularPorcentajeGeneralAnexo3_(resumenArray)`: adaptable a tu estructura
  - `calcularPorcentajeGeneralAnexo4_(indicadoresArray)`: cuenta aprobados / total de indicadores

- **`CONFIG_HISTORIAL`**: Objeto con nombres de hojas. **Debes rellenar los valores TODO**:
  ```javascript
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
  ```

## Anexo 1 (ya integrado)

El script `Anexo1_Auditoria_v6.gs` ya contiene:

1. Nueva función `calcularPorcentajeGeneralAnexo1_(resumenArray)` que calcula el porcentaje ponderado
2. Llamada a `registrarRevision('Anexo 1', porcentaje)` después de `escribirEnDashboard_()`

**Nada más que hacer aquí.**

## Anexo 3 V3 — Ya integrado en el repositorio

El script `Anexo3_Revision_v3.gs` ya contiene:

1. Nueva función `calcularPorcentajeGeneralAnexo3_(facultadesRevisadas)` que calcula el promedio simple de los avances por facultad
2. Llamada a `registrarRevision('Anexo 3', porcentaje)` después de `escribirResultado_()`

**Simplemente copia el contenido completo de `apps-script/Anexo3_Revision_v3.gs` a tu Apps Script del Anexo 3 y reemplaza la v2.**

## Anexo 3 V2 (antigua) — Referencia

Si aún usas la v2, sigue estos pasos manualmente en tu proyecto:

### Paso 1: Copiar ambos módulos

En tu Apps Script del Anexo 3, añade dos nuevos archivos ("+"):
1. Copia el contenido completo de `HistorialRevisiones.gs` de este repo
2. Copia el contenido completo de `ExportarJSON.gs` de este repo

### Paso 2: Rellenar CONFIG_HISTORIAL

En el archivo `ExportarJSON.gs`, reemplaza los valores TODO con los nombres reales de tus hojas:
- `catalogoFacultades`: La hoja que contiene el catálogo oficial (N°, SIGLA, FACULTAD, CODIGO)
- `resumenAnexo3`: Donde escribes el resumen ejecutivo del Anexo 3
- `detalleFichasAnexo3`: Donde escribes el detalle de fichas evaluadas

### Paso 3: Adaptarlocales de cálculo

La función `calcularPorcentajeGeneralAnexo3_()` incluye un TODO porque solo tú conoces la estructura exacta de tu resumen. Verifica estos índices:
```javascript
function calcularPorcentajeGeneralAnexo3_(resumenArray) {
  let totalConforme = 0;
  let totalFichas = 0;

  resumenArray.forEach(function(fila) {
    const conforme = Number(fila[2]) || 0;    // ← Ajusta según tu estructura
    const total = Number(fila[3]) || 0;       // ← Ajusta según tu estructura
    totalConforme += conforme;
    totalFichas += total;
  });

  return totalFichas > 0
    ? Math.round((totalConforme / totalFichas) * 1000) / 10
    : 0;
}
```

### Paso 4: Integrar registrarRevision

Encuentra la función que escribe el resumen del Anexo 3 (el equivalente a `escribirEnDashboard_` en Anexo 1). Después de que esa función termina, añade:

```javascript
registrarRevision('Anexo 3', calcularPorcentajeGeneralAnexo3_(resumen));
```

Donde `resumen` sea tu array de filas del resumen.

## Anexo 4 — Integración manual

Sigue el mismo patrón que Anexo 1 y Anexo 3:

1. Copia `HistorialRevisiones.gs` y `ExportarJSON.gs` a tu Apps Script del Anexo 4
2. Rellena `CONFIG_HISTORIAL` con tus nombres de hojas (especialmente `indicadoresAnexo4`)
3. Verifica/adapta `calcularPorcentajeGeneralAnexo4_()` para entender tu estructura de indicadores
   - Asume que los indicadores tienen una columna de estado ("Aprobado", "Pendiente", etc.)
   - Cuenta aprobados ÷ total
4. Encuentra dónde tu auditor escribe el resumen del Anexo 4
5. Llama a `registrarRevision('Anexo 4', calcularPorcentajeGeneralAnexo4_(indicadores))` después de esa escritura

## Ejecución

### Primera ejecución (autorizar permisos)

1. Abre el Apps Script editor
2. Selecciona la función `exportarDashboardJSON` en el dropdown
3. Haz clic en ▶ Ejecutar
4. Autoriza los permisos que pida (acceso a Google Drive)
5. Verifica en Logs que el archivo se creó/actualizó correctamente
   - Output esperado: `Archivo creado: Dashboard_Datos.json (ID: 1xyzABC...)`

### Ejecuciones posteriores

Cada vez que ejecutes un auditor (Anexo 1, 3 o 4):
1. Se llama automáticamente a `registrarRevision()` con el porcentaje actual
2. Se guarda un registro en la hoja `HISTORIAL_REVISIONES`

Para actualizar el JSON en Drive con todos los datos nuevos, ejecuta manualmente `exportarDashboardJSON()` desde el editor. (Opcional: puede programarse con un Trigger de tiempo.)

## Uso en el Dashboard

El dashboard (`publico/Dashboard.html` o similar) consumirá este JSON y:
- Mostrará el % actual de cada Anexo
- Mostrará el cambio en pp (puntos porcentuales) respecto a la revisión anterior
- Renderizará mini-barras que muestren la evolución histórica de cada anexo

## Verificación

Después de la primera ejecución completa (todos los auditors más `exportarDashboardJSON`):

1. Verifica que existe la hoja `HISTORIAL_REVISIONES` en tu hoja de cálculo
2. Verifica que existe el archivo `Dashboard_Datos.json` en Drive
3. Descarga el JSON y comprueba que contiene:
   - `generado`: timestamp ISO de la exportación
   - `catalogo`: lista de facultades
   - `resumenAnexo1`, `detalleProductos`, `detalleProcesos`: datos del Anexo 1
   - `resumenAnexo3`, `detalleFichas`: datos del Anexo 3 (si está configurado)
   - `indicadoresAnexo4`: datos del Anexo 4 (si está configurado)
   - `revisiones`: array de revisiones agrupadas por timestamp

## Notas

- La estructura de `CONFIG_HISTORIAL` es compartida entre Anexo 1, 3 y 4 porque pueden estar en el mismo Apps Script o en scripts separados
- Si Anexo 3 o 4 tienen su propio Apps Script (proyecto de Google distinto), cada uno debe tener su propia copia de `HistorialRevisiones.gs` y `ExportarJSON.gs`
- La función `calcularPorcentajeGeneralAnexo#_()` debe adaptarse a la estructura exacta de tus datos (índices de columnas)
- El JSON se sobrescribe completamente en cada ejecución de `exportarDashboardJSON()`, así que no hay riesgo de datos huérfanos
