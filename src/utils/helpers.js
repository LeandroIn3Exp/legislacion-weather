// Funciones de ayuda comunes
export function formatDate(date) {
    return new Date(date).toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getWeatherIcon(weatherType) {
    const iconMap = {
        'clear': 'sun',
        'clouds': 'cloud',
        'rain': 'cloud-rain',
        'thunderstorm': 'bolt',
        'snow': 'snowflake',
        'mist': 'smog'
    };
    return iconMap[weatherType.toLowerCase()] || 'cloud';
}