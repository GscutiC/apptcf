# 🎨 Migración a CSS Variables Personalizadas - Módulo Techo Propio

## ✅ Resumen de Cambios Implementados

Este documento describe todos los cambios realizados para migrar el módulo Techo Propio desde colores hardcodeados (verde/azul) a un sistema de CSS Variables personalizables por usuario.

---

## 📋 Componentes Actualizados

### 1. **TechoPropioHeader.tsx** ✅
**Ubicación:** `components/layout/TechoPropioHeader.tsx`

**Cambios realizados:**
- ✅ Botón "Nueva Solicitud" ahora usa gradiente personalizado
- ✅ Breadcrumbs hover usa `--tp-primary`
- ✅ Input de búsqueda usa focus ring personalizado

**Antes:**
```tsx
className="bg-gradient-to-r from-green-500 to-blue-600"
className="hover:text-green-600"
className="focus:ring-green-500"
```

**Después:**
```tsx
style={{
  background: 'linear-gradient(to right, var(--tp-primary), var(--tp-secondary))'
}}
onMouseEnter={(e) => e.currentTarget.style.color = 'var(--tp-primary)'}
onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px var(--tp-primary)`}
```

---

### 2. **Button.tsx** ✅
**Ubicación:** `components/common/Button.tsx`

**Cambios realizados:**
- ✅ Variant `primary` usa gradiente `--tp-primary` → `--tp-secondary`
- ✅ Variant `success` usa `--tp-primary`
- ✅ Variant `danger` usa `--tp-accent`
- ✅ Añadido estado hover con `useState`

**Ejemplo de uso:**
```tsx
<Button variant="primary">Guardar</Button> // Usa gradiente personalizado
<Button variant="success">Aprobar</Button> // Usa color primario
<Button variant="danger">Rechazar</Button>  // Usa color de acento
```

**Implementación:**
```tsx
case 'primary':
  return {
    background: 'linear-gradient(to right, var(--tp-primary), var(--tp-secondary))',
    color: 'white'
  };
case 'success':
  return {
    backgroundColor: 'var(--tp-primary)',
    color: 'white'
  };
```

---

### 3. **ApplicationCard.tsx** ✅
**Ubicación:** `components/application/ApplicationCard.tsx`

**Cambios realizados:**
- ✅ Botones de acción usan colores personalizados:
  - Enviar (submit) → `--tp-primary`
  - Editar (edit) → `--tp-secondary`
  - Eliminar (delete) → `--tp-accent`
- ✅ Spinner de carga usa `--tp-primary`
- ✅ Hover states con opacity transparente

**Antes:**
```tsx
className="text-green-600 hover:bg-green-50"
className="text-blue-600 hover:bg-blue-50"
className="border-b-2 border-blue-600"
```

**Después:**
```tsx
style={{ color: 'var(--tp-primary)' }}
onMouseEnter={(e) => {
  e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.1)';
}}
```

---

### 4. **Dashboard.tsx** ✅
**Ubicación:** `pages/Dashboard.tsx`

**Cambios realizados:**
- ✅ Spinner de carga usa `--tp-primary`
- ✅ Botones de acceso rápido:
  - "Nueva Solicitud" → `--tp-secondary` (azul)
  - "Ver Todas" → `--tp-primary` (verde)
- ✅ Cards hover de solicitudes recientes/prioritarias
- ✅ Badge "Alta prioridad" usa `--tp-accent`
- ✅ Modals de confirmación:
  - Aprobar → texto con `--tp-primary`
  - Rechazar → texto con `--tp-accent`, focus ring personalizado
  - Solicitar info → focus ring con `--tp-secondary`

**Elementos específicos actualizados:**
- Loading spinner (línea 95-98)
- Botón "Nueva Solicitud" (línea 229-252)
- Botón "Ver Todas" (línea 254-277)
- Cards de solicitudes recientes (línea 151-186)
- Cards de solicitudes prioritarias (línea 208-248)
- Badge contador de solicitudes (línea 356-364)
- Modal de aprobación (línea 425-427)
- Modal de rechazo (línea 443-459)
- Modal de solicitar info (línea 475-487)

---

### 5. **TechoPropioSidebar.tsx** ✅ (Ya estaba actualizado)
**Ubicación:** `components/layout/TechoPropioSidebar.tsx`

**Características:**
- ✅ Items activos con gradiente personalizado
- ✅ Logo con gradiente personalizado
- ✅ Badges usan colores personalizados

---

## 🛠️ Utilidades Creadas

### **colorHelpers.ts** ✅
**Ubicación:** `config/utils/colorHelpers.ts`

**Funciones disponibles:**

#### 1. `getTPColor(colorKey)`
Obtiene el valor hexadecimal de un color del DOM.

```tsx
import { getTPColor } from '../config/utils/colorHelpers';

const primaryColor = getTPColor('primary');   // '#16a34a'
const secondaryColor = getTPColor('secondary'); // '#2563eb'
const accentColor = getTPColor('accent');       // '#dc2626'
```

#### 2. `getTPGradient(direction)`
Genera un objeto de estilo con gradiente personalizado.

```tsx
import { getTPGradient } from '../config/utils/colorHelpers';

<div style={getTPGradient('to right')}>
  Contenido con gradiente
</div>
```

#### 3. `getTPBackground(colorKey, opacity)`
Genera un objeto de estilo con color de fondo.

```tsx
import { getTPBackground } from '../config/utils/colorHelpers';

<div style={getTPBackground('primary', 0.1)}>
  Fondo con 10% de opacidad
</div>
```

#### 4. `getTPTextColor(colorKey)`
Genera un objeto de estilo con color de texto.

```tsx
import { getTPTextColor } from '../config/utils/colorHelpers';

<p style={getTPTextColor('primary')}>
  Texto en color primario
</p>
```

#### 5. `tpStyles` - Estilos predefinidos
Objeto con patrones comunes reutilizables.

```tsx
import { tpStyles } from '../config/utils/colorHelpers';

// Botón activo
<button {...tpStyles.btnPrimary(isActive)}>
  Click aquí
</button>

// Badge de éxito
<span {...tpStyles.badgeSuccess()}>
  Aprobado
</span>

// Card con borde
<div {...tpStyles.cardBorder()}>
  Contenido
</div>
```

---

## 📚 Guía de Uso para Desarrolladores

### ¿Cuándo usar cada enfoque?

#### 1. **Uso directo de CSS Variables** (Recomendado para casos simples)
```tsx
// Para colores estáticos
<div style={{ color: 'var(--tp-primary, #16a34a)' }}>
  Texto en color primario
</div>

// Para gradientes
<div style={{
  background: 'linear-gradient(to right, var(--tp-primary), var(--tp-secondary))'
}}>
  Fondo con gradiente
</div>
```

#### 2. **Helpers de colorHelpers.ts** (Para lógica compleja)
```tsx
import { getTPColor, getTPGradient } from '../config/utils/colorHelpers';

// Cuando necesitas el valor en JavaScript
const handleClick = () => {
  const primaryColor = getTPColor('primary');
  console.log('Color actual:', primaryColor);
};

// Para estilos dinámicos
<div style={getTPGradient('to bottom')}>
  Gradiente vertical
</div>
```

#### 3. **Eventos hover personalizados** (Para interactividad)
```tsx
<button
  style={{ color: 'var(--tp-primary)' }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  }}
>
  Hover me
</button>
```

---

## 🎯 CSS Variables Disponibles

Las siguientes variables están siempre disponibles en el DOM:

```css
--tp-primary: #16a34a      /* Color primario (verde por defecto) */
--tp-secondary: #2563eb    /* Color secundario (azul por defecto) */
--tp-accent: #dc2626       /* Color de acento (rojo por defecto) */
--tp-gradient: linear-gradient(...) /* Gradiente primary → secondary */
```

**Valores por defecto:**
- Se aplican automáticamente si el usuario no tiene configuración personalizada
- Siempre incluir fallback: `var(--tp-primary, #16a34a)`

---

## 🚀 Mejores Prácticas

### ✅ DO (Hacer)

```tsx
// ✅ Usar CSS Variables con fallback
style={{ color: 'var(--tp-primary, #16a34a)' }}

// ✅ Usar helpers para lógica compleja
const color = getTPColor('primary');

// ✅ Hover states personalizados
onMouseEnter={(e) => e.currentTarget.style.color = 'var(--tp-primary)'}

// ✅ Gradientes personalizados
style={{ background: 'linear-gradient(to right, var(--tp-primary), var(--tp-secondary))' }}
```

### ❌ DON'T (Evitar)

```tsx
// ❌ NO hardcodear colores
className="text-green-600"
className="bg-blue-500"
className="border-red-500"

// ❌ NO usar Tailwind para colores del módulo
className="hover:bg-green-50"
className="focus:ring-blue-500"

// ❌ NO olvidar el fallback
style={{ color: 'var(--tp-primary)' }} // ⚠️ Falta fallback
```

---

## 🔍 Componentes Pendientes (Opcional)

Estos componentes NO fueron actualizados en este sprint, pero podrían beneficiarse de CSS Variables:

### 1. StatusBadge.tsx
- Colores de estados hardcodeados (verde, amarillo, rojo, etc.)
- **Recomendación:** Mantener colores actuales por consistencia de estados

### 2. Formularios de Nueva Solicitud
- `AddMemberModal.tsx` - Tabs activos
- `HouseholdForm.tsx` - Displays de ingreso
- `PropertyForm.tsx` - Mensajes de validación
- **Recomendación:** Actualizar cuando se trabaje en esos componentes

### 3. Convocatorias
- `ConvocationManagement.tsx` - Varios botones y badges
- **Recomendación:** Actualizar en próximo sprint si es necesario

---

## 📦 Resumen de Archivos Modificados

```
frontend/src/modules/techo-propio/
├── components/
│   ├── layout/
│   │   ├── TechoPropioHeader.tsx          ✅ Actualizado
│   │   └── TechoPropioSidebar.tsx         ✅ Ya estaba actualizado
│   ├── common/
│   │   └── Button.tsx                     ✅ Actualizado
│   └── application/
│       └── ApplicationCard.tsx            ✅ Actualizado
├── pages/
│   └── Dashboard.tsx                      ✅ Actualizado
└── config/
    ├── utils/
    │   └── colorHelpers.ts                ✅ NUEVO - Utilidades
    └── MIGRACION_CSS_VARIABLES.md         ✅ NUEVO - Este documento
```

---

## 🧪 Cómo Probar

1. **Navegar al módulo:**
   ```
   http://localhost:3000/techo-propio
   ```

2. **Cambiar configuración:**
   - Ir a `/techo-propio/configuracion`
   - Cambiar colores primario, secundario y acento
   - Guardar cambios

3. **Verificar aplicación:**
   - ✅ Sidebar: Items activos y logo
   - ✅ Header: Botón "Nueva Solicitud" y breadcrumbs hover
   - ✅ Dashboard: Botones de acceso rápido y cards hover
   - ✅ Botones: Variants primary, success, danger
   - ✅ ApplicationCard: Botones de acción y spinner
   - ✅ Modals: Textos de confirmación y focus rings

4. **Verificar en DevTools:**
   ```javascript
   // Consola del navegador
   getComputedStyle(document.documentElement).getPropertyValue('--tp-primary')
   // Debe retornar el color configurado
   ```

---

## 🎓 Documentación Relacionada

- **README Principal:** `frontend/src/modules/techo-propio/config/README.md`
- **Diagnóstico:** `DIAGNOSTICO_CONFIG_TECHO_PROPIO.md` (raíz del proyecto)
- **Plan de Implementación:** `IMPLEMENTACION_CONFIG_TP.md` (raíz del proyecto)

---

## 💡 Tips para Futuros Desarrollos

### Añadir un nuevo componente con colores personalizados:

```tsx
import React from 'react';

export const MiComponente: React.FC = () => {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        borderColor: 'var(--tp-primary, #16a34a)',
        backgroundColor: 'rgba(22, 163, 74, 0.05)'
      }}
    >
      <h3 style={{ color: 'var(--tp-primary, #16a34a)' }}>
        Título personalizado
      </h3>

      <button
        className="px-4 py-2 rounded-lg text-white"
        style={{
          background: 'linear-gradient(to right, var(--tp-primary), var(--tp-secondary))'
        }}
      >
        Acción
      </button>
    </div>
  );
};
```

### Usar helpers para lógica compleja:

```tsx
import { getTPColor, tpStyles } from '../config/utils/colorHelpers';

export const ComponenteComplejo: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div>
      {/* Uso de helper de estilos */}
      <button {...tpStyles.btnPrimary(isActive)}>
        Toggle
      </button>

      {/* Uso de función getTPColor */}
      <div style={{ borderLeft: `4px solid ${getTPColor('primary')}` }}>
        Con borde personalizado
      </div>
    </div>
  );
};
```

---

**Desarrollado con** ❤️ **siguiendo el diagnóstico y plan de implementación V1.0**

✅ **Sprint completado:** Migración de colores hardcodeados a CSS Variables personalizables
🎯 **Próximos pasos:** Actualizar formularios y componentes adicionales según necesidad
