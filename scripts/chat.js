const chatInput = document.querySelector('.chat-input');
const SendButton = document.querySelector('.chat-send-button');
const chatHistory = document.querySelector('.chat-history');
const chatView = document.querySelector('.chat-view');

let currentCoversationId = null;

//New conversation on load
window.electronAPI.listConversations().then(conversations => {
    if (conversations.length > 0) {
        // Show the modal
        document.getElementById('resume-modal').classList.remove('hidden')
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            document.getElementById('resume-modal').classList.add('hidden')
            currentConversationId = conversations[0].replace('.json', '')
            window.electronAPI.loadConversation(currentConversationId).then(messages => {
                messages.forEach(msg => {
                    if (msg.role === 'user') {
                        const el = document.createElement('div')
                        el.classList.add('chat-message')
                        el.textContent = msg.text
                        chatHistory.appendChild(el)
                    } else {
                        addBotMessage(msg.text)
                    }
                })
            })
        })
        
        document.getElementById('fresh-btn').addEventListener('click', () => {
            document.getElementById('resume-modal').classList.add('hidden')
            window.electronAPI.newConversation().then(id => {
                currentConversationId = id
                addBotMessage("Hello! I'm Scrying Myr! My master appointed me as your new assistant! What are we learning today?")
            })
        })
    } else {
        // No conversations exist, start fresh silently
        window.electronAPI.newConversation().then(id => {
            currentConversationId = id
            addBotMessage("Hello! I'm Scrying Myr! My master appointed me as your new assistant! What are we learning today?")
        })
    }
});

// Send user input as a message
SendButton.addEventListener('click', () => {
    const message = chatInput.value;
    if (message.trim() === '') return;

    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-message');
    messageEl.textContent = message;
    chatHistory.appendChild(messageEl);

    window.electronAPI.saveMessage(currentCoversationId, {
        role: 'user',
        text: message
    });

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

//Bot's response as a message
function addBotMessage(text){
    const messageBot = document.createElement('div');
    messageBot.classList.add('chat-message-bot');
    messageBot.textContent = text;
    chatHistory.appendChild(messageBot);
    window.electronAPI.saveMessage(currentCoversationId, {
        role: 'bot',
        text: text
    })
}