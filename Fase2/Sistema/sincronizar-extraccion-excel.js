const GCSStorage = require('./gcs-storage');
const path = require('path');
const os = require('os');

// Configuración
const config = {
  projectId: 'pioneering-rex-471016-m3',
  bucketName: 'stage_cifra_agente-contabl',
  carpetaBucket: 'Extraccion_excel',
  carpetaLocal: 'C:\\Extraccion_excel',
  sdkPath: 'C:\\Users\\Usuario\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk'
};

async function descargarDesdeCloud() {
  console.log('📥 Descargando carpeta Extraccion_excel desde Google Cloud Storage...\n');
  
  const storage = new GCSStorage({
    projectId: config.projectId,
    bucketName: config.bucketName,
    sdkPath: config.sdkPath
  });

  // Inicializar conexión
  const inicializado = await storage.inicializar();
  if (!inicializado) {
    console.error('❌ No se pudo inicializar la conexión');
    return false;
  }

  // Descargar carpeta
  const exito = storage.descargarCarpeta(
    config.carpetaBucket,
    config.carpetaLocal
  );

  if (exito) {
    console.log(`\n✅ Carpeta descargada exitosamente en: ${config.carpetaLocal}`);
    return true;
  } else {
    console.error('\n❌ Error al descargar la carpeta');
    return false;
  }
}

async function subirACloud() {
  console.log('📤 Subiendo carpeta Extraccion_excel a Google Cloud Storage...\n');
  
  const storage = new GCSStorage({
    projectId: config.projectId,
    bucketName: config.bucketName,
    sdkPath: config.sdkPath
  });

  // Inicializar conexión
  const inicializado = await storage.inicializar();
  if (!inicializado) {
    console.error('❌ No se pudo inicializar la conexión');
    return false;
  }

  // Subir carpeta
  const exito = storage.subirCarpeta(
    config.carpetaLocal,
    config.carpetaBucket
  );

  if (exito) {
    console.log(`\n✅ Carpeta subida exitosamente desde: ${config.carpetaLocal}`);
    return true;
  } else {
    console.error('\n❌ Error al subir la carpeta');
    return false;
  }
}

async function sincronizar() {
  console.log('🔄 Sincronizando carpeta Extraccion_excel...\n');
  
  const storage = new GCSStorage({
    projectId: config.projectId,
    bucketName: config.bucketName,
    sdkPath: config.sdkPath
  });

  // Inicializar conexión
  const inicializado = await storage.inicializar();
  if (!inicializado) {
    console.error('❌ No se pudo inicializar la conexión');
    return false;
  }

  // Sincronizar (bidireccional)
  const exito = storage.sincronizarCarpeta(
    config.carpetaLocal,
    config.carpetaBucket,
    null,
    { eliminar: false } // No eliminar archivos que no están en local
  );

  if (exito) {
    console.log(`\n✅ Sincronización completada`);
    console.log(`   Local: ${config.carpetaLocal}`);
    console.log(`   Cloud: gs://${config.bucketName}/${config.carpetaBucket}`);
    return true;
  } else {
    console.error('\n❌ Error en la sincronización');
    return false;
  }
}

// Función principal
async function main() {
  const accion = process.argv[2] || 'descargar';

  console.log('='.repeat(60));
  console.log('📁 Sincronización de Extraccion_excel');
  console.log('='.repeat(60));
  console.log(`\n📂 Carpeta local: ${config.carpetaLocal}`);
  console.log(`☁️  Carpeta cloud: gs://${config.bucketName}/${config.carpetaBucket}\n`);

  switch (accion.toLowerCase()) {
    case 'descargar':
    case 'down':
    case 'pull':
      await descargarDesdeCloud();
      break;
    
    case 'subir':
    case 'up':
    case 'push':
      await subirACloud();
      break;
    
    case 'sincronizar':
    case 'sync':
      await sincronizar();
      break;
    
    default:
      console.log('Uso: node sincronizar-extraccion-excel.js [accion]');
      console.log('\nAcciones disponibles:');
      console.log('  descargar/pull/down - Descarga desde Cloud Storage');
      console.log('  subir/push/up       - Sube a Cloud Storage');
      console.log('  sincronizar/sync    - Sincroniza bidireccionalmente');
      break;
  }
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

