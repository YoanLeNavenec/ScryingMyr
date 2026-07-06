const chatInput = document.querySelector('.chat-input');
const SendButton = document.querySelector('.chat-send-button');
const chatHistory = document.querySelector('.chat-history');

SendButton.addEventListener('click', () => {
  const message = chatInput.value;
  if (message.trim() === '') return;

  const messageEl = document.createElement('div');
  messageEl.classList.add('chat-message');
  messageEl.textContent = message;
  chatHistory.appendChild(messageEl);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  chatInput.value = '';
});

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    SendButton.click();
  }
});
