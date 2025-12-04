const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class GCSStorage {
  constructor(options = {}) {
    this.projectId = options.projectId || 'pioneering-rex-471016-m3';
    this.bucketName = options.bucketName || 'stage_cifra_agente-contabl';
    this.defaultRegion = options.region || 'us-central1';
    
    // Ruta local del SDK de Google Cloud
    this.sdkPath = options.sdkPath || 'C:\\Users\\Usuario\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk';
    this.binPath = path.join(this.sdkPath, 'bin');
    
    // Verificar que la ruta existe
    this._verificarInstalacionLocal();
  }

  /**
   * Verifica que la instalación local del SDK existe
   */
  _verificarInstalacionLocal() {
    if (fs.existsSync(this.sdkPath)) {
      this.sdkInstalado = true;
    } else {
      this.sdkInstalado = false;
    }
  }

  /**
   * Obtiene la ruta completa del ejecutable (gcloud o gsutil)
   */
  _obtenerRutaEjecutable(comando) {
    if (this.sdkInstalado) {
      const rutaCompleta = path.join(this.binPath, `${comando}.cmd`);
      if (fs.existsSync(rutaCompleta)) {
        return rutaCompleta;
      }
      // Intentar con .ps1
      const rutaPS1 = path.join(this.binPath, `${comando}.ps1`);
      if (fs.existsSync(rutaPS1)) {
        return rutaPS1;
      }
    }
    // Si no se encuentra localmente, usar el comando del PATH
    return comando;
  }

  /**
   * Ejecuta un comando de gcloud/gsutil y retorna el resultado
   */
  _ejecutarComando(comando, opciones = {}) {
    try {
      // Detectar si el comando es gcloud o gsutil
      let comandoFinal = comando;
      if (comando.startsWith('gcloud ')) {
        const rutaGcloud = this._obtenerRutaEjecutable('gcloud');
        if (rutaGcloud !== 'gcloud') {
          // Si tenemos ruta local, usar comillas para rutas con espacios
          const restoComando = comando.substring(7); // Quitar 'gcloud '
          comandoFinal = `"${rutaGcloud}" ${restoComando}`;
        }
      } else if (comando.startsWith('gsutil ')) {
        const rutaGsutil = this._obtenerRutaEjecutable('gsutil');
        if (rutaGsutil !== 'gsutil') {
          // Si tenemos ruta local, usar comillas para rutas con espacios
          const restoComando = comando.substring(7); // Quitar 'gsutil '
          comandoFinal = `"${rutaGsutil}" ${restoComando}`;
        }
      }

      const resultado = execSync(comandoFinal, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true, // Usar shell para ejecutar .cmd y .ps1
        ...opciones
      });
      return { exito: true, resultado: resultado.trim() };
    } catch (error) {
      return {
        exito: false,
        error: error.message,
        stderr: error.stderr ? error.stderr.toString() : ''
      };
    }
  }

  /**
   * Configura el proyecto de Google Cloud
   */
  configurarProyecto() {
    console.log(`🔧 Configurando proyecto: ${this.projectId}`);
    const resultado = this._ejecutarComando(`gcloud config set project ${this.projectId}`);
    if (resultado.exito) {
      console.log(`✅ Proyecto configurado: ${this.projectId}`);
      return true;
    } else {
      console.error(`❌ Error al configurar proyecto: ${resultado.error}`);
      return false;
    }
  }

  /**
   * Verifica la autenticación actual
   */
  verificarAutenticacion() {
    console.log('🔐 Verificando autenticación...');
    const resultado = this._ejecutarComando('gcloud auth list');
    if (resultado.exito) {
      console.log('✅ Autenticación verificada');
      console.log(resultado.resultado);
      return true;
    } else {
      console.error('❌ Error al verificar autenticación');
      return false;
    }
  }

  /**
   * Lista todos los buckets del proyecto
   */
  listarBuckets() {
    console.log('📦 Listando buckets...');
    const resultado = this._ejecutarComando('gsutil ls');
    if (resultado.exito) {
      const buckets = resultado.resultado.split('\n').filter(b => b.trim());
      console.log(`✅ Encontrados ${buckets.length} bucket(s):`);
      buckets.forEach((bucket, index) => {
        console.log(`   ${index + 1}. ${bucket}`);
      });
      return buckets;
    } else {
      console.error(`❌ Error al listar buckets: ${resultado.error}`);
      return [];
    }
  }

  /**
   * Lista el contenido de un bucket (carpetas y archivos)
   */
  listarContenidoBucket(bucketName = null, ruta = '', opciones = {}) {
    const bucket = bucketName || this.bucketName;
    const silencioso = opciones.silencioso || false;
    let rutaCompleta;
    if (ruta) {
      rutaCompleta = `${bucket}/${ruta}`;
    } else {
      rutaCompleta = bucket;
    }
    
    if (!silencioso) {
      console.log(`📁 Listando contenido de: gs://${rutaCompleta}`);
    }
    
    // Usar comillas para manejar espacios en las rutas
    const comando = `gsutil ls -r "gs://${rutaCompleta}/"`;
    const resultado = this._ejecutarComando(comando);
    if (resultado.exito) {
      const lineas = resultado.resultado.split('\n').filter(l => l.trim());
      
      if (!silencioso) {
        console.log(`✅ Encontrados ${lineas.length} elemento(s):`);
      }
      
      const estructura = this._parsearEstructura(lineas);
      
      if (!silencioso) {
        this._mostrarEstructura(estructura);
      }
      
      return estructura;
    } else {
      if (!silencioso) {
        console.error(`❌ Error al listar contenido: ${resultado.error}`);
      }
      return null;
    }
  }

  /**
   * Parsea la estructura de carpetas y archivos
   */
  _parsearEstructura(lineas) {
    const estructura = {
      carpetas: [],
      archivos: []
    };

    lineas.forEach(linea => {
      const ruta = linea.replace('gs://', '').replace(this.bucketName + '/', '');
      if (linea.endsWith('/')) {
        // Es una carpeta
        estructura.carpetas.push(ruta);
      } else {
        // Es un archivo
        const partes = ruta.split('/');
        const nombreArchivo = partes[partes.length - 1];
        const carpeta = partes.slice(0, -1).join('/');
        estructura.archivos.push({
          nombre: nombreArchivo,
          rutaCompleta: ruta,
          carpeta: carpeta || '/'
        });
      }
    });

    return estructura;
  }

  /**
   * Muestra la estructura de forma organizada
   */
  _mostrarEstructura(estructura) {
    console.log('\n📂 ESTRUCTURA DE CARPETAS:');
    const carpetasUnicas = [...new Set(estructura.carpetas)];
    carpetasUnicas.forEach(carpeta => {
      console.log(`   📁 ${carpeta}`);
    });

    console.log('\n📄 ARCHIVOS:');
    estructura.archivos.forEach(archivo => {
      console.log(`   📄 ${archivo.carpeta}/${archivo.nombre}`);
    });
  }

  /**
   * Lista solo las carpetas de nivel superior
   */
  listarCarpetasPrincipales(bucketName = null) {
    const bucket = bucketName || this.bucketName;
    console.log(`📁 Listando carpetas principales de: gs://${bucket}`);
    
    const resultado = this._ejecutarComando(`gsutil ls "gs://${bucket}/"`);
    if (resultado.exito) {
      const carpetas = resultado.resultado
        .split('\n')
        .filter(l => l.trim() && l.endsWith('/'))
        .map(c => c.replace(`gs://${bucket}/`, '').replace('/', ''));
      
      console.log(`✅ Carpetas principales (${carpetas.length}):`);
      carpetas.forEach((carpeta, index) => {
        console.log(`   ${index + 1}. ${carpeta}`);
      });
      return carpetas;
    } else {
      console.error(`❌ Error al listar carpetas: ${resultado.error}`);
      return [];
    }
  }

  /**
   * Descarga un archivo del bucket
   */
  descargarArchivo(rutaArchivo, destinoLocal, bucketName = null, opciones = {}) {
    const bucket = bucketName || this.bucketName;
    const silencioso = opciones.silencioso || false;
    const rutaCompleta = `gs://${bucket}/${rutaArchivo}`;
    
    if (!silencioso) {
      console.log(`⬇️  Descargando: ${rutaCompleta} -> ${destinoLocal}`);
    }
    
    const resultado = this._ejecutarComando(`gsutil cp "${rutaCompleta}" "${destinoLocal}"`);
    if (resultado.exito) {
      if (!silencioso) {
        console.log(`✅ Archivo descargado exitosamente`);
      }
      return true;
    } else {
      if (!silencioso) {
        console.error(`❌ Error al descargar archivo: ${resultado.error}`);
      }
      return false;
    }
  }

  /**
   * Sube un archivo al bucket
   */
  subirArchivo(archivoLocal, rutaDestino, bucketName = null) {
    const bucket = bucketName || this.bucketName;
    const rutaCompleta = `gs://${bucket}/${rutaDestino}`;
    console.log(`⬆️  Subiendo: ${archivoLocal} -> ${rutaCompleta}`);
    
    const resultado = this._ejecutarComando(`gsutil cp "${archivoLocal}" "${rutaCompleta}"`);
    if (resultado.exito) {
      console.log(`✅ Archivo subido exitosamente`);
      return true;
    } else {
      console.error(`❌ Error al subir archivo: ${resultado.error}`);
      return false;
    }
  }

  /**
   * Obtiene información sobre la instalación local del SDK
   */
  obtenerInfoSDK() {
    const info = {
      rutaSDK: this.sdkPath,
      rutaBin: this.binPath,
      instalado: this.sdkInstalado,
      ejecutables: []
    };

    if (this.sdkInstalado) {
      const ejecutables = ['gcloud', 'gsutil', 'bq'];
      ejecutables.forEach(cmd => {
        const ruta = this._obtenerRutaEjecutable(cmd);
        if (fs.existsSync(ruta) || ruta !== cmd) {
          info.ejecutables.push({
            comando: cmd,
            ruta: ruta
          });
        }
      });
    }

    return info;
  }

  /**
   * Sincroniza una carpeta local con una carpeta del bucket
   */
  sincronizarCarpeta(carpetaLocal, rutaBucket, bucketName = null, opciones = {}) {
    const bucket = bucketName || this.bucketName;
    const rutaCompleta = `gs://${bucket}/${rutaBucket}`;
    
    // Verificar que la carpeta local existe
    if (!fs.existsSync(carpetaLocal)) {
      console.error(`❌ La carpeta local no existe: ${carpetaLocal}`);
      return false;
    }

    const eliminar = opciones.eliminar ? '-d' : '';
    const excluir = opciones.excluir ? `-x "${opciones.excluir}"` : '';
    
    console.log(`🔄 Sincronizando: ${carpetaLocal} <-> ${rutaCompleta}`);
    
    const comando = `gsutil rsync ${eliminar} ${excluir} "${carpetaLocal}" "${rutaCompleta}"`;
    const resultado = this._ejecutarComando(comando);
    
    if (resultado.exito) {
      console.log(`✅ Sincronización completada`);
      return true;
    } else {
      console.error(`❌ Error en sincronización: ${resultado.error}`);
      return false;
    }
  }

  /**
   * Descarga una carpeta completa del bucket
   */
  descargarCarpeta(rutaBucket, destinoLocal, bucketName = null) {
    const bucket = bucketName || this.bucketName;
    const rutaCompleta = `gs://${bucket}/${rutaBucket}`;
    
    // Crear la carpeta destino si no existe
    if (!fs.existsSync(destinoLocal)) {
      fs.mkdirSync(destinoLocal, { recursive: true });
    }

    console.log(`⬇️  Descargando carpeta: ${rutaCompleta} -> ${destinoLocal}`);
    
    // Usar rsync para descargar (más eficiente y mantiene estructura)
    // Primero intentar con rsync
    let resultado = this._ejecutarComando(`gsutil -m rsync -r "${rutaCompleta}" "${destinoLocal}"`);
    
    // Si rsync falla, intentar con cp
    if (!resultado.exito) {
      console.log('   Intentando método alternativo...');
      resultado = this._ejecutarComando(`gsutil -m cp -r "${rutaCompleta}/*" "${destinoLocal}"`);
    }
    
    if (resultado.exito) {
      console.log(`✅ Carpeta descargada exitosamente`);
      return true;
    } else {
      console.error(`❌ Error al descargar carpeta: ${resultado.error}`);
      if (resultado.stderr) {
        console.error(`   Detalles: ${resultado.stderr}`);
      }
      return false;
    }
  }

  /**
   * Sube una carpeta completa al bucket
   */
  subirCarpeta(carpetaLocal, rutaBucket, bucketName = null) {
    const bucket = bucketName || this.bucketName;
    const rutaCompleta = `gs://${bucket}/${rutaBucket}`;
    
    if (!fs.existsSync(carpetaLocal)) {
      console.error(`❌ La carpeta local no existe: ${carpetaLocal}`);
      return false;
    }

    console.log(`⬆️  Subiendo carpeta: ${carpetaLocal} -> ${rutaCompleta}`);
    
    const resultado = this._ejecutarComando(`gsutil -m cp -r "${carpetaLocal}/*" "${rutaCompleta}"`);
    if (resultado.exito) {
      console.log(`✅ Carpeta subida exitosamente`);
      return true;
    } else {
      console.error(`❌ Error al subir carpeta: ${resultado.error}`);
      return false;
    }
  }

  /**
   * Inicializa la conexión (configura proyecto y verifica autenticación)
   */
  async inicializar() {
    console.log('🚀 Inicializando conexión con Google Cloud Storage...\n');
    
    // Mostrar información del SDK local
    const infoSDK = this.obtenerInfoSDK();
    console.log(`📦 SDK Local:`);
    console.log(`   Ruta: ${infoSDK.rutaSDK}`);
    console.log(`   Estado: ${infoSDK.instalado ? '✅ Instalado' : '⚠️  No encontrado'}`);
    if (infoSDK.ejecutables.length > 0) {
      console.log(`   Ejecutables encontrados: ${infoSDK.ejecutables.map(e => e.comando).join(', ')}`);
    }
    console.log('');
    
    if (!this.verificarAutenticacion()) {
      console.error('❌ No hay autenticación activa. Ejecuta: gcloud auth login');
      return false;
    }

    if (!this.configurarProyecto()) {
      return false;
    }

    console.log('\n✅ Conexión inicializada correctamente\n');
    return true;
  }
}

module.exports = GCSStorage;

