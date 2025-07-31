import { showLoading, addMessage, QUITO_COORDS } from '../main.js';
import { loadWeatherData } from './weather.js';

let geminiAPI = 'AIzaSyChkgOoEz0-nzzcB5RFttNQHQIwh_QZ_70';
let connectedAPIs = { weather: false, gemini: false };
let csvData = null;

// Enviar mensaje al chat
export async function sendMessage() {
    const messageInput = document.getElementById('user-message');
    const message = messageInput.value.trim();

    if (!message) return;

    if (!connectedAPIs.gemini) {
        alert('Conecta primero la API de Gemini');
        return;
    }

    addMessage('user', message);
    messageInput.value = '';

    showLoading(true);

    // Obtener datos meteorológicos actuales para contexto
    let weatherContext = '';
    if (connectedAPIs.weather) {
        try {
            const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${QUITO_COORDS[0]}&lon=${QUITO_COORDS[1]}&appid=${weatherAPI}&units=metric&lang=es`
            );
            const weatherData = await weatherResponse.json();
            
            weatherContext = `\n\nDATOS METEOROLÓGICOS ACTUALES DE QUITO (OpenWeather):
- Temperatura: ${weatherData.main.temp}°C
- Humedad: ${weatherData.main.humidity}%
- Presión: ${weatherData.main.pressure} hPa
- Viento: ${weatherData.wind.speed} m/s
- Condición: ${weatherData.weather[0].description}
- Visibilidad: ${weatherData.visibility} metros`;
        } catch (error) {
            console.error('Error obteniendo datos meteorológicos:', error);
        }
    }

    const prompt = `Eres un experto en gestión hídrica y meteorología de Quito, Ecuador. Responde con conocimiento técnico especializado.

CONSULTA DEL USUARIO: ${message}

CONTEXTO QUITO:
- Ubicación: Andes ecuatorianos, 2,850 msnm
- Infraestructura hídrica: 39 plantas potabilizadoras
- Sistemas principales: Pita-Tambo, La Mica-Quito Sur, Papallacta Integrado
- Vulnerabilidades: volcanes, deslizamientos, variabilidad climática
- Cobertura: 98.2% agua potable, 92% alcantarillado${weatherContext}

INSTRUCCIONES:
- Proporciona recomendaciones técnicas específicas para Quito
- Considera los datos meteorológicos actuales en tu análisis
- Incluye medidas preventivas y de gestión de riesgos
- Explica cómo las condiciones actuales afectan la gestión hídrica
- Sugiere acciones concretas basadas en la situación meteorológica

Responde de manera técnica pero comprensible, con recomendaciones prácticas.`;

    try {
        console.log('Enviando mensaje a Gemini...');
        console.log('Prompt enviado:', prompt.substring(0, 200) + '...');
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiAPI}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        console.log('Respuesta mensaje - Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error en mensaje:', errorData);
            throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
        }

        const data = await response.json();
        console.log('Respuesta mensaje recibida:', data);
        
        if (data.candidates && data.candidates[0]) {
            const answer = data.candidates[0].content.parts[0].text;
            addMessage('assistant', answer);
        } else {
            throw new Error('Respuesta vacía de Gemini AI');
        }
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        addMessage('assistant', `❌ Error de conexión con Gemini AI: ${error.message}\n\nVerifica tu API key y cuota disponible.`);
    }

    showLoading(false);
}

// Generar reporte de alertas
export async function generateRiskReport() {
    if (!connectedAPIs.gemini || !connectedAPIs.weather) {
        alert('Conecta ambas APIs para generar el reporte');
        return;
    }

    showLoading(true);

    try {
        // Obtener datos meteorológicos para el reporte
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${QUITO_COORDS[0]}&lon=${QUITO_COORDS[1]}&appid=${weatherAPI}&units=metric&lang=es`
        );
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${QUITO_COORDS[0]}&lon=${QUITO_COORDS[1]}&appid=${weatherAPI}&units=metric&lang=es`
        );
        
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        const prompt = `Genera un reporte completo de alertas de riesgo para Quito basado en datos meteorológicos actuales de OpenWeather.

DATOS METEOROLÓGICOS ACTUALES:
- Temperatura: ${weatherData.main.temp}°C
- Humedad: ${weatherData.main.humidity}%
- Presión: ${weatherData.main.pressure} hPa
- Viento: ${weatherData.wind.speed} m/s, dirección ${weatherData.wind.deg}°
- Condición: ${weatherData.weather[0].description}
- Visibilidad: ${weatherData.visibility} metros
- Sensación térmica: ${weatherData.main.feels_like}°C

PRONÓSTICO 5 DÍAS:
${forecastData.list.slice(0, 8).map(item => 
    `${new Date(item.dt * 1000).toLocaleDateString('es-ES')}: ${item.main.temp}°C, ${item.weather[0].description}, Humedad ${item.main.humidity}%`
).join('\n')}

GENERA REPORTE CON:

1. NIVEL DE ALERTA GENERAL (Verde/Amarillo/Naranja/Rojo)
2. RIESGOS ESPECÍFICOS POR ZONA:
   - Norte de Quito (Carcelén, Calderón)
   - Centro (Centro Histórico, La Mariscal)
   - Sur (Quitumbe, Chillogallo)
   - Valles (Tumbaco, Cumbayá)

3. ALERTAS HIDROLÓGICAS:
   - Riesgo de inundación por precipitaciones
   - Vulnerabilidad en plantas potabilizadoras
   - Posibles afectaciones en captación La Mica
   - Estado de sistemas de distribución

4. RECOMENDACIONES INMEDIATAS:
   - Para autoridades (EPMAPS, Municipio)
   - Para ciudadanos
   - Medidas preventivas por sector

5. CRONOGRAMA DE SEGUIMIENTO:
   - Próximas 24 horas
   - Próximos 3 días
   - Próxima semana

Considera factores específicos de Quito: altitud, topografía, época del año, vulnerabilidades volcánicas y sísmicas.

Formato: Reporte técnico oficial con niveles de urgencia claros.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiAPI}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            const report = data.candidates[0].content.parts[0].text;
            
            // Actualizar panel de alertas
            const alertsContent = document.getElementById('alerts-content');
            alertsContent.innerHTML = `
                <div class="alert-item">
                    <h4>📋 REPORTE GENERADO - ${new Date().toLocaleString('es-EC')}</h4>
                    <div style="white-space: pre-wrap; margin-top: 15px;">${report}</div>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 0.9em;">
                        <strong>📊 Fuentes de datos:</strong><br>
                        • Datos meteorológicos: OpenWeather API en tiempo real<br>
                        • Análisis predictivo: Google Gemini AI<br>
                        • Contexto local: Sistema de gestión hídrica de Quito (EPMAPS)<br>
                        • Generado: ${new Date().toLocaleString('es-EC')}
                    </div>
                </div>
            `;

            // También agregar al chat
            addMessage('assistant', `🚨 REPORTE DE ALERTAS GENERADO\n\nSe ha creado un reporte completo de riesgos basado en:\n- Datos meteorológicos actuales de OpenWeather\n- Análisis predictivo con Gemini AI\n- Contexto específico de Quito\n\nRevisa el panel de alertas para ver el reporte completo.`);

            // Crear archivo descargable
            createDownloadableReport(report, weatherData);
        }
    } catch (error) {
        console.error('Error generando reporte:', error);
        addMessage('assistant', 'Error al generar el reporte de alertas. Verifica las conexiones API.');
    }

    showLoading(false);
}

// Crear archivo descargable del reporte
function createDownloadableReport(report, weatherData) {
    const reportContent = `REPORTE DE ALERTAS HIDROMETEOROLÓGICAS - QUITO
================================================================

Fecha de generación: ${new Date().toLocaleString('es-EC')}
Fuente de datos: OpenWeather API + Análisis Gemini AI

CONDICIONES METEOROLÓGICAS ACTUALES:
- Temperatura: ${weatherData.main.temp}°C
- Humedad: ${weatherData.main.humidity}%
- Presión: ${weatherData.main.pressure} hPa
- Viento: ${weatherData.wind.speed} m/s
- Condición: ${weatherData.weather[0].description}

ANÁLISIS Y RECOMENDACIONES:
${report}

================================================================
Sistema Hidrológico y Meteorológico de Quito
Desarrollado con OpenWeather API y Google Gemini AI
================================================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Alertas_Quito_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addMessage('assistant', '📄 Reporte descargado exitosamente. El archivo contiene el análisis completo con recomendaciones específicas para Quito.');
}

// Análisis inicial al conectar APIs
export async function generateInitialAnalysis() {
    try {
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${QUITO_COORDS[0]}&lon=${QUITO_COORDS[1]}&appid=${weatherAPI}&units=metric&lang=es`
        );
        const weatherData = await weatherResponse.json();

        const prompt = `Basándote en las condiciones meteorológicas actuales de Quito, proporciona un análisis inicial del estado del sistema hídrico.

DATOS ACTUALES:
- Temperatura: ${weatherData.main.temp}°C
- Humedad: ${weatherData.main.humidity}%
- Condición: ${weatherData.weather[0].description}
- Presión: ${weatherData.main.pressure} hPa

Como experto en recursos hídricos de Quito, evalúa:
1. Estado general del sistema basado en condiciones actuales
2. Riesgos inmediatos por zona
3. Recomendaciones operativas para las próximas 24 horas
4. Impacto en plantas potabilizadoras

Respuesta breve y técnica.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiAPI}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            const analysis = data.candidates[0].content.parts[0].text;
            addMessage('assistant', `🌟 ANÁLISIS INICIAL DEL SISTEMA\n\n${analysis}\n\n✅ Sistema conectado y operativo. Datos en tiempo real desde OpenWeather API.`);
        }
    } catch (error) {
        console.error('Error en análisis inicial:', error);
    }
}

// Función de diagnóstico específica para Gemini
export async function diagnoseGeminiAPI() {
    const apiKey = document.getElementById('gemini-key').value.trim() || geminiAPI;
    
    addMessage('assistant', '🔍 Iniciando diagnóstico de Gemini API...');
    
    console.log('=== DIAGNÓSTICO GEMINI API ===');
    console.log('API Key format:', apiKey.length, 'caracteres');
    console.log('Primeros 10 caracteres:', apiKey.substring(0, 10));
    console.log('Últimos 5 caracteres:', apiKey.substring(apiKey.length - 5));
    
    // Verificar formato de API Key
    if (!apiKey.startsWith('AIza')) {
        addMessage('assistant', '❌ Error: API Key de Gemini debe comenzar con "AIza"');
        return;
    }
    
    if (apiKey.length < 35) {
        addMessage('assistant', '❌ Error: API Key parece muy corta. Debe tener ~39 caracteres');
        return;
    }
    
    // Probar diferentes endpoints
    const endpoints = [
        'gemini-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ];
    
    for (const model of endpoints) {
        try {
            addMessage('assistant', `🧪 Probando modelo: ${model}...`);
            console.log(`Probando modelo: ${model}`);
            
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ 
                            parts: [{ text: "Responde con una sola palabra: OK" }] 
                        }]
                    })
                }
            );
            
            console.log(`${model} - Status:`, response.status);
            console.log(`${model} - Status Text:`, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`${model} - Respuesta exitosa:`, data);
                addMessage('assistant', `✅ ${model}: FUNCIONANDO`);
                
                // Actualizar configuración con el modelo que funciona
                geminiAPI = apiKey;
                connectedAPIs.gemini = true;
                document.getElementById('gemini-status').innerHTML = '<i class="fas fa-robot"></i> Gemini: Conectado';
                document.getElementById('gemini-status').className = 'status-indicator status-connected';
                
                addMessage('assistant', `🎉 ¡Éxito! Gemini conectado usando modelo: ${model}`);
                return;
            } else {
                const errorData = await response.json();
                console.error(`${model} - Error:`, errorData);
                addMessage('assistant', `❌ ${model}: Error ${response.status} - ${errorData.error?.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error(`Error probando ${model}:`, error);
            addMessage('assistant', `❌ ${model}: Error de conexión - ${error.message}`);
        }
    }
    
    // Si llegamos aquí, ningún modelo funcionó
    addMessage('assistant', `❌ DIAGNÓSTICO COMPLETO - GEMINI NO CONECTADO
    
Posibles soluciones:
1. Verifica que tu API Key sea correcta en: https://makersuite.google.com/app/apikey
2. Asegúrate de que Gemini API esté habilitada para tu proyecto
3. Verifica que tengas cuota disponible
4. Intenta generar una nueva API Key
5. Confirma que tu región sea compatible

La API Key actual parece tener el formato correcto pero no funciona con ningún modelo disponible.`);
}