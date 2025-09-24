import React, { useState, useEffect } from 'react';
import { apiService, WelcomeResponse, MessageResponse } from '../services/apiService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  processed_by?: string;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      setConnectionStatus('connecting');

      // Verificar conexión con el backend
      await apiService.checkHealth();

      // Obtener mensaje de bienvenida
      const welcomeResponse: WelcomeResponse = await apiService.getWelcomeMessage();

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: welcomeResponse.message,
        isUser: false,
        timestamp: new Date(),
        processed_by: 'AI'
      };

      setMessages([welcomeMessage]);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Error initializing chat:', err);
      setConnectionStatus('error');
      setError('No se pudo conectar con el servicio de IA. Verifica que el backend esté ejecutándose.');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response: MessageResponse = await apiService.sendMessage(inputMessage.trim());

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date(),
        processed_by: response.processed_by
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error enviando mensaje. Inténtalo de nuevo.');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor, inténtalo de nuevo.',
        isUser: false,
        timestamp: new Date(),
        processed_by: 'Error Handler'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Conectando con IA</h3>
          <p className="text-gray-600">Inicializando servicio de chat...</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #fef2f2, #fce7f3)' }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error de Conexión</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={initializeChat}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🤖</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Asistente IA</h1>
                  <p className="text-sm text-gray-500">Chat con inteligencia artificial</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Conectado</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white shadow-lg h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{formatTime(message.timestamp)}</span>
                    {message.processed_by && !message.isUser && (
                      <span>• {message.processed_by}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">IA está escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white rounded-b-2xl shadow-lg p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Enviar</span>
                <span className="text-xl">📤</span>
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Presiona Enter para enviar • La IA puede tardar unos segundos en responder
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;