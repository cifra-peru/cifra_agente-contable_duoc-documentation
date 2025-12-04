const Bot = require('./bot');

console.log('═══════════════════════════════════════════════════════');
console.log('🧪 PRUEBA DE INICIALIZACIÓN DEL BOT');
console.log('═══════════════════════════════════════════════════════\n');

try {
  console.log('1. Creando instancia del bot...');
  const bot = new Bot();
  console.log('   ✅ Bot creado');
  console.log(`   ✅ Carpeta conectada: ${bot.carpetaConectada}`);
  console.log(`   ✅ Ruta carpeta: ${bot.carpetaExtraccionExcel}\n`);
  
  console.log('2. Verificando PowerShell...');
  const powershellOk = bot.verificarPowerShell();
  console.log(`   ✅ PowerShell OK: ${powershellOk}\n`);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ PRUEBA COMPLETADA');
  console.log('═══════════════════════════════════════════════════════');
  
  process.exit(0);
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

