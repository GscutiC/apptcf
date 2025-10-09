# 🚀 Guía Rápida de Integración - Módulo Techo Propio

## ✅ Pre-requisitos

Antes de integrar el módulo, asegúrate de tener:

1. ✅ Backend corriendo en `http://localhost:8000`
2. ✅ MongoDB corriendo en `localhost:27017`
3. ✅ Clerk configurado en tu aplicación React
4. ✅ React Router Dom instalado
5. ✅ Tailwind CSS configurado

## 📦 Paso 1: Verificar Instalación del Módulo

El módulo ya está creado en:
```
frontend/src/modules/techo-propio/
```

Todos los archivos necesarios están implementados (40+ archivos).

## 🔌 Paso 2: Agregar la Ruta Principal

Abre el archivo donde configures las rutas principales de tu aplicación:

```tsx
// App.tsx o tu archivo de rutas principal
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TechoPropio } from './modules/techo-propio';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Módulo Techo Propio */}
        <Route path="/techo-propio/*" element={<TechoPropio />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 🔑 Paso 3: Configurar Acceso de Usuarios en Clerk

### Desde el Dashboard de Clerk:

1. Ir a https://dashboard.clerk.com
2. Seleccionar tu aplicación
3. Ir a **Users** > Seleccionar usuario
4. **Metadata** > **Public Metadata**
5. Agregar:

```json
{
  "techoPropio": true
}
```

## 🎨 Paso 4: Agregar Link de Navegación (Opcional)

```tsx
import { Link } from 'react-router-dom';
import { useModuleAccess } from './modules/techo-propio';

function Navbar() {
  const hasAccess = useModuleAccess();

  return hasAccess && (
    <Link to="/techo-propio">🏠 Techo Propio</Link>
  );
}
```

## 🌐 Paso 5: Variables de Entorno

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## ✅ Paso 6: Probar la Integración

1. Iniciar backend: `cd backend && python start_server.py`
2. Iniciar frontend: `cd frontend && npm start`
3. Abrir: `http://localhost:3000/techo-propio`

## 🎯 Rutas Disponibles

- `/techo-propio/` - Dashboard
- `/techo-propio/solicitudes` - Lista
- `/techo-propio/ver/:id` - Detalle
- `/techo-propio/nueva` - Wizard creación
- `/techo-propio/editar/:id` - Wizard edición

¡Listo! El módulo está completamente integrado. 🎉
