# Configuración de Cloud Storage para SUNAT Bot

## 📋 Requisitos Previos

1. **Cuenta de Google Cloud Platform (GCP)**
2. **Proyecto creado en GCP**
3. **Service Account con permisos de Cloud Storage**

## 🔧 Configuración Paso a Paso

### 1. Crear Service Account en GCP

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **IAM & Admin** > **Service Accounts**
4. Haz clic en **Create Service Account**
5. Completa los datos:
   - **Name**: `sunat-bot-storage`
   - **Description**: `Service account para SUNAT Bot`
6. Haz clic en **Create and Continue**

### 2. Asignar Roles

1. En la sección **Grant this service account access to project**
2. Selecciona el rol: **Storage Admin**
3. Haz clic en **Continue** y luego **Done**

### 3. Crear y Descargar Credenciales

1. En la lista de Service Accounts, haz clic en el que acabas de crear
2. Ve a la pestaña **Keys**
3. Haz clic en **Add Key** > **Create new key**
4. Selecciona **JSON** y haz clic en **Create**
5. El archivo se descargará automáticamente

### 4. Configurar Variables de Entorno

1. Copia el archivo `env.example` a `.env`:
   ```bash
   cp env.example .env
   ```

2. Edita el archivo `.env` con tus datos:
   ```env
   GCP_PROJECT_ID=tu-proyecto-gcp-id
   GCP_KEY_FILENAME=./credentials/gcp-service-account.json
   GCP_BUCKET_NAME=sunat-facturas-bucket
   ```

3. Crea el directorio de credenciales:
   ```bash
   mkdir -p credentials
   ```

4. Mueve el archivo JSON descargado a la carpeta credentials:
   ```bash
   mv ~/Downloads/tu-proyecto-gcp-id-xxxxx.json ./credentials/gcp-service-account.json
   ```

### 5. Crear Bucket en Cloud Storage

1. Ve a **Cloud Storage** > **Buckets**
2. Haz clic en **Create Bucket**
3. Configura el bucket:
   - **Name**: `sunat-facturas-bucket` (o el nombre que prefieras)
   - **Location**: Selecciona la región más cercana
   - **Storage class**: Standard
   - **Access control**: Uniform
4. Haz clic en **Create**

### 6. Instalar Dependencias

```bash
npm install
```

## 🚀 Uso

Una vez configurado, el bot automáticamente:

1. **Descarga** los archivos XML y PDF de SUNAT
2. **Sube** los archivos a tu bucket de Cloud Storage
3. **Organiza** los archivos con nombres únicos
4. **Limpia** los archivos temporales

## 📁 Estructura de Archivos Subidos

Los archivos se suben con el siguiente formato:
```
{numero_factura}_{tipo}_{timestamp}.{extension}
```

Ejemplo:
- `E001-1840_XML_2024-01-31T10-30-45-123Z.xml`
- `E001-1840_PDF_2024-01-31T10-30-45-456Z.pdf`

## 🔍 Verificación

Para verificar que todo funciona:

1. Ejecuta el bot:
   ```bash
   npm run test
   ```

2. Revisa tu bucket de Cloud Storage para ver los archivos subidos

## 🛠️ Solución de Problemas

### Error: "GCP_PROJECT_ID no está configurado"
- Verifica que el archivo `.env` existe y tiene la variable `GCP_PROJECT_ID`

### Error: "GCP_KEY_FILENAME no está configurado"
- Verifica que el archivo `.env` tiene la ruta correcta al archivo JSON

### Error: "Permission denied"
- Verifica que el Service Account tiene el rol **Storage Admin**
- Verifica que el archivo JSON de credenciales es válido

### Error: "Bucket not found"
- Verifica que el bucket existe en tu proyecto de GCP
- Verifica que el nombre del bucket en `.env` es correcto

## 📞 Soporte

Si tienes problemas, revisa:
1. Los logs del bot para errores específicos
2. La consola de GCP para permisos
3. La documentación de Google Cloud Storage
