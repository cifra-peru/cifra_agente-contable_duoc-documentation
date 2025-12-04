# Proyecto Playwright - Bot de Automatización

Proyecto configurado completamente con Playwright para pruebas end-to-end y automatización con bot.

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Instalar los navegadores de Playwright:
```bash
npx playwright install
```

3. Instalar las dependencias del sistema (si es necesario):
```bash
npx playwright install-deps
```

## Uso

### 🚀 Ejecutar el Bot

1. **Configurar la URL de la aplicación:**
   - Edita el archivo `config.js`
   - Cambia la propiedad `urlAplicacion` con la dirección de tu aplicación

2. **Ejecutar el bot:**
```bash
npm start
# o
npm run bot
```

El bot abrirá la aplicación configurada en `config.js`.

### 🧪 Ejecutar Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests con UI interactiva
```bash
npm run test:ui
```

### Ejecutar tests en modo headed (con navegador visible)
```bash
npm run test:headed
```

### Ejecutar tests en modo debug
```bash
npm run test:debug
```

### Generar código de test automáticamente
```bash
npm run test:codegen
```

### Ver reporte HTML
```bash
npm run test:report
```

### Ejecutar tests en navegadores específicos
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

## Estructura del proyecto

```
.
├── bot.js              # Clase principal del bot
├── index.js            # Punto de entrada del bot
├── config.js           # Configuración del bot (URL, navegador, etc.)
├── ejemplo-uso.js      # Ejemplos de uso del bot
├── tests/              # Tests de Playwright
├── screenshots/        # Capturas de pantalla
├── playwright.config.js # Configuración de Playwright
├── package.json        # Dependencias y scripts
└── README.md          # Este archivo
```

## 🤖 Uso del Bot

### Configuración Básica

Edita `config.js` para personalizar:

```javascript
{
  urlAplicacion: 'https://tu-aplicacion.com',
  navegador: {
    tipo: 'chromium',  // 'chromium', 'firefox', 'webkit'
    headless: false,   // true = sin ventana, false = con ventana
    viewport: {
      width: 1280,
      height: 720
    }
  }
}
```

### Métodos del Bot

El bot incluye los siguientes métodos:

- `abrirAplicacion(url)` - Abre una aplicación/URL
- `esperarElemento(selector)` - Espera a que un elemento esté visible
- `hacerClic(selector)` - Hace clic en un elemento
- `escribir(selector, texto)` - Escribe texto en un campo
- `obtenerTexto(selector)` - Obtiene el texto de un elemento
- `capturarPantalla(nombre)` - Toma una captura de pantalla
- `cerrar()` - Cierra el navegador

### Ejemplo de Uso

```javascript
const Bot = require('./bot');

const bot = new Bot({
  browserType: 'chromium',
  headless: false
});

await bot.init();
await bot.abrirAplicacion('https://example.com');
await bot.esperarElemento('h1');
await bot.capturarPantalla('mi-captura');
await bot.cerrar();
```

## Configuración

La configuración principal está en `playwright.config.js`. Puedes ajustar:
- Timeouts
- Navegadores a usar
- Modo headless/headed
- Screenshots y videos
- Reportes
- Y más...

## Documentación

Para más información, visita: https://playwright.dev

