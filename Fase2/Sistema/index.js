const Bot = require('./bot');
const config = require('./config');

async function main() {
  // El bot se conecta automáticamente a la carpeta al crearse
  const bot = new Bot();

  // Manejar errores no capturados
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Error no manejado (unhandledRejection):', reason);
    if (reason instanceof Error) {
      console.error('Stack:', reason.stack);
    }
    // No salir, solo registrar el error
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada (uncaughtException):', error.message);
    console.error('Stack:', error.stack);
    // No salir inmediatamente, dar tiempo para ver el error
    setTimeout(() => {
      console.error('⚠️  El proceso se cerrará en 10 segundos...');
      setTimeout(() => {
        process.exit(1);
      }, 10000);
    }, 1000);
  });
  
  // Mantener el proceso activo con un heartbeat
  const heartbeat = setInterval(() => {
    // Heartbeat para mantener el proceso activo
    process.stdout.write(''); // Escribir algo para mantener el proceso activo
  }, 1000);
  
  // Prevenir que el proceso se cierre inesperadamente
  process.on('SIGTERM', () => {
    console.log('\n⚠️  Recibida señal SIGTERM, pero continuando...');
  });
  
  process.on('SIGHUP', () => {
    console.log('\n⚠️  Recibida señal SIGHUP, pero continuando...');
  });

  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 INICIANDO BOT');
    console.log('═══════════════════════════════════════════════════════');

    // Verificar PowerShell antes de continuar
    const powershellOk = bot.verificarPowerShell();
    if (!powershellOk) {
      console.error('❌ PowerShell no está disponible o está bloqueado');
      console.error('💡 Por favor, verifica:');
      console.error('   1. PowerShell está instalado');
      console.error('   2. No hay bloqueos de antivirus');
      console.error('   3. Tienes permisos para ejecutar scripts');
      process.exit(1);
    }

    // Verificar que la conexión esté establecida (ya se estableció automáticamente en el constructor)
    if (!bot.carpetaConectada) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('📁 VERIFICANDO CONEXIÓN CON CARPETA');
      console.log('═══════════════════════════════════════════════════════');
      const carpetaInicializada = bot.inicializarCarpetaExtraccionExcel();
      if (!carpetaInicializada) {
        console.error('❌ No se pudo establecer la conexión con la carpeta C:\\Extraccion_excel');
        console.error('💡 El bot continuará, pero puede haber problemas más adelante');
      } else {
        console.log('✅ Conexión con carpeta C:\\Extraccion_excel establecida y lista');
      }
      console.log('═══════════════════════════════════════════════════════\n');
    } else {
      console.log('✅ Bot conectado a carpeta C:\\Extraccion_excel (conexión automática establecida)\n');
    }

    // Ejecutar aplicación
    await bot.ejecutarAplicacion(config.rutaAplicacion);
    console.log('⏳ Esperando a que la aplicación se inicie...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Tiempo de espera completado, iniciando login...');

    // Completar login
    console.log('📝 Iniciando proceso de login...');
    await bot.completarLogin(
      config.login.tituloVentana,
      config.login.usuario,
      config.login.password
    );

    // Seleccionar compañía
    await bot.seleccionarCompania(config.login.tituloVentana);

    // Fase 2: Navegar a Utilitarios
    console.log('═══════════════════════════════════════════════════════');
    console.log('📂 INICIANDO FASE 2: NAVEGACIÓN');
    console.log('═══════════════════════════════════════════════════════');
    await bot.navegarAUtilitarios(config.login.tituloVentana);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ PROCESO COMPLETADO');
    console.log('═══════════════════════════════════════════════════════');

    // Mantener el proceso activo
    console.log('Presiona Ctrl+C para cerrar...');
    process.on('SIGINT', async () => {
      console.log('\n🛑 Cerrando bot...');
      await bot.cerrar();
      process.exit(0);
    });

    // Mantener el proceso vivo
    setInterval(() => {
      // Heartbeat para mantener el proceso activo
    }, 60000);

    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error en main:', error.message);
    console.error('Stack:', error.stack);
    try {
      await bot.cerrar();
    } catch (e) {
      console.error('Error al cerrar bot:', e.message);
    }
    // No salir inmediatamente, dar tiempo para ver el error
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.exit(1);
  }
}

main();

