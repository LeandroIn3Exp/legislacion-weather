// Importar módulos
import { initializeMap, updateMapWithWeather } from './modules/map.js';
import { connectAPIs, loadWeatherData } from './modules/weather.js';
import { sendMessage, generateRiskReport, diagnoseGeminiAPI } from './modules/gemini.js';
import { loadCSV, analyzeCSVData } from './modules/csv.js';
import { setupCommunityAlerts } from './modules/alerts.js';
import { setupEmergencyPanel } from './modules/emergency.js';
import { showLoading, addMessage } from './modules/ui.js';
import { QUITO_COORDS } from './utils/constants.js';
import { DEFAULT_WEATHER_API, DEFAULT_GEMINI_API } from './utils/constants.js';
// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('openweather-key').value = DEFAULT_WEATHER_API;
    document.getElementById('gemini-key').value = DEFAULT_GEMINI_API;
    // Inicializar mapa
    initializeMap();
    
    // Configurar eventos
    document.getElementById('connect-apis-btn').addEventListener('click', connectAPIs);
    document.getElementById('diagnose-gemini-btn').addEventListener('click', diagnoseGeminiAPI);
    document.getElementById('csv-file').addEventListener('change', loadCSV);
    document.getElementById('analyze-csv-btn').addEventListener('click', analyzeCSVData);
    document.getElementById('send-message-btn').addEventListener('click', sendMessage);
    document.getElementById('generate-report-btn').addEventListener('click', generateRiskReport);
    
    // Configurar alertas comunitarias
    setupCommunityAlerts();
    
    // Configurar panel de emergencia
    setupEmergencyPanel();
    
    // Mensaje de bienvenida
    addMessage('assistant', `🌊 ¡Bienvenido al Sistema Hidrológico y Meteorológico de Quito!

Este sistema integra:
🌤️ OpenWeather API - Datos meteorológicos en tiempo real
🤖 Google Gemini AI - Análisis predictivo avanzado
🗺️ Mapa interactivo - 39 plantas potabilizadoras del DMQ
📊 Análisis de datos CSV - Carga tus datos hidrológicos

Para comenzar:
1. Verifica las API keys pre-cargadas
2. Haz clic en "Conectar APIs"
3. Carga un archivo CSV (opcional)
4. Realiza consultas especializadas

¿En qué puedo ayudarte hoy?`);
});

// Exportar funciones para uso en otros módulos
export { showLoading, addMessage, QUITO_COORDS };