export function setupEmergencyPanel() {
    // Obtener elementos con los nuevos IDs
    const toggleBtn = document.getElementById('emergency-toggle-btn');
    const panel = document.getElementById('emergency-panel');
    const copyBtn = document.getElementById('copy-emergency-btn');
    const copyMessage = document.getElementById('emergency-copy-message');

    // Verificar que todos los elementos existen
    if (!toggleBtn || !panel || !copyBtn || !copyMessage) {
        console.error('Elementos no encontrados:', {
            toggleBtn,
            panel,
            copyBtn,
            copyMessage
        });
        return;
    }

    // Configurar evento para mostrar/ocultar panel
    toggleBtn.addEventListener('click', () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    // Configurar evento para copiar mensaje
    copyBtn.addEventListener('click', () => {
        const baseMessage = `🚨 NECESITO AYUDA URGENTE
Estoy en Quito, no puedo llamar al 911.
Ubicación/Zona: [especifica aquí]
Tipo de emergencia: [inundación, derrumbe, herido, etc.]`;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lon = position.coords.longitude.toFixed(6);
                    const locationUrl = `https://www.google.com/maps?q=${lat},${lon}`;
                    const fullMessage = `${baseMessage}\nUbicación GPS: ${locationUrl}\nPor favor, contacten lo antes posible.`;
                    copyToClipboard(fullMessage);
                },
                () => {
                    // Si falla la geolocalización
                    const fallbackMessage = `${baseMessage}\nUbicación GPS no disponible.\nPor favor, contacten lo antes posible.`;
                    copyToClipboard(fallbackMessage);
                }
            );
        } else {
            // Si no hay soporte de geolocalización
            const noSupportMessage = `${baseMessage}\nUbicación GPS no soportada.\nPor favor, contacten lo antes posible.`;
            copyToClipboard(noSupportMessage);
        }
    });

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                copyMessage.style.display = 'block';
                setTimeout(() => {
                    copyMessage.style.display = 'none';
                }, 4000);
            })
            .catch(err => {
                console.error('Error al copiar al portapapeles:', err);
                // Fallback para navegadores antiguos
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);

                copyMessage.style.display = 'block';
                setTimeout(() => {
                    copyMessage.style.display = 'none';
                }, 4000);
            });
    }
}