const Bot = require('./bot');

async function testConexion() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 PRUEBA DE CONEXIÓN CON CARPETA');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const bot = new Bot();
  
  // Verificar PowerShell primero
  console.log('1. Verificando PowerShell...');
  const powershellOk = bot.verificarPowerShell();
  if (!powershellOk) {
    console.error('❌ PowerShell no está disponible');
    process.exit(1);
  }
  console.log('');
  
  // Probar inicialización de carpeta
  console.log('2. Probando inicialización de carpeta...');
  const resultado = bot.inicializarCarpetaExtraccionExcel();
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  if (resultado) {
    console.log('✅ PRUEBA EXITOSA: La conexión con la carpeta funciona');
    console.log(`✅ Estado de conexión: ${bot.carpetaConectada ? 'CONECTADA' : 'NO CONECTADA'}`);
  } else {
    console.log('❌ PRUEBA FALLIDA: No se pudo establecer la conexión');
    console.log(`❌ Estado de conexión: ${bot.carpetaConectada ? 'CONECTADA' : 'NO CONECTADA'}`);
  }
  console.log('═══════════════════════════════════════════════════════');
  
  process.exit(resultado ? 0 : 1);
}

testConexion().catch(error => {
  console.error('❌ Error en la prueba:', error.message);
  process.exit(1);
});

