/**
 * Página de Login con configuración dinámica
 * Funciona para usuarios no autenticados obteniendo configuración pública
 */

import React, { useEffect, useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { InterfaceConfig } from '../modules/interface-config/types';
import { logger } from '../shared/utils/logger';

// Componente para logo con imagen real en página de login
interface LoginLogoWithImageProps {
  config: InterfaceConfig | null;
  appInitials: string;
  primaryColor: string;
  borderRadius: any;
}

const LoginLogoWithImage: React.FC<LoginLogoWithImageProps> = ({ 
  config, 
  appInitials, 
  primaryColor, 
  borderRadius 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Obtener configuración de logo
  const logoConfig = config?.logos?.mainLogo;
  const shouldShowImage = logoConfig?.showImage && logoConfig?.imageUrl;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  // Si debe mostrar imagen y no hay error, intentar cargar imagen
  if (shouldShowImage && !imageError) {
    return (
      <div className="w-16 h-16 mx-auto mb-6 relative">
        {imageLoading && (
          <div 
            className="w-16 h-16 flex items-center justify-center animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
              borderRadius: borderRadius?.full || '50%'
            }}
          >
            <span className="text-white text-xs">...</span>
          </div>
        )}
        <img 
          src={logoConfig.imageUrl}
          alt="Logo" 
          className={`w-16 h-16 object-cover shadow-lg ${imageLoading ? 'hidden' : 'block'}`}
          style={{
            borderRadius: borderRadius?.full || '50%'
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  // Fallback: mostrar iniciales
  return (
    <div 
      className="w-16 h-16 flex items-center justify-center mx-auto mb-6"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
        borderRadius: borderRadius?.full || '50%'
      }}
    >
      <span className="text-white font-bold text-xl">
        {appInitials}
      </span>
    </div>
  );
};

interface LoginPageProps {}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const [config, setConfig] = useState<InterfaceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicConfig();
  }, []);

  const loadPublicConfig = async () => {
    try {
      setLoading(true);
      
      // Intentar obtener configuración pública/segura sin autenticación
      const response = await fetch('http://localhost:8000/api/interface-config/current/safe');
      
      if (response.ok) {
        const configData = await response.json();
        setConfig(configData);
        
        logger.info('✅ Configuración pública cargada para login:', configData.branding?.appName);
        
        // Aplicar branding básico al documento inmediatamente
        if (configData.branding?.appName) {
          document.title = configData.branding.appName;
        }
      } else {
        logger.warn('⚠️ No se pudo obtener configuración pública, usando valores por defecto');
        useDefaultConfig();
      }
    } catch (error) {
      logger.error('❌ Error cargando configuración pública:', error);
      useDefaultConfig();
    } finally {
      setLoading(false);
    }
  };

  const useDefaultConfig = () => {
    // Configuración por defecto completa que cumple con los tipos
    setConfig({
      id: 'default',
      isActive: true,
      branding: {
        appName: 'ScutiTec',
        appDescription: 'Soluciones empresariales sostenibles',
        welcomeMessage: '¡Bienvenido!',
        loginPageTitle: '¡Bienvenido!',
        loginPageDescription: 'Inicia sesión o regístrate para acceder a todas las funcionalidades de la aplicación.',
        tagline: 'Accede a tu cuenta'
      },
      logos: {
        mainLogo: {
          imageUrl: '',
          fileId: '',
          text: 'ScutiTec',
          showText: true,
          showImage: false
        },
        favicon: {
          imageUrl: '',
          fileId: ''
        },
        sidebarLogo: {
          imageUrl: '',
          fileId: '',
          text: 'ST',
          showText: true,
          showImage: false,
          collapsedText: 'ST'
        }
      },
      theme: {
        name: 'Tema Verde Corporativo',
        mode: 'light',
        colors: {
          primary: {
            '50': '#ECFDF5',
            '100': '#D1FAE5',
            '200': '#A7F3D0',
            '300': '#6EE7B7',
            '400': '#34D399',
            '500': '#10B981',
            '600': '#059669',
            '700': '#047857',
            '800': '#065F46',
            '900': '#064E3B'
          },
          secondary: {
            '50': '#F8FAFC',
            '100': '#F1F5F9',
            '200': '#E2E8F0',
            '300': '#CBD5E1',
            '400': '#94A3B8',
            '500': '#64748B',
            '600': '#475569',
            '700': '#334155',
            '800': '#1E293B',
            '900': '#0F172A'
          },
          accent: {
            '50': '#FEF7FF',
            '100': '#FCEEFF',
            '200': '#F8D4FE',
            '300': '#F3B1FC',
            '400': '#E879F9',
            '500': '#D946EF',
            '600': '#C026D3',
            '700': '#A21CAF',
            '800': '#86198F',
            '900': '#701A75'
          },
          neutral: {
            '50': '#FAFAFA',
            '100': '#F4F4F5',
            '200': '#E4E4E7',
            '300': '#D4D4D8',
            '400': '#A1A1AA',
            '500': '#71717A',
            '600': '#52525B',
            '700': '#3F3F46',
            '800': '#27272A',
            '900': '#18181B'
          }
        },
        layout: {
          borderRadius: {
            sm: '0.125rem',
            base: '0.25rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
            '2xl': '1rem',
            full: '9999px'
          },
          spacing: {
            xs: '0.5rem',
            sm: '0.75rem',
            base: '1rem',
            md: '1.5rem',
            lg: '2rem',
            xl: '3rem',
            '2xl': '4rem'
          },
          shadows: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        },
        typography: {
          fontFamily: {
            primary: 'system-ui, -apple-system, sans-serif',
            secondary: 'Georgia, serif',
            mono: 'Menlo, Monaco, monospace'
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem'
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Extraer configuración
  const appName = config?.branding?.appName || 'Mi Aplicación';
  const loginTitle = config?.branding?.loginPageTitle || '¡Bienvenido!';
  const loginDescription = config?.branding?.loginPageDescription || 'Inicia sesión o regístrate para acceder a todas las funcionalidades de la aplicación.';
  const primaryColor = config?.theme?.colors?.primary?.['500'] || '#3B82F6';
  const borderRadius = config?.theme?.layout?.borderRadius;

  // Crear iniciales dinámicas del app name
  const getAppInitials = (name: string): string => {
    const words = name.split(' ').filter(word => word.length > 0);
    
    if (words.length >= 2) {
      return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    } else if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return 'AP';
  };

  const appInitials = getAppInitials(appName);

  return (
    <div className="App">
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom right, ${primaryColor}10, ${primaryColor}05)`
        }}
      >
        <div className="max-w-md w-full mx-4">
          <div 
            className="bg-white shadow-xl p-8 text-center"
            style={{
              borderRadius: borderRadius?.['2xl'] || '1rem'
            }}
          >
            {/* Logo dinámico con imagen real */}
            <LoginLogoWithImage 
              config={config}
              appInitials={appInitials}
              primaryColor={primaryColor}
              borderRadius={borderRadius}
            />

            {/* Título dinámico */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {loginTitle}
            </h1>

            {/* Descripción dinámica */}
            <p className="text-gray-600 mb-8">
              {loginDescription}
            </p>

            {/* Botones con tema dinámico */}
            <div className="space-y-4">
              <SignInButton mode="modal">
                <button 
                  className="w-full py-3 px-6 text-white font-medium transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: primaryColor,
                    borderRadius: borderRadius?.lg || '0.5rem'
                  }}
                >
                  Iniciar Sesión
                </button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <button 
                  className="w-full py-3 px-6 font-medium transition-all duration-200 hover:bg-opacity-10"
                  style={{
                    border: `2px solid ${primaryColor}`,
                    color: primaryColor,
                    backgroundColor: 'transparent',
                    borderRadius: borderRadius?.lg || '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Crear Cuenta
                </button>
              </SignUpButton>
            </div>

            {/* Branding footer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {config?.branding?.appDescription || appName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;