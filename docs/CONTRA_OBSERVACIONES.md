# Respuesta a las contra observaciones del revisor

Registradas en `COBERTURA_PROCESOS_A1` y `DETALLADO_PRODUCTOS_A1` del dashboard,
sobre la corrida de la v3. Se leyeron 44 contra observaciones: 13 en cobertura y
31 en detalle.

**Resultado: 42 aceptadas y aplicadas, 2 no confirmadas por los datos.**

---

## 1. «EL PRODUCTO CUMPLE EL CRITERIO DE LA CODIFICACIÓN» — 24 filas (FDCP)

**Aceptada.** La v3 fijaba el producto en cuatro segmentos, y la FDCP usa cinco:
`PM.01.01.01.01_F02 PLAN CURRICULAR DE PREGRADO`. Todos esos productos estaban
correctamente codificados y el script los reportaba como «sin código».

**Corrección.** La profundidad deja de ser fija. Un código con descendientes en
la misma hoja es proceso; uno sin descendientes es producto, tenga la
profundidad que tenga. Ver regla 2.1.

---

## 2. «ESTE NO ES UN PRODUCTO, ES UN SUBPROCESO DE NIVEL 2 […] AÑADE ESA EXCLUSIÓN» — FDCP

**Aceptada, y resuelta sin necesidad de una exclusión.** `PM.01.01.01_F02 DISEÑO
Y ACTUALIZACIÓN CURRICULAR` tiene descendientes (`PM.01.01.01.01`), de modo que
la misma regla 2.1 lo clasifica como proceso.

Esto elimina además la lista fija `SUBPROCESOS_EXCLUIDOS` de la v2, que solo
cubría seis códigos de una facultad. La regla general cubre los seis y cualquier
otro caso equivalente en las demás facultades.

---

## 3. «LA REGLA DICE QUE LA COLUMNA E SOLO SERÁ TEXTO, POR LO QUE NO VIOLA ESA REGLA» — 6 filas (FDCP)

**Aceptada.** La columna E admite `NINGUNO` y los demás marcadores de vacío.

**Alcance.** No afecta solo a esas 6 filas: **85 filas** del Anexo 1 usan
`NINGUNO` en la columna E y pasan de incumplimiento a válidas.

Siguen siendo incumplimiento la celda vacía (976 filas), un texto de dos
caracteres o menos, y una Acción Estratégica registrada aquí por error. El
criterio estricto queda disponible en `CONFIG_A1.RECHAZAR_NULOS_EN_E`.

---

## 4. «SÍ TIENE LA DENOMINACIÓN Y SÍ TIENE PRODUCTOS REGISTRADOS» — 13 procesos

**11 aceptadas.** La v3 solo reconocía un proceso de Nivel 0 por el código que
abría la celda. Estas facultades arrastran dos códigos en la misma celda, o
tienen la denominación correcta bajo un código equivocado:

| Facultad | Proceso | Celda real | Estado |
|---|---|---|---|
| FFB | PE.02 | `PE.01.03.06_F04 PE.02_04 GESTIÓN DE LA CALIDAD Y MEJORA CONTINUA` | resuelto |
| FO | PS.01…PS.07 | `PM.03.19_F05 PS.01 GESTIÓN DE ADMISIÓN Y MATRÍCULA` y análogas | resuelto |
| FE | PS.10 | `PS.09_F06 Gestión de Comunicación` | resuelto |
| FQIQ | PM.02 | `PM.01.04.07_F07 PM.02.F07 GESTIÓN DE LA INVESTIGACIÓN` | resuelto |

**Corrección.** Un proceso de Nivel 0 se reconoce por su denominación o por un
código de un nivel embebido en cualquier posición de la celda. Ver regla 3.3.

### 2 no confirmadas por los datos

| Contra observación | Qué muestra la hoja |
|---|---|
| **FFB PS.10** — se cita `PS.09_F04 GESTIÓN DE LA COMUNICACIÓN` | Esa fila no existe en el libro. La hoja de la FFB termina en `PS.04.02.05_F04 PLANILLAS DE RETRIBUCIONES ECONÓMICAS`; no hay ninguna fila con «BIBLIOGRÁFICOS» ni «COMUNICACIÓN». La cita coincide con la fila de la **FE**, que sí la tiene. |
| **FO PS.09 y PS.10** | La hoja de la FO termina en `PM.03.167_F05 INCIDENCIAS TECNOLÓGICAS REGISTRADAS Y ATENDIDAS`. El último proceso embebido es `PM.03.152_F05 PS.07 GESTIÓN DE LA TECNOLOGÍA DE LA INFORMACIÓN`. No hay PS.08, PS.09 ni PS.10. |

Ambos siguen reportándose como FALTANTE. Si la información está en otro archivo
o pestaña, indíquelo y se ajusta el alcance de la búsqueda.

---

## 5. «AÑADE LA REGLA QUE TODOS LOS PROCESOS DEBEN ESTAR EN MAYÚSCULA» — FE

**Aceptada e implementada** como regla 6.1. Se aplica a los procesos de Nivel 0
y a los subprocesos. La observación indica el texto registrado y el corregido.

Los resultados van a la hoja nueva `OBSERVACIONES_PROCESOS_A1`, porque las filas
de proceso no se puntúan como productos y no aparecen en el detallado.

---

## 6. Corrección no pedida, pero necesaria

La v3 hacía `clear()` sobre cada hoja del dashboard antes de reescribirla: **la
siguiente corrida habría borrado las 44 contra observaciones**.

La v4 lee las columnas añadidas a mano, reescribe la hoja y las repone,
reidentificando cada fila por facultad + código + denominación, con respaldo por
facultad + número de fila. Ver regla 8.
