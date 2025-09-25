/**
 * Página del Perfil de Usuario
 * Ruta: /profile
 */

import React from 'react';
import UserProfile from '../components/UserProfile';

export const ProfilePage: React.FC = () => {
  return (
    <div className="h-full">
      <UserProfile />
    </div>
  );
};

export default ProfilePage;