const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Establece la conexión con la carpeta C:\Extraccion_excel
 * Este script se puede ejecutar independientemente para asegurar que la carpeta esté lista
 */
function establecerConexionCarpeta() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📁 ESTABLECIENDO CONEXIÓN CON CARPETA');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const carpeta = 'C:\\Extraccion_excel';
  
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
  
  try {
    // Crear archivo temporal
    const tempFile = path.join(require('os').tmpdir(), `conexion_carpeta_${Date.now()}.ps1`);
    fs.writeFileSync(tempFile, script, 'utf8');
    
    // Ejecutar script
    const comando = `powershell -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tempFile}"`;
    const resultado = execSync(comando, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10000,
      windowsHide: true
    });
    
    // Limpiar archivo temporal
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {
      // Ignorar errores al eliminar
    }
    
    const estado = resultado ? resultado.trim() : '';
    
    console.log(`🔍 Estado de la carpeta: ${estado}\n`);
    
    if (estado === 'CREATED_ACCESSIBLE') {
      console.log('✅ Carpeta C:\\Extraccion_excel creada exitosamente');
      console.log('✅ Carpeta accesible y lista para usar');
      console.log('✅ CONEXIÓN ESTABLECIDA CORRECTAMENTE');
      return true;
    } else if (estado === 'EXISTS_ACCESSIBLE') {
      console.log('✅ Carpeta C:\\Extraccion_excel encontrada');
      console.log('✅ Carpeta accesible y lista para usar');
      console.log('✅ CONEXIÓN ESTABLECIDA CORRECTAMENTE');
      return true;
    } else if (estado === 'EXISTS' || estado === 'EXISTS_NOT_ACCESSIBLE') {
      console.log('✅ Carpeta C:\\Extraccion_excel encontrada');
      if (estado === 'EXISTS_NOT_ACCESSIBLE') {
        console.log('⚠️  Carpeta existe pero puede tener problemas de acceso');
      }
      console.log('✅ CONEXIÓN ESTABLECIDA (con advertencias)');
      return true;
    } else if (estado === 'CREATED_NOT_ACCESSIBLE') {
      console.log('✅ Carpeta C:\\Extraccion_excel creada');
      console.log('⚠️  Carpeta creada pero puede tener problemas de acceso');
      console.log('✅ CONEXIÓN ESTABLECIDA (con advertencias)');
      return true;
    } else if (estado === 'FAILED_CREATE') {
      console.error('❌ No se pudo crear la carpeta C:\\Extraccion_excel');
      console.error('💡 Verifica los permisos del disco C:');
      return false;
    } else if (estado === 'ERROR_CREATE' || estado === 'ERROR') {
      console.error('❌ Error al establecer la conexión con la carpeta');
      console.error(`💡 Detalles: ${estado}`);
      return false;
    } else {
      console.log(`⚠️  Estado desconocido: ${estado}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error al establecer conexión: ${error.message}`);
    return false;
  }
}

// Ejecutar
const exito = establecerConexionCarpeta();

console.log('\n═══════════════════════════════════════════════════════');
if (exito) {
  console.log('✅ CONEXIÓN CON CARPETA ESTABLECIDA');
  console.log('✅ El bot puede usar la carpeta C:\\Extraccion_excel');
} else {
  console.log('❌ NO SE PUDO ESTABLECER LA CONEXIÓN');
  console.log('⚠️  El bot puede tener problemas al usar la carpeta');
}
console.log('═══════════════════════════════════════════════════════\n');

process.exit(exito ? 0 : 1);

