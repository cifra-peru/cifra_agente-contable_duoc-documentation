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
  intervaloVerificacion: 10000, // Verificar cada 10 segundos (tiempo real)
  intervaloDescarga: 5000 // Esperar 5 segundos antes de descargar (para asegurar que el archivo esté completo)
};

let storage = null;
let ultimaListaArchivos = new Set();
let ejecutando = false;

/**
 * Obtiene la lista de archivos del bucket
 */
async function obtenerListaArchivosCloud() {
  try {
    // Usar gsutil directamente para obtener lista de archivos
    const { execSync } = require('child_process');
    const rutaGsutil = storage._obtenerRutaEjecutable('gsutil');
    const rutaCompleta = `gs://${config.bucketName}/${config.carpetaBucket}/`;
    
    // Ejecutar comando gsutil ls para listar archivos (sin recursivo para obtener solo archivos directos)
    const comando = `"${rutaGsutil}" ls "${rutaCompleta}"`;
    
    try {
      const resultado = execSync(comando, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });
      
      // Parsear resultado: cada línea es una ruta gs://
      const lineas = resultado.trim().split('\n').filter(l => l.trim());
      const archivos = [];
      
      lineas.forEach(linea => {
        // Ignorar carpetas (terminan con /)
        if (!linea.endsWith('/')) {
          // Extraer solo el nombre del archivo de la ruta completa
          const partes = linea.split('/');
          const nombreArchivo = partes[partes.length - 1];
          if (nombreArchivo && nombreArchivo.trim() !== '') {
            archivos.push(nombreArchivo);
          }
        }
      });
      
      return new Set(archivos);
    } catch (error) {
      // Si falla, intentar con el método anterior
      const estructura = storage.listarContenidoBucket(null, config.carpetaBucket, { silencioso: true });
      if (!estructura) {
        return new Set();
      }
      
      const archivos = estructura.archivos
        .map(a => a.nombre)
        .filter(nombre => nombre && nombre.trim() !== '');
      
      return new Set(archivos);
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error al obtener lista de archivos:`, error.message);
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
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error al leer carpeta local:`, error.message);
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
    
    console.log(`[${new Date().toLocaleTimeString()}] ⬇️  Descargando: ${nombreArchivo}`);
    
    // Usar el método de descarga directa
    const bucket = config.bucketName;
    const rutaCompleta = `gs://${bucket}/${rutaCloud}`;
    
    // Usar el método de descarga del storage (modo silencioso para evitar mensajes duplicados)
    const exito = storage.descargarArchivo(rutaCloud, rutaLocal, null, { silencioso: true });
    
    if (exito) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Archivo descargado: ${nombreArchivo}`);
      return true;
    } else {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Error al descargar: ${nombreArchivo}`);
      return false;
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error:`, error.message);
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
      console.log(`[${new Date().toLocaleTimeString()}] 🗑️  Archivo eliminado localmente: ${nombreArchivo}`);
      return true;
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] ⚠️  Archivo no encontrado para eliminar: ${nombreArchivo}`);
      return false;
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error al eliminar archivo ${nombreArchivo}:`, error.message);
    return false;
  }
}

/**
 * Sincroniza archivos (descarga nuevos y elimina los que ya no están en cloud)
 */
async function sincronizarArchivosNuevos() {
  if (ejecutando) {
    return; // Evitar ejecuciones simultáneas
  }
  
  ejecutando = true;
  
  try {
    // Obtener listas de archivos
    const archivosCloud = await obtenerListaArchivosCloud();
    const archivosLocal = obtenerListaArchivosLocal();
    
    // Encontrar archivos nuevos (están en cloud pero no en local)
    const archivosNuevos = [...archivosCloud].filter(archivo => !archivosLocal.has(archivo));
    
    // Encontrar archivos eliminados (están en local pero ya no en cloud)
    const archivosEliminados = [...archivosLocal].filter(archivo => !archivosCloud.has(archivo));
    
    // Procesar archivos nuevos
    if (archivosNuevos.length > 0) {
      console.log(`[${new Date().toLocaleTimeString()}] 🔍 ${archivosNuevos.length} archivo(s) nuevo(s) detectado(s)`);
      
      // Esperar un poco para asegurar que el archivo esté completamente subido
      await new Promise(resolve => setTimeout(resolve, config.intervaloDescarga));
      
      // Descargar cada archivo nuevo
      for (const archivo of archivosNuevos) {
        await descargarArchivo(archivo);
        // Pequeña pausa entre descargas
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Procesar archivos eliminados
    if (archivosEliminados.length > 0) {
      console.log(`[${new Date().toLocaleTimeString()}] 🗑️  ${archivosEliminados.length} archivo(s) eliminado(s) en cloud, eliminando localmente...`);
      
      for (const archivo of archivosEliminados) {
        eliminarArchivoLocal(archivo);
        // Pequeña pausa entre eliminaciones
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Archivos eliminados localmente`);
    }
    
    // Mostrar estado de sincronización
    if (archivosNuevos.length > 0 || archivosEliminados.length > 0) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Sincronización completada (${archivosCloud.size} archivo(s) en cloud)`);
    } else {
      // Solo mostrar mensaje cada 30 verificaciones (5 minutos) para no saturar
      const ahora = Date.now();
      if (!ultimaListaArchivos.size || (ahora % (config.intervaloVerificacion * 30) < config.intervaloVerificacion)) {
        console.log(`[${new Date().toLocaleTimeString()}] ✓ Todo sincronizado (${archivosCloud.size} archivo(s))`);
      }
    }
    
    // Actualizar lista de referencia
    ultimaListaArchivos = new Set(archivosCloud);
    
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error en sincronización:`, error.message);
  } finally {
    ejecutando = false;
  }
}

/**
 * Función principal
 */
async function iniciar() {
  console.log('='.repeat(70));
  console.log('🔄 SINCRONIZACIÓN EN TIEMPO REAL - Extraccion_excel');
  console.log('='.repeat(70));
  console.log(`\n📂 Carpeta local: ${config.carpetaLocal}`);
  console.log(`☁️  Carpeta cloud: gs://${config.bucketName}/${config.carpetaBucket}`);
  console.log(`⏱️  Intervalo de verificación: ${config.intervaloVerificacion / 1000} segundos`);
  console.log(`\n💡 Presiona Ctrl+C para detener\n`);

  // Inicializar storage
  storage = new GCSStorage({
    projectId: config.projectId,
    bucketName: config.bucketName,
    sdkPath: config.sdkPath
  });

  const inicializado = await storage.inicializar();
  if (!inicializado) {
    console.error('❌ No se pudo inicializar la conexión');
    process.exit(1);
  }

  // Crear carpeta local si no existe
  if (!fs.existsSync(config.carpetaLocal)) {
    fs.mkdirSync(config.carpetaLocal, { recursive: true });
    console.log(`✅ Carpeta local creada: ${config.carpetaLocal}\n`);
  }

  // Sincronización inicial
  console.log(`[${new Date().toLocaleTimeString()}] 🚀 Iniciando sincronización...\n`);
  await sincronizarArchivosNuevos();

  // Sincronización periódica
  const intervalo = setInterval(async () => {
    await sincronizarArchivosNuevos();
  }, config.intervaloVerificacion);

  // Manejar cierre
  process.on('SIGINT', () => {
    console.log('\n\n👋 Deteniendo sincronización en tiempo real...');
    clearInterval(intervalo);
    process.exit(0);
  });

  // Manejar errores no capturados
  process.on('unhandledRejection', (error) => {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error no manejado:`, error);
  });
}

// Ejecutar
iniciar().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

