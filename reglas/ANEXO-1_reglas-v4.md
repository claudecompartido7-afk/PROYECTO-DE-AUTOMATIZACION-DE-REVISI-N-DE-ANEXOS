# ANEXO 1 (A1) — Inventario de Productos y Procesos
## Reglas de validación consolidadas — v4

> **Origen.** v1 = hoja `REGLAS DE AUTOMATIZACIÓN` (solo filas de Anexo 1).
> v2 = script `Anexo1_Auditoria.gs`. v3 = consolidación verificada contra la
> estructura real. **v4 = incorpora las contra observaciones del revisor**
> registradas en `COBERTURA_PROCESOS_A1` y `DETALLADO_PRODUCTOS_A1`.
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

## 2. Jerarquía de la columna B — *v4: la profundidad deja de ser fija*

Los tres niveles llevan código, pero **la profundidad no es la misma en todas
las facultades**: la FDCP llega a cinco niveles y la FO resuelve procesos en dos.
Fijar «producto = cuatro segmentos», como hacía la v3, marcaba como sin código
productos perfectamente codificados.

**2.1 Regla de clasificación (reemplaza a la de profundidad fija):**

> Un código es **PROCESO** si otro código de la misma hoja lo tiene como prefijo.
> Un código sin descendientes es un **PRODUCTO**, cualquiera sea su profundidad.
> Un código de un solo nivel (`PE.01`) es siempre proceso, aunque no tenga hijos.

Ejemplos verificados:

| Código | Tiene descendientes | Clasificación |
|---|---|---|
| `PM.01.01.01_F02 DISEÑO Y ACTUALIZACIÓN CURRICULAR` (FDCP) | sí (`PM.01.01.01.01`) | Proceso |
| `PM.01.01.01.01_F02 PLAN CURRICULAR DE PREGRADO` (FDCP) | no | **Producto** |
| `PE.01.02_F01 MODERNIZACIÓN DE LA FACULTAD` (FM) | sí (`PE.01.02.01`) | Proceso |
| `PE.01.01.01_F01 PLAN ESTRATÉGICO APROBADO` (FM) | no | **Producto** |
| `PM.02.01_F05 ARTÍCULOS CIENTÍFICOS PUBLICADOS` (FO) | no | **Producto** |

Esta regla sustituye además a la lista fija `SUBPROCESOS_EXCLUIDOS` y a la
exclusión que pedía la contra observación de la FDCP: los seis subprocesos de
Nivel 2 quedan clasificados como procesos porque tienen descendientes, sin
necesidad de enumerarlos.

**2.2 Formato del código.** Prefijos `PE`, `PM`, `PS`. El sufijo de formato se
acepta escrito de cuatro maneras, todas presentes en los datos: `_F04`, `-F04`,
`.F07` y `_04` (sin la F).

**2.3 Filas que NO son producto (se saltan sin puntuar):**
- Categorías raíz sin código: `PROCESOS ESTRATÉGICOS`, `MISIONALES`, `DE SOPORTE`
- Todo código con descendientes
- Todo código de un solo nivel
- Cualquier fila cuya denominación coincida con una de las 16 de Nivel 0

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

**3.2 (de las directrices del propio Anexo 1).**
`PE.03` y `PS.08` **no aplican a todas las facultades**. Su ausencia se reporta
como *No aplica*, nunca como incumplimiento.

**3.3 (NUEVA — v4). Un proceso de Nivel 0 se reconoce por dos vías, y basta una:**

1. **Por denominación**, aunque el código sea otro o esté mal.
2. **Por un código de un nivel embebido en cualquier posición de la celda**, no
   solo al principio.

Varias facultades arrastran dos códigos en la misma celda —el de la posición en
que quedó la fila y el que de verdad le corresponde—, de modo que leer solo el
primero dejaba el proceso invisible:

| Celda real | Proceso que la v3 no veía |
|---|---|
| `PM.03.19_F05 PS.01 GESTIÓN DE ADMISIÓN Y MATRÍCULA` (FO) | PS.01 |
| `PE.01.03.06_F04 PE.02_04 GESTIÓN DE LA CALIDAD Y MEJORA CONTINUA` (FFB) | PE.02 |
| `PM.01.04.07_F07 PM.02.F07 GESTIÓN DE LA INVESTIGACIÓN` (FQIQ) | PM.02 |
| `PS.09_F06 Gestión de Comunicación` (FE) | PS.10 |

Cuando el código y la denominación señalan procesos distintos, **manda la
denominación** y la discrepancia se reporta (ver §7).

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

**4.3 Acción estratégica (col D) — REGLA CERRADA.**

Formato exigido: **`AE` + numeración de dos niveles + descripción**.
Ejemplo canónico: `AE.02.01 Formación académica de calidad`.
Se aceptan como separador el punto, el espacio o el guion, y como separador
entre código y texto el espacio, los dos puntos o ninguno.

Los dos niveles son `AE.<objetivo>.<acción>`: el primero identifica el objetivo
estratégico del que deriva la acción y el segundo el correlativo de la acción.
Por eso `AE.02` es un registro incompleto — nombra el objetivo, no la acción.

**Siglas rechazadas.** Ninguna de estas es una forma válida de la acción
estratégica, y cada una falla por un motivo distinto:

| Sigla | Filas | Por qué es un error | Corrección |
|---|---|---|---|
| `AEI` | 19 | Sigla del PEI (*Acción Estratégica Institucional*). El Anexo 1 normaliza a `AE`. | **No basta con quitar la «I».** La numeración del PEI no coincide con la del Anexo: `AEI.04.02` = «Simplificación administrativa» mientras `AE 04.02` = «Infraestructura y equipamiento». Hay que ubicar la AE equivalente **por su descripción**. |
| `OE` | 19 | Nivel jerárquico equivocado: es un *Objetivo* Estratégico, no una *Acción*. El objetivo agrupa varias acciones. | Descender al nivel de acción: de `OE.02` → `AE.02.01` + descripción. |
| `AO` | 3 | Contenido en la columna equivocada: identifica una *Actividad Operativa*, que va en la **columna E**. | Trasladar el texto a E y registrar en D la AE de la que depende. |
| `AS` | 76 | Sigla no reconocida en el planeamiento institucional. Además vienen sin descripción, solo el código. | Reemplazar por la AE correspondiente en formato `AE.##.##` + texto. |
| `AM` | 20 | Igual que `AS`. | Igual que `AS`. |

**Otros incumplimientos de la columna D:**

| Caso | Filas | Motivo |
|---|---|---|
| Vacía | 200 | Todo producto se alinea a una AE. |
| Código sin descripción (`AE.04.02` a secas) | 512 | La regla 3.1 exige código **seguido del texto** de la acción. |
| Marcador de vacío (`NINGUNO`) | 5 | No es una acción estratégica. |

**4.4 Actividad operativa (col E) — v4: se admite `NINGUNO`.**

Contra observación del revisor: *«la regla dice que la columna E solo será texto,
por lo que no viola esa regla»*. Se acepta cualquier texto, incluidos los
marcadores de vacío. Sigue siendo incumplimiento:

- la celda **vacía**;
- un texto de dos caracteres o menos;
- una **Acción Estratégica** registrada aquí por error (corresponde a la columna D).

El criterio estricto de la v3 queda disponible en
`CONFIG_A1.RECHAZAR_NULOS_EN_E`, hoy en `false`.

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

## 6. Formato de los procesos — *NUEVA en v4*

**6.1 MAYÚSCULAS (a pedido del revisor).** La denominación de todo proceso
—Nivel 0 y subprocesos— debe escribirse íntegramente en mayúsculas.

Incumplen, entre otras: `PS.09_F06 Gestión de Comunicación` (FE),
`PE.02.01_F05 Aseguramiento de la Calidad` (FO),
`PM.01_F05 Gestión de la Formación Académica` (FO).

La observación indica el texto registrado y el texto corregido.

**6.2 Alcance.** Se evalúa sobre las filas de proceso, que no se puntúan como
productos. Por eso el resultado se publica en la hoja
`OBSERVACIONES_PROCESOS_A1`, no en `DETALLADO_PRODUCTOS_A1`.

**Aún sin automatizar** (requieren leer el formato de la celda, no su texto):
fuente Roboto, celdas de la columna B sin combinar, color heredado del modelo `PE.01`.

---

## 7. Integridad de la celda de la columna B — *NUEVA en v4*

**7.1 Un solo código por celda.** Se reporta la celda que arrastra dos o más
códigos, listándolos. 35 celdas lo incumplen.

**7.2 Coherencia código ↔ denominación.** Cuando el código nombra un proceso de
Nivel 0 y la denominación nombra otro, se reporta la discrepancia, se toma la
denominación y se pide corregir el código. Ejemplo: `PS.09_F06 Gestión de
Comunicación` —el código es el de Recursos Bibliográficos y el nombre el de
Comunicación—.

---

## 8. Preservación del trabajo del revisor — *NUEVA en v4*

Las columnas añadidas a mano a la derecha de las que genera el script
—`CONTRA OBSERVACIÓN` y cualquier otra— **se conservan entre corridas**.

Cada fila se reidentifica por una clave estable de contenido
(facultad + código + denominación) y, como respaldo, por facultad + número de
fila. Si el Anexo 1 se corrige y una fila cambia de código y de nombre a la vez,
su contra observación no puede reidentificarse y queda en blanco.
