# SUNAT Bot Knowledge Base - Invoice Categories

## Resumen Ejecutivo
El bot ha aprendido las categorías de facturas del Plan Contable General Empresarial (PCGE) de Perú para mejorar su navegación en el sistema SUNAT.

## Categorías Principales de Comprobantes

### 1. FACTURAS ELECTRÓNICAS
**Códigos contables principales:**
- 1211-1214: Facturas por cobrar (terceros)
- 1311-1314: Facturas por cobrar (relacionadas)
- 4211-4212: Facturas por pagar (terceros)
- 4311-4312: Facturas por pagar (relacionadas)

**Estados de facturas:**
- No emitidas
- Emitidas en cartera
- En cobranza
- En descuento

### 2. BOLETAS DE VENTA
**Tipos principales:**
- Boletas de venta al por menor
- Boletas de servicios
- Boletas de honorarios

**Códigos contables:**
- Mismas categorías que facturas pero con tratamiento diferenciado

### 3. NOTAS
**Tipos de notas:**
- Notas de crédito
- Notas de débito
- Notas de abono
- Notas de cargo

**Aplicación:**
- Corrección de errores
- Devoluciones
- Descuentos adicionales
- Ajustes de montos

## Clasificación Tributaria

### IGV (Impuesto General a las Ventas)
- **40111**: IGV - Cuenta propia
- **40112**: IGV - Servicios prestados por no domiciliados
- **40113**: IGV - Régimen de percepciones
- **40114**: IGV - Régimen de retenciones

### Impuesto a la Renta
- **40171**: Renta de tercera categoría
- **40172**: Renta de cuarta categoría
- **40173**: Renta de quinta categoría
- **40174**: Renta de no domiciliados

## Navegación SUNAT Optimizada

### Secuencia de Navegación Aprendida:
1. **Login** → Credenciales SUNAT
2. **Menú Principal** → Navegación base
3. **Empresas** → Acceso a funciones empresariales
4. **Comprobantes de Pago** → Categoría principal
5. **Facturas Electrónicas** → Subcategoría específica
6. **Consultar factura, boletas y notas** → Función final

### Selectores Mejorados:
El bot utiliza múltiples selectores para mayor robustez:
- `text=Empresas`
- `a:has-text("Empresas")`
- `button:has-text("Empresas")`
- `.divAccesosEmpresas a`
- `.divAccesosEmpresas button`

### Manejo de Popups:
Sistema anti-popup implementado con:
- Detección automática de popups
- Cierre de modales
- Presión de tecla Escape
- Selectores múltiples para botones de cierre

## Aplicación Práctica

### Para Consultas de Facturas:
1. Identificar tipo de comprobante (factura, boleta, nota)
2. Determinar estado (emitida, en cartera, pagada, anulada)
3. Clasificar según relación comercial (terceros vs relacionadas)
4. Aplicar códigos tributarios correspondientes

### Para Navegación Eficiente:
1. Usar selectores robustos con fallbacks
2. Implementar timeouts apropiados
3. Manejar errores silenciosamente
4. Cerrar popups automáticamente

## Códigos de Cuenta Específicos para Facturas

### Cuentas por Cobrar (Activo)
```
121 - Facturas, boletas y otros comprobantes por cobrar
├── 1211 - No emitidas
├── 1212 - Emitidas en cartera
├── 1213 - En cobranza
└── 1214 - En descuento

131 - Facturas, boletas y otros comprobantes por cobrar (Relacionadas)
├── 1311 - No emitidas
├── 1312 - Emitidas en cartera
├── 1313 - En cobranza
└── 1314 - En descuento
```

### Cuentas por Pagar (Pasivo)
```
421 - Facturas, boletas y otros comprobantes por pagar
├── 4211 - No emitidas
└── 4212 - Emitidas

431 - Facturas, boletas y otros comprobantes por pagar (Relacionadas)
├── 4311 - No emitidas
└── 4312 - Emitidas
```

## Mejoras Implementadas

1. **Sistema Anti-Popup**: Detección y cierre automático de ventanas emergentes
2. **Selectores Robustos**: Múltiples fallbacks para elementos de navegación
3. **Timeouts Optimizados**: Balance entre velocidad y confiabilidad
4. **Manejo de Errores**: Procesamiento silencioso de errores no críticos
5. **Navegación Estructurada**: Secuencia lógica de pasos para acceder a consultas

## Próximos Pasos

El bot está preparado para:
- Navegar eficientemente en SUNAT
- Identificar tipos de comprobantes
- Clasificar transacciones contables
- Manejar diferentes estados de documentos
- Aplicar códigos tributarios apropiados

Esta base de conocimiento permite al bot comprender la estructura contable peruana y navegar de manera más inteligente en el sistema SUNAT.
