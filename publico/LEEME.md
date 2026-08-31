# Portada pública — edición y publicación

Esta carpeta contiene **solo lo que puede ver cualquiera**: cifras agregadas de
avance y enlaces a los documentos vigentes. No hay aquí hallazgos,
contradicciones, recomendaciones ni detalle por facultad, y no deben añadirse:
todo lo que esté en `index.html` es público desde el momento en que se sube.

## Archivos

```
editor.html    Editor con vista previa. Se abre en el navegador, sin instalar nada.
portada.js     Contenido base, generadores de las páginas y revisor previo.
index.html     La portada publicada. Se genera; no se edita a mano.
plan.html      El Plan de Gestión publicado. Se genera; no se edita a mano.
generar.js     Genera ambas páginas desde la línea de comandos.
```

## Las dos páginas

El editor tiene dos pestañas, una por página publicada:

- **Portada** (`index.html`) — cifras de avance y tarjetas de documentos.
- **Plan de Gestión** (`plan.html`) — el documento que se abre al pulsar la
  tarjeta «Plan de Gestión del Proyecto».

**Se publican siempre juntas**: la portada enlaza al plan y el plan vuelve a la
portada, así que subir una sola dejaría un enlace roto. Por eso el botón
descarga los dos archivos.

## Cómo editar la portada

1. Abrir `publico/editor.html` en el navegador (doble clic basta).
2. Editar los campos de la izquierda. La derecha muestra, en vivo, exactamente
   lo que se va a publicar.
3. Atender los reparos que aparecen arriba a la izquierda. **Al pulsar un
   reparo, el editor abre su sección y lleva el cursor al campo.**
4. Pulsar **Descargar las 2 páginas**.
5. Reemplazar `publico/index.html` y `publico/plan.html` con los archivos
   descargados y subir ambos.

El borrador se guarda solo en el navegador: se puede cerrar la pestaña y
continuar después. Nada viaja a ningún servidor.

## Editar el Plan de Gestión

En la pestaña **Plan de Gestión** se edita la cabecera del documento (título,
bajada, versión, quién lo aprueba) y sus apartados. Cada apartado admite tres
formas, y puede combinarlas:

- **Párrafos** — una línea en blanco separa un párrafo del siguiente.
- **Viñetas** — se añaden, se reordenan y se quitan una a una.
- **Tabla** — se edita como una rejilla, con botones para añadir o quitar filas
  y columnas. Lo que se deja vacío no se dibuja.

Los apartados se pueden añadir, reordenar y quitar; el índice lateral de la
página se rehace solo a partir de ellos.

## Volver a editar algo ya publicado

**Cargar index.html** reabre un archivo generado por este editor y recupera su
contenido para seguir trabajando. El contenido viaja incrustado en la propia
página como JSON inerte, así que el archivo publicado es siempre su propio
respaldo — no hace falta guardar el JSON por separado. Sirve cualquiera de las
dos páginas: ambas llevan el contenido completo.

## La revisión previa

Antes de permitir la descarga, el editor revisa los textos y señala:

| Gravedad | Qué busca |
|---|---|
| alta | Información de salud, DNI, teléfonos personales, alusiones a remuneraciones, enlaces que no sean `https://`, avance sin datos |
| media | Nombres de personas concretas, correos ajenos a `unmsm.edu.pe`, anotaciones de trabajo olvidadas (`BORRADOR`, `no publicar`), enlaces sin definir |

Los reparos graves piden confirmación expresa antes de descargar.

La regla de personas distingue el **cargo** del **nombre propio**: «Jefe de
OGPL» y «Jefa de Racionalización» no se marcan, porque son la forma
recomendada; «Jefe Juan Pérez» o «Dra. Ramírez» sí.

> Esta revisión nace de un caso real: una bitácora que mencionaba la
> hospitalización de dos jefaturas estuvo a punto de compartirse con las veinte
> facultades. **Es una ayuda, no un sustituto de leer la página antes de
> subirla.** Que no encuentre nada no significa que no haya nada.

## Desde la línea de comandos

```
node publico/generar.js                  # usa el contenido base
node publico/generar.js contenido.json   # usa un contenido guardado
```

Escribe `publico/index.html` e imprime los reparos. Termina con código de salida
1 si hay alguno de gravedad alta, de modo que sirve como control en un flujo
automático.

## Pruebas

```
node tests/portada.test.js
```

46 comprobaciones: ida y vuelta entre publicar y reabrir, detección de cada
patrón de riesgo, ausencia de falsos positivos sobre la redacción correcta,
escapado del contenido, coherencia de la barra de avance, y la estructura del
Plan de Gestión con sus párrafos, viñetas y tablas.

## Nota sobre el diseño

Las páginas publicadas son HTML y CSS: **no llevan JavaScript**. El único
`<script>` de cada archivo es el registro de contenido en JSON, que no se
ejecuta. Se sirven desde cualquier sitio estático y se imprimen correctamente
—el Plan oculta su índice lateral al imprimir y evita cortar un apartado entre
dos páginas—.

**Tampoco piden nada a ningún servidor ajeno**: ni fuentes, ni hojas de estilo,
ni imágenes externas. Un `<link>` a un servidor de tipografías bloquea el primer
pintado, y en una red institucional lenta o filtrada la página se quedaría en
blanco justo para quien tiene que leerla; además, un recurso de un tercero
registra a cada lector de un documento oficial. La tipografía es la del sistema
de cada lector, y el carácter se consigue con el peso y el espaciado.
