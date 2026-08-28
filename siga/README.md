# SIGA — Sistema Integral de Actas

Registro digital de actas de reunión de la OGPL — UNMSM.
Proyecto de Google Apps Script (Web App) + Google Sheets + Google Drive.

## Archivos

```
siga/Codigo.gs      Backend: autenticación, generación del PDF, dashboard
siga/Index.html     Frontend: login, formulario de acta, panel gerencial, admin
siga/Config.gs      Constante LOGO_UNMSM (logo institucional en Base64)
```

## Despliegue

1. Crear un proyecto en [script.google.com](https://script.google.com).
2. Crear los tres archivos con estos nombres exactos: `Codigo.gs`, `Config.gs`
   y `Index.html` (el `doGet` carga la plantilla por el nombre `Index`).
3. Ajustar en `Codigo.gs` las constantes `CONFIG.FOLDER_ID` (carpeta de Drive
   donde se guardan los PDF) y `CONFIG.SPREADSHEET_ID` (base de datos).
4. Ejecutar una vez `inicializarSistema()` — crea las hojas `Usuarios`,
   `Actas`, `Asistentes` y `Acuerdos` con sus encabezados.
5. Ejecutar una vez `crearUsuarioAdmin()` — crea `admin@unmsm.edu.pe` con
   contraseña `admin123`. **Cambiarla después del primer ingreso.**
6. Publicar como aplicación web (Implementar → Nueva implementación).

## Estructura de la base de datos

| Hoja | Columnas |
|---|---|
| Usuarios | Email, PasswordHash, Nombre, Rol, UnidadOficina, FechaRegistro |
| Actas | ID_Acta, Tema, Modalidad, Lugar, Fecha, HoraInicio, HoraFin, URL_PDF, RegistradoPor, Timestamp, CantidadAsistentes, CantidadFotos |
| Asistentes | ID_Acta, Nombres, Apellidos, Cargo, Unidad, TieneFirma, Timestamp |
| Acuerdos | ID_Acuerdo, ID_Acta, Acuerdo, Responsable, Plazo, UnidadPlazo, FechaLimite, Estado, FechaCumplimiento, DiasRestantes, Indicador, Timestamp |

## Codificación del acta

`Acta N° 001-2026-OR-OGPL/UNMSM`

El correlativo sale de `getLastRow()` de la hoja `Actas`, protegido con
`LockService` para evitar duplicados si dos usuarios guardan a la vez.

## Cálculo de plazos

`calcularFechaLimite()` soporta `horas`, `días hábiles` y `meses`.
En días hábiles salta sábados, domingos y los feriados de `FERIADOS_PERU`
(cargados para 2026).

## Fórmula del panel gerencial

```
% Cumplimiento = [(Cumplidos × 1) + (En Plazo × 0.75) + (Por Vencer × 0.5)] / Total × 100
```

## Pendientes conocidos

Estos puntos están presentes en el código tal como se guardó y conviene
resolverlos antes de poner el sistema en producción.

**Bloqueantes del Dashboard**

- `cargarDashboard()` hace `document.getElementById('dashboard-status')` y luego
  `status.innerText`, pero ese elemento no existe en el HTML → lanza
  `TypeError` y el panel no llega a cargar nunca.
- Lo mismo con `dashboard-resumen`, usado cuando no hay acuerdos.

**Funciones del backend que el frontend llama y no existen en `Codigo.gs`**

- `obtenerHistorialAsistentes()` — la usa `cargarDirectorio()` para llenar los
  `datalist` de nombres, apellidos, cargos y unidades.
- `marcarAcuerdoCumplido(idAcuerdo, token)` — la usa el botón «✓ Cumplido».
- `obtenerOficinas()` — la usa `cargarOficinasSelect()`, que además nunca se
  invoca, por lo que el filtro por oficina queda vacío.

**Menores**

- `registrarAsistente()` termina con `document.getElementById('directorio-select').value = ''`
  sobre un elemento inexistente → corta la limpieza del formulario.
- El bloque «Firma Digital» está duplicado en el HTML y deja un `<div>` sin cerrar.
- `chartCumpInstance` y `chartEstInstance` se declaran dos veces.
- El logo (`Config.gs`) es un marcador de posición; falta pegar el Base64 real.
