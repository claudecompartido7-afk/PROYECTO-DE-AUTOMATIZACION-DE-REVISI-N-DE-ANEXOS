# ANEXO 1 (A1) — Inventario de Productos y Procesos
## Reglas de validación consolidadas — v10

> **Origen.** v1 = hoja `REGLAS DE AUTOMATIZACIÓN` (solo filas de Anexo 1).
> v2 = script `Anexo1_Auditoria.gs`. v3 = consolidación verificada contra la
> estructura real. v4 = incorpora las contra observaciones del revisor. v5 =
> puntúa cada proceso en una fila. v6 = fija el catálogo oficial de facultades.
> v7 = unifica el vocabulario en CONFORME / OBSERVADO. **v8 = cambia el prefijo
> de las observaciones, separa los productos sin registro y abre el bloque de
> procesos en Nivel 0 y subprocesos.**
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

**2.3 Filas que NO son producto:**
- **Catalogaciones** (ver 2.5)
- Todo código con descendientes
- Todo código de un solo nivel
- Cualquier fila cuya denominación coincida con una de las 16 de Nivel 0
- **Denominaciones que abren nombrando un proceso** (ver 2.6)

Ninguna se descarta en silencio: todas se publican en
`OBSERVACIONES_DE_PROCESO_A1` con su observación.

**2.4 Cuando la celda arrastra varios códigos, manda el más superficial.**
Es el que indica el nivel real de la fila. En
`PE.02.01.05_F04 PE.02.01_04 ASEGURAMIENTO DE LA CALIDAD` (FFB) el código válido
es `PE.02.01`: un subproceso, no un producto de cuatro niveles.

**2.5 Catalogaciones — NUEVA en v9.**

`PROCESOS ESTRATÉGICOS`, `PROCESOS MISIONALES` y `PROCESOS DE SOPORTE` encabezan
cada grupo de procesos de Nivel 0. **No son productos ni procesos, y no les
corresponde codificación.**

Se reconocen aunque estén en singular (`PROCESO DE SOPORTE`) y aunque arrastren
un código o un número de formulario suelto (`F06 PROCESOS MISIONALES`). Cuando lo
llevan, la observación pide retirarlo:

> Columna B --> NO LE CORRESPONDE UNA CODIFICACIÓN. «PROCESOS DE SOPORTE» no es
> un producto ni un proceso: es la catalogación que encabeza un grupo de procesos
> de Nivel 0. Retire «PM.03.04.04_F04» y deje solo la denominación.

En el Anexo 1 hay **17 filas** en este caso, repartidas entre FFB, FO, FE, FQIQ,
FMV, FCB, FCE, FCF, FIGMMG y FII.

**2.6 Denominación que nombra un proceso — NUEVA en v9.**

Una denominación que abre con `PROCESO`, `SUBPROCESO` o `SUB PROCESO` **en
singular** nombra un proceso, aunque su código no tenga descendientes:

> Columna B --> CODIFICACIÓN A CORREGIR. «PROCESO DE COBERTURA Y SOPORTE
> PROTOCOLAR» nombra un proceso, no un producto, pero está codificado como
> producto («PS.10.03_F04»).

**Solo en singular.** El plural describe entregables: `PROCESOS DE ADQUISICIÓN
TRAMITADOS` es un producto real de la FO. Los plurales que sí son catalogación
los atrapa antes la regla 2.5.

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

## 5. Estados y avance — *reescrita en v7*

**5.1 Dos estados, los mismos para productos y para procesos.**

| Estado | Condición |
|---|---|
| CONFORME | cumple todos sus criterios (8 en productos, 5 en procesos) |
| OBSERVADO | cualquier otro caso |

Desaparecen `COMPLETO`, `PARCIAL` y `PENDIENTE`. Un producto **sin registrar**
—columnas C a I vacías— es OBSERVADO como cualquier otro; su condición se
declara en la observación:

> PRODUCTO SIN REGISTRAR: las columnas C a I están vacías. No hay nada que
> validar más allá del código.

Así el dato no se pierde al retirarse el estado PENDIENTE, y el resumen informa
cuántos observados están en esa situación.

Los procesos conservan además `FALTANTE` (Nivel 0 obligatorio ausente) y
`NO APLICA` (PE.03 y PS.08 ausentes), que no son estados de cumplimiento sino de
existencia.

**5.2 El avance se mide sobre criterios cumplidos, no sobre estados.**

```
Avance % = Σ criterios cumplidos / (nº de filas × criterios por fila)
```

Productos sobre 8 criterios, procesos sobre 5. La fórmula anterior repartía
medio punto a cada parcial; con dos estados eso daría lo mismo a un producto al
que le falta un criterio que a uno enteramente vacío. Medido sobre criterios,
un producto con 7 de 8 aporta 88 % y uno con 1 de 8 aporta 13 %.

**5.3 Estado general de la facultad**

| Estado | Avance |
|---|---|
| CONFORME | 100 % |
| AVANZADO | ≥ 75 % |
| EN DESARROLLO | ≥ 40 % |
| CRÍTICO | < 40 % |

---

## 5.bis Hoja `RESUMEN_EJECUTIVO_A1` — *reestructurada en v8*

| # | Columna | | # | Columna |
|---|---|---|---|---|
| 1 | FACULTAD | | 10 | TOTAL PROCESOS |
| 2 | NOMBRE | | 11 | PROCESOS NIVEL 0 CONFORMES |
| 3 | TOTAL PRODUCTOS | | 12 | PROCESOS NIVEL 0 OBSERVADOS |
| 4 | PRODUCTOS CONFORMES | | 13 | SUBPROCESOS CONFORMES |
| 5 | PRODUCTOS OBSERVADOS | | 14 | SUBPROCESOS OBSERVADOS |
| 6 | PRODUCTOS SIN REGISTRO | | 15 | AVANCE |
| 7 | AVANCE | | 16 | ESTADO GENERAL |
| 8 | ESTADO GENERAL | | 17 | DIAGNÓSTICO |
| 9 | DIAGNÓSTICO | | 18 | CÓDIGO DE LA HOJA |
| | | | 19 | CONTRAOBSERVACIÓN |

La última columna no la genera el script: la aporta el rescate de columnas
manuales (regla 8), con el nombre que el revisor le haya puesto.

**`PRODUCTOS SIN REGISTRO` es un desglose, no una tercera categoría.** Son los
productos observados que además tienen vacías las columnas C a I, de modo que
`TOTAL PRODUCTOS = CONFORMES + OBSERVADOS` sigue cumpliéndose y los sin registro
están contenidos en los observados.

`TOTAL PROCESOS` excluye los `NO APLICA`, que no se puntúan. Los `FALTANTE`
cuentan como observados de Nivel 0, y el diagnóstico los enumera aparte.

---

## 5.ter Leyenda al pie del resumen — *NUEVA en v8*

Debajo de la tabla, separada por una fila en blanco, la hoja cierra con cuatro
bloques de leyenda: **tipos de producto** (Final / Salida y Parcial / Registro,
con su destino en el Anexo 3), **estado de un producto o proceso**, **estado
general de la facultad** y **código de la hoja**.

La leyenda no interfiere con el rescate de columnas manuales: sus filas no
llevan nada en las columnas del revisor, y el rescate descarta toda fila cuyas
celdas manuales estén vacías.

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

**6.3 Sufijo de formulario `_F##`.** Todo código de una pestaña debe llevar el
sufijo del formulario asignado a su facultad.

Se admite escrito de cuatro maneras: `_F04`, `-F04`, `.F07` y `_04` (sin la F).
Tras un punto la `F` es obligatoria; sin ella, el último grupo del propio código
(`PS.10`) se confundiría con un sufijo.

**Relación oficial de la OGPL:**

| Formulario | Sigla | Facultad |
|---|---|---|
| F01 | FM | FACULTAD DE MEDICINA |
| F02 | FDCP | FACULTAD DE DERECHO Y CIENCIA POLÍTICA |
| F03 | FLCH | FACULTAD DE LETRAS Y CIENCIAS HUMANAS |
| F04 | FFB | FACULTAD DE FARMACIA Y BIOQUÍMICA |
| F05 | FO | FACULTAD DE ODONTOLOGÍA |
| F06 | FE | FACULTAD DE EDUCACIÓN |
| F07 | FQIQ | FACULTAD DE QUÍMICA E INGENIERÍA QUÍMICA |
| F08 | FMV | FACULTAD DE MEDICINA VETERINARIA |
| F09 | FCA | FACULTAD DE CIENCIAS ADMINISTRATIVAS |
| F10 | FCB | FACULTAD DE CIENCIAS BIOLÓGICAS |
| F11 | FCC | FACULTAD DE CIENCIAS CONTABLES |
| F12 | FCE | FACULTAD DE CIENCIAS ECONÓMICAS |
| F13 | FCF | FACULTAD DE CIENCIAS FÍSICAS |
| F14 | FCM | FACULTAD DE CIENCIAS MATEMÁTICAS |
| F15 | FCCSS | FACULTAD DE CIENCIAS SOCIALES |
| F16 | FIGMMG | FACULTAD DE INGENIERÍA GEOLÓGICA, MINERA, METALÚRGICA Y GEOGRÁFICA |
| F17 | FPSIC | FACULTAD DE PSICOLOGÍA |
| F18 | FIEE | FACULTAD DE INGENIERÍA ELECTRÓNICA Y ELÉCTRICA |
| F19 | FISI | FACULTAD DE INGENIERÍA DE SISTEMAS E INFORMÁTICA |
| F20 | FII | FACULTAD DE INGENIERÍA INDUSTRIAL |

**Fuente:** hoja `CODIFICACION_DE_LAS_FACULTADES` del dashboard, columna E.
Los 20 están declarados. La numeración **no sigue el orden de la relación**: la
FII es la 17.ª de la lista y lleva F20, mientras que F17, F18 y F19 van a las
tres últimas.

**6.4 Dos defectos distintos.**

| Defecto | Cómo se reporta |
|---|---|
| La pestaña entera usa el formulario de otra facultad | **Hallazgo de hoja**: una sola vez, en el `DIAGNÓSTICO` del resumen y en la columna `FORMULARIO` |
| Filas sueltas que se apartan del sufijo del resto de la hoja | **Observación por fila**, en el criterio 4 de la hoja de procesos |

La separación evita que una pestaña mal numerada de principio a fin genere
cientos de observaciones idénticas. La comparación por fila se hace siempre
contra el **dominante de la pestaña**; el formulario **oficial** solo interviene
en el hallazgo de hoja y en la corrección sugerida.

**6.5 Estado actual, medido sobre el Anexo 1.**

**Siete pestañas** llevan el formulario de otra facultad en toda la hoja:

| Facultad | Oficial | Usa | Observación |
|---|---|---|---|
| FCF | F13 | **F02** | usa el de FDCP |
| FCCSS | F15 | **F02** | usa el de FDCP |
| FISI | F19 | **F02** | usa el de FDCP |
| FIGMMG | F16 | **F06** | usa el de FE |
| FII | F20 | **F17** | usa el de FPSIC |
| FPSIC | F17 | **F18** | **intercambiado con FIEE** |
| FIEE | F18 | **F17** | **intercambiado con FPSIC** |

FPSIC y FIEE tienen el suyo cruzado entre sí. Y F17 lo usan a la vez las
pestañas de FIEE y de FII.

Filas sueltas fuera del dominante: FIGMMG 11, FCC 9, FE 8, FII 7, FCA 5, FFB 2,
FLCH 1, FCB 1, FCCSS 1.

**Aún sin automatizar** (requieren leer el formato de la celda, no su texto):
fuente Roboto, celdas de la columna B sin combinar, color heredado del modelo `PE.01`.

---

## 7. Integridad de la celda de la columna B — *NUEVA en v4*

**7.1 Un solo código por celda.** Se reporta la celda que arrastra dos o más
códigos.

**Cuando uno de los dos códigos es el correcto**, la observación lo dice
explícitamente en vez de limitarse a señalar que hay dos. Para
`PM.03.173_F05 PS.08 GESTIÓN DE ACTIVIDADES PRODUCTIVAS`:

> Col B — CODIFICACIÓN ERRÓNEA. El código que abre la celda, `PM.03.173_F05`, no
> corresponde a esta fila: la denominación «GESTIÓN DE ACTIVIDADES PRODUCTIVAS»
> es la del proceso de Nivel 0 PS.08, y ese código aparece también dentro de la
> misma celda («PS.08»). Debe quedar un único código: `PS.08_F05 GESTIÓN DE
> ACTIVIDADES PRODUCTIVAS`.

**7.3 Códigos de tres dígitos.** Los grupos numéricos admiten hasta tres cifras:
la FO llega a `PM.03.173`.

**7.2 Coherencia código ↔ denominación.** Cuando el código nombra un proceso de
Nivel 0 y la denominación nombra otro, se reporta la discrepancia, se toma la
denominación y se pide corregir el código. Ejemplo: `PS.09_F06 Gestión de
Comunicación` —el código es el de Recursos Bibliográficos y el nombre el de
Comunicación—.

---

## 8. Preservación del trabajo del revisor

Las columnas añadidas a mano a la derecha de las que genera el script
—`CONTRA OBSERVACIÓN` y cualquier otra— **se conservan entre corridas**.

Cada fila se reidentifica por una clave estable de contenido y, como respaldo,
por una clave alterna:

| Hoja | Clave | Respaldo |
|---|---|---|
| `DETALLADO_PRODUCTOS_A1` | facultad + código + nombre del producto | facultad + fila |
| `OBSERVACIONES_DE_PROCESO_A1` | facultad + código del proceso | facultad + denominación |
| `RESUMEN_EJECUTIVO_A1` | facultad | — |

Si el Anexo 1 se corrige y una fila cambia de código y de nombre a la vez, su
contra observación no puede reidentificarse y queda en blanco.

**8.1 (v5) Renombrado de hojas.** `COBERTURA_PROCESOS_A1` y
`OBSERVACIONES_PROCESOS_A1` se renombran a `OBSERVACIONES_DE_PROCESO_A1` en vez
de crearse de nuevo, para que las contra observaciones ya escritas viajen con la
hoja.

**8.2 (v5) Encabezados heredados.** Los encabezados que el script generó en
cualquier versión no se confunden con columnas del revisor, de modo que un
cambio de formato no resucita columnas obsoletas ni pierde las manuales.

---

## 9. Hoja `OBSERVACIONES_DE_PROCESO_A1` — *NUEVA en v5*

Reemplaza a `COBERTURA_PROCESOS_A1` y a `OBSERVACIONES_PROCESOS_A1`, que se
fusionan. **Una fila por proceso, puntuada**: los 16 de Nivel 0 de cada facultad
—estén o no— más cada subproceso registrado.

| Columna | Contenido |
|---|---|
| FACULTAD · CÓDIGO · PROCESO | identificación (el código de Nivel 0 es el del catálogo, para que la clave sea estable) |
| NIVEL | `Nivel 0` o `Subproceso` |
| EXIGENCIA | `Obligatorio`, `Opcional` o `—` |
| FILA | fila del Anexo 1, o `—` si no está registrado |
| ESTADO | `CONFORME` · `OBSERVADO` · `FALTANTE` · `NO APLICA` |
| CUMPLIMIENTO · CRITERIOS | porcentaje y `n/5` |
| OBSERVACIONES Y CORRECCIONES | el detalle, en la misma fila |

**Los 5 criterios:**

| # | Criterio |
|---|---|
| 1 | Registro — el proceso está registrado en la hoja |
| 2 | Código único en la celda |
| 3 | Código coherente con la denominación |
| 4 | Sufijo de formulario consistente con la pestaña |
| 5 | Denominación en MAYÚSCULAS |

**Estados:** `CONFORME` con 5/5; `OBSERVADO` por debajo; `FALTANTE` para un
Nivel 0 obligatorio ausente (0/5); `NO APLICA` para `PE.03` y `PS.08` ausentes,
que no se puntúan.


---

## 9.bis Redacción de las observaciones — *NUEVA en v8*

Toda observación se encabeza con la columna a la que se refiere, en el formato:

```
Columna B --> CODIFICACIÓN ERRÓNEA. El código que abre la celda...
Columna D --> Sigla incorrecta "AEI". La regla 3.1 del Anexo 1 normaliza...
```

Sustituye al formato `Col B — ...` de las versiones anteriores, a pedido del
revisor. Se aplica a las ocho columnas validadas.

**9.bis.0 Una observación por renglón — NUEVA en v10.**

Las observaciones de una misma fila se separan con un **salto de línea** dentro
de la celda, no con `||`. Se ordenan por columna:

1. la **columna B**, que es la que identifica la fila;
2. de la **C a la I**, en el orden de la hoja;
3. la **observación final**, cuando la hay.

Así se lee la fila 57 de la FCB:

```
Columna B --> La celda arrastra 2 códigos ("PE.03.01.05_F10", "PE.03.01.03"). Debe quedar un único código seguido de la denominación.
Columna C --> Tipo de producto vacío. Debe indicarse "Final / Salida" o "Parcial / Registro".
Columna D --> Acción Estratégica vacía. Debe registrarse el código AE.##.## seguido de la descripción de la acción.
Columna E --> Actividad Operativa vacía. Registre la actividad operativa del POI que ejecuta este producto.
Columna F --> Clasificación vacío. Valores admitidos: Regulación · Servicio · Bien.
Columna G --> Atributo institucional vacío. Valores admitidos: Ente rector · Calidad.
Columna H --> Variables de calidad sin registrar. Debe aparecer al menos uno de: …
Columna I --> Criterios de validación sin registrar. Debe aparecer al menos uno de: …
Observación final --> Para las columnas C a I utilice los desplegables de la hoja.
```

El salto solo se ve con el **ajuste de texto** activado, de modo que el script lo
aplica a todo el bloque de datos de las tres hojas y alinea las celdas arriba.
No basta con ajustar la última columna: el resumen lleva sus dos `DIAGNÓSTICO`
en medio de la tabla.

**9.bis.1 Cierre de los productos sin registro — NUEVA en v9.** Un producto con
las columnas C a I vacías recibe las ocho observaciones de columna y cierra con:

> Observación final --> Para las columnas C a I utilice los desplegables de la hoja.

El hecho de estar sin registro ya se contabiliza en la columna
`PRODUCTOS SIN REGISTRO` del resumen, de modo que la observación no necesita
encabezarlo.

---

## 10. Catálogo de facultades — *NUEVA en v6*

El nombre oficial es el que se publica en el resumen. **No siempre coincide con
el título de la pestaña**, así que la localización de la hoja sigue apoyándose en
la sigla y en alias que recogen el título tal como está escrito hoy:

| Sigla | Nombre oficial | Título de la pestaña |
|---|---|---|
| FIEE | FACULTAD DE INGENIERÍA ELECTRÓNICA Y ELÉCTRICA | «Ingeniería Eléctrica Electrónica» — palabras invertidas |
| FCA | FACULTAD DE CIENCIAS ADMINISTRATIVAS | «Ciencias Administrativa» — singular |
| FCF | FACULTAD DE CIENCIAS FÍSICAS | «Ciencias Fisicas» — sin tilde |
| FFB | FACULTAD DE FARMACIA Y BIOQUÍMICA | «Farmacia y Bioquimica» — sin tilde |
| FO | FACULTAD DE ODONTOLOGÍA | «Odontologia» — sin tilde |

Las tildes no son problema —la comparación las ignora—, pero el orden de las
palabras y el número gramatical sí, y por eso se conservan los alias.

La columna `FORMULARIO` del resumen muestra el número oficial y, entre
paréntesis, el que realmente usa la pestaña cuando no coinciden.
