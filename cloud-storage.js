import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

class CloudStorageFileObjectStorageRepository {
    constructor() {
        this.storage = new Storage({
            projectId: process.env.GCP_PROJECT_ID,
            keyFilename: process.env.GCP_KEY_FILENAME,
        });
        this.bucketName = process.env.GCP_BUCKET_NAME || 'sunat-facturas-bucket';
		this.rootPrefix = (process.env.STORAGE_ROOT_PREFIX || 'stage_cifra_agente-contable').replace(/\/$/, '');
        
        // Validar configuración
        if (!process.env.GCP_PROJECT_ID) {
            throw new Error('GCP_PROJECT_ID no está configurado en las variables de entorno');
        }
        if (!process.env.GCP_KEY_FILENAME) {
            throw new Error('GCP_KEY_FILENAME no está configurado en las variables de entorno');
        }
        
        // Inicializar carpetas al crear la instancia
        this.initializeFolders();
    }

	async initializeFolders() {
        try {
			// Inicialización mínima; las carpetas anidadas se crean de forma perezosa al subir
			await this.createFolderIfNotExists(`${this.rootPrefix}/`);
			console.log(`Carpeta raíz inicializada: ${this.rootPrefix}/`);
        } catch (error) {
            console.error('Error inicializando carpetas:', error);
        }
    }

    async createFolderIfNotExists(folderName) {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(folderName);
            
            // Verificar si la carpeta ya existe
            const [exists] = await file.exists();
            
            if (!exists) {
                // Crear la carpeta subiendo un archivo vacío con el nombre de la carpeta
                await file.save('', {
                    metadata: {
                        contentType: 'application/x-directory'
                    }
                });
                console.log(`Carpeta ${folderName} creada exitosamente`);
            } else {
                console.log(`Carpeta ${folderName} ya existe`);
            }
        } catch (error) {
            console.error(`Error creando carpeta ${folderName}:`, error);
            throw error;
        }
    }

    getFileType(fileName) {
        const extension = fileName.toLowerCase().split('.').pop();
        switch (extension) {
            case 'xml':
                return 'XML';
            case 'pdf':
                return 'PDF';
            default:
                return 'OTHER';
        }
    }

	buildDestinationPath(payload) {
		const { fileName, companyName, invoiceDate } = payload;
		const fileType = this.getFileType(fileName);
		// Si no hay metadatos suficientes, usar estructura básica previa
		if (!companyName || !invoiceDate || (fileType !== 'XML' && fileType !== 'PDF')) {
			return `${fileType !== 'OTHER' ? fileType + '/' : ''}${fileName}`;
		}
		// Normalizar fecha a YYYY-MM-DD
		const dateIso = invoiceDate.includes('/') ? this.normalizeDate(invoiceDate) : invoiceDate;
		const year = dateIso.slice(0, 4);
		const day = dateIso;
		// Asegurar nombre de empresa sin slashes
		const safeCompany = String(companyName).replace(/[\\/]/g, '-').trim();
		return `${this.rootPrefix}/${safeCompany}/${year}/${day}/${fileType}/${fileName}`;
	}

	normalizeDate(dateStr) {
		try {
			const parts = dateStr.split('/');
			if (parts.length === 3) {
				const [dd, mm, yyyy] = parts;
				return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
			}
			return dateStr;
		} catch (_) {
			return dateStr;
		}
	}

    getReadableFile(payload) {
        const foundFile = this.getFile(payload);
        const readableFile = foundFile.createReadStream();
        return readableFile;
    }

    async getFileBuffer(payload) {
        const foundFile = this.getFile(payload);
        const downloadedFile = await foundFile.download();
        return downloadedFile;
    }

    async removeFile(payload) {
        const foundFile = this.getFile({ fileName: payload.fileName });

        if (!foundFile) {
            throw new Error(`FILE_002: File not found - ${payload.fileName}`);
        }

        try {
            await foundFile.delete();
        } catch (err) {
            this.logError(err);
            if (this.isNotFoundError(err)) {
                throw new Error(`FILE_002: File not found - ${payload.fileName}`);
            }
            throw new Error("Error deleting file on cloud storage");
        }
    }

	async uploadFile(payload) {
		// Determinar la ruta de destino basada en tipo, empresa y fecha
		const destinationPath = this.buildDestinationPath(payload);
		
		const cloudFile = this.getFile({
			fileName: destinationPath,
		});
        
        const fileStream = Readable.from(payload.file);
        
        return new Promise((resolve, reject) => {
            fileStream
				.pipe(cloudFile.createWriteStream())
                .on("finish", () => {
					console.log(`Archivo ${payload.fileName} subido exitosamente a ${destinationPath}`);
                    resolve({
                        fileId: payload.fileId,
						folderPath: destinationPath,
                        fileType: this.getFileType(payload.fileName)
                    });
                })
                .on("error", (err) => {
                    console.log(err);
                    reject(new Error("Error uploading file to cloud storage"));
                });
        });
    }

	getFile(payload) {
		// Si el fileName ya incluye la ruta de la carpeta, usarlo directamente; si no, construir destino
		const fileName = payload.fileName.includes('/') ? payload.fileName : this.buildDestinationPath(payload);
		return this.storage
			.bucket(this.bucketName)
			.file(fileName);
	}

    logError(err) {
        let message = "GCP Cloud Storage Err:";
        if (err && err.message) {
            console.log(message);
            console.log(err);
            return;
        }
    }

    sendMetrics(metricName, value) {
        // Implementar métricas si es necesario
    }

    isNotFoundError(err) {
        if (err && err.code === 404) {
            return true;
        }
        return false;
    }

    async listFilesByFolder(folderName = null) {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const options = {};
            
            if (folderName) {
                options.prefix = `${folderName}/`;
            }
            
            const [files] = await bucket.getFiles(options);
            
            return files.map(file => ({
                name: file.name,
                size: file.metadata.size,
                created: file.metadata.timeCreated,
                updated: file.metadata.updated,
                contentType: file.metadata.contentType
            }));
        } catch (error) {
            console.error('Error listando archivos:', error);
            throw error;
        }
    }

	async listXMLFiles() {
		return await this.listFilesByFolder(`${this.rootPrefix}`);
	}

    async listPDFFiles() {
        return await this.listFilesByFolder(`${this.rootPrefix}`);
    }

    async listAllFolders() {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const [files] = await bucket.getFiles();
            
            const folders = new Set();
            files.forEach(file => {
                const parts = file.name.split('/');
                if (parts.length > 1) {
                    folders.add(parts[0] + '/');
                }
            });
            
            return Array.from(folders).sort();
        } catch (error) {
            console.error('Error listando carpetas:', error);
            throw error;
        }
    }

    async deleteFolder(folderName) {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const [files] = await bucket.getFiles({ prefix: folderName });
            
            if (files.length === 0) {
                console.log(`Carpeta ${folderName} no existe o está vacía`);
                return { deleted: 0, errors: 0 };
            }
            
            let deleted = 0;
            let errors = 0;
            
            for (const file of files) {
                try {
                    await file.delete();
                    deleted++;
                    console.log(`Archivo eliminado: ${file.name}`);
                } catch (error) {
                    console.error(`Error eliminando archivo ${file.name}:`, error);
                    errors++;
                }
            }
            
            console.log(`Carpeta ${folderName} eliminada: ${deleted} archivos eliminados, ${errors} errores`);
            return { deleted, errors };
            
        } catch (error) {
            console.error(`Error eliminando carpeta ${folderName}:`, error);
            throw error;
        }
    }

    async cleanupOldFolders() {
        try {
            console.log('Iniciando limpieza de carpetas antiguas...');
            const folders = await this.listAllFolders();
            
            const oldFolders = folders.filter(folder => 
                folder.startsWith('stage_cifra_agente-contable/') && 
                folder !== `${this.rootPrefix}/`
            );
            
            if (oldFolders.length === 0) {
                console.log('No se encontraron carpetas antiguas para eliminar');
                return { deleted: 0, errors: 0 };
            }
            
            console.log(`Carpetas antiguas encontradas: ${oldFolders.join(', ')}`);
            
            let totalDeleted = 0;
            let totalErrors = 0;
            
            for (const folder of oldFolders) {
                const result = await this.deleteFolder(folder);
                totalDeleted += result.deleted;
                totalErrors += result.errors;
            }
            
            console.log(`Limpieza completada: ${totalDeleted} archivos eliminados, ${totalErrors} errores`);
            return { deleted: totalDeleted, errors: totalErrors };
            
        } catch (error) {
            console.error('Error en limpieza de carpetas:', error);
            throw error;
        }
    }
}

export { CloudStorageFileObjectStorageRepository };
