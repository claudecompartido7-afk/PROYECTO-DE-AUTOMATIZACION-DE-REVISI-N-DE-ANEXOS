# ANEXO 3 (A3) — Ficha Técnica de Producto y Proceso
## Reglas de validación — v1 (piloto FDCP)

> **Origen.** Directrices escritas en la propia hoja del Anexo 3 (bloque
> `DIRECTRICES`, 7 reglas obligatorias) + estructura real observada en la
> pestaña `2.FDCP`.
>
> **Criterio de autoridad:** cuando las directrices y la hoja real se
> contradicen, manda la **hoja real**; toda desviación queda anotada aquí.
>
> Implementación: `apps-script/Anexo3_Revision.gs`.
> Pruebas: `tests/anexo3.test.js`.

---

## 0. Estructura real de una ficha técnica

Cada pestaña de facultad encadena varias fichas técnicas, una debajo de otra.
Los bloques **no están en filas fijas**: cambian de ficha en ficha según cuántos
proveedores, entradas y procesos tenga. Por eso el script no usa desplazamientos
de fila, sino que **localiza cada sección por su etiqueta**.

| Bloque | Se reconoce por |
|---|---|
| Inicio de ficha | fila con la etiqueta `NOMBRE` y, a su derecha, `CODIGO` |
| Definición del Proceso | las etiquetas de sus 8 campos |
| Descripción del Proceso | `DESCRIPCIÓN DEL PROCESO` + fila `PROVEEDORES … BENEFICIARIOS` |
| Ejecución del Proceso | `EJECUCIÓN DEL PROCESO` |
| Formalización del Proceso | `FORMALIZACIÓN DEL PROCESO` + `UNIDAD / CARGO / NOMBRE Y APELLIDOS / FIRMA` |

**0.1** La primera ficha de la pestaña suele venir **sin** el título
`FICHA TÉCNICA DE PRODUCTO Y PROCESO`; por eso el inicio se detecta por la fila
`NOMBRE … CODIGO` y no por el título.

**0.2** El valor de un campo es la **primera celda no vacía a la derecha** de su
etiqueta, saltando las repeticiones de las celdas combinadas. Si lo que aparece
a la derecha es la etiqueta de otro campo, el campo se da por vacío.

**0.3** La etiqueta de recursos viene partida en dos celdas (`RECURSOS` |
`Humanos`) y con nombres que varían entre facultades (`Tecnológicos` /
`Equipos Tecnológicos`, `Informáticos` / `Sistemas Informáticos`). Se admiten
todas las formas.

---

## 1. Campos obligatorios

### 1.1 Definición del Proceso — 8 campos
Nombre · Responsable · Alcance · Vinculación · Objetivo · Código · Tipo · Versión.

El **Código** de esta sección lleva **un solo grupo numérico**
(`PE.XX_FYY` / `PM.XX_FYY` / `PS.XX_FYY`), sin el desagregado de salidas.
Esto vale también para las facultades de nivel 2: la excepción del punto 4 **no**
alcanza a este campo.

### 1.2 Descripción del Proceso — 5 columnas
Proveedores (B) · Entradas (D) · Procesos (F) · Salidas (H) · Beneficiarios (J).
Una columna sin ningún registro se reporta como campo faltante.

### 1.3 Ejecución del Proceso — 8 campos
Recursos Humanos · Recursos Físicos · Equipos Tecnológicos · Sistemas
Informáticos · Registros · Riesgos · Indicadores · Controles.

### 1.4 Formalización del Proceso — 2 bloques × 3 campos
`Elaboración` y `Revisión`, cada uno con Unidad, Cargo y Nombre y Apellido.

**La Firma es opcional**: va como fotografía dentro de la celda, de modo que una
celda vacía no se computa como campo faltante. Se informa en el detalle con el
estado `Opcional`.

---

## 2. Codificación por tipo de campo

| Campo | Estructura | Grupos numéricos |
|---|---|---|
| Proveedores (B) | `PR.XX_FYY` | — |
| Entradas (D) | `EN.XX_FYY` | — |
| Beneficiarios (J) | `BE.XX_FYY` | — |
| Definición › Código | `PE\|PM\|PS.XX_FYY` | 1 |
| Descripción › Procesos (F) | `PE\|PM\|PS.XX.YY_FYY` | 2 |
| Descripción › Salidas (H) | `PE\|PM\|PS.XX.YY.ZZ_FYY` | 3 |
| Ejecución › Registros | `PE\|PM\|PS.XX.YY.ZZ_FYY` | 3 |

**2.1** El correlativo `XX` admite de **uno a tres dígitos**: la FDCP llega a
`PR.150_F02` y `EN.238_F02`.

**2.2** El sufijo debe escribirse `_F##` y coincidir con el formulario oficial de
la facultad (`F02` para la FDCP). Un sufijo de otra facultad es error de
codificación, no de formato.

**2.3** Cuando la facultad no tiene formulario oficial declarado, se usa el
sufijo **dominante** de la pestaña.

---

## 3. Las 7 reglas obligatorias de consignación

| # | Regla | Cómo se verifica |
|---|---|---|
| 1 | Todo el contenido en la **fuente exigida** | Se comparan las fuentes de cada celda **con contenido** de la ficha; las celdas vacías no se observan |
| 2 | Proveedores con `PR.XX_FYY`, mismo código ante repetición | Validación de estructura + **Hoja 4** (registro maestro) |
| 3 | Entradas con `EN.XX_FYY`, mismo código ante repetición | Igual que la 2 |
| 4 | Procesos de nivel 1, correlativos, **uno por celda** | Una celda de la columna F con más de un código es hallazgo |
| 5 | Salidas: solo productos finales, con código y denominación del **Anexo 1** | **Hoja 5** (cotejo) |
| 6 | Beneficiarios con `BE.XX_FYY`, mismo código ante repetición | Igual que la 2 |
| 7 | Registros: solo productos parciales del **Anexo 1** | **Hoja 5**; lo que no figure allí se marca como pendiente de incorporar en ambos anexos |

**3.0 Fuente exigida (regla 1).** Las directrices escritas dentro de la propia
hoja del Anexo 3 dicen **Arial**; por indicación de la OGPL el script exige hoy
**Calibri**. La fuente se declara en `CONFIG_A3.FUENTE_OBLIGATORIA` y todos los
mensajes del reporte la nombran a partir de ahí, de modo que volver a Arial es
cambiar esa línea. Es un ajuste distinto de `CONFIG_A3.FUENTE_REPORTE`, que es
la fuente con la que se escribe el archivo de salida.

**3.1 Persistencia del código (reglas 2, 3 y 6).** Se detectan los dos defectos
simétricos: un mismo código usado con denominaciones distintas, y una misma
denominación registrada con códigos distintos.

**3.2 Cotejo con el Anexo 1 (reglas 5 y 7).** Se distinguen tres desenlaces:
`Sí`, `Sí (denominación distinta)` — con la denominación del Anexo 1
transcrita — y `No`. Si el Anexo 1 no se puede leer, se reporta
`No verificable` con el motivo; **nunca** se afirma que algo falta sin haberlo
comprobado.

---

## 4. Excepción de las facultades de nivel 2

La FDCP trabaja procesos y productos de **nivel 2**, así que su desagregado llega
a un grupo numérico más (`PM.XX.YY.ZZ.AA_FWW`) y en el encabezado de una ficha
pueden **convivir códigos de 2 y de 3 niveles**. Ocurre en una ficha concreta, no
en todas.

**4.1** Para las facultades listadas en `CONFIG_A3.FACULTADES_NIVEL_2` se admite
**un nivel adicional** en Procesos, Salidas y Registros. No es error: queda
anotado como excepción en el detalle y en el resumen.

**4.2** La excepción **no** alcanza al campo Código de la Definición (punto 1.1),
que sigue exigiendo un solo grupo numérico.

**4.3** Para el resto de facultades, ese nivel de más sí es error de codificación.

---

## 5. Cómputo del avance

- **Campos aplicables** = los de los puntos 1.1 a 1.4, **excluida la Firma**.
- **% de avance de la ficha** = campos completos / campos aplicables.
- **Ficha completa** = sin campos faltantes **y** sin errores de codificación.
- **% de avance global** = campos completos / campos aplicables de todas las
  fichas (promedio ponderado por número de campos, no media de porcentajes).

Los errores de codificación se cuentan **por código defectuoso**, no por celda:
una celda con dos códigos mal escritos suma dos.

---

## 6. Hojas del archivo de salida

| Hoja | Contenido |
|---|---|
| `DETALLE_REVISION` | Una fila por campo revisado: sección, campo, **N° de fila y celda de la hoja original**, código, ¿cumple estructura?, ¿campo completo?, observación |
| `RESUMEN_EJECUTIVO` | Una fila por ficha: ¿completa?, % de avance, campos faltantes, errores de codificación, correcciones sugeridas |
| `DASHBOARD` | Consolidado de la facultad: fichas revisadas, completas vs. incompletas, avance global, errores, secciones con más faltantes |
| `REGISTRO_MAESTRO_CODIGOS` | Proveedores, entradas y beneficiarios: código, denominación, fichas donde aparece, consistencia |
| `COTEJO_ANEXO1` | Salidas y registros contra el Anexo 1 |
| `SOLO_OBSERVACIONES` | Extracto de las tres hojas anteriores, solo filas con hallazgos |

**6.1 Ubicación de cada hallazgo.** El detalle indica dónde está el dato en la
pestaña revisada: `N° DE FILA` con la fila tal como se ve en la hoja (base 1) y
`CELDA` en notación A1 apuntando al **valor**, no a la etiqueta. Cuando el
hallazgo no cuelga de una celda concreta —una columna entera sin registros, una
sección que no aparece— se informa el **rango de filas** (`10–11`). La misma
ubicación se repite entre paréntesis en la lista de campos faltantes del resumen
ejecutivo, y en la columna `FILA / CELDA` de la hoja de observaciones.

Las celdas fuera de la fuente exigida se detallan **una por una**, con su celda exacta, hasta
el tope de `MAX_CELDAS_FUENTE` (25) por ficha; si hay más, se cierra con una fila
que informa el total.

**6.2 Semáforo.** Cada fila de las hojas 1, 2, 4, 5 y 6 se pinta según su
estado, y el mismo estado se escribe en texto en la columna `ESTADO`, para que
la hoja se lea igual impresa en blanco y negro o por quien no distinga los
colores.

| Color | Estado | Cuándo |
|---|---|---|
| Verde | `Correcto` | Campo completo y codificación correcta |
| Ámbar | `Incompleto` | Campo obligatorio vacío, o dato por verificar (denominación distinta en el Anexo 1, cotejo no verificable) |
| Rojo | `Con error` | Codificación fuera de estructura, o fuente distinta de la exigida |
| Gris | `Opcional` | La firma de Formalización |

Cuando una fila reúne más de una condición manda la más grave: rojo sobre
ámbar, y ámbar sobre verde. El `DASHBOARD` cierra con la leyenda de los cuatro
colores.

---

## 7. Generalización al resto de facultades

El código de facultad viaja en el sufijo `_F##` de cada código, así que la misma
lógica sirve para las 20 pestañas. Basta con cambiar `SOURCE_TAB_NAME`, o
ejecutar `revisarTodasLasFacultadesA3`, que recorre todas las pestañas que
correspondan a una facultad y deja un archivo por cada una. Lo único que hay que
declarar por facultad es si trabaja a nivel 2
(`CONFIG_A3.FACULTADES_NIVEL_2`).
