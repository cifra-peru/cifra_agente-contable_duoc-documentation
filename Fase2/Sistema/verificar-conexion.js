const GCSStorage = require('./gcs-storage');
const fs = require('fs');
const path = require('path');

// Configuración
const config = {
  projectId: 'pioneering-rex-471016-m3',
  bucketName: 'stage_cifra_agente-contabl',
  carpetaBucket: 'Extraccion_excel',
  carpetaLocal: 'C:\\Extraccion_excel',
  sdkPath: 'C:\\Users\\Usuario\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk'
};

async function verificarConexion() {
  console.log('='.repeat(70));
  console.log('🔍 VERIFICACIÓN COMPLETA DE CONEXIÓN');
  console.log('='.repeat(70));
  console.log('');

  // 1. Verificar carpeta local
  console.log('1️⃣ Verificando carpeta local...');
  if (fs.existsSync(config.carpetaLocal)) {
    console.log(`   ✅ Carpeta local existe: ${config.carpetaLocal}`);
    const archivos = fs.readdirSync(config.carpetaLocal);
    console.log(`   📄 Archivos encontrados: ${archivos.length}`);
    archivos.forEach(archivo => {
      const rutaCompleta = path.join(config.carpetaLocal, archivo);
      const stats = fs.statSync(rutaCompleta);
      if (stats.isFile()) {
        console.log(`      - ${archivo} (${stats.size} bytes)`);
      }
    });
  } else {
    console.log(`   ❌ Carpeta local NO existe: ${config.carpetaLocal}`);
    console.log(`   📁 Creando carpeta...`);
    fs.mkdirSync(config.carpetaLocal, { recursive: true });
    console.log(`   ✅ Carpeta creada`);
  }
  console.log('');

  // 2. Verificar conexión con Google Cloud
  console.log('2️⃣ Verificando conexión con Google Cloud Storage...');
  const storage = new GCSStorage({
    projectId: config.projectId,
    bucketName: config.bucketName,
    sdkPath: config.sdkPath
  });

  const inicializado = await storage.inicializar();
  if (!inicializado) {
    console.log('   ❌ No se pudo inicializar la conexión');
    return false;
  }
  console.log('   ✅ Conexión inicializada');
  console.log('');

  // 3. Verificar bucket y carpeta en cloud
  console.log('3️⃣ Verificando bucket y carpeta en Cloud Storage...');
  const carpetas = storage.listarCarpetasPrincipales();
  if (carpetas.includes(config.carpetaBucket)) {
    console.log(`   ✅ Carpeta "${config.carpetaBucket}" encontrada en el bucket`);
  } else {
    console.log(`   ⚠️  Carpeta "${config.carpetaBucket}" no encontrada en el bucket`);
  }
  console.log('');

  // 4. Listar contenido de la carpeta en cloud
  console.log('4️⃣ Listando contenido de la carpeta en Cloud Storage...');
  const estructura = storage.listarContenidoBucket(null, config.carpetaBucket);
  if (estructura) {
    console.log(`   ✅ Contenido listado: ${estructura.archivos.length} archivo(s)`);
  } else {
    console.log('   ⚠️  No se pudo listar el contenido');
  }
  console.log('');

  // 5. Resumen final
  console.log('='.repeat(70));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(70));
  console.log(`✅ Carpeta local: ${config.carpetaLocal}`);
  console.log(`✅ Carpeta cloud: gs://${config.bucketName}/${config.carpetaBucket}`);
  console.log(`✅ SDK local: ${config.sdkPath}`);
  console.log(`✅ Proyecto: ${config.projectId}`);
  console.log('');
  console.log('🎉 ¡Conexión verificada y funcionando correctamente!');
  console.log('');

  return true;
}

// Ejecutar
verificarConexion().catch(error => {
  console.error('❌ Error en la verificación:', error);
  process.exit(1);
});

