/**
 * Script para obtener token JWT desde la consola del navegador
 * Copia y pega este código en la consola DevTools (F12)
 */

// Función para obtener el token JWT actual de Clerk
const getClerkToken = async () => {
  try {
    // Intentar obtener desde la instancia de Clerk global
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      console.log('🔑 Token JWT obtenido desde Clerk.session:');
      console.log(token);
      return token;
    }
    
    // Intentar obtener desde localStorage con diferentes claves
    const possibleKeys = [
      '__clerk_db_jwt',
      '__clerk_client_jwt', 
      'clerk-db-jwt',
      'clerk-client-jwt'
    ];
    
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`🔑 Token JWT obtenido desde localStorage[${key}]:`);
        console.log(token);
        return token;
      }
    }
    
    console.log('❌ No se pudo obtener el token JWT');
    console.log('ℹ️ Asegúrate de estar autenticado en la aplicación');
    
    return null;
    
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return null;
  }
};

// Función para probar las APIs contextuales directamente desde el navegador
const testContextualAPIs = async () => {
  const token = await getClerkToken();
  if (!token) return;
  
  const baseURL = 'http://localhost:8000/api/contextual-config';
  
  const makeRequest = async (method, endpoint, data = null) => {
    const url = `${baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(`${method} ${endpoint}:`, {
        status: response.status,
        ok: response.ok,
        data: result
      });
      return result;
    } catch (error) {
      console.error(`Error ${method} ${endpoint}:`, error);
    }
  };
  
  console.log('🚀 Probando APIs contextuales...');
  
  // Probar permisos globales
  await makeRequest('GET', '/permissions/global');
  
  // Probar configuración efectiva (necesita user_id real)
  // await makeRequest('GET', '/effective/USER_ID_AQUI');
  
  // Probar guardar preferencias
  const testPreferences = {
    user_id: 'current-user', // Se sobrescribirá en el backend
    preferences: {
      theme: {
        primary: { 500: '#ff0000' }
      },
      branding: {
        title: 'Prueba desde navegador'
      }
    }
  };
  
  await makeRequest('POST', '/preferences', testPreferences);
};

// Ejecutar automáticamente
console.log('🔍 Obteniendo token JWT...');
getClerkToken().then(token => {
  if (token) {
    console.log('✅ Token obtenido exitosamente');
    console.log('📋 Copia este token para usar en test_contextual_apis.py:');
    console.log(`JWT_TOKEN = "${token}"`);
    console.log('');
    console.log('🧪 Para probar las APIs directamente desde aquí, ejecuta:');
    console.log('testContextualAPIs()');
  }
});

// Exponer funciones globalmente para uso manual
window.getClerkToken = getClerkToken;
window.testContextualAPIs = testContextualAPIs;