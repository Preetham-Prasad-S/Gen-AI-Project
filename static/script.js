const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');
const sessionList = document.getElementById('session-list');
const newChatBtn = document.getElementById('new-chat-btn');

let currentSessionId = localStorage.getItem('chat_session_id') || generateUUID();
localStorage.setItem('chat_session_id', currentSessionId);

function generateUUID() {
    return 'sess_' + Math.random().toString(36).substr(2, 9);
}

const addMessage = (content, type) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    
    if (type === 'ai') {
        messageDiv.innerHTML = `<div class="content">${marked.parse(content)}</div>`;
    } else {
        messageDiv.innerHTML = `<div class="content">${content}</div>`;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const loadHistory = async (sessionId) => {
    try {
        const response = await fetch(`/history/${sessionId}`);
        const history = await response.json();
        chatMessages.innerHTML = ''; // Clear current view
        history.forEach(item => {
            addMessage(item.user_message, 'user');
            addMessage(item.bot_response, 'ai');
        });
    } catch (error) {
        console.error('Error loading history:', error);
    }
};

const loadSessions = async () => {
    try {
        const response = await fetch('/sessions');
        const sessions = await response.json();
        sessionList.innerHTML = '';
        sessions.forEach(s => {
            const item = document.createElement('div');
            item.classList.add('session-item');
            if (s.session_id === currentSessionId) item.classList.add('active');
            item.textContent = s.session_id;
            item.onclick = () => {
                currentSessionId = s.session_id;
                localStorage.setItem('chat_session_id', currentSessionId);
                loadHistory(currentSessionId);
                updateActiveSessionUI();
            };
            sessionList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
};

const updateActiveSessionUI = () => {
    document.querySelectorAll('.session-item').forEach(el => {
        el.classList.toggle('active', el.textContent === currentSessionId);
    });
};

newChatBtn.onclick = () => {
    currentSessionId = generateUUID();
    localStorage.setItem('chat_session_id', currentSessionId);
    chatMessages.innerHTML = '<div class="message ai"><div class="content">New conversation started! How can I help?</div></div>';
    loadSessions();
};

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = userInput.value.trim();
    if (!prompt) return;

    addMessage(prompt, 'user');
    userInput.value = '';
    
    const originalBtnContent = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="loading"></div>';

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, session_id: currentSessionId }),
        });

        if (!response.ok) throw new Error('Failed to fetch response');

        const data = await response.json();
        addMessage(data.response, 'ai');
        loadSessions(); // Refresh session list
    } catch (error) {
        console.error('Error:', error);
        addMessage('Error: ' + error.message, 'ai');
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalBtnContent;
    }
});

// Initial Load
loadHistory(currentSessionId);
loadSessions();
