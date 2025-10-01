# SUNAT Bot - Búsqueda Automática de Archivos XML

## Descripción
Bot automatizado para buscar archivos XML en el sistema SUNAT día por día, probando todas las categorías disponibles.

## Archivos Principales

### Archivos Funcionales (Sin Emojis)
- `tests/sunat-final.spec.js` - Archivo principal de test optimizado
- `utils/config-fixed.js` - Configuración optimizada
- `utils/calendar-fixed.js` - Funciones de calendario y fechas
- `utils/navigation-fixed.js` - Funciones de navegación
- `utils/search-fixed.js` - Funciones de búsqueda
- `utils/registro-fixed.js` - Sistema de registro y reportes
- `utils/login.js` - Funciones de autenticación

### Archivos de Configuración
- `playwright.config.js` - Configuración de Playwright
- `package.json` - Dependencias del proyecto

## Funcionalidades

### 1. Autenticación Automática
- Login automático con credenciales SUNAT
- Manejo de errores de autenticación
- Recuperación automática de sesiones

### 2. Navegación Inteligente
- Navegación paso a paso por el menú SUNAT
- Verificación de URLs correctas
- Manejo de iframes dinámicos

### 3. Búsqueda por Calendario
- Acceso automático a botones de calendario
- Establecimiento de fechas día por día
- Selección automática de categorías

### 4. Detección de Archivos XML
- Búsqueda en tablas de resultados
- Detección de patrones XML
- Clic automático en archivos encontrados

### 5. Sistema de Registro
- Registro de todas las combinaciones probadas
- Generación de reportes detallados
- Estadísticas por categoría

### 6. Recuperación de Errores
- Detección de páginas cerradas
- Recuperación automática de sesiones
- Manejo de errores de SUNAT

## Categorías de Búsqueda
- FE Emitidas
- Boletas Emitidas
- FE Recibidas
- Boletas Recibidas
- Facturas Emitidas
- Facturas Recibidas
- NC Emitidas
- NC Recibidas
- ND Emitidas
- ND Recibidas
- Notas de Crédito Emitidas
- Notas de Crédito Recibidas
- Notas de Débito Emitidas
- Notas de Débito Recibidas

## Período de Búsqueda
- Enero 2024 a Diciembre 2024
- Todos los días de cada mes
- Todas las categorías por día

## Instrucciones de Uso

### 1. Instalación
```bash
npm install
```

### 2. Ejecución
```bash
# Ejecutar el bot principal
npm test

# Ejecutar con interfaz gráfica
npm run test:ui

# Ejecutar en modo debug
npm run test:debug
```

### 3. Configuración
Editar `utils/config-fixed.js` para modificar:
- Credenciales de acceso
- Timeouts y esperas
- URLs de SUNAT
- Configuración de red

## Archivos Generados

### Registros
- `registros-sunat.json` - Registro detallado de todas las operaciones
- `reporte-sunat.json` - Reporte completo con estadísticas

### Logs
- Consola con logging detallado
- Información de progreso en tiempo real
- Errores y recuperaciones

## Características Técnicas

### Optimizaciones
- Sin emojis en el código
- Logging profesional
- Manejo robusto de errores
- Timeouts optimizados
- Recuperación automática

### Compatibilidad
- Playwright 1.55.0+
- Node.js 16+
- Windows/Linux/macOS

### Rendimiento
- Timeout total: 30 minutos
- Timeout por acción: 2 minutos
- Espera entre operaciones: 30 segundos
- Máximo 3 reintentos por operación

## Solución de Problemas

### Error: "iframe.locator is not a function"
- Verificar que el iframe esté cargado correctamente
- Aumentar timeouts de espera
- Verificar conectividad con SUNAT

### Error: "Target page, context or browser has been closed"
- El bot se recupera automáticamente
- Verificar estabilidad de la conexión
- Revisar logs de recuperación

### No se encuentran archivos XML
- Verificar período de búsqueda
- Revisar categorías disponibles
- Comprobar credenciales de acceso

## Soporte
Para problemas o mejoras, revisar los logs detallados en consola y los archivos de registro generados.
