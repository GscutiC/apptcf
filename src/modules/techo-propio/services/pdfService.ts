/**
 * PDF Service - Servicio para generación de formularios PDF de Techo Propio
 * 
 * Utiliza pdf-lib para:
 * 1. Cargar el formulario PDF como plantilla
 * 2. Escribir los datos de la solicitud en las posiciones correspondientes
 * 3. Generar el PDF completado para descarga o impresión
 */

import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';
import {
  ApplicationPDFData,
  PDFGenerationResult,
  DEFAULT_PDF_CONFIG,
  PersonPDFData,
  EconomicPDFData,
  FamilyDependentPDFData,
  AdditionalFamilyMemberPDFData,
  PropertyPDFData
} from '../types/pdf.types';
import {
  REGISTRATION_FIELDS,
  PROPERTY_FIELDS,
  HEAD_OF_FAMILY_PERSONAL_FIELDS,
  HEAD_OF_FAMILY_ECONOMIC_FIELDS,
  SPOUSE_PERSONAL_FIELDS,
  SPOUSE_ECONOMIC_FIELDS,
  FAMILY_DEPENDENTS_TABLE_CONFIG,
  getNestedValue,
  formatFieldValue,
  getLabelForEnum
} from '../utils/pdfFieldMapping';
import { TechoPropioApplication } from '../types';

/**
 * Clase principal para generación de PDFs
 */
class PDFService {
  private templateUrl: string;
  private cachedTemplate: ArrayBuffer | null = null;

  constructor() {
    this.templateUrl = DEFAULT_PDF_CONFIG.templatePath;
  }

  /**
   * Carga el template PDF desde la URL
   */
  private async loadTemplate(): Promise<ArrayBuffer> {
    if (this.cachedTemplate) {
      return this.cachedTemplate;
    }

    try {
      const response = await fetch(this.templateUrl);
      if (!response.ok) {
        throw new Error(`Error cargando template: ${response.status}`);
      }
      this.cachedTemplate = await response.arrayBuffer();
      return this.cachedTemplate;
    } catch (error) {
      console.error('Error loading PDF template:', error);
      throw new Error('No se pudo cargar el formulario PDF');
    }
  }

  /**
   * Transforma los datos de una solicitud al formato requerido para el PDF
   */
  public transformApplicationData(app: TechoPropioApplication): ApplicationPDFData {
    const appAny = app as any;
    
    // Extraer datos del jefe de familia
    const headOfFamily = appAny.head_of_family || appAny.applicant || {};
    const headOfFamilyEconomic = appAny.head_of_family_economic || appAny.economic_info || {};
    
    // Extraer datos del cónyuge (si existe)
    // Buscar en múltiples ubicaciones posibles
    let spouse = appAny.spouse || null;
    let spouseEconomic = appAny.spouse_economic || null;
    
    // Si no hay spouse directo, buscar en household_members
    if (!spouse && appAny.household_members) {
      const spouseMember = appAny.household_members.find((m: any) => {
        const type = (m.member_type || '').toString().toUpperCase();
        const relationship = (m.relationship || '').toString().toUpperCase();
        const familyBond = (m.family_bond || '').toString().toUpperCase();
        
        return type.includes('SPOUSE') || 
               type === 'CONYUGE' || 
               type.includes('CONVIVIENTE') ||
               relationship.includes('SPOUSE') ||
               relationship === 'CONYUGE' ||
               relationship.includes('ESPOSO') ||
               relationship.includes('ESPOSA') ||
               familyBond.includes('CONYUGE') ||
               familyBond.includes('ESPOSO') ||
               familyBond.includes('ESPOSA');
      });
      if (spouseMember) {
        spouse = spouseMember;
        spouseEconomic = spouseMember;
      }
    }
    
    // Extraer miembros del hogar
    const householdMembers = appAny.household_members || [];
    
    // Vínculos que van en "Carga Familiar" (página 1)
    // hijos, hermanos, nietos menores de 25 años o mayores con discapacidad permanente
    const CARGA_FAMILIAR_BONDS = ['hijo', 'hija', 'hermano', 'hermana', 'nieto', 'nieta'];
    
    // Vínculos que van en "Información Adicional del Grupo Familiar" (página 2)
    // padres, abuelos u otros que vivan con el jefe de familia
    const INFO_ADICIONAL_BONDS = ['padre', 'madre', 'abuelo', 'abuela', 'otro', 'otros'];
    
    // Función para verificar si es jefe o cónyuge
    const isHeadOrSpouse = (member: any): boolean => {
      const memberType = member.member_type?.toString().toUpperCase();
      return memberType?.includes('HEAD') || 
        memberType?.includes('SPOUSE') ||
        memberType === 'JEFE_FAMILIA' ||
        memberType === 'CONYUGE';
    };
    
    // Filtrar CARGA FAMILIAR (hijos, hermanos, nietos)
    const familyDependents: FamilyDependentPDFData[] = householdMembers
      .filter((member: any) => {
        if (isHeadOrSpouse(member)) return false;
        const bond = (member.family_bond || member.relationship || '').toLowerCase();
        // Si el vínculo está en CARGA_FAMILIAR_BONDS, va aquí
        return CARGA_FAMILIAR_BONDS.some(b => bond.includes(b));
      })
      .map((member: any) => ({
        dni: member.dni || member.document_number || '',
        first_name: member.first_name || '',
        paternal_surname: member.apellido_paterno || member.paternal_surname || '',
        maternal_surname: member.apellido_materno || member.maternal_surname || '',
        birth_date: member.birth_date || '',
        family_bond: member.family_bond || member.relationship || 'Otro',
        gender: member.gender || '',
        education_level: member.education_level || '',
        disability_type: member.disability_type || 'ninguna',
        disability_is_permanent: member.disability_is_permanent || false,
        disability_is_severe: member.disability_is_severe || false
      }));
    
    // Filtrar INFORMACIÓN ADICIONAL DEL GRUPO FAMILIAR (padres, abuelos, otros)
    const additionalFamilyMembers: AdditionalFamilyMemberPDFData[] = householdMembers
      .filter((member: any) => {
        if (isHeadOrSpouse(member)) return false;
        const bond = (member.family_bond || member.relationship || '').toLowerCase();
        // Si NO está en CARGA_FAMILIAR_BONDS, va a información adicional
        const isInCargaFamiliar = CARGA_FAMILIAR_BONDS.some(b => bond.includes(b));
        return !isInCargaFamiliar;
      })
      .map((member: any) => ({
        first_name: member.first_name || '',
        paternal_surname: member.apellido_paterno || member.paternal_surname || '',
        maternal_surname: member.apellido_materno || member.maternal_surname || '',
        dni: member.dni || member.document_number || '',
        family_bond: member.family_bond || member.relationship || 'Otro'
      }));

    // Calcular ingreso total
    const headIncome = parseFloat(String(headOfFamilyEconomic?.monthly_income || 0));
    const spouseIncome = parseFloat(String(spouseEconomic?.monthly_income || 0));
    const totalIncome = headIncome + spouseIncome;

    // Construir objeto de datos para el PDF
    const pdfData: ApplicationPDFData = {
      registration: {
        code: app.code || '',
        convocation_code: appAny.convocation_code || '',
        registration_date: app.created_at || '',
        year: appAny.registration_year || new Date().getFullYear()
      },
      property: this.extractPropertyData(appAny.property_info || {}),
      head_of_family: this.extractPersonData(headOfFamily),
      head_of_family_economic: this.extractEconomicData(headOfFamilyEconomic),
      spouse: spouse ? this.extractPersonData(spouse) : undefined,
      spouse_economic: spouseEconomic ? this.extractEconomicData(spouseEconomic) : undefined,
      family_dependents: familyDependents,
      additional_family_members: additionalFamilyMembers, // ✅ NUEVO: Miembros adicionales para página 2
      total_household_members: householdMembers.length + 1 + (spouse ? 1 : 0),
      total_family_income: totalIncome
    };

    return pdfData;
  }

  /**
   * Extrae datos del predio
   */
  private extractPropertyData(property: any): PropertyPDFData {
    return {
      department: property.department || '',
      province: property.province || '',
      district: property.district || '',
      populated_center: property.populated_center || '',
      manzana: property.manzana || '',
      lote: property.lote || '',
      sub_lote: property.sub_lote || '',
      address: property.address || '',
      reference: property.reference || ''
    };
  }

  /**
   * Extrae datos personales
   */
  private extractPersonData(person: any): PersonPDFData {
    return {
      dni: person.document_number || person.dni || '',
      first_name: person.first_name || '',
      paternal_surname: person.paternal_surname || person.apellido_paterno || '',
      maternal_surname: person.maternal_surname || person.apellido_materno || '',
      birth_date: person.birth_date || '',
      civil_status: person.civil_status || person.marital_status || 'soltero',
      education_level: person.education_level || '',
      disability_type: person.disability_type || 'ninguna',
      disability_is_permanent: person.disability_is_permanent || false, // ✅ NUEVO
      disability_is_severe: person.disability_is_severe || false, // ✅ NUEVO
      phone_number: person.phone_number || person.phone || '',
      email: person.email || ''
    };
  }

  /**
   * Extrae datos económicos
   */
  private extractEconomicData(economic: any): EconomicPDFData {
    return {
      occupation: economic.occupation_detail || economic.occupation || '',
      employment_situation: economic.employment_situation || '',
      work_condition: economic.work_condition || '',
      monthly_income: parseFloat(String(economic.monthly_income || 0))
    };
  }

  /**
   * Genera el PDF con los datos de la solicitud
   */
  public async generatePDF(application: TechoPropioApplication): Promise<PDFGenerationResult> {
    try {
      // Transformar datos
      const pdfData = this.transformApplicationData(application);
      
      // Cargar template
      const templateBytes = await this.loadTemplate();
      
      // Cargar documento PDF
      const pdfDoc = await PDFDocument.load(templateBytes);
      
      // Cargar fuente
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Obtener páginas
      const pages = pdfDoc.getPages();
      const page1 = pages[0];
      const page2 = pages.length > 1 ? pages[1] : null;

      // Llenar campos de la página 1
      await this.fillPage1(page1, pdfData, font, boldFont);
      
      // Llenar página 2 si existe y hay más datos
      if (page2) {
        await this.fillPage2(page2, pdfData, font, boldFont);
      }

      // Generar PDF final
      const pdfBytes = await pdfDoc.save();
      // Convertir Uint8Array a ArrayBuffer para compatibilidad con Blob
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      return {
        success: true,
        blob,
        url,
        filename: `Formulario_${application.code}_${new Date().toISOString().split('T')[0]}.pdf`
      };

    } catch (error) {
      console.error('Error generating PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al generar PDF'
      };
    }
  }

  /**
   * Llena los campos de la página 1
   */
  private async fillPage1(
    page: PDFPage,
    data: ApplicationPDFData,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const { height } = page.getSize();
    const defaultFontSize = DEFAULT_PDF_CONFIG.defaultFontSize;
    const color = rgb(0, 0, 0);

    // Función helper para dibujar texto
    const drawText = (
      text: string,
      x: number,
      y: number,
      options: { fontSize?: number; font?: PDFFont; maxWidth?: number } = {}
    ) => {
      const fontSize = options.fontSize || defaultFontSize;
      const textFont = options.font || font;
      
      // Truncar texto si excede maxWidth
      let finalText = text;
      if (options.maxWidth && text) {
        const textWidth = textFont.widthOfTextAtSize(text, fontSize);
        if (textWidth > options.maxWidth) {
          // Truncar y agregar ...
          while (textFont.widthOfTextAtSize(finalText + '...', fontSize) > options.maxWidth && finalText.length > 0) {
            finalText = finalText.slice(0, -1);
          }
          finalText += '...';
        }
      }

      if (finalText) {
        page.drawText(finalText, {
          x,
          y,
          size: fontSize,
          font: textFont,
          color
        });
      }
    };

    // ===== INFORMACIÓN DEL REGISTRO =====
    // Fecha de Registro está vacía por ahora, Convocatoria en la parte superior derecha
    // Coordenadas ajustadas basadas en el formulario real
    drawText(data.registration.code, 435, height - 62, { fontSize: 9, font: boldFont }); // Convocatoria
    drawText(String(data.registration.year || ''), 390, height - 62, { fontSize: 9 }); // Año (derecha)

    // ===== INFORMACIÓN DEL PREDIO =====
    // La sección "Información General del predio" está aproximadamente a 1/3 del formulario
    // Ajustado para que los datos caigan en los campos de input (líneas azules)
    const propertyY = height - 355; // Primera fila: Dirección
    drawText(data.property.address || '', 70, propertyY, { maxWidth: 450, fontSize: 9 });
    
    // Segunda fila del predio: Departamento, Provincia, Distrito
    const propertyY2 = height - 390;
    drawText(data.property.department, 48, propertyY2, { maxWidth: 95, fontSize: 9 });
    drawText(data.property.province, 240, propertyY2, { maxWidth: 95, fontSize: 9 });
    drawText(data.property.district, 455, propertyY2, { maxWidth: 95, fontSize: 9 });
    
    // Tercera fila: Manzana, Lote, Sub-Lote, Centro Poblado, Referencia
    const propertyY3 = height - 415;
    drawText(data.property.manzana || '', 48, propertyY3, { maxWidth: 50, fontSize: 9 });
    drawText(data.property.lote || '',135, propertyY3, { maxWidth: 50, fontSize: 9 });
    drawText(data.property.sub_lote || '', 245, propertyY3, { maxWidth: 50, fontSize: 9 });
    drawText(data.property.populated_center || '', 315, propertyY3, { maxWidth: 100, fontSize: 9 });
    drawText(data.property.reference || '', 430, propertyY3, { fontSize: 8, maxWidth: 110 });

    // ===== JEFE DE FAMILIA =====
    // Estructura del formulario real:
    // COLUMNA IZQUIERDA (Información Personal):
    //   Fila 1: Nombre(s) | Apellido Paterno | Apellido Materno
    //   Fila 2: N° DNI | Fecha de Nacimiento | Estado Civil
    //   Fila 3: Grado de Instrucción | Ocupación | Discapacidad
    // COLUMNA DERECHA (Información Económica):
    //   Fila 1: Situación Laboral (Dependiente/Independiente)
    //   Fila 2: Condición (Formal/Informal)
    //   Fila 3: Ingreso Mensual (s/)

    // --- FILA 1: Nombre(s), Apellido Paterno, Apellido Materno ---
    const hofY1 = height - 475;
    drawText(data.head_of_family.first_name, 55, hofY1, { maxWidth: 90, fontSize: 9 });           // Nombre(s)
    drawText(data.head_of_family.paternal_surname, 180, hofY1, { maxWidth: 90, fontSize: 9 });    // Apellido Paterno
    drawText(data.head_of_family.maternal_surname, 295, hofY1, { maxWidth: 90, fontSize: 9 });    // Apellido Materno
    
    // --- FILA 2: N° DNI, Fecha de Nacimiento, Estado Civil ---
    const hofY2 = height - 500;
    drawText(data.head_of_family.dni, 55, hofY2, { maxWidth: 75, fontSize: 9 });                              // N° DNI
    drawText(formatFieldValue(data.head_of_family.birth_date, 'date'), 175, hofY2, { maxWidth: 80, fontSize: 9 }); // Fecha Nacimiento
    drawText(getLabelForEnum(data.head_of_family.civil_status, 'civil_status'), 325, hofY2, { maxWidth: 80, fontSize: 9 }); // Estado Civil
    
    // --- FILA 3: Grado de Instrucción, Ocupación ---
    const hofY3 = height - 535;
    drawText(getLabelForEnum(data.head_of_family.education_level, 'education'), 55, hofY3, { maxWidth: 90, fontSize: 8 }); // Grado Instrucción
    drawText(data.head_of_family_economic.occupation, 180, hofY3, { maxWidth: 120, fontSize: 8 });             // Ocupación
    
    // --- FILA 4: DISCAPACIDAD (fila independiente) ---
    // Esta sección tiene coordenadas 100% independientes de las otras filas
    // Estructura del formulario:
    //   Línea 1: [Campo de texto con el tipo de discapacidad]
    //   Línea 2: ○ Permanente    ○ Severa  (círculos para marcar)
    
    // *** COORDENADAS INDEPENDIENTES - AJUSTAR AQUÍ ***
    const disabilityX = 345;              // Posición X de toda la sección
    const disabilityY = height - 520;     // Posición Y del texto (línea superior)
    const disabilityCircleY = height - 535; // Posición Y de los círculos (línea inferior)
    const disabilityCircleX_Perm = 300;   // Posición X del círculo "Permanente"
    const disabilityCircleX_Sev = 370;    // Posición X del círculo "Severa"
    // *** FIN COORDENADAS ***
    
    const disabilityType = data.head_of_family.disability_type?.toLowerCase() || 'ninguna';
    
    if (disabilityType === 'ninguna' || disabilityType === '') {
      // Sin discapacidad: mostrar "Ninguna" en el campo de texto
      drawText('Ninguna', disabilityX, disabilityY, { fontSize: 8, maxWidth: 50 });
    } else {
      // Con discapacidad: mostrar el tipo en el campo de texto (línea superior)
      const disabilityLabel = getLabelForEnum(disabilityType, 'disability');
      drawText(disabilityLabel, disabilityX, disabilityY, { fontSize: 8, maxWidth: 60 });
      
      // Línea inferior: marcar con "X" en los círculos
      if (data.head_of_family.disability_is_permanent) {
        drawText('X', disabilityCircleX_Perm, disabilityCircleY, { fontSize: 10, font: boldFont });
      }
      if (data.head_of_family.disability_is_severe) {
        drawText('X', disabilityCircleX_Sev, disabilityCircleY, { fontSize: 10, font: boldFont });
      }
    }

    // ===== INFORMACIÓN ECONÓMICA (columna derecha) =====
    // Coordenadas independientes para ajustar esta sección
    
    // --- Fila 1: Situación Laboral - Marcar con "X" ---
    const econY1 = height - 475;
    const econCircleX_Dep = 429;      // Posición X del círculo "Dependiente"
    const econCircleX_Indep = 507;    // Posición X del círculo "Independiente"
    
    const employmentSituation = data.head_of_family_economic.employment_situation?.toLowerCase() || '';
    if (employmentSituation === 'dependiente') {
      drawText('X', econCircleX_Dep, econY1, { fontSize: 10, font: boldFont });
    } else if (employmentSituation === 'independiente') {
      drawText('X', econCircleX_Indep, econY1, { fontSize: 10, font: boldFont });
    }
    
    // --- Fila 2: Condición (Formal/Informal) - Marcar con "X" ---
    const econY2 = height - 503;
    const econCircleX_Formal = 429;   // Posición X del círculo "Formal"
    const econCircleX_Informal = 507; // Posición X del círculo "Informal"
    
    const workCondition = (data.head_of_family_economic.work_condition || '').toLowerCase();
    if (workCondition === 'formal') {
      drawText('X', econCircleX_Formal, econY2, { fontSize: 10, font: boldFont });
    } else if (workCondition === 'informal') {
      drawText('X', econCircleX_Informal, econY2, { fontSize: 10, font: boldFont });
    }
    
    // --- Fila 3: Ingreso Mensual ---
    const econY3 = height - 535;
    drawText(formatFieldValue(data.head_of_family_economic.monthly_income, 'currency'), 490, econY3, { fontSize: 9, maxWidth: 100 });

    // ===== CÓNYUGE/CONVIVIENTE (si existe) =====
    // Estructura igual a Jefe de Familia:
    // COLUMNA IZQUIERDA (Información Personal):
    //   Fila 1: Nombre(s) | Apellido Paterno | Apellido Materno
    //   Fila 2: N° DNI | Fecha de Nacimiento | Estado Civil
    //   Fila 3: Grado de Instrucción | Ocupación
    //   Fila 4: Discapacidad (texto + círculos)
    // COLUMNA DERECHA (Información Económica):
    //   Fila 1: Situación Laboral (Dependiente/Independiente)
    //   Fila 2: Condición (Formal/Informal)
    //   Fila 3: Ingreso Mensual (s/)
    
    if (data.spouse) {
      // *** COORDENADAS BASE PARA CÓNYUGE - AJUSTAR AQUÍ ***
      // La sección cónyuge está debajo de Jefe de Familia
      // Jefe de Familia empieza en height - 475, así que cónyuge debe empezar más abajo
      const spouseBaseY = height - 600; // Posición Y base de la sección cónyuge
      
      // --- FILA 1: Nombre(s), Apellido Paterno, Apellido Materno ---
      const spouseY1 = spouseBaseY;
      drawText(data.spouse.first_name, 55, spouseY1, { maxWidth: 90, fontSize: 9 });
      drawText(data.spouse.paternal_surname, 180, spouseY1, { maxWidth: 90, fontSize: 9 });
      drawText(data.spouse.maternal_surname, 295, spouseY1, { maxWidth: 90, fontSize: 9 });
      
      // --- FILA 2: N° DNI, Fecha de Nacimiento, Estado Civil ---
      const spouseY2 = spouseBaseY - 25;
      drawText(data.spouse.dni, 55, spouseY2, { maxWidth: 75, fontSize: 9 });
      drawText(formatFieldValue(data.spouse.birth_date, 'date'), 175, spouseY2, { maxWidth: 80, fontSize: 9 });
      drawText(getLabelForEnum(data.spouse.civil_status, 'civil_status'), 325, spouseY2, { maxWidth: 80, fontSize: 9 });
      
      // --- FILA 3: Grado de Instrucción, Ocupación ---
      const spouseY3 = spouseBaseY - 50;
      drawText(getLabelForEnum(data.spouse.education_level, 'education'), 55, spouseY3, { maxWidth: 90, fontSize: 8 });
      if (data.spouse_economic) {
        drawText(data.spouse_economic.occupation, 180, spouseY3, { maxWidth: 120, fontSize: 8 });
      }
      
      // --- FILA 4: DISCAPACIDAD (independiente) ---
      const spouseDisabilityX = 345;
      const spouseDisabilityY = spouseBaseY - 40;
      const spouseDisabilityCircleY = spouseBaseY - 53;
      const spouseDisabilityCircleX_Perm = 300;
      const spouseDisabilityCircleX_Sev = 370;
      
      const spouseDisabilityType = data.spouse.disability_type?.toLowerCase() || 'ninguna';
      
      if (spouseDisabilityType === 'ninguna' || spouseDisabilityType === '') {
        drawText('Ninguna', spouseDisabilityX, spouseDisabilityY, { fontSize: 8, maxWidth: 50 });
      } else {
        const spouseDisabilityLabel = getLabelForEnum(spouseDisabilityType, 'disability');
        drawText(spouseDisabilityLabel, spouseDisabilityX, spouseDisabilityY, { fontSize: 8, maxWidth: 60 });
        
        if (data.spouse.disability_is_permanent) {
          drawText('X', spouseDisabilityCircleX_Perm, spouseDisabilityCircleY, { fontSize: 10, font: boldFont });
        }
        if (data.spouse.disability_is_severe) {
          drawText('X', spouseDisabilityCircleX_Sev, spouseDisabilityCircleY, { fontSize: 10, font: boldFont });
        }
      }
      
      // ===== INFORMACIÓN ECONÓMICA CÓNYUGE (columna derecha) =====
      // --- Fila 1: Situación Laboral ---
      const spouseEconY1 = spouseBaseY;
      const spouseEconCircleX_Dep = 429;
      const spouseEconCircleX_Indep = 507;
      
      if (data.spouse_economic) {
        const spouseEmployment = data.spouse_economic.employment_situation?.toLowerCase() || '';
        if (spouseEmployment === 'dependiente') {
          drawText('X', spouseEconCircleX_Dep, spouseEconY1, { fontSize: 10, font: boldFont });
        } else if (spouseEmployment === 'independiente') {
          drawText('X', spouseEconCircleX_Indep, spouseEconY1, { fontSize: 10, font: boldFont });
        }
        
        // --- Fila 2: Condición (Formal/Informal) ---
        const spouseEconY2 = spouseBaseY - 25;
        const spouseEconCircleX_Formal = 429;
        const spouseEconCircleX_Informal = 507;
        
        const spouseWorkCondition = (data.spouse_economic.work_condition || '').toLowerCase();
        if (spouseWorkCondition === 'formal') {
          drawText('X', spouseEconCircleX_Formal, spouseEconY2, { fontSize: 10, font: boldFont });
        } else if (spouseWorkCondition === 'informal') {
          drawText('X', spouseEconCircleX_Informal, spouseEconY2, { fontSize: 10, font: boldFont });
        }
        
        // --- Fila 3: Ingreso Mensual ---
        const spouseEconY3 = spouseBaseY - 50;
        drawText(formatFieldValue(data.spouse_economic.monthly_income, 'currency'), 490, spouseEconY3, { fontSize: 9, maxWidth: 100 });
      }
    }

    // ===== CARGA FAMILIAR (tabla) =====
    const tableConfig = FAMILY_DEPENDENTS_TABLE_CONFIG;
    let currentY = height - tableConfig.startY;
    const maxRows = Math.min(data.family_dependents.length, tableConfig.maxRowsPage1);

    for (let i = 0; i < maxRows; i++) {
      const dependent = data.family_dependents[i];
      const rowY = currentY - (i * tableConfig.rowHeight);
      
      // Nombre completo
      const fullName = `${dependent.first_name} ${dependent.paternal_surname} ${dependent.maternal_surname}`.trim();
      drawText(fullName, tableConfig.columns.fullName.x, rowY, { 
        fontSize: tableConfig.fontSize, 
        maxWidth: tableConfig.columns.fullName.maxWidth 
      });
      
      // DNI
      drawText(dependent.dni, tableConfig.columns.dni.x, rowY, { 
        fontSize: tableConfig.fontSize, 
        maxWidth: tableConfig.columns.dni.maxWidth 
      });
      
      // Fecha de nacimiento
      drawText(
        formatFieldValue(dependent.birth_date, 'date'), 
        tableConfig.columns.birthDate.x, 
        rowY, 
        { fontSize: tableConfig.fontSize, maxWidth: tableConfig.columns.birthDate.maxWidth }
      );
      
      // Vínculo familiar
      drawText(dependent.family_bond, tableConfig.columns.familyBond.x, rowY, { 
        fontSize: tableConfig.fontSize, 
        maxWidth: tableConfig.columns.familyBond.maxWidth 
      });
      
      // Sexo
      drawText(dependent.gender || '', tableConfig.columns.gender.x, rowY, { 
        fontSize: tableConfig.fontSize, 
        maxWidth: tableConfig.columns.gender.maxWidth 
      });
      
      // Educación (abreviado)
      const eduLabel = getLabelForEnum(dependent.education_level || '', 'education');
      drawText(eduLabel, tableConfig.columns.education.x, rowY, { 
        fontSize: 7, 
        maxWidth: tableConfig.columns.education.maxWidth 
      });
      
      // ===== DISCAPACIDAD (igual que Jefe de Familia y Cónyuge) =====
      // Estructura: Texto del tipo ARRIBA + círculos Permanente/Severa ABAJO
      const depDisabilityType = (dependent.disability_type || 'ninguna').toLowerCase();
      
      // Coordenadas para discapacidad en la tabla (usando config)
      // El texto del tipo va ARRIBA de los círculos (+ offset para subir en PDF)
      const depDisabilityTextX = tableConfig.columns.disabilityPermanent.x;
      const depDisabilityTextY = rowY + 10; // Subir 10 puntos para estar arriba de los círculos
      const depDisabilityCircleX_Perm = tableConfig.columns.disabilityPermanent.x;
      const depDisabilityCircleX_Sev = tableConfig.columns.disabilitySevere.x;
      const depDisabilityCircleY = rowY; // Los círculos en la línea base
      
      if (depDisabilityType === 'ninguna' || depDisabilityType === '') {
        // Sin discapacidad: no mostrar nada o mostrar vacío
        // drawText('Ninguna', depDisabilityTextX, depDisabilityTextY, { fontSize: 7, maxWidth: 40 });
      } else {
        // Con discapacidad: mostrar el tipo ARRIBA de los círculos
        const depDisabilityLabel = getLabelForEnum(depDisabilityType, 'disability');
        drawText(depDisabilityLabel, depDisabilityTextX, depDisabilityTextY, { fontSize: 6, maxWidth: 60 });
        
        // Marcar círculo Permanente si aplica (en la línea base)
        if (dependent.disability_is_permanent) {
          drawText('X', depDisabilityCircleX_Perm, depDisabilityCircleY, { fontSize: 8, font: boldFont });
        }
        // Marcar círculo Severa si aplica (en la línea base)
        if (dependent.disability_is_severe) {
          drawText('X', depDisabilityCircleX_Sev, depDisabilityCircleY, { fontSize: 8, font: boldFont });
        }
      }
    }
  }

  /**
   * Llena los campos de la página 2
   * - Información Adicional del Grupo Familiar (padres, abuelos, otros)
   * - Información de Contacto
   */
  private async fillPage2(
    page: PDFPage,
    data: ApplicationPDFData,
    font: PDFFont,
    boldFont: PDFFont
  ): Promise<void> {
    const { height } = page.getSize();
    const color = rgb(0, 0, 0);
    
    // Función helper para dibujar texto
    const drawText = (text: string, x: number, y: number, options?: { fontSize?: number; font?: PDFFont; maxWidth?: number }) => {
      const displayText = text || '';
      const fontSize = options?.fontSize || 9;
      const textFont = options?.font || font;
      
      page.drawText(displayText, {
        x,
        y: height - y,
        size: fontSize,
        font: textFont,
        color,
        maxWidth: options?.maxWidth
      });
    };
    
    // ==================== INFORMACIÓN ADICIONAL DEL GRUPO FAMILIAR ====================
    // Configuración de la tabla (basada en la imagen del formulario)
    const additionalTableConfig = {
      startY: 55, // Posición Y de la primera fila (desde arriba)
      rowHeight: 25,
      maxRows: 3, // Máximo 3 filas visibles en la tabla
      columns: {
        firstName: { x: 60, maxWidth: 90 },
        paternalSurname: { x: 195, maxWidth: 90 },
        maternalSurname: { x: 290, maxWidth: 90 },
        dni: { x: 400, maxWidth: 70 },
        familyBond: { x: 495, maxWidth: 60 }
      },
      fontSize: 8
    };
    
    // Llenar la tabla de miembros adicionales
    if (data.additional_family_members && data.additional_family_members.length > 0) {
      for (let i = 0; i < Math.min(data.additional_family_members.length, additionalTableConfig.maxRows); i++) {
        const member = data.additional_family_members[i];
        const rowY = additionalTableConfig.startY + (i * additionalTableConfig.rowHeight);
        
        // Nombre(s)
        drawText(member.first_name || '', additionalTableConfig.columns.firstName.x, rowY, {
          fontSize: additionalTableConfig.fontSize,
          maxWidth: additionalTableConfig.columns.firstName.maxWidth
        });
        
        // Apellido Paterno
        drawText(member.paternal_surname || '', additionalTableConfig.columns.paternalSurname.x, rowY, {
          fontSize: additionalTableConfig.fontSize,
          maxWidth: additionalTableConfig.columns.paternalSurname.maxWidth
        });
        
        // Apellido Materno
        drawText(member.maternal_surname || '', additionalTableConfig.columns.maternalSurname.x, rowY, {
          fontSize: additionalTableConfig.fontSize,
          maxWidth: additionalTableConfig.columns.maternalSurname.maxWidth
        });
        
        // N° de DNI/CE
        drawText(member.dni || '', additionalTableConfig.columns.dni.x, rowY, {
          fontSize: additionalTableConfig.fontSize,
          maxWidth: additionalTableConfig.columns.dni.maxWidth
        });
        
        // Vínculo
        const bondLabel = (member.family_bond || '').charAt(0).toUpperCase() + (member.family_bond || '').slice(1).toLowerCase();
        drawText(bondLabel, additionalTableConfig.columns.familyBond.x, rowY, {
          fontSize: additionalTableConfig.fontSize,
          maxWidth: additionalTableConfig.columns.familyBond.maxWidth
        });
      }
    }
    
    // ==================== INFORMACIÓN DE CONTACTO ====================
    // Posiciones para correo electrónico y teléfono (ajustar según diseño)
    const contactY = 146; // Posición Y desde arriba
    
    // Correo electrónico (del jefe de familia)
    if (data.head_of_family.email) {
      drawText(data.head_of_family.email, 150, contactY, { fontSize: 9 });
    }
    
    // Teléfono de contacto
    if (data.head_of_family.phone_number) {
      drawText(data.head_of_family.phone_number, 350, contactY, { fontSize: 9 });
    }
  }

  /**
   * Abre el PDF generado en una nueva pestaña
   */
  public openPDF(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Descarga el PDF generado
   */
  public downloadPDF(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Imprime el PDF directamente
   */
  public async printPDF(url: string): Promise<void> {
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  }

  /**
   * Limpia la caché del template
   */
  public clearCache(): void {
    this.cachedTemplate = null;
  }
}

// Exportar instancia singleton
export const pdfService = new PDFService();

// Exportar clase para testing
export { PDFService };

// Exportar función helper para uso directo
export async function generateApplicationPDF(application: TechoPropioApplication): Promise<PDFGenerationResult> {
  return pdfService.generatePDF(application);
}

export async function printApplicationPDF(application: TechoPropioApplication): Promise<void> {
  const result = await pdfService.generatePDF(application);
  if (result.success && result.url) {
    pdfService.openPDF(result.url);
  } else {
    throw new Error(result.error || 'Error al generar el PDF');
  }
}

export async function downloadApplicationPDF(application: TechoPropioApplication): Promise<void> {
  const result = await pdfService.generatePDF(application);
  if (result.success && result.blob && result.filename) {
    pdfService.downloadPDF(result.blob, result.filename);
  } else {
    throw new Error(result.error || 'Error al generar el PDF');
  }
}
