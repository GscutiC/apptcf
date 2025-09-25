# 🛡️ Sistema de Rutas Protegidas

## Descripción General

El sistema de rutas protegidas proporciona control granular de acceso basado en:
- **Autenticación**: Usuario debe estar logueado
- **Roles**: admin, super_admin, moderator, user
- **Permisos**: users.read, roles.create, admin.dashboard, etc.

## Componentes Principales

### 1. ProtectedRoute
Componente wrapper que protege rutas completas.

```tsx
<ProtectedRoute 
  requireAuth={true}
  role="admin"
  permission="users.read"
  unauthorizedRedirect="/unauthorized"
>
  <MyComponent />
</ProtectedRoute>
```

### 2. useProtectedRoute Hook
Hook personalizado para verificar permisos en componentes.

```tsx
const { hasAccess, isAdmin, checkPermission } = useProtectedRoute({
  role: 'admin',
  permission: 'users.read'
});
```

### 3. Guards Individuales
- `AuthGuard`: Solo autenticación
- `RoleGuard`: Verificación de roles
- `PermissionGuard`: Verificación de permisos específicos

## Configuración de Rutas

### Rutas Básicas (Solo Autenticación)
```tsx
<Route path="/dashboard" element={
  <ProtectedRoute requireAuth={true}>
    <DashboardPage />
  </ProtectedRoute>
} />
```

### Rutas con Permisos Específicos
```tsx
<Route path="/users" element={
  <ProtectedRoute 
    requireAuth={true}
    permission="users.read"
    unauthorizedRedirect="/unauthorized"
  >
    <UsersPage />
  </ProtectedRoute>
} />
```

### Rutas de Administrador
```tsx
<Route path="/settings" element={
  <ProtectedRoute 
    requireAuth={true}
    role="admin"
    unauthorizedRedirect="/unauthorized"
  >
    <SettingsPage />
  </ProtectedRoute>
} />
```

### Rutas con Múltiples Opciones
```tsx
<Route path="/users-legacy" element={
  <ProtectedRoute 
    requireAuth={true}
    anyPermission={["users.read", "admin.dashboard"]}
    unauthorizedRedirect="/unauthorized"
  >
    <UsersLegacyPage />
  </ProtectedRoute>
} />
```

## Propiedades de ProtectedRoute

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `requireAuth` | boolean | Requiere autenticación |
| `role` | RoleName | Rol específico requerido |
| `anyRole` | RoleName[] | Cualquiera de estos roles |
| `permission` | Permission | Permiso específico requerido |
| `anyPermission` | Permission[] | Cualquiera de estos permisos |
| `allPermissions` | Permission[] | Todos estos permisos |
| `redirectTo` | string | Ruta de redirección por defecto |
| `unauthorizedRedirect` | string | Ruta cuando no autorizado |
| `fallback` | ReactNode | Componente de loading |
| `unauthorizedFallback` | ReactNode | Componente de no autorizado |

## Roles Disponibles

- `user`: Usuario básico
- `moderator`: Moderador con permisos intermedios
- `admin`: Administrador del sistema
- `super_admin`: Super administrador

## Permisos Disponibles

### Usuarios
- `users.create`, `users.read`, `users.update`, `users.delete`
- `users.list`, `users.assign_role`

### Roles
- `roles.create`, `roles.read`, `roles.update`, `roles.delete`
- `roles.list`, `roles.assign`

### Mensajes
- `messages.create`, `messages.read`, `messages.update`, `messages.delete`

### IA
- `ai.process_message`, `ai.access_advanced`

### Administración
- `admin.dashboard`, `admin.system_settings`

### Sistema
- `system.read`, `system.maintenance`

### Auditoría
- `audit.view_logs`

## Configuración Actual de Rutas

| Ruta | Protección | Descripción |
|------|------------|-------------|
| `/dashboard` | Solo auth | Panel principal |
| `/chat` | Solo auth | Chat con IA |
| `/profile` | Solo auth | Perfil personal |
| `/users` | `users.read` | Gestión moderna de usuarios |
| `/users-legacy` | `users.read` o `admin.dashboard` | Sistema anterior |
| `/roles` | `admin` o `super_admin` | Gestión de roles |
| `/settings` | `admin` | Configuración del sistema |
| `/unauthorized` | Público | Página de acceso denegado |

## Ejemplos de Uso

### En Componentes
```tsx
import { useProtectedRoute } from '../hooks/useProtectedRoute';

const MyComponent = () => {
  const { 
    hasAccess, 
    isAdmin, 
    checkPermission,
    canAccess 
  } = useProtectedRoute();

  if (!hasAccess) {
    return <div>Sin acceso</div>;
  }

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {checkPermission('users.read') && <UsersList />}
      {canAccess({ role: 'moderator' }) && <ModeratorTools />}
    </div>
  );
};
```

### Verificaciones Condicionales
```tsx
const { checkAnyPermission, checkAllPermissions } = useProtectedRoute();

// Mostrar si tiene al menos uno de estos permisos
{checkAnyPermission(['users.read', 'admin.dashboard']) && (
  <UserActions />
)}

// Mostrar si tiene todos estos permisos
{checkAllPermissions(['users.create', 'users.update']) && (
  <UserEditor />
)}
```

## Flujo de Error

1. **No autenticado**: Redirige a página de login
2. **Sin permisos**: Redirige a `/unauthorized`
3. **Error de carga**: Muestra spinner de carga
4. **Fallback personalizado**: Usa componente proporcionado

## Beneficios

- ✅ **Control granular** de acceso
- ✅ **Múltiples niveles** de protección
- ✅ **Fácil de usar** y mantener
- ✅ **Altamente configurable**
- ✅ **TypeScript** completo
- ✅ **Redirecciones inteligentes**
- ✅ **Fallbacks personalizables**