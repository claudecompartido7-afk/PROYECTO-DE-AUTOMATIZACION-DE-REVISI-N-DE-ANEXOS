# ANEXO 1 (A1) — Inventario de Productos y Procesos
## Reglas de validación consolidadas — v3

> **Origen.** v1 = hoja `REGLAS DE AUTOMATIZACIÓN` (solo filas de Anexo 1).
> v2 = script `Anexo1_Auditoria.gs`. v3 = esta consolidación, verificada
> contra la estructura real del Anexo 1 el 2026-08-24.
>
> **Criterio de autoridad:** cuando la hoja de reglas y la hoja real se
> contradicen, manda la **hoja real**. La hoja de reglas v1 quedó desactualizada
> cuando el contenido del Anexo 2 se migró al Anexo 1.

---

## 0. Estructura real de cada pestaña

| Fila | Contenido |
|---|---|
| 1–2 | vacías / marco |
| 3 | Título combinado: `Facultad de <Nombre> - Anexo 1` |
| 4 | Encabezado nivel 1 (`FUENTE` abarca D y E) |
| 5 | Encabezado nivel 2 |
| 6+ | Datos |

**Mapa de columnas (VIGENTE):**

| Col | Encabezado | Contenido |
|---|---|---|
| B | PRODUCTOS | Código + denominación (procesos, subprocesos y productos) |
| C | TIPO DE PRODUCTO | `Final / Salida (...)` o `Parcial / Registro (...)` |
| D | ACCIÓN ESTRATÉGICA | `AE.##.##` / `AE ##.##` + texto |
| E | ACTIVIDAD OPERATIVA | Texto libre |
| F | CLASIFICACIÓN | Regulación · Servicio · Bien |
| G | ATRIBUTOS | Ente rector · Calidad |
| H | VARIABLES DE CALIDAD | 1 o más de las 5 variables |
| I | CRITERIOS DE VALIDACIÓN | 1 o más de los 5 criterios |

**Rango de análisis: B:I (8 columnas).**

---

## 1. Existencia de pestañas — *sin cambios*

Deben existir las 20 pestañas: FM, FDCP, FLCH, FFB, FO, FE, FQIQ, FMV, FCA,
FCB, FCC, FCE, FCF, FCM, FCCSS, FIGMMG, FII, FPSIC, FIEE, FISI.

**1.2 (NUEVA).** La pestaña se identifica por **coincidencia exacta de sigla**,
no por subcadena. `FM` ≠ `FMV`, `FCC` ≠ `FCCSS`, `Medicina` ≠ `Medicina Veterinaria`.

---

## 2. Jerarquía de la columna B — *REEMPLAZA a la regla 10.1 de v1*

Los tres niveles llevan código. Se distinguen por **profundidad numérica**:

| Nivel | Patrón | Ejemplo real |
|---|---|---|
| Nivel 0 — Macroproceso | `XX.##_F##` | `PE.02_F01 GESTIÓN DE LA CALIDAD Y MEJORA CONTINUA` |
| Nivel 1 — Proceso | `XX.##.##_F##` | `PE.01.02_F01 MODERNIZACIÓN DE LA FACULTAD` |
| **Producto** | `XX.##.##.##_F##` | `PE.01.01.01_F01 PLAN ESTRATÉGICO APROBADO` |

Prefijos válidos: `PE`, `PM`, `PS`. Separador `_` o `-`, `F` mayúscula o minúscula.

**Solo las filas de 4 segmentos se puntúan como producto.**

**2.4 Filas que NO son producto (se saltan sin puntuar):**
- Categorías raíz sin código: `PROCESOS ESTRATÉGICOS`, `PROCESOS MISIONALES`, `PROCESOS DE SOPORTE`
- Filas de Nivel 0 y Nivel 1
- **(NUEVA)** Cualquier fila cuya denominación coincida con una de las 16
  denominaciones de Nivel 0, **sin importar la profundidad de su código**.
  Sustituye a la lista fija `SUBPROCESOS_EXCLUIDOS`.

---

## 3. Cobertura de los 16 procesos Nivel 0 — *v1 regla 2.1, PENDIENTE de implementar*

| # | Código | Denominación |
|---|---|---|
| 1 | PE.01 | GESTIÓN ESTRATÉGICA |
| 2 | PE.02 | GESTIÓN DE LA CALIDAD Y MEJORA CONTINUA |
| 3 | PE.03 | GESTIÓN DE RELACIONES INTERINSTITUCIONALES |
| 4 | PM.01 | GESTIÓN DE LA FORMACIÓN ACADÉMICA |
| 5 | PM.02 | GESTIÓN DE LA INVESTIGACIÓN |
| 6 | PM.03 | GESTIÓN DE LA RESPONSABILIDAD Y VINCULACIÓN SOCIAL |
| 7 | PS.01 | GESTIÓN DE ADMISIÓN Y MATRÍCULA |
| 8 | PS.02 | GESTIÓN DOCUMENTAL |
| 9 | PS.03 | GESTIÓN DE BIENESTAR INTEGRAL |
| 10 | PS.04 | GESTIÓN DE RECURSOS ECONÓMICOS |
| 11 | PS.05 | GESTIÓN DE RECURSOS HUMANOS |
| 12 | PS.06 | GESTIÓN DE ABASTECIMIENTO Y SERVICIOS |
| 13 | PS.07 | GESTIÓN DE LA TECNOLOGÍA DE LA INFORMACIÓN |
| 14 | PS.08 | GESTIÓN DE ACTIVIDADES PRODUCTIVAS |
| 15 | PS.09 | GESTIÓN DE RECURSOS BIBLIOGRÁFICOS |
| 16 | PS.10 | GESTIÓN DE LA COMUNICACIÓN |

**3.2 (NUEVA — de las directrices del propio Anexo 1).**
`PE.03` y `PS.08` **no aplican a todas las facultades**. Su ausencia se reporta
como *No aplica*, nunca como incumplimiento.

Cada proceso Nivel 0 presente debe tener **al menos un producto** asociado.

---

## 4. Criterios puntuables por producto

8 criterios, 1 punto cada uno.

| # | Col | Criterio | Condición de aprobación |
|---|---|---|---|
| 1 | B | Código | Formato `XX.##.##.##_F##` |
| 2 | C | Tipo de producto | Contiene `Final` o `Parcial` |
| 3 | D | Acción estratégica | Ver 4.3 |
| 4 | E | Actividad operativa | Ver 4.4 |
| 5 | F | Clasificación | = `Regulación` \| `Servicio` \| `Bien` |
| 6 | G | Atributos | = `Ente rector` \| `Calidad` |
| 7 | H | Variables de calidad | Contiene ≥1 de las 5 variables |
| 8 | I | Criterios de validación | Contiene ≥1 de los 5 criterios |

**4.3 Acción estratégica (col D) — REGLA A DEFINIR.**
Hoy solo se aceptan `AE.##` y `AE ##`. En los datos reales conviven otras
nomenclaturas que el validador rechaza:

| Variante | Filas | ¿Válida? |
|---|---|---|
| `AE.##.##` / `AE ##.##` | 1 613 | Sí |
| *(vacía)* | 200 | No |
| `AEI.##.##` | 19 | **por decidir** |
| `AS.##.##` | 76 | **por decidir** |
| `OE.##` | 19 | **por decidir** |
| otras | 55 | **por decidir** |

**4.4 Actividad operativa (col E) — CORRECCIÓN.**
Debe rechazarse explícitamente el literal `NINGUNO` y variantes
(`N/A`, `NO APLICA`, `-`). Hoy 85 filas lo usan y **aprueban indebidamente**.

**Valores de referencia**

- Variables de calidad (H): Tiempo de atención · Cumplimiento de plazos · Claridad · Trato recibido · Facilidad de acceso
- Criterios de validación (I): a) solucionar un problema público · b) funciones sustantivas de la facultad · c) misión, estrategia, objetivos y metas institucionales · d) necesidades de las personas a quienes sirve la facultad · e) desarrollo y fortalecimiento de la facultad

---

## 5. Estados y avance — *sin cambios*

| Estado del producto | Condición |
|---|---|
| COMPLETO | 8/8 criterios |
| PENDIENTE | Solo col B; C–I vacías |
| PARCIAL | Cualquier otro caso |

`Avance % = (COMPLETOS + 0,5 × PARCIALES) / TOTAL`

| Estado de la facultad | Avance |
|---|---|
| COMPLETO | 100 % |
| AVANZADO | ≥ 75 % |
| EN DESARROLLO | ≥ 40 % |
| CRÍTICO | < 40 % |

---

## 6. Reglas de formato aún no automatizadas

De las directrices internas del Anexo 1, todavía sin implementar:

- Denominación de proceso en **mayúsculas**, fuente **Roboto**
- Celdas de columna B **sin combinar** (ni con otras columnas ni entre filas)
- Formato de letra y color replicado del modelo `PE.01`
