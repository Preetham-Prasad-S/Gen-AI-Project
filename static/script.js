const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');
const sessionList = document.getElementById('session-list');
const newChatBtn = document.getElementById('new-chat-btn');
const chatTitleEl = document.getElementById('chat-title');
const chatMetadataEl = document.getElementById('chat-metadata');
const summarizeBtn = document.getElementById('summarize-btn');
const summaryContentEl = document.getElementById('summary-content');

let currentSessionId = localStorage.getItem('chat_session_id') || generateUUID();
let typingIndicator = null;
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
    
    // Smooth scroll to bottom
    const scrollTarget = chatMessages.closest('.chat-main') || chatMessages;
    scrollTarget.scrollTo({
        top: scrollTarget.scrollHeight,
        behavior: 'smooth'
    });
};

const showTypingIndicator = () => {
    if (typingIndicator) return;
    typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai';
    typingIndicator.innerHTML = `
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>`;
    chatMessages.appendChild(typingIndicator);
    
    const scrollTarget = chatMessages.closest('.chat-main') || chatMessages;
    scrollTarget.scrollTo({
        top: scrollTarget.scrollHeight,
        behavior: 'smooth'
    });
};

const hideTypingIndicator = () => {
    if (typingIndicator) {
        typingIndicator.remove();
        typingIndicator = null;
    }
};

const updateHeaderInfo = (sessionData = null) => {
    if (sessionData) {
        chatTitleEl.textContent = sessionData.title || "New Curation";
        chatMetadataEl.textContent = `Exploration initiated • Session ID: #${sessionData.session_id.toUpperCase()}`;
        
        if (sessionData.summary) {
            summaryContentEl.innerHTML = `<div class="text-secondary small">${marked.parse(sessionData.summary)}</div>`;
        } else {
            summaryContentEl.innerHTML = '<div class="summary-placeholder text-secondary small"><p>Send messages to generate a summary.</p></div>';
        }
    } else {
        const activeSessionItem = document.querySelector(`.session-item-container[data-session-id="${currentSessionId}"]`);
        if (activeSessionItem) {
            const titleText = activeSessionItem.querySelector('.session-title').textContent;
            chatTitleEl.textContent = titleText;
            chatMetadataEl.textContent = `Exploration initiated • Session ID: #${currentSessionId.toUpperCase()}`;
        } else {
            chatTitleEl.textContent = "New Curation";
            chatMetadataEl.textContent = "Exploration initiated • Session ID: #NEW";
        }
    }
};

const loadHistory = async (sessionId) => {
    try {
        chatMessages.innerHTML = '';
        showTypingIndicator();
        
        const response = await fetch(`/history/${sessionId}`);
        const history = await response.json();
        
        hideTypingIndicator();
        chatMessages.innerHTML = ''; 

        if (history.length === 0) {
            addMessage("Hello! I am your AI Curator. How can I assist your exploration today?", 'ai');
        } else {
            history.forEach(item => {
                const type = item.role === 'assistant' ? 'ai' : 'user';
                addMessage(item.content, type);
            });
        }
        updateHeaderInfo();

        // Ensure we are at the bottom after loading history
        setTimeout(() => {
            const scrollTarget = chatMessages.closest('.chat-main') || chatMessages;
            scrollTarget.scrollTop = scrollTarget.scrollHeight;
        }, 100);
    } catch (error) {
        console.error('Error loading history:', error);
        hideTypingIndicator();
    }
};

const loadSessions = async () => {
    try {
        const response = await fetch('/sessions');
        const sessions = await response.json();
        sessionList.innerHTML = '';
        
        sessions.forEach(s => {
            const container = document.createElement('div');
            container.className = `session-item-container ${s.session_id === currentSessionId ? 'active' : ''}`;
            container.dataset.sessionId = s.session_id;

            const content = document.createElement('div');
            content.className = 'session-content';
            
            const title = document.createElement('div');
            title.className = 'session-title';
            title.textContent = s.title || "New Curation";
            title.title = s.title || "New Curation";
            content.appendChild(title);

            if (s.session_id === currentSessionId) {
                updateHeaderInfo(s);
            }

            content.onclick = () => {
                currentSessionId = s.session_id;
                localStorage.setItem('chat_session_id', currentSessionId);
                
                document.querySelectorAll('.session-item-container').forEach(el => {
                    el.classList.toggle('active', el.dataset.sessionId === currentSessionId);
                });
                
                loadHistory(currentSessionId);
                updateHeaderInfo(s);
            };

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = '<i class="bi bi-trash"></i>';
            delBtn.title = "Delete Curation";
            delBtn.onclick = async (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this curation?')) {
                    try {
                        await fetch(`/sessions/${s.session_id}`, { method: 'DELETE' });
                        if (currentSessionId === s.session_id) {
                            newChatBtn.click();
                        } else {
                            loadSessions();
                        }
                    } catch (err) {
                        console.error('Failed to delete', err);
                    }
                }
            };

            container.appendChild(content);
            container.appendChild(delBtn);
            sessionList.appendChild(container);
        });
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
};

summarizeBtn.onclick = async () => {
    const originalText = summarizeBtn.textContent;
    summarizeBtn.textContent = 'SUMMARIZING...';
    summarizeBtn.disabled = true;
    showTypingIndicator();
    try {
        const response = await fetch(`/sessions/${currentSessionId}/summarize`, { method: 'POST' });
        if (response.ok) {
            hideTypingIndicator();
            const data = await response.json();
            summaryContentEl.innerHTML = `<div class="text-secondary small">${marked.parse(data.summary)}</div>`;
            await loadSessions(); 
        } else {
            hideTypingIndicator();
            console.error('Failed to summarize.');
        }
    } catch (err) {
        hideTypingIndicator();
        console.error('Error summarizing:', err);
    } finally {
        summarizeBtn.textContent = originalText;
        summarizeBtn.disabled = false;
    }
};

newChatBtn.onclick = () => {
    currentSessionId = generateUUID();
    localStorage.setItem('chat_session_id', currentSessionId);
    chatMessages.innerHTML = '';
    summaryContentEl.innerHTML = '<div class="summary-placeholder text-secondary small"><p>Send messages to generate a summary.</p></div>';
    loadSessions();
    loadHistory(currentSessionId);
    updateHeaderInfo();
};

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = userInput.value.trim();
    if (!prompt) return;

    addMessage(prompt, 'user');
    userInput.value = '';
    
    userInput.disabled = true;
    const originalBtnContent = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

    showTypingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, session_id: currentSessionId }),
        });

        if (!response.ok) throw new Error('Failed to fetch response');

        const data = await response.json();
        hideTypingIndicator();
        addMessage(data.response, 'ai');
        loadSessions(); 
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addMessage('Error: ' + error.message, 'ai');
    } finally {
        userInput.disabled = false;
        userInput.focus();
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalBtnContent;
    }
});

// Initial Load
loadHistory(currentSessionId).then(() => {
    loadSessions();
});
