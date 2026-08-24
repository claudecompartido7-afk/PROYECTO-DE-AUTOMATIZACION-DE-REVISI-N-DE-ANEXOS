/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  AUDITORÍA AUTOMÁTICA Y CUANTIFICACIÓN COMPLETA — ANEXO 1
 *  Oficina de Racionalización - OGPL (UNMSM)
 *  VERSIÓN CORREGIDA:
 *   - El código de producto exige el formato exacto "PE.03.01.08_F02" (sufijo _F## obligatorio).
 *   - Se excluyen como "no producto" las categorías raíz (PROCESOS ESTRATÉGICOS / MISIONALES / DE SOPORTE).
 *   - Se excluyen explícitamente los subprocesos de Nivel 2 indicados, que tienen la misma
 *     profundidad numérica que un producto pero NO deben evaluarse como tal.
 *   - Se corrige bug: matchN2 (array completo) ya no se asigna a codigoProd/nombreProd;
 *     ahora se usan los grupos correctos matchN2[1] y matchN2[3].
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const CONFIG_A1 = {
  ID_ANEXO1: '1SUMuS32zUweN_o7WfdBhXq-ipvvaFXYTcxKF1hmhPww',
  ID_DASHBOARD: '1oYBAHp-Bd0V8un5hUAWdK1jKbcbdsROH4IOyM0MAmFk',

  FACULTADES: [
    { sigla: "FM", nombre: "Medicina" },
    { sigla: "FDCP", nombre: "Derecho" },
    { sigla: "FLCH", nombre: "Letras" },
    { sigla: "FFB", nombre: "Farmacia" },
    { sigla: "FO", nombre: "Odontología" },
    { sigla: "FE", nombre: "Educación" },
    { sigla: "FQIQ", nombre: "Química" },
    { sigla: "FMV", nombre: "Veterinaria" },
    { sigla: "FCA", nombre: "Administrativas" },
    { sigla: "FCB", nombre: "Biológicas" },
    { sigla: "FCC", nombre: "Contables" },
    { sigla: "FCE", nombre: "Económicas" },
    { sigla: "FCF", nombre: "Físicas" },
    { sigla: "FCM", nombre: "Matemáticas" },
    { sigla: "FCCSS", nombre: "Sociales" },
    { sigla: "FIGMMG", nombre: "Geológica" },
    { sigla: "FII", nombre: "Industrial" },
    { sigla: "FPSIC", nombre: "Psicología" },
    { sigla: "FIEE", nombre: "Electrónica" },
    { sigla: "FISI", nombre: "Sistemas" }
  ],

  TIPOS_ENTREGABLE: ["Regulación", "Servicio", "Bien"],
  ROLES_INSTITUCIONALES: ["Ente rector", "Calidad"],
  VARIABLES_CALIDAD: ["Tiempo de atención", "Cumplimiento de plazos", "Claridad", "Trato recibido", "Facilidad de acceso"],
  CRITERIOS_IMPACTO: [
    "solucionar un problema público",
    "funciones sustantivas",
    "misión, estrategia",
    "necesidades de las personas",
    "desarrollo y fortalecimiento"
  ],

  FILA_INICIO: 5,

  // ── Denominaciones raíz que NUNCA son productos y NUNCA llevan código ──
  CATEGORIAS_NO_PRODUCTO: [
    "PROCESOS ESTRATÉGICOS",
    "PROCESOS MISIONALES",
    "PROCESOS DE SOPORTE"
  ],

  // ── Subprocesos de Nivel 2 que, pese a tener la misma profundidad de código
  //    que un producto (XX.XX.XX_F##), NO deben evaluarse como producto ──
  SUBPROCESOS_EXCLUIDOS: [
    "PM.01.01.01_F02", // DISEÑO Y ACTUALIZACIÓN CURRICULAR
    "PM.01.01.02_F02", // REGULACIÓN ACADÉMICA
    "PM.01.01.03_F02", // DESARROLLO DE SÍLABOS
    "PM.01.02.01_F02", // GESTIÓN DE PLANIFICACIÓN Y ASIGNACIÓN DE LA LABOR DOCENTE
    "PM.01.02.02_F02", // GESTIÓN DEL DESARROLLO Y DESEMPEÑO DOCENTE
    "PM.01.02.03_F02"  // INCORPORACIÓN Y FORMALIZACIÓN DEL PERSONAL DOCENTE
  ],

  // Expresiones regulares precisas por nivel de jerarquía
  REGEX_NIVEL0: /^((PE|PM|PS)\.\d{2})(?:[_\-]?[Ff]\d+)?\s+(.+)$/i,
  REGEX_NIVEL1: /^((PE|PM|PS)\.\d{2}\.\d{2})(?:[_\-]?[Ff]\d+)?\s+(.+)$/i,

  // CORREGIDO: el sufijo _F## ahora es OBLIGATORIO (estructura exacta "PE.03.01.08_F02")
  REGEX_PRODUCTO_N2: /^((PE|PM|PS)\.\d{2}\.\d{2}\.\d{2}[_\-][Ff]\d{1,2})\s+(.+)$/i,

  REGEX_AE: /^\s*AE[\s\-\.]?\d+/i
};

// Normaliza texto: mayúsculas, sin tildes, sin espacios extra (para comparar encabezados de categoría)
function normalizarTexto_(txt) {
  return (txt || "")
    .toString()
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Normaliza un código de producto/subproceso para compararlo contra la lista de exclusión
function normalizarCodigo_(txt) {
  return (txt || "").toString().trim().toUpperCase().replace(/\s+/g, "");
}

// Precalcular listas normalizadas una sola vez
const CATEGORIAS_NO_PRODUCTO_NORM = CONFIG_A1.CATEGORIAS_NO_PRODUCTO.map(normalizarTexto_);
const SUBPROCESOS_EXCLUIDOS_NORM = CONFIG_A1.SUBPROCESOS_EXCLUIDOS.map(normalizarCodigo_);

function ejecutarAuditoriaAnexo1() {
  const ssA1 = SpreadsheetApp.openById(CONFIG_A1.ID_ANEXO1);
  const hojas = ssA1.getSheets();

  let listaResumen = [];
  let listaDetalle = [];

  CONFIG_A1.FACULTADES.forEach(fac => {
    // Buscar la pestaña correspondiente
    const hoja = hojas.find(h => {
      const nom = h.getName().toUpperCase();
      return nom.includes(fac.sigla.toUpperCase()) || nom.includes(fac.nombre.toUpperCase());
    });

    if (!hoja) {
      listaResumen.push([
        fac.sigla, fac.nombre, 0, 0, 0, 0, "0%", "NO INICIADO", "Pestaña no encontrada en Anexo 1"
      ]);
      return;
    }

    const resultado = procesarFacultad(hoja, fac.sigla, fac.nombre);
    listaResumen.push(resultado.resumenFila);
    listaDetalle = listaDetalle.concat(resultado.detalleFilas);
  });

  // Guardar en el Dashboard
  escribirEnDashboard(listaResumen, listaDetalle);
}

function procesarFacultad(hoja, sigla, nombreCompleto) {
  const ultimaFila = hoja.getLastRow();
  if (ultimaFila < CONFIG_A1.FILA_INICIO) {
    return {
      resumenFila: [sigla, nombreCompleto, 0, 0, 0, 0, "0%", "VACÍO", "Sin datos registrados"],
      detalleFilas: []
    };
  }

  const numFilas = ultimaFila - CONFIG_A1.FILA_INICIO + 1;
  const datos = hoja.getRange(CONFIG_A1.FILA_INICIO, 2, numFilas, 8).getValues(); // Cols B a I

  let productos = [];
  let procN0Actual = "PE.01 GESTIÓN ESTRATÉGICA";

  for (let i = 0; i < datos.length; i++) {
    const filaReal = i + CONFIG_A1.FILA_INICIO;
    const [colB, colC, colD, colE, colF, colG, colH, colI] = datos[i].map(c => c ? c.toString().trim() : "");

    if (!colB && !colC && !colD && !colE && !colF && !colG && !colH && !colI) continue;

    // ── PASO 1: ¿Es una categoría raíz (Procesos Estratégicos/Misionales/De Soporte)? ──
    // Estas filas nunca llevan código y nunca se evalúan como producto.
    const colBNorm = normalizarTexto_(colB);
    if (CATEGORIAS_NO_PRODUCTO_NORM.includes(colBNorm)) {
      continue;
    }

    // ── PASO 2: Detectar encabezados de Macroproceso (Nivel 0) o Proceso (Nivel 1) ──
    if (CONFIG_A1.REGEX_NIVEL0.test(colB) && !CONFIG_A1.REGEX_NIVEL1.test(colB) && !CONFIG_A1.REGEX_PRODUCTO_N2.test(colB)) {
      procN0Actual = colB;
      continue;
    }
    if (CONFIG_A1.REGEX_NIVEL1.test(colB) && !CONFIG_A1.REGEX_PRODUCTO_N2.test(colB)) {
      continue;
    }

    // ── PASO 3: ¿Coincide con el formato de código de producto (PE.XX.XX.XX_F##)? ──
    const matchN2 = colB.match(CONFIG_A1.REGEX_PRODUCTO_N2);

    let codigoProd = "(Sin Código)";
    let nombreProd = colB;

    if (matchN2) {
      const codigoNormalizado = normalizarCodigo_(matchN2[1]);

      // ── PASO 4: ¿Es uno de los subprocesos de Nivel 2 excluidos? ──
      // Tiene la misma profundidad de código que un producto, pero NO es un producto.
      if (SUBPROCESOS_EXCLUIDOS_NORM.includes(codigoNormalizado)) {
        continue;
      }

      // CORREGIDO: antes se asignaba el array completo (matchN2) en vez de los grupos.
      codigoProd = matchN2[1];
      nombreProd = matchN2[3];
    }

    let obs = [];
    let correctos = 0;
    const totalCriterios = 8;

    // 1. Col B: Código
    if (matchN2) correctos++;
    else obs.push("Falta código estándar (PE.XX.XX.XX_F##).");

    // 2. Col C: Tipo (Final / Parcial)
    if (colC && (colC.toLowerCase().includes("final") || colC.toLowerCase().includes("parcial"))) correctos++;
    else obs.push("Col C: Tipo no especifica Final o Parcial.");

    // 3. Col D: Acción Estratégica
    if (colD && CONFIG_A1.REGEX_AE.test(colD)) correctos++;
    else obs.push("Col D: AE no cumple formato (ej. AE 04.01).");

    // 4. Col E: Actividad Operativa
    if (colE && !CONFIG_A1.REGEX_AE.test(colE) && colE.length > 2) correctos++;
    else obs.push("Col E: Actividad Operativa vacía o inválida.");

    // 5. Col F: Clasificación
    if (colF && CONFIG_A1.TIPOS_ENTREGABLE.some(t => t.toLowerCase() === colF.toLowerCase())) correctos++;
    else obs.push("Col F: No es Regulación, Servicio o Bien.");

    // 6. Col G: Atributos
    if (colG && CONFIG_A1.ROLES_INSTITUCIONALES.some(r => r.toLowerCase() === colG.toLowerCase())) correctos++;
    else obs.push("Col G: No es Ente rector o Calidad.");

    // 7. Col H: Variables de Calidad
    if (colH && CONFIG_A1.VARIABLES_CALIDAD.some(v => colH.toLowerCase().includes(v.toLowerCase()))) correctos++;
    else obs.push("Col H: Sin variables de calidad válidas.");

    // 8. Col I: Criterios de Impacto
    if (colI && CONFIG_A1.CRITERIOS_IMPACTO.some(c => colI.toLowerCase().includes(c))) correctos++;
    else obs.push("Col I: Sin criterios de validación válidos.");

    // Clasificación del Estado
    let estado = "PARCIAL";
    const todoVacioExceptoB = !colC && !colD && !colE && !colF && !colG && !colH && !colI;

    if (correctos === totalCriterios) estado = "COMPLETO";
    else if (todoVacioExceptoB) estado = "PENDIENTE";
    else estado = "PARCIAL";

    let pct = Math.round((correctos / totalCriterios) * 100);

    productos.push({
      fila: [
        sigla, filaReal, procN0Actual, codigoProd, nombreProd, colC || "(Vacío)", estado, `${pct}%`, obs.length > 0 ? obs.join(" | ") : "Cumple al 100% con todos los criterios."
      ],
      estado: estado
    });
  }

  const total = productos.length;
  const completos = productos.filter(p => p.estado === "COMPLETO").length;
  const parciales = productos.filter(p => p.estado === "PARCIAL").length;
  const pendientes = productos.filter(p => p.estado === "PENDIENTE").length;

  let avancePct = total > 0 ? Math.round(((completos * 1.0 + parciales * 0.5) / total) * 100) : 0;
  let estadoGeneral = avancePct === 100 ? "COMPLETO" : (avancePct >= 75 ? "AVANZADO" : (avancePct >= 40 ? "EN DESARROLLO" : "CRÍTICO"));

  return {
    resumenFila: [
      sigla, nombreCompleto, total, completos, parciales, pendientes, `${avancePct}%`, estadoGeneral, `${completos} completos (100%), ${parciales} con observaciones, ${pendientes} pendientes.`
    ],
    detalleFilas: productos.map(p => p.fila)
  };
}

function escribirEnDashboard(filasResumen, filasDetalle) {
  const ssDash = SpreadsheetApp.openById(CONFIG_A1.ID_DASHBOARD);

  // 1. Escribir Resumen Ejecutivo
  let hojaResumen = ssDash.getSheetByName("RESUMEN_EJECUTIVO_A1");
  if (!hojaResumen) hojaResumen = ssDash.insertSheet("RESUMEN_EJECUTIVO_A1");
  hojaResumen.clear();

  const encResumen = [
    ["FACULTAD", "NOMBRE DE FACULTAD", "TOTAL PRODUCTOS", "COMPLETOS (100%)", "PARCIALES (CON OBS.)", "PENDIENTES (VACÍOS)", "AVANCE (%)", "ESTADO GENERAL", "DIAGNÓSTICO"]
  ];
  hojaResumen.getRange(1, 1, 1, 9).setValues(encResumen).setFontWeight("bold").setBackground("#1c4587").setFontColor("#ffffff");

  if (filasResumen.length > 0) {
    hojaResumen.getRange(2, 1, filasResumen.length, 9).setValues(filasResumen);

    // Colores de estado
    let colores = filasResumen.map(r => {
      let est = r[7];
      let col = "#ffffff";
      if (est === "COMPLETO") col = "#d9ead3"; // verde
      else if (est === "AVANZADO") col = "#cfe2f3"; // azul
      else if (est === "EN DESARROLLO") col = "#fff2cc"; // amarillo
      else col = "#fce5cd"; // naranja/rojo
      return Array(9).fill(col);
    });
    hojaResumen.getRange(2, 1, filasResumen.length, 9).setBackgrounds(colores);
  }
  hojaResumen.autoResizeColumns(1, 9);

  // 2. Escribir Detalle de Productos
  let hojaDetalle = ssDash.getSheetByName("DETALLADO_PRODUCTOS_A1");
  if (!hojaDetalle) hojaDetalle = ssDash.insertSheet("DETALLADO_PRODUCTOS_A1");
  hojaDetalle.clear();

  const encDetalle = [
    ["FACULTAD", "FILA", "PROCESO NIVEL 0", "CÓDIGO PRODUCTO", "NOMBRE PRODUCTO", "TIPO PRODUCTO", "ESTADO", "CUMPLIMIENTO (%)", "OBSERVACIONES DETALLADAS"]
  ];
  hojaDetalle.getRange(1, 1, 1, 9).setValues(encDetalle).setFontWeight("bold").setBackground("#0d3472").setFontColor("#ffffff");

  if (filasDetalle.length > 0) {
    hojaDetalle.getRange(2, 1, filasDetalle.length, 9).setValues(filasDetalle);

    let coloresDetalle = filasDetalle.map(f => {
      let est = f[6];
      let col = est === "COMPLETO" ? "#d9ead3" : (est === "PARCIAL" ? "#fff2cc" : "#fce5cd");
      return Array(9).fill(col);
    });
    hojaDetalle.getRange(2, 1, filasDetalle.length, 9).setBackgrounds(coloresDetalle);
  }
  hojaDetalle.autoResizeColumns(1, 9);

  SpreadsheetApp.getUi().alert(`Auditoría completada exitosamente. Se evaluaron ${filasDetalle.length} productos en las 20 facultades.`);
}
