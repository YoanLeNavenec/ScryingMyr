const chatInput = document.querySelector('.chat-input');
const SendButton = document.querySelector('.chat-send-button');
const chatHistory = document.querySelector('.chat-history');
const chatView = document.querySelector('.chat-view');

SendButton.addEventListener('click', () => {
    const message = chatInput.value;
    if (message.trim() === '') return;

    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-message');
    messageEl.textContent = message;
    chatHistory.appendChild(messageEl);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    chatInput.value = '';

    // Update empty state
    chatView.classList.remove('empty-state');
});

chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        SendButton.click();
    }
});

// Set initial empty state
console.log('chat history children:', chatHistory.children.length);
if (chatHistory.children.length === 0) {
    chatView.classList.add('empty-state');
    console.log('added empty-state class');
}