# 🎨 Configuración Visual del Módulo Techo Propio

Sistema de personalización visual que permite a cada usuario configurar la apariencia del módulo Techo Propio de forma independiente.

## 📋 Características

- ✅ **Personalización por Usuario**: Cada usuario tiene su propia configuración visual
- ✅ **Aislamiento Total**: Los cambios no afectan a otros usuarios
- ✅ **3 Colores Configurables**: Primario, Secundario y Acento
- ✅ **Logos Personalizables**: Ícono del sidebar y logo del header
- ✅ **Textos de Branding**: Título, descripción y mensaje de bienvenida
- ✅ **Vista Previa en Tiempo Real**: Ver cambios antes de guardar
- ✅ **Reset a Default**: Volver a la configuración por defecto fácilmente

## 🚀 Acceso Rápido

### Para Usuarios

1. Navega al módulo Techo Propio: `/techo-propio`
2. En el sidebar, haz clic en **⚙️ Configuración Visual**
3. O accede directamente a: `/techo-propio/configuracion`

### Configuraciones Disponibles

#### 🎨 **Colores**
- **Color Primario**: Color principal del módulo (ejemplo: #16A34A - Verde)
- **Color Secundario**: Color complementario (ejemplo: #2563EB - Azul)
- **Color de Acento**: Color de énfasis (ejemplo: #DC2626 - Rojo)

Los colores se aplican automáticamente a:
- Botones activos en el sidebar
- Gradientes de navegación
- Logo del módulo
- Elementos destacados

#### 🖼️ **Logos**
- **Ícono del Sidebar**: Emoji o texto corto (default: 🏠)
- **Logo del Header**: URL de imagen o emoji (opcional)

#### 📝 **Textos de Branding**
- **Título del Módulo**: Nombre que aparece en el sidebar (default: "Techo Propio")
- **Descripción**: Subtítulo descriptivo (default: "Gestión de Solicitudes")
- **Mensaje de Bienvenida**: Texto del dashboard (default: "Bienvenido al sistema")

## 💻 Uso Programático

### Hook Principal

```tsx
import { useTechoPropioConfig } from './config/hooks/useTechoPropioConfig';

function MyComponent() {
  const { config, loading, saveConfig, resetConfig, isCustomized } = useTechoPropioConfig();

  // Cambiar colores
  const handleChangeColors = async () => {
    await saveConfig({
      colors: {
        primary: '#16A34A',
        secondary: '#2563EB',
        accent: '#DC2626'
      }
    });
  };

  // Reset a default
  const handleReset = async () => {
    await resetConfig();
  };

  return (
    <div>
      {loading ? 'Cargando...' : `Color primario: ${config?.colors.primary}`}
    </div>
  );
}
```

### Context API

```tsx
import { useTechoPropioConfigContext } from './config/context/TechoPropioConfigContext';

function MyComponent() {
  const { config, saveConfig } = useTechoPropioConfigContext();

  return (
    <div style={{ color: config?.colors.primary }}>
      Contenido personalizado
    </div>
  );
}
```

### CSS Variables

El sistema aplica automáticamente CSS Variables que puedes usar directamente:

```css
/* Variables disponibles */
--tp-primary: /* Color primario del usuario */
--tp-secondary: /* Color secundario del usuario */
--tp-accent: /* Color de acento del usuario */
--tp-gradient: /* Gradiente primario → secundario */
```

**Ejemplo de uso:**

```tsx
<div
  style={{
    background: 'linear-gradient(to right, var(--tp-primary), var(--tp-secondary))'
  }}
>
  Contenido con gradiente personalizado
</div>
```

## 🏗️ Arquitectura

### Backend

```
backend/src/mi_app_completa_backend/
├── domain/entities/techo_propio_config.py          # Entidad del dominio
├── domain/repositories/techo_propio_config_repository.py  # Interfaz
├── application/dto/techo_propio_config_dto.py      # DTOs con validación
├── application/use_cases/techo_propio_config_use_cases.py  # Lógica de negocio
└── infrastructure/
    ├── persistence/mongodb/techo_propio_config_repository_impl.py  # Implementación MongoDB
    └── web/fastapi/techo_propio_config_routes.py   # API REST
```

### Frontend

```
frontend/src/modules/techo-propio/config/
├── types/config.types.ts                # Tipos TypeScript
├── utils/domApplier.ts                  # Aplicación de CSS Variables
├── services/techoPropioConfigService.ts # Cliente HTTP
├── hooks/useTechoPropioConfig.ts        # Hook principal
├── context/TechoPropioConfigContext.tsx # Context Provider
└── components/TechoPropioConfigPanel.tsx # UI de configuración
```

## 🔒 Seguridad

- **Aislamiento por Usuario**: Cada usuario solo puede ver y modificar su propia configuración
- **Validación Backend**: Todos los datos se validan en el servidor
- **JWT Authentication**: El `user_id` siempre se extrae del token JWT, no del body
- **Índice Único**: MongoDB garantiza 1 configuración por usuario

## 📡 API Endpoints

### `GET /api/techo-propio/config`
Obtiene la configuración del usuario actual.

**Response:**
```json
{
  "id": "67abc123...",
  "user_id": "user_abc123",
  "colors": {
    "primary": "#16A34A",
    "secondary": "#2563EB",
    "accent": "#DC2626"
  },
  "logos": {
    "sidebar_icon": "🏠",
    "header_logo": null
  },
  "branding": {
    "module_title": "Techo Propio",
    "module_description": "Gestión de Solicitudes",
    "dashboard_welcome": "Bienvenido al sistema"
  }
}
```

### `POST /api/techo-propio/config`
Guarda/actualiza la configuración del usuario actual.

**Request Body:**
```json
{
  "colors": {
    "primary": "#16A34A",
    "secondary": "#2563EB",
    "accent": "#DC2626"
  },
  "logos": {
    "sidebar_icon": "🏠"
  },
  "branding": {
    "module_title": "Mi Techo Propio"
  }
}
```

### `DELETE /api/techo-propio/config`
Elimina la configuración (reset a default).

### `GET /api/techo-propio/config/exists`
Verifica si el usuario tiene configuración personalizada.

**Response:**
```json
{
  "exists": true
}
```

### `GET /api/techo-propio/config/default`
Obtiene la configuración por defecto (sin autenticación).

## 🧪 Testing

### Probar la funcionalidad

1. **Inicia sesión** con diferentes usuarios
2. **Navega a** `/techo-propio/configuracion`
3. **Cambia colores**, logos o textos
4. **Guarda los cambios**
5. **Verifica** que se aplican al sidebar y navegación
6. **Inicia sesión con otro usuario** y verifica que ve su propia configuración

### Testing Programático

```typescript
// Verificar que se aplican las CSS Variables
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue('--tp-primary')
  .trim();

console.log('Color primario:', primary); // #16A34A
```

## 🐛 Troubleshooting

### Los colores no se aplican

1. Verifica que `TechoPropioConfigProvider` envuelve el layout
2. Revisa la consola del navegador para errores
3. Comprueba que el backend está respondiendo correctamente

### Error "context not found"

Asegúrate de que estás usando el hook dentro del `TechoPropioConfigProvider`:

```tsx
<TechoPropioConfigProvider>
  <TuComponente />
</TechoPropioConfigProvider>
```

### Los cambios no persisten

1. Verifica que el token JWT es válido
2. Comprueba la conexión con MongoDB
3. Revisa los logs del backend

## 📚 Recursos Adicionales

- **Diagnóstico Completo**: Ver `DIAGNOSTICO_CONFIG_TECHO_PROPIO.md` en la raíz del proyecto
- **Plan de Implementación**: Ver `IMPLEMENTACION_CONFIG_TP.md`
- **Resumen Visual**: Ver `RESUMEN_VISUAL_CONFIG_TP.md`

## 🎯 Próximas Mejoras (V2.0)

- [ ] Más opciones de colores (hover, focus, disabled)
- [ ] Configuración de íconos de navegación
- [ ] Galería de plantillas predefinidas
- [ ] Historial de cambios
- [ ] Modo oscuro personalizado
- [ ] Importar/exportar configuración (JSON)

---

**Desarrollado con** ❤️ **siguiendo el diagnóstico y plan de implementación V1.0**
