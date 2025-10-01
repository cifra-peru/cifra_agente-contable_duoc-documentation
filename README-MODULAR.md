# SUNAT Bot - Estructura Modular

Este proyecto está organizado en módulos para facilitar el mantenimiento y la reutilización del código.

## Estructura de Archivos

```
sunat-pruebas/
├── utils/
│   ├── config.js          # Configuración de Playwright y constantes
│   ├── login.js           # Funciones de autenticación
│   ├── navigation.js      # Funciones de navegación en SUNAT
│   ├── calendar.js        # Funciones de calendario y fechas
│   └── search.js          # Funciones de búsqueda de archivos XML
├── tests/
│   ├── example.spec.js    # Test original (monolítico)
│   └── sunat-modular.spec.js  # Test modular principal
└── package.json
```

## Módulos

### 1. `utils/config.js`
- **Propósito**: Configuración centralizada de Playwright
- **Contenido**:
  - Timeouts y configuraciones
  - URLs de SUNAT
  - Credenciales
  - Configuración de red y bloqueo de recursos
- **Funciones**:
  - `configurePage(page)`: Configura la página con todas las opciones

### 2. `utils/login.js`
- **Propósito**: Manejo de autenticación
- **Contenido**:
  - Login a SUNAT
  - Manejo de modales
  - Configuración de alertas
- **Funciones**:
  - `realizarLogin(page)`: Realiza el login
  - `closeModals(page)`: Cierra modales emergentes
  - `configureAlerts(page)`: Configura alertas del navegador

### 3. `utils/navigation.js`
- **Propósito**: Navegación por el menú de SUNAT
- **Contenido**:
  - Navegación a diferentes secciones
  - Manejo de selectores múltiples
- **Funciones**:
  - `navigateToMenu(page)`: Navega al menú principal
  - `navigateToEmpresas(page)`: Va a la sección Empresas
  - `navigateToComprobantes(page)`: Va a Comprobantes de Pago
  - `navigateToFacturas(page)`: Va a Facturas Electrónicas
  - `navigateToConsultar(page)`: Va a la sección de consultas
  - `navigateToConsultas(page)`: Navegación completa paso a paso

### 4. `utils/calendar.js`
- **Propósito**: Manejo de calendario y fechas
- **Contenido**:
  - Generación de días del mes
  - Configuración de fechas
  - Selección de categorías
  - Botón "Aceptar"
- **Funciones**:
  - `generarDiasDelMes(año, mes)`: Genera todos los días de un mes
  - `clickCalendario(iframe)`: Hace clic en el botón calendario
  - `establecerFechas(iframe, diaActual)`: Establece fechas inicio y fin
  - `seleccionarCategoriaYAceptar(page, iframe, categoria)`: Selecciona categoría y acepta

### 5. `utils/search.js`
- **Propósito**: Búsqueda de archivos XML
- **Contenido**:
  - Búsqueda en tablas
  - Selectores combinados
  - Búsquedas de respaldo
  - Verificación de iframe
- **Funciones**:
  - `verificarIframe(page)`: Verifica y configura el iframe
  - `buscarArchivosXmlEnTablas(iframe)`: Busca en tablas
  - `buscarConSelectoresCombinados(iframe)`: Búsqueda avanzada
  - `buscarRespaldo(iframe)`: Búsquedas de respaldo
  - `buscarArchivosXml(iframe)`: Función principal de búsqueda

## Test Principal

### `tests/sunat-modular.spec.js`
- **Propósito**: Test principal que importa todos los módulos
- **Flujo**:
  1. Configura la página
  2. Realiza login
  3. Navega a consultas
  4. Verifica iframe
  5. Ejecuta búsqueda día por día
  6. Genera resumen final

## Ventajas de la Estructura Modular

1. **Mantenibilidad**: Cada función tiene una responsabilidad específica
2. **Reutilización**: Los módulos pueden usarse en otros tests
3. **Debugging**: Fácil identificar problemas en módulos específicos
4. **Escalabilidad**: Fácil agregar nuevas funcionalidades
5. **Legibilidad**: Código más limpio y organizado

## Uso

Para ejecutar el test modular:

```bash
npm test tests/sunat-modular.spec.js
```

Para ejecutar el test original:

```bash
npm test tests/example.spec.js
```

## Funcionalidades Implementadas

- ✅ Login automático a SUNAT
- ✅ Navegación automática por el menú
- ✅ Clic en botón calendario
- ✅ Establecimiento de fechas día por día
- ✅ Selección de categorías de facturas
- ✅ Clic en botón "Aceptar"
- ✅ Espera de 30 segundos para procesamiento
- ✅ Búsqueda exhaustiva de archivos XML
- ✅ Manejo de errores y reintentos
- ✅ Resumen detallado de resultados
