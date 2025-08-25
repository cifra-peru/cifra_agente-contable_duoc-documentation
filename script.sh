#!/bin/bash

# Crear estructura de carpetas para proyecto APT122
mkdir -p APT122/{Fase1,Fase2,Fase3}/{EvidenciasIndividuales,EvidenciasGrupales}
mkdir -p APT122/Fase2/EvidenciasProyecto/{Documentacion,Sistema,BaseDatos}

# FASE 1 - Evidencias Individuales
touch "APT122/Fase1/EvidenciasIndividuales/AntonioLoza_LeandroMarcelo_1.1_APT122_AutoevaluacionCompetenciasFase1.docx"
touch "APT122/Fase1/EvidenciasIndividuales/AntonioLoza_LeandroMarcelo_1.2_APT122_DiarioReflexionFase1.docx"
touch "APT122/Fase1/EvidenciasIndividuales/AntonioLoza_LeandroMarcelo_1.3_APT122_AutoevaluacionFase1.docx"

# FASE 1 - Evidencias Grupales
touch "APT122/Fase1/EvidenciasGrupales/Presentacion_Proyecto.pptx"
touch "APT122/Fase1/EvidenciasGrupales/1.4_APT122_FormativaFase1.docx"
touch "APT122/Fase1/EvidenciasGrupales/1.5_GuiaEstudiante_Fase_1_Definicion_Proyecto_APT_Espanol.docx"
touch "APT122/Fase1/EvidenciasGrupales/1.5_GuiaEstudiante_Fase_1_Definicion_Proyecto_APT_Ingles_OPTATIVO.docx"
touch "APT122/Fase1/EvidenciasGrupales/PLANILLA_DE_EVALUACION_FASE_1.xlsx"

# FASE 2 - Evidencias Individuales
touch "APT122/Fase2/EvidenciasIndividuales/AntonioLoza_LeandroMarcelo_2.1_APT122_DiarioReflexionFase2.docx"

# FASE 2 - Evidencias Grupales
touch "APT122/Fase2/EvidenciasGrupales/2.4_GuiaEstudiante_Fase_2_DesarrolloProyecto_APT_Espanol.docx"
touch "APT122/Fase2/EvidenciasGrupales/2.4_GuiaEstudiante_Fase_2_DesarrolloProyecto_APT_Ingles_OPTATIVO.docx"
touch "APT122/Fase2/EvidenciasGrupales/PLANILLA_DE_EVALUACION_AVANCE_FASE_2.xlsx"
touch "APT122/Fase2/EvidenciasGrupales/2.6_GuiaEstudiante_Fase_2_Informe_Final_Proyecto_APT_Espanol.docx"
touch "APT122/Fase2/EvidenciasGrupales/2.6_GuiaEstudiante_Fase_2_Informe_Final_Proyecto_APT_Ingles_OPTATIVO.docx"
touch "APT122/Fase2/EvidenciasGrupales/PLANILLA_DE_EVALUACION_FINAL_FASE_2.xlsx"

# FASE 2 - Evidencias Proyecto
touch "APT122/Fase2/EvidenciasProyecto/Presentacion_Proyecto.pptx"
touch "APT122/Fase2/EvidenciasProyecto/Documentacion/README.md"
touch "APT122/Fase2/EvidenciasProyecto/Sistema/README.md"
touch "APT122/Fase2/EvidenciasProyecto/BaseDatos/README.md"

# FASE 3 - Evidencias Individuales
touch "APT122/Fase3/EvidenciasIndividuales/AntonioLoza_LeandroMarcelo_3.1_APT122_DiarioReflexionFase3.docx"

# FASE 3 - Evidencias Grupales
touch "APT122/Fase3/EvidenciasGrupales/PLANILLA_DE_EVALUACION_FASE_3.xlsx"
touch "APT122/Fase3/EvidenciasGrupales/Presentacion_Final_del_proyecto_Espanol.pptx"
touch "APT122/Fase3/EvidenciasGrupales/Presentacion_Final_del_proyecto_Ingles_OPTATIVO.pptx"

# Crear .gitignore básico
cat > APT122/.gitignore << 'EOF'
# Archivos temporales de Office
~$*
*.tmp

# Archivos de respaldo
*.bak
*~

# Archivos del sistema
.DS_Store
Thumbs.db

# Carpetas de IDEs
.vscode/
.idea/
EOF

# Crear README principal
cat > APT122/README.md << 'EOF'
# Proyecto APT122

## Estructura del Proyecto

### Fase 1
- **Evidencias Individuales**: Autoevaluaciones y diario de reflexión
- **Evidencias Grupales**: Definición del proyecto y materiales formativos

### Fase 2
- **Evidencias Individuales**: Diario de reflexión fase 2
- **Evidencias Grupales**: Desarrollo e informe final
- **Evidencias Proyecto**: Código, documentación y base de datos

### Fase 3
- **Evidencias Individuales**: Diario de reflexión final
- **Evidencias Grupales**: Presentación final del proyecto

## Notas
- Los archivos marcados como OPTATIVO son entregables opcionales
- Archivos personalizados para: Leandro Marcelo Antonio Loza
- Las planillas de evaluación serán proporcionadas por el docente
EOF

echo "✅ Estructura de carpetas y archivos creada en ./APT122/"
echo "👤 Archivos personalizados para: Leandro Marcelo Antonio Loza"
echo "📁 Revisa el contenido con: tree APT122/ o ls -la APT122/"