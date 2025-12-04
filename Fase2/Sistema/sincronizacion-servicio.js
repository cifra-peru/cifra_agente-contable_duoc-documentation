const GCSStorage = require('./gcs-storage');
const fs = require('fs');
const path = require('path');

// Configuración
const config = {
  projectId: 'pioneering-rex-471016-m3',
  bucketName: 'stage_cifra_agente-contabl',
  carpetaBucket: 'Extraccion_excel',
  carpetaLocal: 'C:\\Extraccion_excel',
  sdkPath: 'C:\\Users\\Usuario\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk',
  intervaloVerificacion: 10000, // Verificar cada 10 segundos
  intervaloDescarga: 5000 // Esperar 5 segundos antes de descargar
};

let storage = null;
let ultimaListaArchivos = new Set();
let ejecutando = false;

// Función para escribir logs
function escribirLog(mensaje) {
  const fecha = new Date().toISOString();
  const logMensaje = `[${fecha}] ${mensaje}\n`;
  const logFile = path.join(__dirname, 'sincronizacion.log');
  
  // Escribir en archivo de log
  fs.appendFileSync(logFile, logMensaje, 'utf8');
  
  // También mostrar en consola si está disponible
  console.log(mensaje);
}

/**
 * Obtiene la lista de archivos del bucket
 */
async function obtenerListaArchivosCloud() {
  try {
    const estructura = storage.listarContenidoBucket(null, config.carpetaBucket, { silencioso: true });
    if (!estructura) {
      return new Set();
    }
    
    const archivos = estructura.archivos
      .map(a => a.nombre)
      .filter(nombre => nombre && nombre.trim() !== '');
    
    return new Set(archivos);
  } catch (error) {
    escribirLog(`❌ Error al obtener lista de archivos: ${error.message}`);
    return new Set();
  }
}

/**
 * Obtiene la lista de archivos locales
 */
function obtenerListaArchivosLocal() {
  try {
    if (!fs.existsSync(config.carpetaLocal)) {
      fs.mkdirSync(config.carpetaLocal, { recursive: true });
      return new Set();
    }
    
    const archivos = fs.readdirSync(config.carpetaLocal)
      .filter(archivo => {
        const rutaCompleta = path.join(config.carpetaLocal, archivo);
        return fs.statSync(rutaCompleta).isFile();
      });
    
    return new Set(archivos);
  } catch (error) {
    escribirLog(`❌ Error al leer carpeta local: ${error.message}`);
    return new Set();
  }
}

/**
 * Descarga un archivo específico del cloud
 */
async function descargarArchivo(nombreArchivo) {
  try {
    const rutaCloud = `${config.carpetaBucket}/${nombreArchivo}`;
    const rutaLocal = path.join(config.carpetaLocal, nombreArchivo);
    
    escribirLog(`⬇️  Descargando: ${nombreArchivo}`);
    
    const exito = storage.descargarArchivo(rutaCloud, rutaLocal, null, { silencioso: true });
    
    if (exito) {
      escribirLog(`✅ Archivo descargado: ${nombreArchivo}`);
      return true;
    } else {
      escribirLog(`❌ Error al descargar: ${nombreArchivo}`);
      return false;
    }
  } catch (error) {
    escribirLog(`❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Elimina un archivo local
 */
function eliminarArchivoLocal(nombreArchivo) {
  try {
    const rutaLocal = path.join(config.carpetaLocal, nombreArchivo);
    
    if (fs.existsSync(rutaLocal)) {
      fs.unlinkSync(rutaLocal);
      escribirLog(`🗑️  Archivo eliminado localmente: ${nombreArchivo}`);
      return true;
    } else {
      escribirLog(`⚠️  Archivo no encontrado para eliminar: ${nombreArchivo}`);
      return false;
    }
  } catch (error) {
    escribirLog(`❌ Error al eliminar archivo ${nombreArchivo}: ${error.message}`);
    return false;
  }
}

/**
 * Sincroniza archivos (descarga nuevos y elimina los que ya no están en cloud)
 */
async function sincronizarArchivosNuevos() {
  if (ejecutando) {
    return;
  }
  
  ejecutando = true;
  
  try {
    const archivosCloud = await obtenerListaArchivosCloud();
    const archivosLocal = obtenerListaArchivosLocal();
    
    // Encontrar archivos nuevos (están en cloud pero no en local)
    const archivosNuevos = [...archivosCloud].filter(archivo => !archivosLocal.has(archivo));
    
    // Encontrar archivos eliminados (están en local pero ya no en cloud)
    const archivosEliminados = [...archivosLocal].filter(archivo => !archivosCloud.has(archivo));
    
    // Procesar archivos nuevos
    if (archivosNuevos.length > 0) {
      escribirLog(`🔍 ${archivosNuevos.length} archivo(s) nuevo(s) detectado(s)`);
      
      await new Promise(resolve => setTimeout(resolve, config.intervaloDescarga));
      
      for (const archivo of archivosNuevos) {
        await descargarArchivo(archivo);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Procesar archivos eliminados
    if (archivosEliminados.length > 0) {
      escribirLog(`🗑️  ${archivosEliminados.length} archivo(s) eliminado(s) en cloud, eliminando localmente...`);
      
      for (const archivo of archivosEliminados) {
        eliminarArchivoLocal(archivo);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      escribirLog(`✅ Archivos eliminados localmente`);
    }
    
    // Actualizar lista de referencia
    ultimaListaArchivos = new Set(archivosCloud);
    
    // Mostrar estado de sincronización
    if (archivosNuevos.length > 0 || archivosEliminados.length > 0) {
      escribirLog(`✅ Sincronización completada (${archivosCloud.size} archivo(s) en cloud)`);
    }
    
  } catch (error) {
    escribirLog(`❌ Error en sincronización: ${error.message}`);
  } finally {
    ejecutando = false;
  }
}

/**
 * Función principal
 */
async function iniciar() {
  escribirLog('🚀 Iniciando servicio de sincronización...');
  escribirLog(`📂 Carpeta local: ${config.carpetaLocal}`);
  escribirLog(`☁️  Carpeta cloud: gs://${config.bucketName}/${config.carpetaBucket}`);

  // Inicializar storage
  storage = new GCSStorage({
    projectId: config.projectId,
    bucketName: config.bucketName,
    sdkPath: config.sdkPath
  });

  const inicializado = await storage.inicializar();
  if (!inicializado) {
    escribirLog('❌ No se pudo inicializar la conexión');
    process.exit(1);
  }

  // Crear carpeta local si no existe
  if (!fs.existsSync(config.carpetaLocal)) {
    fs.mkdirSync(config.carpetaLocal, { recursive: true });
    escribirLog(`✅ Carpeta local creada: ${config.carpetaLocal}`);
  }

  // Sincronización inicial
  await sincronizarArchivosNuevos();

  // Sincronización periódica
  setInterval(async () => {
    await sincronizarArchivosNuevos();
  }, config.intervaloVerificacion);

  escribirLog('✅ Servicio de sincronización activo');
}

// Ejecutar
iniciar().catch(error => {
  escribirLog(`❌ Error fatal: ${error.message}`);
  process.exit(1);
});

