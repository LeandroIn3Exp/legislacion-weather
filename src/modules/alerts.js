import { addMessage } from '../main.js';

// Configurar alertas comunitarias
export function setupCommunityAlerts() {
    document.getElementById('alertForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const zona = document.getElementById('zona').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const fecha = new Date().toLocaleString();

        const alertaHTML = `
            <div style="background: #ecf0f1; border-left: 6px solid #e74c3c; padding: 1rem; margin-bottom: 1rem; border-radius: 6px;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">📍 Zona: ${zona}</div>
                <div style="margin-bottom: 0.5rem;">💬 ${descripcion}</div>
                <div style="font-size: 0.9rem; color: #7f8c8d;">📅 ${fecha}</div>
            </div>
        `;

        const feed = document.getElementById('alertasFeed');
        feed.insertAdjacentHTML('afterbegin', alertaHTML);

        document.getElementById('alertForm').reset();

        // Notificar al chat
        addMessage('assistant', `🚨 Se ha registrado una nueva alerta comunitaria en ${zona}: ${descripcion}`);
    });
}