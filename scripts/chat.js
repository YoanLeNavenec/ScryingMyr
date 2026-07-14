const chatInput = document.querySelector('.chat-input');
const SendButton = document.querySelector('.chat-send-button');
const chatHistory = document.querySelector('.chat-history');
const chatView = document.querySelector('.chat-view');

let currentCoversationId = null;

//New conversation on load
(async () => {
    const conversations = await window.electronAPI.listConversations()
    
    if (conversations.length > 0) {
        document.getElementById('resume-modal').classList.remove('hidden')
        
        document.getElementById('resume-btn').addEventListener('click', async () => {
            document.getElementById('resume-modal').classList.add('hidden')
            currentConversationId = conversations[0].replace('.json', '')
            const messages = await window.electronAPI.loadConversation(currentConversationId)
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
        
        document.getElementById('fresh-btn').addEventListener('click', async () => {
            document.getElementById('resume-modal').classList.add('hidden')
            currentConversationId = await window.electronAPI.newConversation()
            const isFirstLaunch = await window.electronAPI.checkFirstLaunch()
            if (isFirstLaunch) {
                addBotMessage("By Urza, hello! I'm the Scrying Myr, your appointed assistant in all things Magic the Gathering! From creating a deck to optimising it, I'm your myr! What are we tackling first?")
            } else {
                addBotMessage("Welcome back! What are we working on today?")
            }
        })
        
    } else {
        currentConversationId = await window.electronAPI.newConversation()
        const isFirstLaunch = await window.electronAPI.checkFirstLaunch()
        if (isFirstLaunch) {
            addBotMessage("By Urza, hello! I'm the Scrying Myr, your appointed assistant in all things Magic the Gathering! From creating a deck to optimising it, I'm your myr! What are we tackling first?")
        } else {
            addBotMessage("Welcome back! What are we working on today?")
        }
    }
})()



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