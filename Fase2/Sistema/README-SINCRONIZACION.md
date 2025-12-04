# 🔄 Sincronización en Tiempo Real - Extraccion_excel

## 📋 Descripción

Sistema de sincronización automática en tiempo real entre Google Cloud Storage y la carpeta local `C:\Extraccion_excel`.

**Características:**
- ✅ Sincronización automática cada 10 segundos
- ✅ Descarga automática de archivos nuevos
- ✅ Funciona en tiempo real
- ✅ No requiere intervención manual

## 🚀 Cómo Usar

### Opción 1: Ejecutar desde la terminal

```bash
node sincronizacion-tiempo-real.js
```

### Opción 2: Doble clic en el archivo

Haz doble clic en `iniciar-sincronizacion.bat`

## 📂 Ubicaciones

- **Carpeta Local:** `C:\Extraccion_excel`
- **Carpeta Cloud:** `gs://stage_cifra_agente-contabl/Extraccion_excel`

## ⚙️ Configuración

El sistema verifica cambios cada **10 segundos** y descarga automáticamente cualquier archivo nuevo que se suba a Google Cloud Storage.

## 🔧 Funcionamiento

1. El sistema se conecta a Google Cloud Storage
2. Verifica la lista de archivos cada 10 segundos
3. Compara con los archivos locales
4. Descarga automáticamente los archivos nuevos
5. Muestra notificaciones en tiempo real

## 📝 Ejemplo de Uso

1. **Inicia la sincronización:**
   ```bash
   node sincronizacion-tiempo-real.js
   ```

2. **Sube un archivo a Google Cloud Storage** (desde la consola web o cualquier método)

3. **El archivo aparecerá automáticamente** en `C:\Extraccion_excel` en menos de 10 segundos

## 🛑 Detener la Sincronización

Presiona `Ctrl+C` en la terminal donde está ejecutándose.

## 📊 Monitoreo

El sistema muestra mensajes en tiempo real:
- `✓ Todo sincronizado` - No hay archivos nuevos
- `🔍 X archivo(s) nuevo(s) detectado(s)` - Archivos nuevos encontrados
- `⬇️ Descargando: nombre_archivo` - Descargando archivo
- `✅ Archivo descargado: nombre_archivo` - Descarga completada

## ⚠️ Notas Importantes

- El sistema debe estar ejecutándose para que funcione la sincronización automática
- Si cierras la terminal, la sincronización se detiene
- Para sincronización permanente, considera ejecutarlo como servicio de Windows

## 🔄 Otros Scripts Disponibles

- `sincronizar-extraccion-excel.js` - Sincronización manual
- `monitor-extraccion-excel.js` - Monitor con intervalo de 1 minuto
- `verificar-conexion.js` - Verificar estado de la conexión

