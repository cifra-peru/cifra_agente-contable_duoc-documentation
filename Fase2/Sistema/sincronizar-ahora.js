const GCSStorage = require('./gcs-storage');

// Configuración
const config = {
  projectId: 'pioneering-rex-471016-m3',
  bucketName: 'stage_cifra_agente-contabl',
  carpetaBucket: 'Extraccion_excel',
  carpetaLocal: 'C:\\Extraccion_excel',
  sdkPath: 'C:\\Users\\Usuario\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk'
};

async function sincronizar() {
  console.log('🔄 Sincronizando desde Google Cloud Storage...\n');
  
  const storage = new GCSStorage({
    projectId: config.projectId,
    bucketName: config.bucketName,
    sdkPath: config.sdkPath
  });

  // Inicializar
  const inicializado = await storage.inicializar();
  if (!inicializado) {
    console.error('❌ No se pudo inicializar la conexión');
    process.exit(1);
  }

  // Descargar desde cloud
  const exito = storage.descargarCarpeta(
    config.carpetaBucket,
    config.carpetaLocal
  );

  if (exito) {
    console.log(`\n✅ ¡Sincronización completada!`);
    console.log(`📂 Archivos actualizados en: ${config.carpetaLocal}`);
    
    // Mostrar archivos actualizados
    const fs = require('fs');
    const archivos = fs.readdirSync(config.carpetaLocal);
    console.log(`\n📄 Archivos en la carpeta (${archivos.length}):`);
    archivos.forEach(archivo => {
      const rutaCompleta = require('path').join(config.carpetaLocal, archivo);
      const stats = fs.statSync(rutaCompleta);
      if (stats.isFile()) {
        console.log(`   - ${archivo}`);
      }
    });
  } else {
    console.error('\n❌ Error en la sincronización');
    process.exit(1);
  }
}

// Ejecutar
sincronizar().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

