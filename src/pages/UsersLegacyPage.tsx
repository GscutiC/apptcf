/**
 * Página de Usuarios Legacy (Sistema anterior)
 * Ruta: /users-legacy
 */

import React from 'react';
import UserManagement from '../components/UserManagement';

export const UsersLegacyPage: React.FC = () => {
  return (
    <div className="h-full">
      <UserManagement />
    </div>
  );
};

export default UsersLegacyPage;