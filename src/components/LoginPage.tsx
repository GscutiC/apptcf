import React, { useState, useEffect, useMemo } from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { InterfaceConfig } from '../modules/interface-config/types';
import { ConfigCacheService } from '../modules/interface-config/services/configCacheService';

// URL base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// DEFAULT CONFIG - Definido fuera del componente para evitar re-creación
const DEFAULT_CONFIG: InterfaceConfig = {
  isActive: true,
  branding: {
    appName: 'SistemTec',
    appDescription: 'Sistema de Gestión Integral',
    loginPageTitle: '¡Bienvenido!',
    loginPageDescription: 'Inicia sesión o regístrate para acceder a todas las funcionalidades de la aplicación.',
    welcomeMessage: '¡Bienvenido a SistemTec!'
  },
  logos: {
    mainLogo: {
      text: 'SistemTec',
      showText: true,
      showImage: false
    },
    favicon: {},
    sidebarLogo: {
      text: 'SistemTec',
      showText: true,
      showImage: false,
      collapsedText: 'ST'
    }
  },
  theme: {
    mode: 'light' as const,
    name: 'Default',
    colors: {
      primary: {
        '50': '#EFF6FF',
        '100': '#DBEAFE',
        '200': '#BFDBFE',
        '300': '#93C5FD',
        '400': '#60A5FA',
        '500': '#3B82F6',
        '600': '#2563EB',
        '700': '#1D4ED8',
        '800': '#1E40AF',
        '900': '#1E3A8A',
        '950': '#172554'
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
        '900': '#0F172A',
        '950': '#020617'
      },
      accent: {
        '50': '#FDF4FF',
        '100': '#FAE8FF',
        '200': '#F5D0FE',
        '300': '#F0ABFC',
        '400': '#E879F9',
        '500': '#D946EF',
        '600': '#C026D3',
        '700': '#A21CAF',
        '800': '#86198F',
        '900': '#701A75',
        '950': '#4A044E'
      },
      neutral: {
        '50': '#FAFAFA',
        '100': '#F5F5F5',
        '200': '#E5E5E5',
        '300': '#D4D4D4',
        '400': '#A3A3A3',
        '500': '#737373',
        '600': '#525252',
        '700': '#404040',
        '800': '#262626',
        '900': '#171717',
        '950': '#0A0A0A'
      }
    },
    typography: {
      fontFamily: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'Fira Code, monospace'
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
        xs: '0.25rem',
        sm: '0.5rem',
        base: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        base: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
      }
    }
  }
};

// Componente de Logo separado y memoizado
const LoginLogoWithImage = React.memo(({ 
  config, 
  appInitials, 
  primaryColor, 
  borderRadius 
}: {
  config: InterfaceConfig | null;
  appInitials: string;
  primaryColor: string;
  borderRadius: any;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const logoUrl = config?.logos?.mainLogo?.imageUrl;
  const showImage = config?.logos?.mainLogo?.showImage && logoUrl;

  return (
    <div className="mb-8">
      {showImage && !imageError ? (
        <div className="relative w-24 h-24 mx-auto">
          {!imageLoaded && (
            <div 
              className="absolute inset-0 animate-pulse"
              style={{
                backgroundColor: 'var(--color-neutral-200, #E5E5E5)',
                borderRadius: borderRadius?.full || '9999px'
              }}
            />
          )}
          <img
            src={logoUrl}
            alt="Logo"
            className={`w-24 h-24 mx-auto object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              borderRadius: borderRadius?.full || '9999px'
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
          />
        </div>
      ) : (
        <div 
          className="w-24 h-24 mx-auto flex items-center justify-center text-white text-2xl font-bold"
          style={{
            backgroundColor: primaryColor,
            borderRadius: borderRadius?.full || '9999px'
          }}
        >
          {appInitials}
        </div>
      )}
    </div>
  );
});

LoginLogoWithImage.displayName = 'LoginLogoWithImage';

const LoginPage: React.FC = () => {
  const [config, setConfig] = useState<InterfaceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Valores extraídos con useMemo para evitar re-cálculos
  // IMPORTANTE: Debe estar ANTES de cualquier return condicional
  const configValues = useMemo(() => {
    const appName = config?.branding?.appName || 'Mi Aplicación';
    const loginTitle = config?.branding?.loginPageTitle || '¡Bienvenido!';
    const loginDescription = config?.branding?.loginPageDescription || 
      'Inicia sesión o regístrate para acceder a todas las funcionalidades de la aplicación.';
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
    const appDescription = config?.branding?.appDescription || appName;

    return {
      appName,
      loginTitle,
      loginDescription,
      primaryColor,
      borderRadius,
      appInitials,
      appDescription
    };
  }, [config]);

  useEffect(() => {
    const loadPublicConfig = async () => {
      try {
        // 1. Intentar usar preload de index.html
        const preloadedConfig = ConfigCacheService.getPreloadedConfig();
        if (preloadedConfig) {
          setConfig(preloadedConfig);
          setLoading(false);
          return;
        }

        // 2. Intentar usar caché de localStorage
        const cachedConfig = ConfigCacheService.getCache();
        if (cachedConfig) {
          setConfig(cachedConfig);
          setLoading(false);
          return;
        }

        // 3. Última opción: fetch directo
        const response = await fetch(`${API_BASE_URL}/api/interface-config/current/safe`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
          ConfigCacheService.setCache(data);
        } else {
          console.warn('No se pudo cargar configuración pública, usando defaults');
          setConfig(DEFAULT_CONFIG);
        }
      } catch (error) {
        console.error('Error cargando configuración pública:', error);
        setConfig(DEFAULT_CONFIG);
      } finally {
        setLoading(false);
      }
    };

    loadPublicConfig();
  }, []);

  // Loading state optimizado sin colores hardcodeados
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(to bottom right, var(--color-neutral-50, #FAFAFA), var(--color-neutral-100, #F5F5F5))'
        }}
      >
        <div className="animate-pulse">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4"
            style={{
              backgroundColor: 'var(--color-neutral-300, #D4D4D4)'
            }}
          />
          <div 
            className="h-4 rounded w-32 mx-auto"
            style={{
              backgroundColor: 'var(--color-neutral-300, #D4D4D4)'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom right, ${configValues.primaryColor}10, ${configValues.primaryColor}05)`
        }}
      >
        <div className="max-w-md w-full mx-4">
          <div 
            className="shadow-xl p-8 text-center"
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              borderRadius: configValues.borderRadius?.['2xl'] || '1rem'
            }}
          >
            {/* Logo dinámico con imagen real */}
            <LoginLogoWithImage 
              config={config}
              appInitials={configValues.appInitials}
              primaryColor={configValues.primaryColor}
              borderRadius={configValues.borderRadius}
            />

            {/* Título dinámico */}
            <h1 
              className="text-3xl font-bold mb-4"
              style={{
                color: 'var(--color-neutral-800, #262626)'
              }}
            >
              {configValues.loginTitle}
            </h1>

            {/* Descripción dinámica */}
            <p 
              className="mb-8"
              style={{
                color: 'var(--color-neutral-600, #525252)'
              }}
            >
              {configValues.loginDescription}
            </p>

            {/* Botones con tema dinámico */}
            <div className="space-y-4">
              <SignInButton mode="modal">
                <button 
                  className="w-full py-3 px-6 text-white font-medium transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: configValues.primaryColor,
                    borderRadius: configValues.borderRadius?.lg || '0.5rem'
                  }}
                >
                  Iniciar Sesión
                </button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <button 
                  className="w-full py-3 px-6 font-medium transition-all duration-200 hover:bg-opacity-10"
                  style={{
                    border: `2px solid ${configValues.primaryColor}`,
                    color: configValues.primaryColor,
                    backgroundColor: 'transparent',
                    borderRadius: configValues.borderRadius?.lg || '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${configValues.primaryColor}10`;
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
            <div 
              className="mt-6 pt-4"
              style={{
                borderTop: '1px solid var(--color-neutral-100, #F5F5F5)'
              }}
            >
              <p 
                className="text-sm"
                style={{
                  color: 'var(--color-neutral-500, #737373)'
                }}
              >
                {configValues.appDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
