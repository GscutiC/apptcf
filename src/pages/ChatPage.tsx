/**
 * Página del Chat con IA
 * Ruta: /chat
 */

import React from 'react';
import AIChat from '../components/AIChat';

export const ChatPage: React.FC = () => {
  return (
    <div className="h-full">
      <AIChat />
    </div>
  );
};

export default ChatPage;