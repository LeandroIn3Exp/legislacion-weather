import { showLoading, QUITO_COORDS } from '../main.js';
import { updateMapWithWeather } from './map.js';
import { addMessage } from './ui.js';
import { generateInitialAnalysis } from './gemini.js';

// Variables globales
let weatherAPI = '72c4e33babfabcb045cc45d1a7ea381f';
let connectedAPIs = { weather: false, gemini: false };

// Conectar APIs
export async function connectAPIs() {
    weatherAPI = document.getElementById('openweather-key').value.trim() || weatherAPI;
    const geminiAPI = document.getElementById('gemini-key').value.trim();

    showLoading(true);

    // Probar conexión con OpenWeather
    try {
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${QUITO_COORDS[0]}&lon=${QUITO_COORDS[1]}&appid=${weatherAPI}&units=metric&lang=es`
        );
        
        if (weatherResponse.ok) {
            connectedAPIs.weather = true;
            document.getElementById('weather-status').innerHTML = '<i class="fas fa-cloud"></i> Clima: Conectado';
            document.getElementById('weather-status').className = 'status-indicator status-connected';
            
            // Cargar datos del clima
            await loadWeatherData();
        } else {
            throw new Error('API Key de OpenWeather inválida');
        }
    } catch (error) {
        console.error('Error conectando OpenWeather:', error);
        document.getElementById('weather-status').innerHTML = '<i class="fas fa-cloud"></i> Clima: Error';
    }

    showLoading(false);

    if (connectedAPIs.weather && connectedAPIs.gemini) {
        generateInitialAnalysis();
    }
}

// Cargar datos del clima
export async function loadWeatherData() {
    try {
        // Clima actual
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${QUITO_COORDS[0]}&lon=${QUITO_COORDS[1]}&appid=${weatherAPI}&units=metric&lang=es`
        );
        const currentData = await currentResponse.json();

        // Pronóstico 5 días
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${QUITO_COORDS[0]}&lon=${QUITO_COORDS[1]}&appid=${weatherAPI}&units=metric&lang=es`
        );
        const forecastData = await forecastResponse.json();

        updateWeatherDisplay(currentData, forecastData);
        updateMapWithWeather(currentData);

    } catch (error) {
        console.error('Error cargando datos del clima:', error);
    }
}

// Actualizar visualización del clima
function updateWeatherDisplay(current, forecast) {
    // Datos actuales
    document.getElementById('current-temp').textContent = `${Math.round(current.main.temp)}°C`;
    document.getElementById('current-desc').textContent = current.weather[0].description;
    document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${(current.wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('feels-like').textContent = `${Math.round(current.main.feels_like)}°C`;

    // Icono del clima
    const iconMap = {
        'clear': 'sun',
        'clouds': 'cloud',
        'rain': 'cloud-rain',
        'thunderstorm': 'bolt',
        'snow': 'snowflake',
        'mist': 'smog'
    };
    const weatherType = current.weather[0].main.toLowerCase();
    const iconClass = iconMap[weatherType] || 'cloud';
    document.getElementById('weather-icon').className = `fas fa-${iconClass} fa-4x`;

    // Pronóstico 5 días (tomamos uno por día)
    const forecastElement = document.getElementById('forecast');
    forecastElement.innerHTML = '';
    
    const dailyForecasts = forecast.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
        
        const dayElement = document.createElement('div');
        dayElement.className = 'forecast-day';
        dayElement.innerHTML = `
            <div>${dayName}</div>
            <div><i class="fas fa-${iconMap[day.weather[0].main.toLowerCase()] || 'cloud'}"></i></div>
            <div>${Math.round(day.main.temp)}°C</div>
            <div style="font-size: 0.8em;">${day.weather[0].description}</div>
        `;
        forecastElement.appendChild(dayElement);
    });
}

// Actualización automática del clima cada 10 minutos
setInterval(() => {
    if (connectedAPIs.weather) {
        loadWeatherData();
    }
}, 600000);