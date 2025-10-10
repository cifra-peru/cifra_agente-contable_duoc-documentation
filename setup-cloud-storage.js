#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configurando Cloud Storage para SUNAT Bot...\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        console.log('📋 Copiando env.example a .env...');
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Archivo .env creado');
    } else {
        console.log('❌ No se encontró env.example');
        process.exit(1);
    }
} else {
    console.log('✅ Archivo .env ya existe');
}

// Crear directorio de credenciales
const credentialsDir = path.join(__dirname, 'credentials');
if (!fs.existsSync(credentialsDir)) {
    console.log('📁 Creando directorio de credenciales...');
    fs.mkdirSync(credentialsDir, { recursive: true });
    console.log('✅ Directorio credentials/ creado');
} else {
    console.log('✅ Directorio credentials/ ya existe');
}

// Crear directorio de descargas
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    console.log('📁 Creando directorio de descargas...');
    fs.mkdirSync(downloadsDir, { recursive: true });
    console.log('✅ Directorio downloads/ creado');
} else {
    console.log('✅ Directorio downloads/ ya existe');
}

// Crear directorio de logs
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    console.log('📁 Creando directorio de logs...');
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✅ Directorio logs/ creado');
} else {
    console.log('✅ Directorio logs/ ya existe');
}

console.log('\n🎯 Próximos pasos:');
console.log('1. Configura las variables en el archivo .env');
console.log('2. Descarga las credenciales de GCP y colócalas en credentials/');
console.log('3. Crea un bucket en Google Cloud Storage');
console.log('4. Ejecuta: npm install');
console.log('5. Ejecuta: npm run test');
console.log('\n📖 Para más detalles, lee CLOUD-STORAGE-SETUP.md');
