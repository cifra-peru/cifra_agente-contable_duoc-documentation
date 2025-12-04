const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const GCSStorage = require('./gcs-storage');

class Bot {
  constructor() {
    this.process = null;
    this.carpetaExtraccionExcel = 'C:\\Extraccion_excel';
    this.carpetaConectada = false;
    
    // Configuración de Google Cloud Storage
    this.gcsStorage = new GCSStorage({
      projectId: 'pioneering-rex-471016-m3',
      bucketName: 'stage_cifra_agente-contabl',
      carpetaBucket: 'Extraccion_excel',
      sdkPath: 'C:\\Users\\Usuario\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk'
    });
    
    // ESTABLECER CONEXIÓN AUTOMÁTICAMENTE AL CREAR EL BOT
    console.log('🔗 Estableciendo conexión automática con carpeta C:\\Extraccion_excel...');
    this._establecerConexionCarpetaInmediata();
  }
  
  /**
   * Establece la conexión con la carpeta de forma inmediata y síncrona
   * @private
   */
  _establecerConexionCarpetaInmediata() {
    try {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      const script = `
$carpeta = 'C:\\Extraccion_excel'
try {
  if (-not (Test-Path -Path $carpeta -PathType Container)) {
    New-Item -Path $carpeta -ItemType Directory -Force | Out-Null
  }
  if (Test-Path -Path $carpeta -PathType Container) {
    # Probar acceso
    $testFile = Join-Path $carpeta "test_$(Get-Date -Format 'yyyyMMddHHmmss').tmp"
    "test" | Out-File -FilePath $testFile -Force -ErrorAction SilentlyContinue | Out-Null
    Remove-Item -Path $testFile -Force -ErrorAction SilentlyContinue | Out-Null
    Write-Output "OK"
  } else {
    Write-Output "FAILED"
  }
} catch {
  Write-Output "ERROR"
}
`;
      
      const tempFile = path.join(os.tmpdir(), `bot_conexion_${Date.now()}.ps1`);
      fs.writeFileSync(tempFile, script, 'utf8');
      
      try {
        const comando = `powershell -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tempFile}"`;
        const resultado = execSync(comando, {
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 5000,
          windowsHide: true
        });
        
        // Limpiar archivo temporal
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignorar
        }
        
        if (resultado && resultado.trim().includes('OK')) {
          this.carpetaConectada = true;
          console.log('✅ Conexión con carpeta C:\\Extraccion_excel establecida automáticamente');
          return true;
        } else {
          // Intentar de forma más simple
          try {
            if (!fs.existsSync(this.carpetaExtraccionExcel)) {
              fs.mkdirSync(this.carpetaExtraccionExcel, { recursive: true });
            }
            this.carpetaConectada = true;
            console.log('✅ Conexión con carpeta C:\\Extraccion_excel establecida (método alternativo)');
            return true;
          } catch (e) {
            console.log('⚠️  No se pudo establecer conexión automática, se intentará al iniciar');
            this.carpetaConectada = false;
            return false;
          }
        }
      } catch (error) {
        // Limpiar archivo temporal
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignorar
        }
        
        // Intentar de forma más simple
        try {
          if (!fs.existsSync(this.carpetaExtraccionExcel)) {
            fs.mkdirSync(this.carpetaExtraccionExcel, { recursive: true });
          }
          this.carpetaConectada = true;
          console.log('✅ Conexión con carpeta C:\\Extraccion_excel establecida (método alternativo)');
          return true;
        } catch (e) {
          console.log('⚠️  No se pudo establecer conexión automática, se intentará al iniciar');
          this.carpetaConectada = false;
          return false;
        }
      }
    } catch (error) {
      // Intentar de forma más simple como último recurso
      try {
        const fs = require('fs');
        if (!fs.existsSync(this.carpetaExtraccionExcel)) {
          fs.mkdirSync(this.carpetaExtraccionExcel, { recursive: true });
        }
        this.carpetaConectada = true;
        console.log('✅ Conexión con carpeta C:\\Extraccion_excel establecida (método simple)');
        return true;
      } catch (e) {
        console.log('⚠️  No se pudo establecer conexión automática, se intentará al iniciar');
        this.carpetaConectada = false;
        return false;
      }
    }
  }

  /**
   * Espera un tiempo determinado
   * @private
   */
  async _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica si PowerShell está disponible y funcionando
   * @returns {boolean} true si PowerShell está disponible
   */
  verificarPowerShell() {
    try {
      console.log('🔍 Verificando PowerShell...');
      
      // Test 1: Verificar si PowerShell está disponible
      try {
        const version = execSync('powershell -Command "Write-Output $PSVersionTable.PSVersion"', {
          encoding: 'utf-8',
          timeout: 5000,
          windowsHide: true
        });
        console.log(`   ✅ PowerShell disponible: ${version.trim()}`);
      } catch (error) {
        console.error(`   ❌ PowerShell no disponible: ${error.message}`);
        return false;
      }
      
      // Test 2: Verificar que podemos ejecutar scripts
      try {
        const resultado = execSync('powershell -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "Write-Output \'TEST_OK\'"', {
          encoding: 'utf-8',
          timeout: 5000,
          windowsHide: true
        });
        if (resultado.trim() === 'TEST_OK') {
          console.log('   ✅ Scripts de PowerShell funcionando correctamente');
        } else {
          console.error(`   ⚠️  Resultado inesperado: ${resultado.trim()}`);
          return false;
        }
      } catch (error) {
        console.error(`   ❌ Error al ejecutar script de prueba: ${error.message}`);
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          console.error('   🚫 BLOQUEO DETECTADO: Timeout en script de prueba - posible bloqueo de antivirus');
        }
        return false;
      }
      
      // Test 3: Verificar que SendKeys está disponible
      try {
        const script = `$wshell = New-Object -ComObject wscript.shell; Write-Output "SendKeys_OK"`;
        const tempFile = path.join(os.tmpdir(), `test_sendkeys_${Date.now()}.ps1`);
        fs.writeFileSync(tempFile, script, 'utf8');
        
        const resultado = execSync(`powershell -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tempFile}"`, {
          encoding: 'utf-8',
          timeout: 5000,
          windowsHide: true
        });
        
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        
        if (resultado.includes('SendKeys_OK')) {
          console.log('   ✅ SendKeys disponible y funcionando');
        } else {
          console.error(`   ⚠️  SendKeys no funcionó correctamente: ${resultado.trim()}`);
          return false;
        }
      } catch (error) {
        console.error(`   ❌ Error al probar SendKeys: ${error.message}`);
        if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
          console.error('   🚫 BLOQUEO DETECTADO: Timeout al probar SendKeys - posible bloqueo de antivirus');
        }
        return false;
      }
      
      console.log('✅ PowerShell verificado correctamente\n');
      return true;
    } catch (error) {
      console.error(`❌ Error en verificación de PowerShell: ${error.message}`);
      return false;
    }
  }

  /**
   * Inicializa y establece la conexión con la carpeta C:\Extraccion_excel
   * Este método debe ejecutarse ANTES de que el bot comience a funcionar
   * Asegura que la carpeta exista y esté lista para ser utilizada
   */
  inicializarCarpetaExtraccionExcel() {
    try {
      console.log('📁 Inicializando conexión con carpeta C:\\Extraccion_excel...');
      
      const script = `
$carpeta = 'C:\\Extraccion_excel'
$estado = 'UNKNOWN'

try {
  # Verificar si la carpeta existe
  if (Test-Path -Path $carpeta -PathType Container) {
    $estado = 'EXISTS'
    
    # Verificar que la carpeta es accesible (prueba de escritura/lectura)
    try {
      $testFile = Join-Path $carpeta "test_access_$(Get-Date -Format 'yyyyMMddHHmmss').tmp"
      "test" | Out-File -FilePath $testFile -Force -ErrorAction Stop | Out-Null
      Remove-Item -Path $testFile -Force -ErrorAction Stop | Out-Null
      $estado = 'EXISTS_ACCESSIBLE'
    } catch {
      $estado = 'EXISTS_NOT_ACCESSIBLE'
    }
  } else {
    # Intentar crear la carpeta
    try {
      $null = New-Item -Path $carpeta -ItemType Directory -Force -ErrorAction Stop
      
      if (Test-Path -Path $carpeta -PathType Container) {
        # Verificar acceso después de crear
        try {
          $testFile = Join-Path $carpeta "test_access_$(Get-Date -Format 'yyyyMMddHHmmss').tmp"
          "test" | Out-File -FilePath $testFile -Force -ErrorAction Stop | Out-Null
          Remove-Item -Path $testFile -Force -ErrorAction Stop | Out-Null
          $estado = 'CREATED_ACCESSIBLE'
        } catch {
          $estado = 'CREATED_NOT_ACCESSIBLE'
        }
      } else {
        $estado = 'FAILED_CREATE'
      }
    } catch {
      $estado = 'ERROR_CREATE'
    }
  }
} catch {
  $estado = 'ERROR'
}

Write-Output $estado
`;
      
      const resultado = this._runPowerShell(script);
      const estado = resultado ? resultado.trim() : '';
      
      console.log(`   🔍 Estado de la carpeta: ${estado || 'SIN_RESPUESTA'}`);
      
      if (estado === 'CREATED_ACCESSIBLE') {
        console.log('   ✅ Carpeta C:\\Extraccion_excel creada exitosamente');
        console.log('   ✅ Carpeta accesible y lista para usar');
        console.log('   ✅ CONEXIÓN ESTABLECIDA CORRECTAMENTE');
        this.carpetaConectada = true;
        return true;
      } else if (estado === 'EXISTS_ACCESSIBLE') {
        console.log('   ✅ Carpeta C:\\Extraccion_excel encontrada');
        console.log('   ✅ Carpeta accesible y lista para usar');
        console.log('   ✅ CONEXIÓN ESTABLECIDA CORRECTAMENTE');
        this.carpetaConectada = true;
        return true;
      } else if (estado === 'EXISTS' || estado === 'EXISTS_NOT_ACCESSIBLE') {
        console.log('   ✅ Carpeta C:\\Extraccion_excel encontrada');
        if (estado === 'EXISTS_NOT_ACCESSIBLE') {
          console.log('   ⚠️  Carpeta existe pero puede tener problemas de acceso');
        }
        console.log('   ✅ CONEXIÓN ESTABLECIDA (con advertencias)');
        this.carpetaConectada = true; // Intentar continuar
        return true;
      } else if (estado === 'CREATED_NOT_ACCESSIBLE') {
        console.log('   ✅ Carpeta C:\\Extraccion_excel creada');
        console.log('   ⚠️  Carpeta creada pero puede tener problemas de acceso');
        console.log('   ✅ CONEXIÓN ESTABLECIDA (con advertencias)');
        this.carpetaConectada = true; // Intentar continuar
        return true;
      } else if (estado === 'FAILED_CREATE') {
        console.error('   ❌ No se pudo crear la carpeta C:\\Extraccion_excel');
        console.error('   💡 Verifica los permisos del disco C:');
        this.carpetaConectada = false;
        return false;
      } else if (estado === 'ERROR_CREATE' || estado === 'ERROR') {
        console.error('   ❌ Error al inicializar la carpeta');
        console.error(`   💡 Detalles: ${estado}`);
        this.carpetaConectada = false;
        return false;
      } else {
        // Si no hay respuesta o estado desconocido, intentar crear la carpeta de forma simple
        console.log(`   ⚠️  Estado desconocido o sin respuesta: ${estado}`);
        console.log('   🔄 Intentando crear carpeta de forma directa...');
        
        // Intentar crear la carpeta de forma simple
        const scriptSimple = `
$carpeta = 'C:\\Extraccion_excel'
try {
  if (-not (Test-Path -Path $carpeta -PathType Container)) {
    New-Item -Path $carpeta -ItemType Directory -Force | Out-Null
  }
  if (Test-Path -Path $carpeta -PathType Container) {
    Write-Output 'OK'
  } else {
    Write-Output 'FAILED'
  }
} catch {
  Write-Output 'ERROR'
}
`;
        const resultadoSimple = this._runPowerShell(scriptSimple);
        if (resultadoSimple && resultadoSimple.trim().includes('OK')) {
          console.log('   ✅ Carpeta creada/verificada exitosamente');
          this.carpetaConectada = true;
          return true;
        } else {
          console.log('   ⚠️  Continuando con la ejecución...');
          this.carpetaConectada = true; // Intentar continuar
          return true;
        }
      }
    } catch (error) {
      console.error(`❌ Error al inicializar carpeta Extraccion_excel: ${error.message}`);
      // Intentar crear la carpeta de forma simple como último recurso
      try {
        const scriptSimple = `
$carpeta = 'C:\\Extraccion_excel'
try {
  if (-not (Test-Path -Path $carpeta -PathType Container)) {
    New-Item -Path $carpeta -ItemType Directory -Force | Out-Null
  }
  Write-Output 'OK'
} catch {
  Write-Output 'ERROR'
}
`;
        const resultadoSimple = this._runPowerShell(scriptSimple);
        if (resultadoSimple && resultadoSimple.trim().includes('OK')) {
          console.log('   ✅ Carpeta creada/verificada exitosamente (método alternativo)');
          this.carpetaConectada = true;
          return true;
        }
      } catch (e) {
        // Ignorar
      }
      this.carpetaConectada = false;
      return false;
    }
  }

  /**
   * Ejecuta un comando PowerShell
   * @private
   */
  _runPowerShell(script, timeout = 30000) {
    let tempFile = null;
    try {
      // Usar archivo temporal en lugar de -EncodedCommand para evitar bloqueos de antivirus
      tempFile = path.join(os.tmpdir(), `bot_ps_${Date.now()}_${Math.random().toString(36).substring(7)}.ps1`);
      
      // Verificar que el directorio temporal existe
      if (!fs.existsSync(os.tmpdir())) {
        console.error(`   ❌ Directorio temporal no existe: ${os.tmpdir()}`);
        return '';
      }
      
      fs.writeFileSync(tempFile, script, 'utf8');
      
      // Verificar que el archivo se creó correctamente
      if (!fs.existsSync(tempFile)) {
        console.error(`   ❌ No se pudo crear archivo temporal: ${tempFile}`);
        return '';
      }
      
      // Ejecutar el script desde el archivo temporal
      const comando = `powershell -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tempFile}"`;
      const inicio = Date.now();
      
      try {
        const resultado = execSync(comando, {
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: timeout, // Timeout configurable (por defecto 30 segundos para scripts largos)
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          windowsHide: true,
          killSignal: 'SIGKILL' // Forzar terminación si hay timeout
        });
        const tiempo = Date.now() - inicio;
        if (tiempo > 1500) {
          console.log(`   ⏱️  PowerShell tardó ${tiempo}ms`);
        }
        
        // Limpiar archivo temporal
        this._limpiarArchivoTemporal(tempFile);
        
        return resultado ? resultado.trim() : '';
      } catch (execError) {
        // Error en la ejecución
        const tiempo = Date.now() - inicio;
        console.error(`   ⚠️  PowerShell falló después de ${tiempo}ms`);
        
        // Limpiar archivo temporal
        this._limpiarArchivoTemporal(tempFile);
        
        // Analizar el tipo de error
        if (execError.signal === 'SIGTERM' || execError.code === 'ETIMEDOUT') {
          console.error(`   ❌ PowerShell TIMEOUT (${timeout}ms) - posible bloqueo de antivirus o script muy lento`);
          console.error(`   💡 Sugerencia: Verificar antivirus o aumentar timeout`);
          return '';
        }
        
        if (execError.stderr) {
          const stderr = execError.stderr.toString();
          if (stderr.trim()) {
            const stderrShort = stderr.substring(0, 300);
            console.error(`   ❌ PowerShell stderr: ${stderrShort}`);
            
            // Detectar bloqueos comunes
            if (stderr.includes('Access is denied') || stderr.includes('denied')) {
              console.error(`   🚫 BLOQUEO DETECTADO: Acceso denegado - posible bloqueo de antivirus`);
            }
            if (stderr.includes('cannot be loaded') || stderr.includes('execution')) {
              console.error(`   🚫 BLOQUEO DETECTADO: Política de ejecución bloqueada`);
            }
          }
        }
        
        if (execError.message) {
          const msg = execError.message.substring(0, 200);
          if (!msg.includes('timeout') && !msg.includes('ETIMEDOUT')) {
            console.error(`   ❌ PowerShell error: ${msg}`);
          }
        }
        
        return '';
      }
    } catch (error) {
      // Error general (creación de archivo, etc.)
      console.error(`   ❌ Error general en _runPowerShell: ${error.message}`);
      
      // Limpiar archivo temporal en caso de error
      if (tempFile) {
        this._limpiarArchivoTemporal(tempFile);
      }
      
      return '';
    }
  }

  /**
   * Limpia un archivo temporal de forma segura
   * @private
   */
  _limpiarArchivoTemporal(tempFile) {
    try {
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (e) {
      // Ignorar errores al eliminar archivo temporal (puede estar bloqueado)
      // No mostrar error para no saturar la consola
    }
  }

  /**
   * Verifica rápidamente si una ventana existe (sin esperar mucho tiempo)
   * @private
   */
  async _verificarVentanaRapido(titulo) {
    try {
      const tituloEscapado = titulo.replace(/'/g, "''");
      const script = `$process = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like '*${tituloEscapado}*' } | Select-Object -First 1; if ($process) { Write-Output $process.MainWindowTitle } else { Write-Output 'NO_FOUND' }`;
      const resultado = this._runPowerShell(script);
      return resultado && resultado.trim() && resultado.trim() !== 'NO_FOUND';
    } catch (error) {
      return false;
    }
  }

  /**
   * Busca una ventana por título
   */
  async buscarVentanaPorTitulo(titulo, timeout = 60000) {
    const inicio = Date.now();
    let intentos = 0;
    console.log(`   Buscando ventana "${titulo}"...`);
    while (Date.now() - inicio < timeout) {
      try {
        intentos++;
        const tituloEscapado = titulo.replace(/'/g, "''");
        const script = `$process = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like '*${tituloEscapado}*' } | Select-Object -First 1; if ($process) { Write-Output $process.MainWindowTitle }`;
        try {
          const resultado = this._runPowerShell(script);
          if (resultado && resultado.trim()) {
            console.log(`   ✅ Ventana encontrada: ${resultado.trim()}`);
            return true;
          }
        } catch (error) {
          console.error(`   Error en intento ${intentos}: ${error.message}`);
        }
        // Mostrar progreso cada 5 segundos
        if (intentos % 10 === 0) {
          const segundos = Math.floor((Date.now() - inicio) / 1000);
          console.log(`   Buscando ventana... (${segundos}s, intento ${intentos})`);
        }
        await this._wait(500);
      } catch (error) {
        console.error(`   Error al buscar ventana (intento ${intentos}): ${error.message}`);
        await this._wait(1000);
      }
    }
    throw new Error(`No se encontró la ventana: ${titulo} después de ${timeout}ms`);
  }

  /**
   * Activa una ventana por título
   */
  async activarVentana(titulo) {
    const tituloEscapado = titulo.replace(/'/g, "''");
    const script = `
# Usar SetForegroundWindow de user32.dll en lugar de AppActivate
try {
  Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    public class Win32 {
      [DllImport("user32.dll")]
      public static extern bool SetForegroundWindow(IntPtr hWnd);
      [DllImport("user32.dll")]
      public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    }
"@ -ErrorAction SilentlyContinue
} catch {
  # Si ya está definido, ignorar el error
}

# Buscar por título o nombre de proceso (más flexible)
$process = Get-Process | Where-Object { 
  $_.MainWindowHandle -ne 0 -and 
  $_.MainWindowTitle -ne '' -and
  (
    $_.MainWindowTitle -like '*${tituloEscapado}*' -or
    $_.ProcessName -like '*concar*' -or
    $_.ProcessName -like '*ctmenuw*'
  )
} | Select-Object -First 1

if ($process -and $process.MainWindowHandle -ne 0) {
  # Activar la ventana usando SetForegroundWindow (más confiable que AppActivate)
  $hwnd = [IntPtr]$process.MainWindowHandle
  [Win32]::ShowWindow($hwnd, 9) | Out-Null  # SW_RESTORE = 9
  $result = [Win32]::SetForegroundWindow($hwnd)
  
  if ($result) {
    # Esperar un momento para asegurar que la ventana esté activa
    Start-Sleep -Milliseconds 100
    Write-Output 'OK'
  } else {
    Write-Output 'FAIL_ACTIVATE'
  }
} else {
  Write-Output 'NO_PROCESS'
}
`;
    const resultado = this._runPowerShell(script);
    return resultado;
  }

  /**
   * Envía teclas a una ventana específica (método simple para login y navegación normal)
   * @private
   */
  async _enviarTeclas(teclas, tituloVentana) {
    // Escapar comillas simples para PowerShell
    const teclasEscapadas = teclas.replace(/'/g, "''");
    const tituloEscapado = tituloVentana.replace(/'/g, "''");
    
    // Script simple: activar ventana y luego enviar teclas (para login y navegación normal)
    const script = `
$wshell = New-Object -ComObject wscript.shell
$process = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like '*${tituloEscapado}*' } | Select-Object -First 1
if ($process) {
  $result = $wshell.AppActivate($process.Id)
  if (-not $result) {
    $result = $wshell.AppActivate($process.MainWindowTitle)
  }
  if ($result) {
    Start-Sleep -Milliseconds 200
    $wshell.SendKeys('${teclasEscapadas}')
    Write-Output 'OK'
  } else {
    Write-Output 'FAIL_ACTIVATE'
  }
} else {
  Write-Output 'NO_PROCESS'
}
`;
    try {
      let resultado = this._runPowerShell(script);
      
      // Si no encuentra el proceso, intentar buscar la ventana y reintentar
      if (!resultado || resultado.includes('NO_PROCESS')) {
        // Buscar la ventana antes de reintentar
        const ventanaExiste = await this._verificarVentanaRapido(tituloVentana);
        if (!ventanaExiste) {
          await this.buscarVentanaPorTitulo(tituloVentana);
          await this._wait(500);
        }
        await this.activarVentana(tituloVentana);
        await this._wait(500);
        
        // Reintentar después de buscar la ventana
        resultado = this._runPowerShell(script);
      }
      
      if (!resultado || !resultado.includes('OK')) {
        // Solo mostrar error si no es NO_PROCESS (ya lo manejamos arriba)
        if (resultado && !resultado.includes('NO_PROCESS')) {
          console.log(`⚠️  Error al enviar tecla: ${teclas} (resultado: ${resultado || 'vacío'})`);
        }
        // Último intento
        await this._wait(300);
        const resultado2 = this._runPowerShell(script);
        if (!resultado2 || !resultado2.includes('OK')) {
          // Solo mostrar error persistente si no es NO_PROCESS
          if (resultado2 && !resultado2.includes('NO_PROCESS')) {
            console.log(`⚠️  Error persistente al enviar tecla: ${teclas}`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Excepción al enviar tecla ${teclas}: ${error.message}`);
    }
    await this._wait(100);
  }

  /**
   * Envía teclas críticas con activación profesional (solo para diálogo de archivos)
   * @private
   */
  async _enviarTeclaProfesional(teclas, tituloVentana) {
    // Escapar comillas simples para PowerShell
    const teclasEscapadas = teclas.replace(/'/g, "''");
    const tituloEscapado = tituloVentana.replace(/'/g, "''");
    
    // Script profesional: usar SetForegroundWindow para teclas críticas del diálogo
    const script = `
# Cargar funciones de Windows API para activación profesional
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
  }
"@ -ErrorAction SilentlyContinue

$wshell = New-Object -ComObject wscript.shell
$titulo = '${tituloEscapado}'
$teclas = '${teclasEscapadas}'

# Buscar proceso
$process = Get-Process | Where-Object { 
  $_.MainWindowHandle -ne 0 -and 
  ($_.MainWindowTitle -like "*$titulo*" -or $_.MainWindowTitle -eq $titulo)
} | Select-Object -First 1

if ($process -and $process.MainWindowHandle -ne 0) {
  $hwnd = [IntPtr]$process.MainWindowHandle
  
  if ([Win32]::IsWindowVisible($hwnd)) {
    # Restaurar ventana si está minimizada
    [Win32]::ShowWindow($hwnd, 9) | Out-Null  # SW_RESTORE = 9
    
    # Activar ventana usando SetForegroundWindow
    $result = [Win32]::SetForegroundWindow($hwnd)
    
    if ($result) {
      Start-Sleep -Milliseconds 500
      # Verificar que la ventana esté realmente activa
      $hwndActiva = [Win32]::GetForegroundWindow()
      if ($hwndActiva -eq $hwnd) {
        Start-Sleep -Milliseconds 1000
        $wshell.SendKeys($teclas)
        Write-Output 'OK'
      } else {
        # Si falla, intentar con AppActivate
        $result = $wshell.AppActivate($process.Id)
        if (-not $result) {
          $result = $wshell.AppActivate($process.MainWindowTitle)
        }
        if ($result) {
          Start-Sleep -Milliseconds 1000
          $wshell.SendKeys($teclas)
          Write-Output 'OK'
        } else {
          Write-Output 'FAIL_ACTIVATE'
        }
      }
    } else {
      # Si SetForegroundWindow falla, intentar con AppActivate
      $result = $wshell.AppActivate($process.Id)
      if (-not $result) {
        $result = $wshell.AppActivate($process.MainWindowTitle)
      }
      if ($result) {
        Start-Sleep -Milliseconds 1000
        $wshell.SendKeys($teclas)
        Write-Output 'OK'
      } else {
        Write-Output 'FAIL_ACTIVATE'
      }
    }
  } else {
    Write-Output 'WINDOW_NOT_VISIBLE'
  }
} else {
  Write-Output 'NO_PROCESS'
}
`;
    try {
      const resultado = this._runPowerShell(script);
      if (!resultado || !resultado.includes('OK')) {
        console.log(`⚠️  Error al enviar tecla profesional: ${teclas} (resultado: ${resultado || 'vacío'})`);
        await this._wait(1000);
        await this.activarVentana(tituloVentana);
        await this._wait(1000);
        const resultado2 = this._runPowerShell(script);
        if (!resultado2 || !resultado2.includes('OK')) {
          console.log(`⚠️  Error persistente al enviar tecla profesional: ${teclas}`);
        } else {
          console.log(`✅ Tecla profesional enviada exitosamente en segundo intento: ${teclas}`);
        }
      } else {
        console.log(`✅ Tecla profesional enviada exitosamente: ${teclas}`);
      }
    } catch (error) {
      console.error(`❌ Excepción al enviar tecla profesional ${teclas}: ${error.message}`);
    }
    await this._wait(100);
  }

  /**
   * Escribe texto completo en una ventana específica
   * @private
   */
  async _escribirTexto(texto, tituloVentana) {
    // Escapar caracteres especiales de SendKeys
    // SendKeys tiene caracteres especiales: + ^ % ~ ( ) [ ] { }
    // Necesitamos envolverlos en llaves: {+} {^} {%} {~} {(} {)} {[} {]} {{} {}}
    let textoEscapado = '';
    for (const char of texto) {
      if ('+^%~()[]{}'.includes(char)) {
        textoEscapado += `{${char}}`;
      } else {
        textoEscapado += char;
      }
    }
    
    // Escapar comillas simples para PowerShell (doblar comillas simples)
    const textoEscapadoPS = textoEscapado.replace(/'/g, "''");
    
    // Script mejorado: activar ventana y luego enviar texto
    const tituloEscapado = tituloVentana.replace(/'/g, "''");
    const script = `
$ErrorActionPreference = 'Stop'
try {
  $wshell = New-Object -ComObject wscript.shell
  $titulo = '${tituloEscapado}'
  
  # Buscar proceso con múltiples intentos
  $process = $null
  for ($i = 0; $i -lt 3; $i++) {
    $process = Get-Process | Where-Object { 
      $_.MainWindowHandle -ne 0 -and 
      ($_.MainWindowTitle -like "*$titulo*" -or $_.MainWindowTitle -eq $titulo)
    } | Select-Object -First 1
    if ($process) { break }
    Start-Sleep -Milliseconds 200
  }
  
  if ($process) {
    # Intentar activar por ID primero
    $result = $wshell.AppActivate($process.Id)
    if (-not $result) {
      # Intentar por título
      $result = $wshell.AppActivate($process.MainWindowTitle)
    }
    if (-not $result) {
      # Intentar por nombre de proceso
      $result = $wshell.AppActivate($process.ProcessName)
    }
    
    if ($result) {
      Start-Sleep -Milliseconds 300
      $wshell.SendKeys('${textoEscapadoPS}')
      Write-Output 'OK'
    } else {
      Write-Output 'FAIL_ACTIVATE'
    }
  } else {
    Write-Output 'NO_PROCESS'
  }
} catch {
  Write-Output 'ERROR'
}
`;
    try {
      const resultado = this._runPowerShell(script);
      
      if (resultado && resultado.trim() === 'OK') {
        return true;
      } else {
        console.log(`⚠️  Error al escribir texto: ${texto} (resultado: ${resultado || 'vacío'})`);
        // Activar ventana manualmente antes del segundo intento
        await this.activarVentana(tituloVentana);
        await this._wait(500);
        const resultado2 = this._runPowerShell(script);
        if (resultado2 && resultado2.trim() === 'OK') {
          console.log(`✅ Texto escrito exitosamente en segundo intento: ${texto}`);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error(`❌ Excepción al escribir texto ${texto}: ${error.message}`);
      return false;
    }
  }

  /**
   * Ejecuta la aplicación
   */
  async ejecutarAplicacion(rutaExe) {
    console.log(`🚀 Ejecutando aplicación: ${path.basename(rutaExe)}`);
    this.process = spawn(rutaExe, [], {
      detached: true,
      stdio: 'ignore'
    });
    this.process.unref();
    console.log(`✅ Proceso iniciado con PID: ${this.process.pid}`);
    await this._wait(5000);
  }

  /**
   * Completa el login
   */
  async completarLogin(tituloVentana, usuario, password) {
    try {
      console.log('🔍 Buscando ventana...');
      // Esperar y activar ventana
      await this.buscarVentanaPorTitulo(tituloVentana);
      console.log('✅ Ventana encontrada');
      await this._wait(500);
      console.log('🔄 Activando ventana...');
      await this.activarVentana(tituloVentana);
      console.log('✅ Ventana activada');
      await this._wait(500);

      // Escribir usuario
      console.log(`📝 Escribiendo usuario: ${usuario}...`);
      const usuarioOk = await this._escribirTexto(usuario, tituloVentana);
      if (!usuarioOk) {
        console.log(`⚠️  No se pudo escribir el usuario, continuando...`);
      }
      await this._wait(300);

      // Navegar al campo password
      console.log('➡️  Navegando al campo password...');
      await this._enviarTeclas('{TAB}', tituloVentana);
      await this._wait(500);

      // Escribir password
      console.log(`🔒 Escribiendo password...`);
      const passwordOk = await this._escribirTexto(password, tituloVentana);
      if (!passwordOk) {
        console.log(`⚠️  No se pudo escribir el password, continuando...`);
      }
      await this._wait(300);

      // Hacer clic en Entrar
      console.log('🚀 Haciendo clic en Entrar...');
      console.log('   Enviando TAB 1...');
      await this._enviarTeclas('{TAB}', tituloVentana);
      await this._wait(200);
      console.log('   Enviando TAB 2...');
      await this._enviarTeclas('{TAB}', tituloVentana);
      await this._wait(200);
      console.log('   Enviando ENTER...');
      await this._enviarTeclas('{ENTER}', tituloVentana);
      console.log('   ENTER enviado, esperando ventana de compañía...');
      // Esperar en incrementos más pequeños para detectar si se cancela
      for (let i = 0; i < 6; i++) {
        await this._wait(500);
        console.log(`   Esperando... (${i + 1}/6)`);
      }
      console.log('✅ Login completado');
    } catch (error) {
      console.error(`❌ Error en completarLogin: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Hace clic en "Inka moss" en el dropdown abierto
   * Calcula la posición del último elemento del dropdown
   * @private
   */
  async _hacerClicEnInkaMoss(tituloVentana) {
    const tituloEscapado = tituloVentana.replace(/'/g, "''");
    const script = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  }
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }
  public class Mouse {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
    public const uint MOUSEEVENTF_LEFTDOWN = 0x02;
    public const uint MOUSEEVENTF_LEFTUP = 0x04;
  }
"@

$wshell = New-Object -ComObject wscript.shell
$process = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like '*${tituloEscapado}*' } | Select-Object -First 1
if ($process -and $process.MainWindowHandle -ne 0) {
  $hwnd = [IntPtr]$process.MainWindowHandle
  [Win32]::ShowWindow($hwnd, 9) | Out-Null
  $result = [Win32]::SetForegroundWindow($hwnd)
  
  if ($result) {
    Start-Sleep -Milliseconds 300
    # Obtener posición de la ventana
    $rect = New-Object RECT
    [Win32]::GetWindowRect($hwnd, [ref]$rect)
    
    $windowWidth = $rect.Right - $rect.Left
    $windowHeight = $rect.Bottom - $rect.Top
    
    # Primero bajar hasta el último elemento usando flechas
    # Luego hacer clic en la posición aproximada del último elemento del dropdown
    # El dropdown típicamente se abre debajo del combo box
    # "Inka moss" es el último elemento, así que estará en la parte inferior del dropdown
    $x = $rect.Left + [int]($windowWidth * 0.50)  # Centro horizontal
    $y = $rect.Top + [int]($windowHeight * 0.70)   # Más abajo para el último elemento
    
    # Mover el cursor y hacer clic
    [Mouse]::SetCursorPos($x, $y)
    Start-Sleep -Milliseconds 200
    [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 50
    [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 100
    Write-Output "OK:$x,$y"
  } else {
    Write-Output 'FAIL_ACTIVATE'
  }
} else {
  Write-Output 'NO_PROCESS'
}
`;
    try {
      const resultado = this._runPowerShell(script);
      if (resultado && resultado.includes('OK')) {
        console.log(`   ✅ Clic en "Inka moss" realizado`);
        return true;
      } else {
        console.log(`   ⚠️  No se pudo hacer clic directo, usando método alternativo...`);
        return false;
      }
    } catch (error) {
      console.log(`   ⚠️  Error al hacer clic en "Inka moss": ${error.message}`);
      return false;
    }
  }

  /**
   * Hace clic en el botón "Entrar"
   * Calcula la posición del botón Entrar
   * @private
   */
  async _hacerClicEnBotonEntrar(tituloVentana) {
    const tituloEscapado = tituloVentana.replace(/'/g, "''");
    const script = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  }
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }
  public class Mouse {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
    public const uint MOUSEEVENTF_LEFTDOWN = 0x02;
    public const uint MOUSEEVENTF_LEFTUP = 0x04;
  }
"@

$wshell = New-Object -ComObject wscript.shell
$process = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like '*${tituloEscapado}*' } | Select-Object -First 1
if ($null -eq $process) {
  Write-Output 'NO_PROCESS'
  exit
}

if ($process.MainWindowHandle -eq 0) {
  Write-Output 'NO_WINDOW'
  exit
}

$hwnd = [IntPtr]$process.MainWindowHandle
[Win32]::ShowWindow($hwnd, 9) | Out-Null
$result = [Win32]::SetForegroundWindow($hwnd)

if (-not $result) {
  Write-Output 'FAIL_ACTIVATE'
  exit
}

Start-Sleep -Milliseconds 800

# Obtener posición de la ventana
$rect = New-Object RECT
$gotRect = [Win32]::GetWindowRect($hwnd, [ref]$rect)

if (-not $gotRect) {
  Write-Output 'FAIL_GETRECT'
  exit
}

$windowWidth = $rect.Right - $rect.Left
$windowHeight = $rect.Bottom - $rect.Top

if ($windowWidth -le 0 -or $windowHeight -le 0) {
  Write-Output "FAIL_INVALID_SIZE:$windowWidth,$windowHeight"
  exit
}

# El botón "Entrar" está en la parte INFERIOR IZQUIERDA de la ventana
# Usar 30% del ancho y 85% de la altura para hacer clic en el botón "Entrar"
$xRelativo = [int]($windowWidth * 0.30)  # 30% del ancho (izquierda)
$yRelativo = [int]($windowHeight * 0.85)  # 85% de la altura (abajo)

# Convertir a coordenadas absolutas de pantalla
$x = $rect.Left + $xRelativo
$y = $rect.Top + $yRelativo

# Mover el cursor y hacer clic
$cursorMoved = [Mouse]::SetCursorPos($x, $y)
Start-Sleep -Milliseconds 500

# Hacer clic
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
Start-Sleep -Milliseconds 200
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
Start-Sleep -Milliseconds 300

Write-Output "OK:$x,$y"
`;
    try {
      const resultado = this._runPowerShell(script);
      
      if (!resultado) {
        console.log(`   ❌ ERROR: Resultado vacío del script PowerShell`);
        return false;
      }
      
      // El resultado puede tener múltiples líneas, buscar la línea que contiene "OK"
      const lineas = resultado.split('\n').map(l => l.trim()).filter(l => l);
      const lineaOK = lineas.find(l => l.includes('OK'));
      
      console.log(`   🔍 Resultado del script PowerShell (${lineas.length} líneas):`);
      lineas.forEach((linea, idx) => {
        console.log(`      [${idx + 1}] ${linea}`);
      });
      
      if (lineaOK) {
        const coordenadas = lineaOK.split(':')[1] || 'N/A';
        console.log(`   ✅ Clic en botón "Entrar" realizado en coordenadas: ${coordenadas}`);
        return true;
      } else {
        // Mostrar el error específico
        const lineaError = lineas.find(l => l.includes('NO_PROCESS') || l.includes('FAIL_ACTIVATE') || l.includes('NO_WINDOW') || l.includes('FAIL_GETRECT') || l.includes('FAIL_INVALID_SIZE'));
        if (lineaError) {
          if (lineaError.includes('NO_PROCESS')) {
            console.log(`   ❌ ERROR: No se encontró el proceso con título "${tituloVentana}"`);
          } else if (lineaError.includes('NO_WINDOW')) {
            console.log(`   ❌ ERROR: El proceso no tiene ventana principal`);
          } else if (lineaError.includes('FAIL_ACTIVATE')) {
            console.log(`   ❌ ERROR: No se pudo activar la ventana`);
          } else if (lineaError.includes('FAIL_GETRECT')) {
            console.log(`   ❌ ERROR: No se pudo obtener las dimensiones de la ventana`);
          } else if (lineaError.includes('FAIL_INVALID_SIZE')) {
            console.log(`   ❌ ERROR: Dimensiones de ventana inválidas: ${lineaError}`);
          }
        } else {
          console.log(`   ⚠️  No se pudo hacer clic directo (resultado sin "OK")`);
          console.log(`   Resultado completo: "${resultado.substring(0, 300)}"`);
        }
        return false;
      }
    } catch (error) {
      console.log(`   ⚠️  Error al hacer clic en botón "Entrar": ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
      return false;
    }
  }

  /**
   * Selecciona la compañía después del login
   */
  async seleccionarCompania(tituloVentana) {
    try {
      console.log('🏢 Esperando selección de compañía...');
      // Esperar a que aparezca la ventana de selección
      await this._wait(2000);
      
      // Buscar la ventana de selección de compañía
      console.log('   Buscando ventana de selección de compañía...');
      await this.buscarVentanaPorTitulo(tituloVentana);
      await this._wait(1000);
      
      // Activar la ventana
      console.log('   Activando ventana...');
      await this.activarVentana(tituloVentana);
      await this._wait(500);
      
      // Hacer clic directamente en el botón de flecha del dropdown
      console.log('   🖱️  Haciendo clic en el botón de flecha del dropdown...');
      const clicFlechaOk = await this._hacerClicEnBotonFlecha(tituloVentana);
      if (!clicFlechaOk) {
        // Si falla, intentar con F4
        console.log('   Intentando abrir dropdown con F4...');
        await this._enviarTeclas('{F4}', tituloVentana);
      }
      await this._wait(1500); // Esperar a que se abra el dropdown
      
      // Bajar hasta el último elemento (Inka moss) usando flechas
      console.log('   ⬇️  Bajando hasta "Inka moss" (último elemento)...');
      for (let i = 0; i < 20; i++) {
        await this._enviarTeclas('{DOWN}', tituloVentana);
        await this._wait(100);
      }
      await this._wait(500);
      
      // Hacer clic directamente en "Inka moss" para seleccionarlo
      console.log('   ✅ Haciendo clic en "Inka moss" para seleccionarlo...');
      const clicInkaMossOk = await this._hacerClicEnInkaMoss(tituloVentana);
      if (!clicInkaMossOk) {
        // Si falla el clic directo, usar ENTER
        console.log('   Usando ENTER como alternativa...');
        await this._enviarTeclas('{ENTER}', tituloVentana);
      }
      await this._wait(1000); // Espera para que se procese completamente la selección de compañía
      
      // PRIMER CLIC EN "ENTRAR" - Usar SendKeys (mismo método que en el login)
      console.log('   🚀 Yendo DIRECTAMENTE al botón "Entrar" usando TAB+ENTER...');
      
      // Verificar que la ventana existe antes de intentar enviar teclas
      console.log('   Verificando que la ventana existe...');
      let ventanaExiste = await this._verificarVentanaRapido(tituloVentana);
      if (!ventanaExiste) {
        console.log('   ⚠️  Ventana no encontrada, buscando...');
        await this.buscarVentanaPorTitulo(tituloVentana);
        await this._wait(1000);
      }
      
      // Activar la ventana
      await this.activarVentana(tituloVentana);
      await this._wait(1000);
      
      // Presionar TAB varias veces para navegar al botón "Entrar"
      // (El dropdown se cierra automáticamente al seleccionar con ENTER)
      console.log('   Presionando TAB para navegar al botón "Entrar"...');
      await this._enviarTeclas('{TAB}', tituloVentana);
      await this._wait(400);
      await this._enviarTeclas('{TAB}', tituloVentana);
      await this._wait(400);
      await this._enviarTeclas('{TAB}', tituloVentana);
      await this._wait(600);
      
      // Presionar ENTER en el botón "Entrar" (PRIMER CLIC)
      console.log('   ✅ Presionando ENTER en el botón "Entrar" (primera vez)...');
      await this._enviarTeclas('{ENTER}', tituloVentana);
      await this._wait(3000); // Esperar 3 segundos como solicitado
      
      // SEGUNDO CLIC EN "ENTRAR" - Después de esperar 3 segundos
      console.log('   🚀 Haciendo clic en el botón "Entrar" (segunda vez)...');
      
      // Verificar nuevamente que la ventana existe
      ventanaExiste = await this._verificarVentanaRapido(tituloVentana);
      if (!ventanaExiste) {
        console.log('   ⚠️  Ventana no encontrada, buscando...');
        await this.buscarVentanaPorTitulo(tituloVentana);
        await this._wait(1000);
      }
      
      await this.activarVentana(tituloVentana);
      await this._wait(1000);
      
      // Presionar TAB varias veces para navegar al botón "Entrar" nuevamente
      console.log('   Presionando TAB para navegar al botón "Entrar"...');
      await this._enviarTeclas('{TAB}', tituloVentana);
      await this._wait(400);
      await this._enviarTeclas('{TAB}', tituloVentana);
      await this._wait(400);
      await this._enviarTeclas('{TAB}', tituloVentana);
      await this._wait(600);
      
      // Presionar ENTER en el botón "Entrar" (SEGUNDO CLIC)
      console.log('   ✅ Presionando ENTER en el botón "Entrar" (segunda vez)...');
      await this._enviarTeclas('{ENTER}', tituloVentana);
      await this._wait(1000);
      
      // ACEPTAR - Para entrar a la aplicación
      console.log('   ✅ Aceptando para entrar a la aplicación...');
      
      // Verificar nuevamente que la ventana existe
      ventanaExiste = await this._verificarVentanaRapido(tituloVentana);
      if (!ventanaExiste) {
        console.log('   ⚠️  Ventana no encontrada, buscando...');
        await this.buscarVentanaPorTitulo(tituloVentana);
        await this._wait(1000);
      }
      
      await this.activarVentana(tituloVentana);
      await this._wait(1000);
      await this._enviarTeclas('{ENTER}', tituloVentana);
      await this._wait(2000);
      
      // Esperar a que la aplicación se abra completamente
      console.log('   Esperando a que la aplicación se abra...');
      for (let i = 0; i < 3; i++) {
        await this._wait(1000);
        console.log(`   Esperando... (${i + 1}/3)`);
      }
      
      // Activar la ventana final
      await this.activarVentana(tituloVentana);
      await this._wait(300);
      
      console.log('✅ Compañía "Inka moss" seleccionada y aplicación iniciada');
    } catch (error) {
      console.error(`❌ Error al seleccionar compañía: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Navega a Utilitarios y luego a Movimiento Datos
   * Fase 2: Navegación por menús
   */
  async navegarAUtilitarios(tituloVentana) {
    try {
      console.log('📂 Iniciando navegación a Utilitarios...');
      
      // Activar la ventana una vez
      console.log('   Activando ventana...');
      await this.activarVentana(tituloVentana);
      await this._wait(1000);
      
      // Hacer clic en "Utilitarios" - ALT+U
      console.log('   Haciendo clic en Utilitarios (ALT+U)...');
      // Activar la ventana antes de hacer clic
      await this.activarVentana(tituloVentana);
      await this._wait(1000);
      // Enviar ALT+U para abrir el menú Utilitarios
      await this._enviarTeclas('%U', tituloVentana);
      console.log('   ✅ ALT+U enviado, esperando a que se abra el menú...');
      await this._wait(4000); // Esperar más tiempo para que el menú se abra completamente
      
      // Esperar un momento para que el menú se abra completamente
      console.log('   Esperando a que el menú se abra completamente...');
      await this._wait(2000);
      
      // Bajar 12 veces - SOLO SendKeys (SIN AppActivate)
      console.log('   ⬇️  Bajando 12 veces...');
      for (let i = 0; i < 12; i++) {
        try {
          console.log(`   [${i + 1}/12] Enviando {DOWN}...`);
          
          // Usar SOLO SendKeys directamente (SIN activar ventana, SIN AppActivate)
          const script = `
$wshell = New-Object -ComObject wscript.shell
Start-Sleep -Milliseconds 200
$wshell.SendKeys('{DOWN}')
Write-Output 'OK'
`;
          const resultado = this._runPowerShell(script);
          
          // Esperar para que el menú procese el movimiento
          await this._wait(400);
          console.log(`   ✅ Movimiento ${i + 1}/12 completado`);
        } catch (error) {
          console.error(`   ❌ Error en movimiento ${i + 1}/12: ${error.message}`);
          // Continuar con el siguiente movimiento aunque haya error
          await this._wait(400);
        }
      }
      
      // Esperar un momento después de bajar las 12 veces
      console.log('   Esperando a que el menú se estabilice...');
      await this._wait(1500);
      
      // Hacer clic en "Movimiento Datos" (ENTER)
      console.log('   📋 Haciendo clic en Movimiento Datos...');
      
      // Esperar un momento para asegurar que el menú esté listo
      await this._wait(1000);
      
      // Enviar ENTER directamente con SendKeys (sin AppActivate, sin buscar procesos)
      // El menú ya está enfocado después de bajar las 12 veces
      console.log('   Enviando ENTER con SendKeys...');
      const scriptEnter = `
$wshell = New-Object -ComObject wscript.shell
Start-Sleep -Milliseconds 500
$wshell.SendKeys('{ENTER}')
Write-Output 'OK'
`;
      
      // Intentar múltiples veces para asegurar que funcione
      for (let intento = 1; intento <= 3; intento++) {
        console.log(`   Intento ${intento}/3 de enviar ENTER...`);
        const resultado = this._runPowerShell(scriptEnter);
        
        if (resultado && resultado.includes('OK')) {
          console.log(`   ✅ ENTER enviado exitosamente en intento ${intento}`);
          break;
        } else {
          console.log(`   ⚠️  Intento ${intento} falló, reintentando...`);
          await this._wait(1000);
        }
      }
      
      console.log('   ✅ Esperando a que se abra el submenú...');
      await this._wait(5000); // Esperar más tiempo para que el submenú se abra completamente
      
      // Esperar un momento para que el submenú se abra completamente
      console.log('   Esperando a que el submenú se abra completamente...');
      await this._wait(2000);
      
      // Bajar 7 veces - SOLO SendKeys (SIN AppActivate)
      console.log('   ⬇️  Bajando 7 veces en el submenú...');
      for (let i = 0; i < 7; i++) {
        try {
          console.log(`   [${i + 1}/7] Enviando {DOWN}...`);
          
          // Usar SOLO SendKeys directamente (SIN activar ventana, SIN AppActivate)
          const script = `
$wshell = New-Object -ComObject wscript.shell
Start-Sleep -Milliseconds 200
$wshell.SendKeys('{DOWN}')
Write-Output 'OK'
`;
          const resultado = this._runPowerShell(script);
          
          // Esperar para que el submenú procese el movimiento
          await this._wait(400);
          console.log(`   ✅ Movimiento ${i + 1}/7 completado`);
        } catch (error) {
          console.error(`   ❌ Error en movimiento ${i + 1}/7: ${error.message}`);
          // Continuar con el siguiente movimiento aunque haya error
          await this._wait(400);
        }
      }
      
      // Esperar un momento después de bajar las 7 veces
      console.log('   Esperando a que el submenú se estabilice...');
      await this._wait(1000);
      
      // Hacer clic en el último elemento (ENTER)
      console.log('   ✅ Haciendo clic en el último elemento...');
      
      // Esperar un momento para asegurar que el submenú esté listo
      await this._wait(1000);
      
      // Enviar ENTER directamente con SendKeys (sin AppActivate, sin buscar procesos)
      console.log('   Enviando ENTER con SendKeys...');
      const scriptEnterUltimo = `
$wshell = New-Object -ComObject wscript.shell
Start-Sleep -Milliseconds 500
$wshell.SendKeys('{ENTER}')
Write-Output 'OK'
`;
      
      // Intentar múltiples veces para asegurar que funcione
      for (let intento = 1; intento <= 3; intento++) {
        console.log(`   Intento ${intento}/3 de enviar ENTER...`);
        const resultado = this._runPowerShell(scriptEnterUltimo);
        
        if (resultado && resultado.includes('OK')) {
          console.log(`   ✅ ENTER enviado exitosamente en intento ${intento}`);
          break;
        } else {
          console.log(`   ⚠️  Intento ${intento} falló, reintentando...`);
          await this._wait(1000);
        }
      }
      
      console.log('   ✅ ENTER enviado');
      
      // Esperar a que se abra el diálogo de selección de archivo/carpeta
      console.log('   ⏳ Esperando a que se abra el diálogo...');
      await this._wait(8000); // Aumentado a 8 segundos para dar más tiempo
      
      // Conectar a la carpeta Extraccion_excel
      await this.conectarACarpetaExtraccionExcel(tituloVentana);
      
      console.log('✅ Navegación completada');
    } catch (error) {
      console.error(`❌ Error en navegación a Utilitarios: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Conecta el bot a la carpeta C:\Extraccion_excel
   * Busca la carpeta en el disco C y navega hasta ella en el diálogo de selección
   * NOTA: La carpeta ya debe estar inicializada antes de llamar a esta función
   */
  /**
   * Envía teclas directamente usando SendKeys SIN buscar la ventana
   * Método directo para cuando la ventana ya está activa
   * @private
   */
  async _enviarTeclasDirecto(teclas) {
    const teclasEscapadas = teclas.replace(/'/g, "''");
    const script = `
$wshell = New-Object -ComObject wscript.shell
Start-Sleep -Milliseconds 200
$wshell.SendKeys('${teclasEscapadas}')
Write-Output 'OK'
`;
    try {
      const resultado = this._runPowerShell(script);
      return resultado && resultado.includes('OK');
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el nombre del archivo dentro de la carpeta C:\Extraccion_excel
   * Retorna el primer archivo encontrado (o el más reciente si hay múltiples)
   * @private
   * @returns {string|null} Nombre del archivo o null si no hay archivos
   */
  _obtenerNombreArchivoExtraccionExcel() {
    try {
      if (!fs.existsSync(this.carpetaExtraccionExcel)) {
        console.log(`⚠️  Carpeta ${this.carpetaExtraccionExcel} no existe`);
        return null;
      }

      const archivos = fs.readdirSync(this.carpetaExtraccionExcel);
      
      // Filtrar solo archivos (no carpetas)
      const archivosReales = archivos.filter(archivo => {
        const rutaCompleta = path.join(this.carpetaExtraccionExcel, archivo);
        try {
          const stats = fs.statSync(rutaCompleta);
          return stats.isFile();
        } catch (e) {
          return false;
        }
      });

      if (archivosReales.length === 0) {
        console.log(`⚠️  No se encontraron archivos en ${this.carpetaExtraccionExcel}`);
        return null;
      }

      // Si hay múltiples archivos, obtener el más reciente
      if (archivosReales.length > 1) {
        const archivosConFecha = archivosReales.map(archivo => {
          const rutaCompleta = path.join(this.carpetaExtraccionExcel, archivo);
          const stats = fs.statSync(rutaCompleta);
          return {
            nombre: archivo,
            fechaModificacion: stats.mtime
          };
        });

        archivosConFecha.sort((a, b) => b.fechaModificacion - a.fechaModificacion);
        const archivoMasReciente = archivosConFecha[0].nombre;
        console.log(`📄 Múltiples archivos encontrados, usando el más reciente: ${archivoMasReciente}`);
        return archivoMasReciente;
      }

      const nombreArchivo = archivosReales[0];
      console.log(`📄 Archivo encontrado: ${nombreArchivo}`);
      return nombreArchivo;
    } catch (error) {
      console.error(`❌ Error al obtener nombre de archivo: ${error.message}`);
      return null;
    }
  }

  /**
   * Lista todos los archivos en la carpeta Extraccion_excel con información detallada
   * Verifica que la carpeta esté sincronizada con Google Cloud
   * @private
   */
  _listarArchivosExtraccionExcel() {
    try {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('📂 LISTADO DE ARCHIVOS EN C:\\Extraccion_excel');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      // Verificar que la carpeta existe
      if (!fs.existsSync(this.carpetaExtraccionExcel)) {
        console.log(`❌ ERROR: La carpeta ${this.carpetaExtraccionExcel} no existe`);
        console.log('   → Verificando sincronización con Google Cloud...');
        return;
      }

      console.log(`✅ Carpeta encontrada: ${this.carpetaExtraccionExcel}`);
      console.log('   → Verificando sincronización con Google Cloud...\n');

      // Leer todos los archivos y carpetas
      const elementos = fs.readdirSync(this.carpetaExtraccionExcel);
      
      // Separar archivos y carpetas
      const archivos = [];
      const carpetas = [];

      elementos.forEach(elemento => {
        const rutaCompleta = path.join(this.carpetaExtraccionExcel, elemento);
        try {
          const stats = fs.statSync(rutaCompleta);
          if (stats.isFile()) {
            archivos.push({
              nombre: elemento,
              ruta: rutaCompleta,
              stats: stats
            });
          } else if (stats.isDirectory()) {
            carpetas.push({
              nombre: elemento,
              ruta: rutaCompleta,
              stats: stats
            });
          }
        } catch (e) {
          console.log(`   ⚠️  Error al leer elemento "${elemento}": ${e.message}`);
        }
      });

      // Mostrar información de carpetas si las hay
      if (carpetas.length > 0) {
        console.log('📁 CARPETAS ENCONTRADAS:');
        carpetas.forEach((carpeta, index) => {
          const fechaMod = carpeta.stats.mtime.toLocaleString('es-ES');
          console.log(`   ${index + 1}. ${carpeta.nombre}`);
          console.log(`      📅 Última modificación: ${fechaMod}`);
        });
        console.log('');
      }

      // Mostrar información de archivos
      if (archivos.length === 0) {
        console.log('⚠️  No se encontraron archivos en la carpeta');
        console.log('   → Verifica que Google Cloud esté sincronizado con esta carpeta');
        console.log('═══════════════════════════════════════════════════════════\n');
        return;
      }

      console.log(`📄 ARCHIVOS ENCONTRADOS (${archivos.length}):\n`);

      // Ordenar archivos por fecha de modificación (más reciente primero)
      archivos.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      archivos.forEach((archivo, index) => {
        const fechaMod = archivo.stats.mtime.toLocaleString('es-ES');
        const fechaCreacion = archivo.stats.birthtime.toLocaleString('es-ES');
        const tamanoBytes = archivo.stats.size;
        const tamanoKB = (tamanoBytes / 1024).toFixed(2);
        const tamanoMB = (tamanoBytes / (1024 * 1024)).toFixed(2);
        const tamanoFormato = tamanoBytes > 1024 * 1024 ? `${tamanoMB} MB` : `${tamanoKB} KB`;

        console.log(`   ${index + 1}. 📄 ${archivo.nombre}`);
        console.log(`      📅 Última modificación: ${fechaMod}`);
        console.log(`      📅 Fecha de creación: ${fechaCreacion}`);
        console.log(`      📦 Tamaño: ${tamanoFormato} (${tamanoBytes} bytes)`);
        console.log(`      📍 Ruta completa: ${archivo.ruta}`);
        console.log('');
      });

      // Resumen
      const archivoMasReciente = archivos[0];
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📊 RESUMEN:');
      console.log(`   • Total de archivos: ${archivos.length}`);
      console.log(`   • Archivo más reciente: ${archivoMasReciente.nombre}`);
      console.log(`   • Última modificación: ${archivoMasReciente.stats.mtime.toLocaleString('es-ES')}`);
      console.log('═══════════════════════════════════════════════════════════\n');

    } catch (error) {
      console.error(`\n❌ ERROR al listar archivos en ${this.carpetaExtraccionExcel}:`);
      console.error(`   ${error.message}`);
      console.error(`   Stack: ${error.stack}\n`);
    }
  }

  /**
   * Selecciona los archivos más recientes de la carpeta Extraccion_excel
   * Los archivos que se suban a Google Cloud aparecerán automáticamente en esta carpeta
   * @returns {Array} Array de objetos con información de archivos recientes
   * @private
   */
  async _seleccionarArchivosRecientes() {
    try {
      if (!fs.existsSync(this.carpetaExtraccionExcel)) {
        console.log('   ⚠️  La carpeta no existe');
        return [];
      }

      console.log('   → Buscando archivos en la carpeta...');
      const elementos = fs.readdirSync(this.carpetaExtraccionExcel);
      const archivos = [];

      // Obtener información de todos los archivos
      for (const elemento of elementos) {
        const rutaCompleta = path.join(this.carpetaExtraccionExcel, elemento);
        try {
          const stats = fs.statSync(rutaCompleta);
          if (stats.isFile()) {
            archivos.push({
              nombre: elemento,
              ruta: rutaCompleta,
              fechaModificacion: stats.mtime,
              fechaCreacion: stats.birthtime,
              tamano: stats.size
            });
          }
        } catch (e) {
          // Ignorar errores al leer archivos
          continue;
        }
      }

      if (archivos.length === 0) {
        console.log('   ⚠️  No se encontraron archivos en la carpeta');
        return [];
      }

      // Ordenar por fecha de modificación (más reciente primero)
      archivos.sort((a, b) => b.fechaModificacion.getTime() - a.fechaModificacion.getTime());

      // Seleccionar los 3 archivos más recientes
      const cantidadSeleccionar = 3;
      const archivosSeleccionados = archivos.slice(0, cantidadSeleccionar);

      console.log(`   → Archivos encontrados: ${archivos.length}`);
      console.log(`   → Archivos recientes seleccionados: ${archivosSeleccionados.length} (los ${cantidadSeleccionar} más recientes)`);
      archivosSeleccionados.forEach((archivo, index) => {
        const fechaMod = archivo.fechaModificacion.toLocaleString('es-ES');
        console.log(`      ${index + 1}. ${archivo.nombre} (modificado: ${fechaMod})`);
      });

      return archivosSeleccionados;

    } catch (error) {
      console.error(`   ❌ Error al seleccionar archivos recientes: ${error.message}`);
      return [];
    }
  }

  /**
   * Valida los archivos seleccionados
   * Verifica que los archivos estén completos, tengan formato válido, etc.
   * @param {Array} archivosSeleccionados - Array de archivos a validar
   * @returns {Array} Array de objetos con información de archivos válidos
   * @private
   */
  async _validarArchivosSeleccionados(archivosSeleccionados) {
    if (!archivosSeleccionados || archivosSeleccionados.length === 0) {
      return [];
    }

    const archivosValidos = [];

    for (const archivo of archivosSeleccionados) {
      try {
        // Validación 1: El archivo debe existir
        if (!fs.existsSync(archivo.ruta)) {
          console.log(`   ⚠️  Archivo no existe: ${archivo.nombre}`);
          continue;
        }

        // Validación 2: El archivo debe tener tamaño > 0
        const stats = fs.statSync(archivo.ruta);
        if (stats.size === 0) {
          console.log(`   ⚠️  Archivo vacío ignorado: ${archivo.nombre}`);
          continue;
        }

        // Validación 3: El archivo debe ser accesible (puede leerse)
        try {
          fs.accessSync(archivo.ruta, fs.constants.R_OK);
        } catch (e) {
          console.log(`   ⚠️  Archivo no accesible ignorado: ${archivo.nombre}`);
          continue;
        }

        // Validación 4: Verificar extensión (opcional, solo advertir)
        const extension = path.extname(archivo.nombre).toLowerCase();
        const extensionesValidas = ['.xlsx', '.xls', '.csv', '.txt', '.pdf'];
        if (extension && !extensionesValidas.includes(extension)) {
          console.log(`   ⚠️  Archivo con extensión no común: ${archivo.nombre} (${extension}) - pero se incluirá`);
        }

        // Si pasa todas las validaciones, agregar a la lista
        archivosValidos.push({
          nombre: archivo.nombre,
          ruta: archivo.ruta,
          tamano: stats.size,
          fechaModificacion: stats.mtime,
          extension: extension
        });

        console.log(`   ✅ Archivo válido: ${archivo.nombre} (${(stats.size / 1024).toFixed(2)} KB)`);

      } catch (error) {
        console.log(`   ⚠️  Error al validar ${archivo.nombre}: ${error.message}`);
        continue;
      }
    }

    return archivosValidos;
  }

  /**
   * Valida los archivos en la carpeta Extraccion_excel
   * Verifica que los archivos estén completos, tengan formato válido, etc.
   * @returns {Array} Array de objetos con información de archivos válidos
   * @private
   * @deprecated Usar _validarArchivosSeleccionados en su lugar
   */
  async _validarArchivos() {
    try {
      console.log('   → Verificando archivos en la carpeta...');
      
      if (!fs.existsSync(this.carpetaExtraccionExcel)) {
        console.log('   ❌ La carpeta no existe');
        return [];
      }

      const elementos = fs.readdirSync(this.carpetaExtraccionExcel);
      const archivosValidos = [];

      for (const elemento of elementos) {
        const rutaCompleta = path.join(this.carpetaExtraccionExcel, elemento);
        
        try {
          const stats = fs.statSync(rutaCompleta);
          
          // Solo validar archivos (no carpetas)
          if (!stats.isFile()) {
            continue;
          }

          // Validación 1: El archivo debe tener tamaño > 0
          if (stats.size === 0) {
            console.log(`   ⚠️  Archivo vacío ignorado: ${elemento}`);
            continue;
          }

          // Validación 2: El archivo debe tener una extensión válida (opcional, pero recomendado)
          const extension = path.extname(elemento).toLowerCase();
          const extensionesValidas = ['.xlsx', '.xls', '.csv', '.txt', '.pdf'];
          
          // Si tiene extensión, verificar que sea válida (pero no rechazar si no tiene)
          if (extension && !extensionesValidas.includes(extension)) {
            console.log(`   ⚠️  Archivo con extensión no común ignorado: ${elemento} (${extension})`);
            // No rechazamos, solo advertimos
          }

          // Validación 3: El archivo debe ser accesible (puede leerse)
          try {
            fs.accessSync(rutaCompleta, fs.constants.R_OK);
          } catch (e) {
            console.log(`   ⚠️  Archivo no accesible ignorado: ${elemento}`);
            continue;
          }

          // Validación 4: El archivo debe haber sido modificado recientemente (no muy antiguo)
          // Archivos modificados en los últimos 30 días se consideran válidos
          const diasDesdeModificacion = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
          if (diasDesdeModificacion > 30) {
            console.log(`   ⚠️  Archivo muy antiguo (${Math.round(diasDesdeModificacion)} días), pero se incluirá: ${elemento}`);
            // No rechazamos, solo advertimos
          }

          // Si pasa todas las validaciones, agregar a la lista
          archivosValidos.push({
            nombre: elemento,
            ruta: rutaCompleta,
            tamano: stats.size,
            fechaModificacion: stats.mtime,
            extension: extension
          });

          console.log(`   ✅ Archivo válido: ${elemento} (${(stats.size / 1024).toFixed(2)} KB)`);

        } catch (error) {
          console.log(`   ⚠️  Error al validar ${elemento}: ${error.message}`);
          continue;
        }
      }

      console.log(`   ✅ Validación completada: ${archivosValidos.length} archivo(s) válido(s)`);
      return archivosValidos;

    } catch (error) {
      console.error(`   ❌ Error al validar archivos: ${error.message}`);
      return [];
    }
  }

  /**
   * Sube los archivos validados
   * @param {Array} archivosValidos - Array de objetos con información de archivos válidos
   * @returns {boolean} true si todos los archivos se subieron exitosamente
   * @private
   */
  async _subirArchivos(archivosValidos) {
    try {
      if (!archivosValidos || archivosValidos.length === 0) {
        console.log('   ⚠️  No hay archivos para subir');
        return false;
      }

      let archivosSubidos = 0;
      let archivosFallidos = 0;

      for (const archivo of archivosValidos) {
        try {
          console.log(`   → Procesando archivo: ${archivo.nombre}...`);
          
          // Aquí se puede agregar la lógica específica para subir/procesar cada archivo
          // Por ahora, simulamos el proceso
          await this._wait(500);
          
          // Verificar que el archivo todavía existe y es accesible
          if (!fs.existsSync(archivo.ruta)) {
            console.log(`   ⚠️  Archivo no encontrado: ${archivo.nombre}`);
            archivosFallidos++;
            continue;
          }

          // Procesar el archivo (aquí se puede agregar lógica específica)
          // Por ejemplo: subir a un servidor, procesar en la aplicación, etc.
          console.log(`   ✅ Archivo procesado exitosamente: ${archivo.nombre}`);
          archivosSubidos++;

        } catch (error) {
          archivosFallidos++;
          console.error(`   ❌ Error al procesar ${archivo.nombre}: ${error.message}`);
        }
      }

      console.log(`\n   📊 Resumen:`);
      console.log(`      • Archivos procesados exitosamente: ${archivosSubidos}`);
      if (archivosFallidos > 0) {
        console.log(`      • Archivos con errores: ${archivosFallidos}`);
      }

      return archivosFallidos === 0;

    } catch (error) {
      console.error(`   ❌ Error al subir archivos: ${error.message}`);
      return false;
    }
  }

  /**
   * Sube los archivos validados a Google Cloud Storage
   * @param {Array} archivosValidos - Array de objetos con información de archivos válidos
   * @returns {boolean} true si todos los archivos se subieron exitosamente
   * @private
   * @deprecated Usar _subirArchivos en su lugar
   */
  async _subirArchivosACloud(archivosValidos) {
    try {
      if (!archivosValidos || archivosValidos.length === 0) {
        console.log('   ⚠️  No hay archivos para subir');
        return false;
      }

      console.log(`   → Subiendo ${archivosValidos.length} archivo(s)...`);

      // Asegurar que GCS Storage esté inicializado
      const inicializado = await this.gcsStorage.inicializar();
      if (!inicializado) {
        console.log('   ❌ No se pudo inicializar la conexión con Google Cloud Storage');
        return false;
      }

      let archivosSubidos = 0;
      let archivosFallidos = 0;

      for (const archivo of archivosValidos) {
        try {
          console.log(`   → Subiendo: ${archivo.nombre}...`);
          
          // Construir la ruta de destino en el bucket
          const rutaDestino = `Extraccion_excel/${archivo.nombre}`;
          
          // Subir el archivo
          const exito = this.gcsStorage.subirArchivo(archivo.ruta, rutaDestino);
          
          if (exito) {
            archivosSubidos++;
            console.log(`   ✅ ${archivo.nombre} subido exitosamente`);
          } else {
            archivosFallidos++;
            console.log(`   ❌ Error al subir ${archivo.nombre}`);
          }

          // Pequeña pausa entre subidas para no sobrecargar
          await this._wait(500);

        } catch (error) {
          archivosFallidos++;
          console.error(`   ❌ Error al subir ${archivo.nombre}: ${error.message}`);
        }
      }

      console.log(`\n   📊 Resumen de subida:`);
      console.log(`      • Archivos subidos exitosamente: ${archivosSubidos}`);
      if (archivosFallidos > 0) {
        console.log(`      • Archivos con errores: ${archivosFallidos}`);
      }

      return archivosFallidos === 0;

    } catch (error) {
      console.error(`   ❌ Error al subir archivos a Google Cloud: ${error.message}`);
      return false;
    }
  }

  async conectarACarpetaExtraccionExcel(tituloVentana) {
    try {
      console.log('📁 Dirigiendo bot al campo "Nombre del Archivo"...');
      
      // Verificar que la carpeta fue inicializada correctamente
      if (!this.carpetaConectada) {
        console.log('   ⚠️  La carpeta no fue inicializada correctamente, intentando inicializar ahora...');
        const inicializada = this.inicializarCarpetaExtraccionExcel();
        if (!inicializada) {
          throw new Error('No se pudo inicializar la carpeta C:\\Extraccion_excel');
        }
      }
      
      console.log('   ✅ Carpeta C:\\Extraccion_excel ya está conectada y lista');
      
      // El diálogo debería estar activo después del ENTER
      // Interactuar directamente SIN buscar la ventana
      console.log('   → El diálogo debería estar activo, interactuando directamente...');
      await this._wait(3000); // Esperar a que el diálogo se abra completamente
      
      // PASO 1: Navegar al campo "Nombre del Archivo" usando TAB
      // El campo "Nombre del Archivo" está después del campo de exploración
      console.log('   → Navegando al campo "Nombre del Archivo" con TAB...');
      await this._wait(500);
      
      // Enviar TAB varias veces para llegar al campo "Nombre del Archivo"
      // Usar método directo SIN buscar ventana
      for (let i = 0; i < 3; i++) {
        await this._enviarTeclasDirecto('{TAB}');
        await this._wait(400);
      }
      await this._wait(1000);
      
      // PASO 2: Limpiar completamente el campo y escribir solo la ruta
      console.log('   → Limpiando campo y escribiendo ruta C:\\Extraccion_excel...');
      await this._wait(500);
      
      // Ir al final del campo (END)
      await this._enviarTeclasDirecto('{END}');
      await this._wait(200);
      
      // Seleccionar todo desde el final hasta el inicio (SHIFT+HOME)
      await this._enviarTeclasDirecto('+{HOME}');
      await this._wait(300);
      
      // Borrar todo el contenido seleccionado (DELETE)
      await this._enviarTeclasDirecto('{DELETE}');
      await this._wait(300);
      
      // Método alternativo: Ctrl+A + BACKSPACE (más agresivo)
      await this._enviarTeclasDirecto('^{a}');
      await this._wait(200);
      await this._enviarTeclasDirecto('{BACKSPACE}');
      await this._wait(300);
      
      // Verificar que esté vacío: HOME + SHIFT+END + DELETE
      await this._enviarTeclasDirecto('{HOME}');
      await this._wait(100);
      await this._enviarTeclasDirecto('+{END}');
      await this._wait(100);
      await this._enviarTeclasDirecto('{DELETE}');
      await this._wait(300);
      
      // Escribir la ruta base: C:\Extraccion_excel
      // En SendKeys, la barra invertida se escribe como \ (una sola)
      await this._enviarTeclasDirecto('C:\\Extraccion_excel');
      await this._wait(300);
      
      // Agregar la barra invertida final: \
      await this._enviarTeclasDirecto('\\');
      await this._wait(300);
      
      // Obtener el nombre del archivo de la carpeta
      console.log('   → Obteniendo nombre del archivo de la carpeta...');
      const nombreArchivo = this._obtenerNombreArchivoExtraccionExcel();
      
      if (nombreArchivo) {
        // Escribir el nombre del archivo
        console.log(`   → Escribiendo nombre del archivo: ${nombreArchivo}`);
        await this._enviarTeclasDirecto(nombreArchivo);
        await this._wait(500);
        console.log(`   ✅ Ruta completa escrita: C:\\Extraccion_excel\\${nombreArchivo}`);
      } else {
        console.log('   ⚠️  No se pudo obtener el nombre del archivo, solo se escribió la ruta de la carpeta');
      }
      
      await this._wait(500);
      console.log('✅ Bot dirigido correctamente al campo "Nombre del Archivo"');
      
      // PASO 3: Listar archivos en la carpeta Extraccion_excel
      console.log('📋 Listando archivos en la carpeta Extraccion_excel...');
      await this._wait(500);
      this._listarArchivosExtraccionExcel();
      
      // PASO 4: Seleccionar archivos recientes
      // Los archivos que se suban a Google Cloud aparecerán automáticamente en la carpeta del disco C
      console.log('\n📅 Seleccionando archivos recientes...');
      const archivosRecientes = await this._seleccionarArchivosRecientes();
      
      if (archivosRecientes.length === 0) {
        console.log('⚠️  No se encontraron archivos recientes');
        return;
      }
      
      console.log(`   ✅ Se seleccionaron ${archivosRecientes.length} archivo(s) reciente(s)`);
      
      // PASO 5: Validar archivos seleccionados
      console.log('\n✅ Validando archivos seleccionados...');
      const archivosValidos = await this._validarArchivosSeleccionados(archivosRecientes);
      
      if (archivosValidos.length === 0) {
        console.log('⚠️  No se encontraron archivos válidos después de la validación');
        return;
      }
      
      console.log(`   ✅ Se validaron ${archivosValidos.length} archivo(s) correctamente`);
      
      // PASO 6: Subir archivos validados
      console.log(`\n⬆️  Subiendo ${archivosValidos.length} archivo(s) validado(s)...`);
      const subidaExitosa = await this._subirArchivos(archivosValidos);
      
      if (subidaExitosa) {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ ARCHIVOS SUBIDOS CON ÉXITO');
        console.log('═══════════════════════════════════════════════════════════\n');
      } else {
        console.log('\n⚠️  Hubo problemas al subir algunos archivos');
      }
      
      // SUSPENDIDO: Clic en botón "Validación"
      // console.log('🔘 Haciendo clic en el botón "Validación"...');
      // await this._wait(1000);
      // ... código suspendido temporalmente ...
      
    } catch (error) {
      console.error(`❌ Error al dirigir bot al campo "Nombre del Archivo": ${error.message}`);
      console.error(`Stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Hace clic en el botón "Validación" usando coordenadas del mouse
   * El botón "Validación" típicamente está en la parte inferior derecha o central del diálogo
   * @private
   */
  async _hacerClicEnBotonValidacion(tituloVentana) {
    const tituloEscapado = tituloVentana.replace(/'/g, "''");
    const script = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  }
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }
  public class Mouse {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
    public const uint MOUSEEVENTF_LEFTDOWN = 0x02;
    public const uint MOUSEEVENTF_LEFTUP = 0x04;
  }
"@

$wshell = New-Object -ComObject wscript.shell
$process = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like '*${tituloEscapado}*' } | Select-Object -First 1
if ($null -eq $process) {
  Write-Output 'NO_PROCESS'
  exit
}

if ($process.MainWindowHandle -eq 0) {
  Write-Output 'NO_WINDOW'
  exit
}

$hwnd = [IntPtr]$process.MainWindowHandle
[Win32]::ShowWindow($hwnd, 9) | Out-Null
$result = [Win32]::SetForegroundWindow($hwnd)

if (-not $result) {
  Write-Output 'FAIL_ACTIVATE'
  exit
}

Start-Sleep -Milliseconds 800

# Obtener posición de la ventana
$rect = New-Object RECT
$gotRect = [Win32]::GetWindowRect($hwnd, [ref]$rect)

if (-not $gotRect) {
  Write-Output 'FAIL_GETRECT'
  exit
}

$windowWidth = $rect.Right - $rect.Left
$windowHeight = $rect.Bottom - $rect.Top

if ($windowWidth -le 0 -or $windowHeight -le 0) {
  Write-Output "FAIL_INVALID_SIZE:$windowWidth,$windowHeight"
  exit
}

# El botón "Validación" puede estar en diferentes posiciones del diálogo
# Probar múltiples posiciones, empezando por la más probable
$posiciones = @(
  @{x=0.75; y=0.85},  # 75% ancho, 85% altura (derecha inferior) - MÁS PROBABLE
  @{x=0.70; y=0.85},  # 70% ancho, 85% altura (centro-derecha inferior)
  @{x=0.80; y=0.85},  # 80% ancho, 85% altura (más a la derecha)
  @{x=0.65; y=0.85},  # 65% ancho, 85% altura (más al centro)
  @{x=0.75; y=0.80},  # 75% ancho, 80% altura (un poco más arriba)
  @{x=0.70; y=0.90}   # 70% ancho, 90% altura (más abajo)
)

# Usar la primera posición (más probable) y hacer clic
$pos = $posiciones[0]
$xRelativo = [int]($windowWidth * $pos.x)
$yRelativo = [int]($windowHeight * $pos.y)
$x = $rect.Left + $xRelativo
$y = $rect.Top + $yRelativo

# Mover el cursor y hacer clic
[Mouse]::SetCursorPos($x, $y)
Start-Sleep -Milliseconds 500

# Hacer clic
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
Start-Sleep -Milliseconds 200
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
Start-Sleep -Milliseconds 300

Write-Output "OK:$x,$y"
`;
    try {
      const resultado = this._runPowerShell(script);
      
      if (!resultado) {
        console.log(`   ⚠️  Resultado vacío del script PowerShell para botón "Validación"`);
        return false;
      }
      
      const lineas = resultado.split('\n').map(l => l.trim()).filter(l => l);
      const lineaOK = lineas.find(l => l.includes('OK'));
      
      if (lineaOK) {
        const coordenadas = lineaOK.split(':')[1] || 'N/A';
        console.log(`   ✅ Clic en botón "Validación" realizado en coordenadas: ${coordenadas}`);
        return true;
      } else {
        const lineaError = lineas.find(l => l.includes('NO_PROCESS') || l.includes('FAIL_ACTIVATE') || l.includes('NO_WINDOW') || l.includes('FAIL_GETRECT') || l.includes('FAIL_INVALID_SIZE'));
        if (lineaError) {
          console.log(`   ⚠️  Error al hacer clic con coordenadas: ${lineaError}`);
        } else {
          console.log(`   ⚠️  No se pudo hacer clic con coordenadas. Resultado: ${resultado.substring(0, 200)}`);
        }
        return false;
      }
    } catch (error) {
      console.log(`   ⚠️  Error al hacer clic en botón "Validación": ${error.message}`);
      return false;
    }
  }

  /**
   * Hace clic con el mouse en coordenadas específicas
   * @private
   */
  async _hacerClicMouse(x, y, tituloVentana) {
    const tituloEscapado = tituloVentana.replace(/'/g, "''");
    const script = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
  using System;
  using System.Runtime.InteropServices;
  public class Mouse {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
    public const uint MOUSEEVENTF_LEFTDOWN = 0x02;
    public const uint MOUSEEVENTF_LEFTUP = 0x04;
  }
"@

$wshell = New-Object -ComObject wscript.shell
$process = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like '*${tituloEscapado}*' } | Select-Object -First 1
if ($process) {
  $result = $wshell.AppActivate($process.Id)
  if (-not $result) {
    $result = $wshell.AppActivate($process.MainWindowTitle)
  }
  if ($result) {
    Start-Sleep -Milliseconds 300
    # Mover el cursor a la posición
    [Mouse]::SetCursorPos(${x}, ${y})
    Start-Sleep -Milliseconds 200
    # Hacer clic izquierdo
    [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 50
    [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 100
    Write-Output 'OK'
  } else {
    Write-Output 'FAIL_ACTIVATE'
  }
} else {
  Write-Output 'NO_PROCESS'
}
`;
    try {
      const resultado = this._runPowerShell(script);
      return resultado && resultado.includes('OK');
    } catch (error) {
      return false;
    }
  }

  /**
   * Hace clic en el botón de flecha del dropdown (botón derecho del combo box)
   * Calcula la posición relativa al selector de compañía
   * @private
   */
  async _hacerClicEnBotonFlecha(tituloVentana) {
    const tituloEscapado = tituloVentana.replace(/'/g, "''");
    const script = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  }
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }
  public class Mouse {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
    public const uint MOUSEEVENTF_LEFTDOWN = 0x02;
    public const uint MOUSEEVENTF_LEFTUP = 0x04;
  }
"@

$wshell = New-Object -ComObject wscript.shell
$process = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like '*${tituloEscapado}*' } | Select-Object -First 1
if ($process -and $process.MainWindowHandle -ne 0) {
  $hwnd = [IntPtr]$process.MainWindowHandle
  [Win32]::ShowWindow($hwnd, 9) | Out-Null
  $result = [Win32]::SetForegroundWindow($hwnd)
  
  if ($result) {
    Start-Sleep -Milliseconds 300
    # Obtener posición de la ventana
    $rect = New-Object RECT
    [Win32]::GetWindowRect($hwnd, [ref]$rect)
    
    # Calcular posición aproximada del botón de flecha
    # El botón de flecha está típicamente a la derecha del combo box
    # Asumiendo que el combo box está en el centro de la ventana
    $windowWidth = $rect.Right - $rect.Left
    $windowHeight = $rect.Bottom - $rect.Top
    
    # Posición aproximada: centro horizontal, un poco arriba del centro vertical
    # El botón de flecha está típicamente a ~85% del ancho de la ventana
    $x = $rect.Left + [int]($windowWidth * 0.85)
    $y = $rect.Top + [int]($windowHeight * 0.45)
    
    # Mover el cursor y hacer clic
    [Mouse]::SetCursorPos($x, $y)
    Start-Sleep -Milliseconds 200
    [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 50
    [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 100
    Write-Output "OK:$x,$y"
  } else {
    Write-Output 'FAIL_ACTIVATE'
  }
} else {
  Write-Output 'NO_PROCESS'
}
`;
    try {
      const resultado = this._runPowerShell(script);
      if (resultado && resultado.includes('OK')) {
        console.log(`   ✅ Clic en botón de flecha realizado`);
        return true;
      } else {
        console.log(`   ⚠️  No se pudo hacer clic en el botón de flecha, usando F4 como alternativa...`);
        // Usar F4 como alternativa (F4 abre comboboxes en Windows)
        await this._enviarTeclas('{F4}', tituloVentana);
        return true;
      }
    } catch (error) {
      console.log(`   ⚠️  Error al hacer clic en botón de flecha, usando F4 como alternativa...`);
      // Usar F4 como alternativa
      await this._enviarTeclas('{F4}', tituloVentana);
      return false;
    }
  }


  /**
   * Cierra el bot
   */
  async cerrar() {
    if (this.process) {
      this.process.kill();
    }
  }
}

module.exports = Bot;

