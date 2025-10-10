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
        
        // Validar configuración
        if (!process.env.GCP_PROJECT_ID) {
            throw new Error('GCP_PROJECT_ID no está configurado en las variables de entorno');
        }
        if (!process.env.GCP_KEY_FILENAME) {
            throw new Error('GCP_KEY_FILENAME no está configurado en las variables de entorno');
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
        const cloudFile = this.getFile({
            fileName: payload.fileName,
        });
        
        const fileStream = Readable.from(payload.file);
        
        return new Promise((resolve, reject) => {
            fileStream
                .pipe(cloudFile.createWriteStream())
                .on("finish", () => {
                    resolve({
                        fileId: payload.fileId,
                    });
                })
                .on("error", (err) => {
                    console.log(err);
                    reject(new Error("Error uploading file to cloud storage"));
                });
        });
    }

    getFile(payload) {
        return this.storage
            .bucket(this.bucketName)
            .file(payload.fileName);
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
}

export { CloudStorageFileObjectStorageRepository };
