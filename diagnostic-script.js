/**
 * Script de diagnóstico específico para el problema de persistencia
 * Ejecuta esto en la consola del navegador para ver qué está pasando
 */

console.log('🔍 DIAGNÓSTICO ESPECÍFICO - PROBLEMA DE PERSISTENCIA');
console.log('==================================================');

// Función para verificar el estado actual
function diagnosticCurrentState() {
  console.log('📊 ESTADO ACTUAL:');
  
  // 1. Verificar localStorage
  const localStorage_config = localStorage.getItem('interface-config');
  console.log('💾 localStorage:', localStorage_config ? 'EXISTE' : 'VACÍO');
  
  if (localStorage_config) {
    try {
      const parsed = JSON.parse(localStorage_config);
      console.log('📝 appName en localStorage:', parsed.branding?.appName || 'NO ENCONTRADO');
      console.log('⏰ updatedAt en localStorage:', parsed.updatedAt || 'NO ENCONTRADO');
    } catch (error) {
      console.log('❌ Error parseando localStorage:', error);
    }
  }
  
  // 2. Verificar autenticación
  const clerk_token = localStorage.getItem('clerk-db-jwt') || 
                      localStorage.getItem('__clerk_db_jwt') ||
                      Object.keys(localStorage).find(key => key.includes('clerk'));
  console.log('🔐 Token de autenticación:', clerk_token ? 'EXISTE' : 'NO ENCONTRADO');
  
  // 3. Verificar si estamos en React y hay contexto
  if (window.React) {
    console.log('⚛️ React:', 'DISPONIBLE');
  } else {
    console.log('⚛️ React:', 'NO DISPONIBLE');
  }
  
  // 4. Verificar red - última llamada al servidor
  console.log('🌐 Para verificar llamadas de red, ve a Network tab y recarga');
  
  return {
    hasLocalStorage: !!localStorage_config,
    hasAuth: !!clerk_token,
    hasReact: !!window.React
  };
}

// Función para simular el flujo de carga
async function simulateLoadFlow() {
  console.log('🔄 SIMULANDO FLUJO DE CARGA...');
  
  try {
    // Verificar si podemos hacer llamada al servidor
    const apiUrl = 'http://localhost:8000'; // Ajustar según tu configuración
    
    console.log(`📡 Intentando conectar a: ${apiUrl}/api/interface-config/current/safe`);
    
    const response = await fetch(`${apiUrl}/api/interface-config/current/safe`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Aquí deberías incluir el token de autenticación
      }
    });
    
    if (response.ok) {
      const serverConfig = await response.json();
      console.log('✅ Servidor responde con:', serverConfig.branding?.appName || 'SIN NOMBRE');
      return { serverOk: true, serverConfig };
    } else {
      console.log(`❌ Servidor responde con error: ${response.status} ${response.statusText}`);
      return { serverOk: false, error: `${response.status} ${response.statusText}` };
    }
    
  } catch (error) {
    console.log('❌ Error conectando al servidor:', error.message);
    return { serverOk: false, error: error.message };
  }
}

// Función para identificar el problema específico
function identifyProblem() {
  console.log('🎯 IDENTIFICANDO PROBLEMA ESPECÍFICO...');
  
  const state = diagnosticCurrentState();
  
  if (!state.hasLocalStorage) {
    console.log('🚨 PROBLEMA: No hay configuración en localStorage');
    console.log('💡 SOLUCIÓN: Verifica que el guardado esté funcionando');
    return 'no-localStorage';
  }
  
  if (!state.hasAuth) {
    console.log('🚨 PROBLEMA: No hay token de autenticación');
    console.log('💡 SOLUCIÓN: Verifica que estés logueado correctamente');
    return 'no-auth';
  }
  
  console.log('🤔 El problema puede estar en:');
  console.log('1. El servidor no está devolviendo la configuración correcta');
  console.log('2. El sistema está priorizando configuración por defecto sobre localStorage');
  console.log('3. Hay un problema en el flujo de carga inicial');
  
  return 'unknown';
}

// Función para probar el fix sugerido
function testProposedFix() {
  console.log('🧪 PROBANDO FIX SUGERIDO...');
  
  // Verificar si podemos modificar la configuración actual en memoria
  if (window.React && window.React.version) {
    console.log('⚛️ React disponible - el fix debería funcionar');
  }
  
  console.log('📋 PASOS PARA APLICAR EL FIX:');
  console.log('1. Modificar defaultConfigs.ts para usar valores genéricos');
  console.log('2. Mejorar el flujo de carga para priorizar datos guardados');
  console.log('3. Agregar logs específicos para debug');
}

// Exportar funciones
window.diagnosticCurrentState = diagnosticCurrentState;
window.simulateLoadFlow = simulateLoadFlow;
window.identifyProblem = identifyProblem;
window.testProposedFix = testProposedFix;

console.log('');
console.log('📋 COMANDOS DISPONIBLES:');
console.log('1. diagnosticCurrentState() - Ver estado actual');
console.log('2. simulateLoadFlow() - Simular carga desde servidor');
console.log('3. identifyProblem() - Identificar problema específico');
console.log('4. testProposedFix() - Ver pasos para aplicar fix');
console.log('');

// Ejecutar diagnóstico inicial
const problem = identifyProblem();
console.log(`🎯 Problema identificado: ${problem}`);

// Ejecutar simulación de carga
setTimeout(() => {
  simulateLoadFlow().then(result => {
    if (!result.serverOk) {
      console.log('');
      console.log('🚨 PROBLEMA CONFIRMADO: Servidor no disponible o no responde correctamente');
      console.log('💡 El sistema está cargando configuración por defecto en lugar de localStorage');
    }
  });
}, 1000);
