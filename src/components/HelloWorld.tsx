import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface HealthStatus {
  status: string;
  service: string;
  timestamp?: string;
}

interface HelloWorldResponse {
  message: string;
  status: string;
  timestamp: string;
  backend: string;
  version: string;
}

const HelloWorld: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [helloMessage, setHelloMessage] = useState<HelloWorldResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar salud del backend
      const health = await apiService.checkHealth();
      setHealthStatus({
        ...health,
        timestamp: new Date().toLocaleTimeString()
      });

      // Obtener mensaje Hello World
      const hello = await apiService.getHelloWorld();
      setHelloMessage(hello);
    } catch (err) {
      const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
      setError(`No se pudo conectar con el backend. Asegúrate de que esté ejecutándose en ${apiUrl}`);
      console.error('Backend connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConnection = () => {
    checkBackendConnection();
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '32px',
    maxWidth: '600px',
    width: '100%',
    color: '#374151'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#6b7280',
    fontSize: '16px'
  };

  const successBoxStyle: React.CSSProperties = {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px'
  };

  const errorBoxStyle: React.CSSProperties = {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px'
  };

  const buttonStyle: React.CSSProperties = {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    width: '100%',
    marginTop: '16px'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    fontSize: '14px',
    color: '#6b7280'
  };

  const footerStyle: React.CSSProperties = {
    marginTop: '32px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px'
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Conectando con el backend...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>🚀 Backend ↔ Frontend</h1>
          <p style={subtitleStyle}>Prueba de sincronización React + FastAPI</p>
        </div>

        {error ? (
          <div style={errorBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', marginRight: '12px' }}>❌</span>
              <div>
                <h3 style={{ color: '#dc2626', fontWeight: '600', margin: '0 0 4px 0' }}>Error de Conexión</h3>
                <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
              </div>
            </div>
            <button
              onClick={refreshConnection}
              style={{
                ...buttonStyle,
                background: '#dc2626',
                width: 'auto'
              }}
            >
              Reintentar Conexión
            </button>
          </div>
        ) : (
          <div>
            {/* Hello World Message */}
            {helloMessage && (
              <div style={successBoxStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>✅</span>
                  <h3 style={{ color: '#15803d', fontWeight: '600', margin: 0 }}>Mensaje del Backend</h3>
                </div>
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #bbf7d0'
                }}>
                  <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px', color: '#1f2937' }}>
                    {helloMessage.message}
                  </p>
                  <div style={gridStyle}>
                    <div><strong>Backend:</strong> {helloMessage.backend}</div>
                    <div><strong>Versión:</strong> {helloMessage.version}</div>
                    <div><strong>Estado:</strong> <span style={{ color: '#15803d', fontWeight: '500' }}>{helloMessage.status}</span></div>
                    <div><strong>Timestamp:</strong> {helloMessage.timestamp}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Health Status */}
            {healthStatus && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>💓</span>
                  <h3 style={{ color: '#1d4ed8', fontWeight: '600', margin: 0 }}>Estado del Sistema</h3>
                </div>
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={gridStyle}>
                    <div><strong>Servicio:</strong> {healthStatus.service}</div>
                    <div><strong>Estado:</strong> <span style={{ color: '#15803d', fontWeight: '500' }}>{healthStatus.status}</span></div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Última verificación:</strong> {healthStatus.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button onClick={refreshConnection} style={buttonStyle}>
              🔄 Refrescar Conexión
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={footerStyle}>
          <p>
            Frontend: React + TypeScript<br/>
            Backend: FastAPI + Python
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HelloWorld;