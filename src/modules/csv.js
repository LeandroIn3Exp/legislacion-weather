import { showLoading, addMessage } from '../main.js';

let csvData = null;

// Cargar CSV
export function loadCSV() {
    const fileInput = document.getElementById('csv-file');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvText = e.target.result;
            csvData = csvText;
            
            // Mostrar preview
            const lines = csvText.split('\n').slice(0, 5);
            document.getElementById('csv-preview').value = lines.join('\n') + '\n... (mostrando primeras 5 líneas)';
        };
        reader.readAsText(file);
    }
}

// Analizar datos CSV
export async function analyzeCSVData() {
    if (!csvData) {
        alert('Por favor, carga primero un archivo CSV');
        return;
    }

    if (!connectedAPIs.gemini) {
        alert('Conecta primero la API de Gemini para análisis');
        return;
    }

    showLoading(true);

    const prompt = `Analiza estos datos hidrológicos de Quito como experto en recursos hídricos. 

DATOS CSV:
${csvData.substring(0, 2000)}

CONTEXTO DE QUITO:
- Ciudad андina a 2,850 msnm
- Vulnerabilidades: volcanes (Pichincha, Antisana), deslizamientos, estacionalidad
- 39 plantas potabilizadoras, sistemas Pita-Tambo, La Mica, Papallacta
- Población: 2.8 millones en DMQ

ANÁLISIS REQUERIDO:
1. Identificar patrones y tendencias en los datos
2. Evaluar riesgos de inundación/sequía por zona
3. Correlación con datos meteorológicos actuales
4. Recomendaciones específicas para gestión hídrica
5. Predicciones a corto/mediano plazo
6. Medidas preventivas por sector de Quito

COMPARACIÓN CON DATOS METEOROLÓGICOS:
Incluye cómo estos datos históricos se relacionan con las condiciones climáticas actuales obtenidas de OpenWeather para generar predicciones más precisas.

Proporciona un análisis técnico detallado con recomendaciones específicas.`;

    try {
        console.log('Enviando análisis CSV a Gemini...');
        
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

        console.log('Respuesta análisis CSV - Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error en análisis CSV:', errorData);
            throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
        }

        const data = await response.json();
        console.log('Datos de análisis CSV recibidos:', data);
        
        if (data.candidates && data.candidates[0]) {
            const analysis = data.candidates[0].content.parts[0].text;
            
            // Mostrar análisis en el chat
            addMessage('assistant', `📊 ANÁLISIS DE DATOS CSV COMPLETADO\n\n${analysis}\n\n📍 FUENTES: Datos CSV cargados + OpenWeather API + Análisis Gemini AI`);
        } else {
            throw new Error('Respuesta vacía de Gemini AI');
        }
    } catch (error) {
        console.error('Error en análisis CSV:', error);
        addMessage('assistant', `❌ Error al analizar datos CSV: ${error.message}\n\nRevisa la consola del navegador (F12) para más detalles.`);
    }

    showLoading(false);
}