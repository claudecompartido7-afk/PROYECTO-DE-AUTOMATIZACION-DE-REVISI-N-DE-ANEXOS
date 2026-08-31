# Portada pública — edición y publicación

Esta carpeta contiene **solo lo que puede ver cualquiera**: cifras agregadas de
avance y enlaces a los documentos vigentes. No hay aquí hallazgos,
contradicciones, recomendaciones ni detalle por facultad, y no deben añadirse:
todo lo que esté en `index.html` es público desde el momento en que se sube.

## Archivos

```
editor.html    Editor con vista previa. Se abre en el navegador, sin instalar nada.
portada.js     Contenido base, generador de la página y revisor previo a publicar.
index.html     La página publicada. Se genera; no se edita a mano.
generar.js     Genera index.html desde la línea de comandos.
```

## Cómo editar la portada

1. Abrir `publico/editor.html` en el navegador (doble clic basta).
2. Editar los campos de la izquierda. La derecha muestra, en vivo, exactamente
   lo que se va a publicar.
3. Atender los reparos que aparecen arriba a la izquierda. **Al pulsar un
   reparo, el editor abre su sección y lleva el cursor al campo.**
4. Pulsar **Descargar index.html**.
5. Reemplazar `publico/index.html` con el archivo descargado y subirlo.

El borrador se guarda solo en el navegador: se puede cerrar la pestaña y
continuar después. Nada viaja a ningún servidor.

## Volver a editar algo ya publicado

**Cargar index.html** reabre un archivo generado por este editor y recupera su
contenido para seguir trabajando. El contenido viaja incrustado en la propia
página como JSON inerte, así que el archivo publicado es siempre su propio
respaldo — no hace falta guardar el JSON por separado.

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

29 comprobaciones: ida y vuelta entre publicar y reabrir, detección de cada
patrón de riesgo, ausencia de falsos positivos sobre la redacción correcta,
escapado del contenido y coherencia de la barra de avance.

## Nota sobre el diseño

La página publicada es HTML y CSS: **no lleva JavaScript**. El único `<script>`
del archivo es el registro de contenido en JSON, que no se ejecuta. Se puede
servir desde cualquier sitio estático y se imprime correctamente.
