# Análisis: hoja de reglas (v1) vs. script de auditoría (v2)

**Alcance:** solo Anexo 1.
**Fecha:** 2026-08-24.
**Fuentes:** hoja `REGLAS DE AUTOMATIZACIÓN`; `ANEXO 1 - (A1)`; `Anexo1_Auditoria.gs`.

**Base empírica:** se procesó la exportación completa del Anexo 1
(3 673 filas, las 20 pestañas de facultad). Se detectaron **1 982 filas con
código de producto** (4 segmentos + `_F##`).

---

## Parte 1 — Qué mejoró el script respecto a la hoja de reglas

### M1. Corrigió un desplazamiento de una columna en las reglas 3.1 a 7.1 ← *la mejora principal*

La hoja de reglas describe un layout que ya no existe.

| Regla v1 dice | Encabezado real | Script v2 usa |
|---|---|---|
| C = Acción estratégica | C = **TIPO DE PRODUCTO** | C = Tipo |
| D = Actividad operativa | D = **ACCIÓN ESTRATÉGICA** | D = AE |
| E = Clasificación | E = **ACTIVIDAD OPERATIVA** | E = Act. operativa |
| F = Atributos | F = **CLASIFICACIÓN** | F = Clasificación |
| G = Variables de calidad | G = **ATRIBUTOS** | G = Atributos |
| H = Criterios de validación | H = **VARIABLES DE CALIDAD** | H = Calidad |
| — | I = **CRITERIOS DE VALIDACIÓN** | I = Impacto |

**Causa raíz.** Las directrices dentro del propio Anexo 1 lo explican: al
conectar las hojas a SIGPRO, el Anexo 2 dejó de llenarse porque exige celdas
combinadas, y su contenido —el tipo de producto— **se trasladó al Anexo 1**.
Eso insertó la columna C y corrió todo un lugar a la derecha.

**Consecuencia sobre la regla 8.1.** El rango deja de ser `B:H` (7 columnas) y
pasa a `B:I` (8 columnas). El script ya lee `getRange(fila, 2, n, 8)`.

> Si se hubiera implementado la hoja de reglas al pie de la letra, **las 6
> validaciones de contenido habrían leído la columna equivocada** y el informe
> completo sería inservible.

### M2. Invirtió la regla 10.1, que estaba al revés

| | Regla 10.1 (v1) | Realidad verificada |
|---|---|---|
| Proceso | `PE.01_F01 GESTIÓN ESTRATÉGICA` | ✅ igual |
| Subproceso | *no contemplado* | `PE.01.02_F01 MODERNIZACIÓN DE LA FACULTAD` |
| Producto | «solo texto, **sin código ni _F**» | `PE.01.01.01_F01 PLAN ESTRATÉGICO APROBADO` |

La regla 10.1 declara que un producto no lleva código. En los datos reales
**todos** lo llevan, y la propia celda de directrices trae como ejemplo
`PE.01.01.01_F01 PLAN ESTRATÉGICO APROBADO`.

El script modela los **tres** niveles con regex por profundidad y exige el
sufijo `_F##`. Es lo correcto.

### M3. Añadió un criterio que la hoja no tenía para el Anexo 1

Validar `Final / Parcial` figura en la hoja **bajo Anexo 2**, no bajo Anexo 1.
Tras la migración a SIGPRO ese dato vive en el Anexo 1, columna C. El script lo
valida; la hoja de reglas nunca se actualizó.

### M4. Convirtió el formato del código en criterio puntuable

La hoja pide validar «de 3.1 a 7.1» → 6 comprobaciones.
El script puntúa 8: agrega el formato del código (M2) y el tipo Final/Parcial (M3).

### M5. Filtró las categorías raíz

`PROCESOS ESTRATÉGICOS` / `MISIONALES` / `DE SOPORTE` no llevan código y no son
productos. Sin este filtro aparecerían como productos con 0/8. La hoja no lo menciona.

---

## Parte 2 — Reglas de la hoja que el script todavía no cubre

### P1. Regla 2.1 — cobertura de los 16 procesos Nivel 0: **no implementada**

Nadie comprueba que los 16 procesos existan. La variable `procN0Actual` arranca
fija en `"PE.01 GESTIÓN ESTRATÉGICA"`, de modo que **los productos que aparezcan
antes del primer encabezado se atribuyen a PE.01 aunque no le correspondan**.

### P2. `PE.03` y `PS.08` no aplican a todas las facultades

Está en las directrices del Anexo 1, no en la hoja de reglas, y el script no lo
contempla. Sin esta excepción se penaliza a facultades que legítimamente no
ejecutan esos procesos.

### P3. Reglas de formato

Mayúsculas, fuente Roboto, celdas sin combinar, color heredado del modelo PE.01.
Ninguna está automatizada.

---

## Parte 3 — Defectos detectados en el script v2

### D1. `REGEX_AE` rechaza nomenclaturas que sí se usan · **114 filas (5,8 %)**

`/^\s*AE[\s\-\.]?\d+/i` acepta `AE.01` y `AE 01`, pero no:

| Variante | Filas |
|---|---|
| `AEI.##.##` | 19 |
| `AS.##.##` | 76 |
| `OE.##` | 19 |

Requiere decisión funcional: ¿son sinónimos válidos o son errores de registro?

### D2. `NINGUNO` aprueba como Actividad Operativa · **85 filas**

`colE.length > 2` deja pasar cualquier texto. Distribución real de la columna E:

| | Filas | % |
|---|---|---|
| Texto real | 921 | 46,5 % |
| Vacía | 976 | 49,2 % |
| `NINGUNO` (aprueba mal) | 85 | 4,3 % |

### D3. Colisión de siglas al localizar la pestaña · **riesgo de informe cruzado**

`nom.includes(sigla)` con `hojas.find` (primer match):

- `FM` ⊂ `FMV` → Medicina puede quedarse con la pestaña de Veterinaria
- `FCC` ⊂ `FCCSS` → Contables puede quedarse con la de Sociales
- `"Medicina"` ⊂ `"Medicina Veterinaria"` → misma colisión por nombre

Además, la pestaña capturada por error **no queda disponible** para su facultad
real, que se reportaría como `NO INICIADO`.

### D4. `SUBPROCESOS_EXCLUIDOS` es un parche de una sola facultad

Los 6 códigos aparecen **una vez cada uno** en todo el libro. Pero el problema
que intentan resolver es general: hay **38 filas** con código de producto cuya
denominación es en realidad un proceso Nivel 0. Ejemplos:

```
PE.01.01.12_F02 GESTIÓN DE CALIDAD Y MEJORA CONTINUA
PE.01.01.31_F02 GESTIÓN DE LA FORMACIÓN ACADÉMICA
PE.01.01.44_F02 GESTIÓN DE LA INVESTIGACIÓN
PE.01.01.88_F02 GESTIÓN DE RECURSOS BIBLIOGRAFICOS
PE.02.02.16_F01 GESTIÓN DE LA FORMACIÓN ACADÉMICA
```

La serie `PE.01.01.12` … `PE.01.01.88` son **los 16 procesos Nivel 0 numerados
como si fueran productos de PE.01.01**: una facultad aplanó toda la jerarquía.

**Regla general propuesta** (reemplaza la lista fija): si la denominación
coincide con una de las 16 de Nivel 0 → es proceso, sin importar la profundidad
del código.

Señal de apoyo: **194 filas** llevan en la columna C la nota
`(No combinar las celdas de los procesos ni de los sub porcesos)`, marcador
inequívoco de fila de proceso.

### D5. `SpreadsheetApp.getUi().alert()` rompe la ejecución programada

Sin interfaz (activador por tiempo o llamada desde otro script) lanza excepción
**después** de haber escrito el dashboard: el trabajo se completa pero la
ejecución se registra como fallida. Debe ir en `try/catch` o eliminarse.

---

## Resumen

| | Cantidad |
|---|---|
| Mejoras del script sobre la hoja de reglas | 5 |
| Reglas de la hoja aún no implementadas | 3 |
| Defectos detectados en el script | 5 |
| Filas afectadas por D1 + D2 + D4 | ~237 |

**Conclusión.** La hoja `REGLAS DE AUTOMATIZACIÓN` quedó desactualizada tras la
migración a SIGPRO y **no debe usarse como especificación**. El script v2 es la
referencia válida para la estructura; le faltan la regla 2.1, la excepción
PE.03/PS.08 y las 5 correcciones de la Parte 3.
