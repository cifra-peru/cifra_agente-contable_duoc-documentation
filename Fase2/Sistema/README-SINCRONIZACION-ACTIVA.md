# 🔄 Sincronización Automática - Estado y Configuración

## ✅ Estado Actual

La sincronización está **ACTIVA** y funcionando en segundo plano.

- **Proceso ID**: Verificar con `verificar-sincronizacion.bat`
- **Script**: `sincronizacion-tiempo-real.js`
- **Carpeta Local**: `C:\Extraccion_excel`
- **Carpeta Cloud**: `gs://stage_cifra_agente-contabl/Extraccion_excel`

## 🚀 Scripts Disponibles

### Para Iniciar la Sincronización

1. **`iniciar-sincronizacion.bat`**
   - Inicia la sincronización en una ventana visible
   - Útil para ver los logs en tiempo real
   - Presiona Ctrl+C para detener

2. **`iniciar-sincronizacion-fondo.bat`**
   - Inicia la sincronización en segundo plano
   - No muestra ventana (ejecución silenciosa)
   - Ideal para uso permanente

3. **`activar-sincronizacion-permanente.bat`**
   - Configura la sincronización para ejecutarse automáticamente al iniciar Windows
   - Inicia la sincronización inmediatamente
   - **Requiere ejecutarse como Administrador**

### Para Detener la Sincronización

- **`detener-sincronizacion.bat`**
  - Detiene todos los procesos de sincronización activos
  - También detiene la tarea programada si existe

### Para Verificar el Estado

- **`verificar-sincronizacion.bat`**
  - Muestra el estado actual de la sincronización
  - Lista procesos activos
  - Verifica tarea programada
  - Muestra archivos en la carpeta local

### Para Configurar Auto-Inicio (Como Administrador)

- **`EJECUTAR-COMO-ADMIN-SINCRONIZACION.bat`**
  - Configura la sincronización para ejecutarse automáticamente
  - Inicia la sincronización inmediatamente
  - **Ejecuta automáticamente como Administrador**

## ⚙️ Configuración Permanente

Para que la sincronización se ejecute automáticamente al iniciar Windows:

1. **Ejecuta como Administrador:**
   ```
   EJECUTAR-COMO-ADMIN-SINCRONIZACION.bat
   ```

2. O manualmente con PowerShell (como Administrador):
   ```powershell
   .\configurar-auto-inicio.ps1
   ```

Esto creará una tarea programada que se ejecutará automáticamente al iniciar sesión.

## 📊 Funcionalidades

La sincronización ahora incluye:

- ✅ **Descarga automática** de archivos nuevos del cloud
- ✅ **Eliminación automática** de archivos locales cuando se borran del cloud
- ✅ **Sincronización cada 10 segundos**
- ✅ **Logs detallados** en consola y archivo `sincronizacion.log`

## 🔍 Verificar que Está Funcionando

1. Ejecuta `verificar-sincronizacion.bat`
2. O verifica manualmente:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -eq "node"}
   ```
3. Revisa el archivo `sincronizacion.log` para ver la actividad

## ⚠️ Notas Importantes

- La sincronización debe estar ejecutándose para que funcione
- Si reinicias la computadora, necesitas ejecutar `EJECUTAR-COMO-ADMIN-SINCRONIZACION.bat` una vez para configurar el auto-inicio
- Los archivos se sincronizan cada 10 segundos
- Los archivos eliminados del cloud se eliminarán automáticamente del disco local

