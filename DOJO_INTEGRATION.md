# 🤖 Bot SUNAT con Detección Avanzada de Dojo Toolkit

## 🆕 Nuevas Funcionalidades Implementadas

### 🔧 Detección de Dojo Toolkit
El bot ahora incluye capacidades avanzadas para detectar y interactuar con componentes de Dojo Toolkit utilizados en el portal SUNAT.

### 📁 Archivos Nuevos

#### `utils/dojo-detector.js`
- **`detectarDojoToolkit(page)`**: Detecta si Dojo Toolkit está cargado en la página
- **`detectarComponentesDojo(page)`**: Identifica formularios, botones, menús, diálogos, grids y validaciones de Dojo
- **`interactuarConDojo(page, tipoComponente, accion, parametros)`**: Interactúa con componentes específicos de Dojo
- **`escucharEventosDojo(page)`**: Configura escucha de eventos de Dojo
- **`obtenerEstadoDojo(page)`**: Obtiene el estado completo del sistema Dojo

#### `utils/dojo-sunat.js`
- **`manejarFormulariosDojoSunat(page, iframe)`**: Analiza formularios específicos de SUNAT
- **`validarFormulariosDojoSunat(page, iframe)`**: Valida formularios usando métodos de Dojo
- **`interactuarConComponentesDojoSunat(page, iframe, accion, parametros)`**: Interacciones específicas con componentes SUNAT
- **`monitorearEventosDojoSunat(page, iframe)`**: Monitorea eventos específicos de SUNAT
- **`obtenerInformacionDojoSunat(page, iframe)`**: Obtiene información completa del sistema Dojo en SUNAT

### 🔄 Integración en el Flujo Principal

El análisis de Dojo se ejecuta en el **PASO 7** del bot, después de la sincronización de tiempo F5 CSPM:

1. **Detección General**: Identifica si Dojo Toolkit está presente
2. **Análisis de Componentes**: Detecta formularios, botones, menús, etc.
3. **Análisis Específico SUNAT**: Examina componentes específicos del portal SUNAT
4. **Configuración de Eventos**: Establece monitoreo de eventos importantes
5. **Interacción Inteligente**: Intenta interactuar con componentes clave

### 📊 Información que Proporciona

#### Detección General
- ✅ Versión de Dojo Toolkit
- ✅ Disponibilidad de Dijit y DojoX
- ✅ Número total de componentes Dojo
- ✅ Tipos de componentes más comunes

#### Análisis Específico SUNAT
- 📝 Formularios Dojo encontrados
- 📅 Calendarios Dojo detectados
- 📋 Selectores de categoría Dojo
- 🔘 Botones importantes de Dojo
- ✅ Sistema de validación Dojo
- 🔍 Elementos específicos de SUNAT (Filtro Busqueda, Consultas Fac)

### 🎯 Beneficios para el Bot

1. **Mejor Detección**: Identifica componentes que podrían no ser detectados por selectores estándar
2. **Interacción Inteligente**: Usa métodos nativos de Dojo para interactuar con componentes
3. **Validación Avanzada**: Aprovecha el sistema de validación de Dojo
4. **Monitoreo de Eventos**: Escucha eventos importantes para detectar cambios
5. **Compatibilidad**: Funciona tanto con componentes estándar como con Dojo

### 🔍 Logging Detallado

El bot ahora proporciona información detallada sobre:

```
🔧 Iniciando análisis de Dojo Toolkit...
✅ Dojo Toolkit detectado en SUNAT
📦 Versión: 1.16.3
🎨 Dijit: SÍ
🔧 DojoX: SÍ

📊 Componentes Dojo detectados:
   📝 Formularios: 3
   🔘 Botones: 8
   📋 Menús: 2
   💬 Diálogos: 1
   📊 Grids: 1
   ✅ Validaciones: 5

🔧 Iniciando análisis específico de Dojo en SUNAT...
📊 Información específica de Dojo SUNAT obtenida
📝 Formularios específicos de SUNAT analizados
✅ Validaciones específicas de SUNAT analizadas
📅 Calendario Dojo encontrado en SUNAT
📋 Selector de categoría Dojo encontrado en SUNAT
🔘 Botón de aceptar Dojo encontrado en SUNAT
```

### 🚀 Uso Avanzado

El bot puede ahora:

1. **Detectar automáticamente** si SUNAT usa Dojo Toolkit
2. **Adaptar su comportamiento** según los componentes encontrados
3. **Usar métodos nativos de Dojo** para interacciones más robustas
4. **Monitorear eventos** para detectar cambios en tiempo real
5. **Validar formularios** usando el sistema de validación de Dojo

### 🔧 Configuración

No se requiere configuración adicional. El bot detecta automáticamente Dojo Toolkit y se adapta según lo que encuentre.

### 📈 Mejoras Futuras

- Integración con más frameworks JavaScript
- Detección de componentes React/Vue
- Análisis de rendimiento de componentes
- Interacciones más avanzadas con Dojo

---

**¡El bot ahora es más inteligente y puede adaptarse mejor a la estructura técnica del portal SUNAT!** 🎉
