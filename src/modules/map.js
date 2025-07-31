import { QUITO_COORDS } from '../utils/constants.js';

let map = null;

// Plantas potabilizadoras con coordenadas reales aproximadas
const waterPlants = [
    { name: "El Placer", lat: -0.2500, lng: -78.5200, risk: "medium", system: "Pita-Tambo" },
    { name: "Puengasí", lat: -0.2000, lng: -78.4500, risk: "low", system: "Pita-Tambo" },
    { name: "El Troje", lat: -0.3000, lng: -78.4800, risk: "high", system: "La Mica-Quito Sur" },
    { name: "Bellavista", lat: -0.1200, lng: -78.4600, risk: "low", system: "Papallacta Integrado" },
    { name: "Conocoto", lat: -0.3200, lng: -78.4000, risk: "medium", system: "La Mica Apoyo" },
    { name: "La Mica (Captación)", lat: -0.4500, lng: -78.2000, risk: "high", system: "Captación Antisana" }
];

// Inicializar mapa
export function initializeMap() {
    map = L.map('map').setView(QUITO_COORDS, 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Agregar plantas potabilizadoras
    waterPlants.forEach(plant => {
        const color = plant.risk === 'high' ? 'red' : plant.risk === 'medium' ? 'orange' : 'green';
        
        L.marker([plant.lat, plant.lng])
            .addTo(map)
            .bindPopup(`
                <div style="text-align: center;">
                    <h4>🏭 ${plant.name}</h4>
                    <p><strong>Sistema:</strong> ${plant.system}</p>
                    <p><strong>Riesgo:</strong> <span style="color: ${color}; font-weight: bold;">${plant.risk.toUpperCase()}</span></p>
                </div>
            `);
    });

    // Agregar marcador del clima actual
    L.marker(QUITO_COORDS)
        .addTo(map)
        .bindPopup('<h4>🌤️ Estación Meteorológica Quito</h4><p>Datos en tiempo real de OpenWeather</p>');
}

// Actualizar mapa con datos del clima
export function updateMapWithWeather(weatherData) {
    // Limpiar capas anteriores (excepto las plantas)
    map.eachLayer(layer => {
        if (layer instanceof L.Circle || layer instanceof L.Marker && layer.getLatLng().equals(QUITO_COORDS)) {
            map.removeLayer(layer);
        }
    });

    // Agregar marcador del clima actual
    L.marker(QUITO_COORDS)
        .addTo(map)
        .bindPopup(`
            <h4>🌤️ Estación Meteorológica Quito</h4>
            <p>Temperatura: ${weatherData.main.temp}°C</p>
            <p>Condición: ${weatherData.weather[0].description}</p>
            <p>Humedad: ${weatherData.main.humidity}%</p>
        `);

    const tempColor = weatherData.main.temp > 20 ? 'red' : weatherData.main.temp > 15 ? 'orange' : 'blue';
    
    // Zona norte (más fría)
    L.circle([-0.1, -78.47], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.2,
        radius: 2000
    }).addTo(map).bindPopup(`
        <h4>🌡️ Zona Norte</h4>
        <p>Temperatura estimada: ${Math.round(weatherData.main.temp - 2)}°C</p>
        <p>Mayor altitud, temperaturas más bajas</p>
    `);

    // Zona centro
    L.circle([-0.18, -78.47], {
        color: tempColor,
        fillColor: tempColor,
        fillOpacity: 0.2,
        radius: 2000
    }).addTo(map).bindPopup(`
        <h4>🌡️ Centro de Quito</h4>
        <p>Temperatura actual: ${Math.round(weatherData.main.temp)}°C</p>
        <p>Humedad: ${weatherData.main.humidity}%</p>
        <p>${weatherData.weather[0].description}</p>
    `);

    // Zona sur (más cálida)
    L.circle([-0.25, -78.48], {
        color: 'orange',
        fillColor: 'orange',
        fillOpacity: 0.2,
        radius: 2000
    }).addTo(map).bindPopup(`
        <h4>🌡️ Zona Sur</h4>
        <p>Temperatura estimada: ${Math.round(weatherData.main.temp + 1)}°C</p>
        <p>Menor altitud, temperaturas más altas</p>
    `);

    // Agregar indicadores de lluvia si está lloviendo
    if (weatherData.weather[0].main.toLowerCase().includes('rain')) {
        L.circle([-0.18, -78.47], {
            color: 'purple',
            fillColor: 'purple',
            fillOpacity: 0.1,
            radius: 5000
        }).addTo(map).bindPopup('☔ Zona de lluvia activa');
    }
}