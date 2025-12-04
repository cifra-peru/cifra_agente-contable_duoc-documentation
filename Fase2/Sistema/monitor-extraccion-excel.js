const GCSStorage = require('./gcs-storage');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Configuración
const config = {
  projectId: 'pioneering-rex-471016-m3',
  bucketName: 'stage_cifra_agente-contabl',
  carpetaBucket: 'Extraccion_excel',
  carpetaLocal: 'C:\\Extraccion_excel',
  sdkPath: 'C:\\Users\\Usuario\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk',
  intervalo: 60000 // Sincronizar cada 60 segundos (1 minuto)
};

let storage = null;

/**
 * Inicializa el storage
 */
async function inicializar() {
  storage = new GCSStorage({
    projectId: config.projectId,
    bucketName: config.bucketName,
    sdkPath: config.sdkPath
  });

  const inicializado = await storage.inicializar();
  if (!inicializado) {
    console.error('❌ No se pudo inicializar la conexión');
    return false;
  }

  return true;
}

/**
 * Sincroniza la carpeta (descarga desde cloud)
 */
async function sincronizarDesdeCloud() {
  console.log(`\n[${new Date().toLocaleTimeString()}] 🔄 Sincronizando desde Cloud...`);
  
  try {
    const exito = storage.descargarCarpeta(
      config.carpetaBucket,
      config.carpetaLocal
    );

    if (exito) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Sincronización completada`);
      return true;
    } else {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Error en sincronización`);
      return false;
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error:`, error.message);
    return false;
  }
}

/**
 * Sube cambios locales al cloud
 */
async function sincronizarACloud() {
  console.log(`\n[${new Date().toLocaleTimeString()}] 🔄 Subiendo cambios al Cloud...`);
  
  try {
    const exito = storage.subirCarpeta(
      config.carpetaLocal,
      config.carpetaBucket
    );

    if (exito) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Subida completada`);
      return true;
    } else {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Error al subir`);
      return false;
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error:`, error.message);
    return false;
  }
}

/**
 * Sincronización bidireccional
 */
async function sincronizarBidireccional() {
  console.log(`\n[${new Date().toLocaleTimeString()}] 🔄 Sincronización bidireccional...`);
  
  try {
    const exito = storage.sincronizarCarpeta(
      config.carpetaLocal,
      config.carpetaBucket,
      null,
      { eliminar: false }
    );

    if (exito) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Sincronización completada`);
      return true;
    } else {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Error en sincronización`);
      return false;
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error:`, error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  const modo = process.argv[2] || 'monitor';

  console.log('='.repeat(70));
  console.log('📁 Monitor de Sincronización - Extraccion_excel');
  console.log('='.repeat(70));
  console.log(`\n📂 Carpeta local: ${config.carpetaLocal}`);
  console.log(`☁️  Carpeta cloud: gs://${config.bucketName}/${config.carpetaBucket}`);
  console.log(`\n💡 Presiona Ctrl+C para detener\n`);

  // Inicializar
  const inicializado = await inicializar();
  if (!inicializado) {
    process.exit(1);
  }

  switch (modo.toLowerCase()) {
    case 'monitor':
    case 'watch':
      // Modo monitor: sincroniza periódicamente desde cloud
      console.log(`🔄 Modo monitor activado (sincroniza cada ${config.intervalo / 1000} segundos)`);
      console.log('   Sincronizando desde Cloud Storage...\n');
      
      // Sincronizar inmediatamente
      await sincronizarDesdeCloud();
      
      // Sincronizar periódicamente
      setInterval(async () => {
        await sincronizarDesdeCloud();
      }, config.intervalo);
      break;

    case 'sync':
    case 'sincronizar':
      // Sincronización bidireccional única
      await sincronizarBidireccional();
      process.exit(0);
      break;

    case 'pull':
    case 'descargar':
      // Descargar desde cloud
      await sincronizarDesdeCloud();
      process.exit(0);
      break;

    case 'push':
    case 'subir':
      // Subir a cloud
      await sincronizarACloud();
      process.exit(0);
      break;

    default:
      console.log('Uso: node monitor-extraccion-excel.js [modo]');
      console.log('\nModos disponibles:');
      console.log('  monitor/watch  - Monitorea y sincroniza automáticamente desde cloud');
      console.log('  sync           - Sincronización bidireccional única');
      console.log('  pull/descargar - Descarga desde cloud');
      console.log('  push/subir     - Sube a cloud');
      process.exit(0);
  }
}

// Manejar cierre
process.on('SIGINT', () => {
  console.log('\n\n👋 Deteniendo monitor...');
  process.exit(0);
});

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

