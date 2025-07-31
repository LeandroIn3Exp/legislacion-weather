// Mostrar/ocultar loading spinner
export function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.className = show ? 'loading show' : 'loading';
}

// Agregar mensaje al chat
export function addMessage(sender, text) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const timestamp = new Date().toLocaleTimeString('es-EC');
    const senderName = sender === 'user' ? 'Usuario' : 'Gemini AI';
    
    messageDiv.innerHTML = `<strong>${senderName}:</strong> ${text}<br><small style="opacity: 0.7;">${timestamp}</small>`;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}