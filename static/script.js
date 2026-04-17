const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');
const sessionList = document.getElementById('session-list');
const newChatBtn = document.getElementById('new-chat-btn');
const chatTitleEl = document.getElementById('chat-title');
const summarizeBtn = document.getElementById('summarize-btn');

let currentSessionId = localStorage.getItem('chat_session_id') || generateUUID();
let typingIndicator = null;
localStorage.setItem('chat_session_id', currentSessionId);

function generateUUID() {
    return 'sess_' + Math.random().toString(36).substr(2, 9);
}

const addMessage = (content, type) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    
    // We already styled message.ai and its inner contents (Markdown)
    // and user messages too. The summary is just another AI message.
    if (type === 'ai') {
        messageDiv.innerHTML = `<div class="content">${marked.parse(content)}</div>`;
    } else {
        messageDiv.innerHTML = `<div class="content">${content}</div>`;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const hideTypingIndicator = () => {
    if (typingIndicator) {
        typingIndicator.remove();
        typingIndicator = null;
    }
};

const updateHeaderInfo = () => {
    const activeSessionItem = document.querySelector(`.session-item-container[data-session-id="${currentSessionId}"]`);
    if (activeSessionItem) {
        const titleText = activeSessionItem.querySelector('.session-title').textContent;
        chatTitleEl.textContent = titleText;
        
        // Show summarize if enough messages
        if (chatMessages.children.length > 1 || (chatMessages.children.length === 1 && chatMessages.children[0].classList.contains('user'))) {
            summarizeBtn.style.display = 'block';
        } else {
            summarizeBtn.style.display = 'none';
        }
    } else {
        chatTitleEl.textContent = "AI Assistant";
        summarizeBtn.style.display = 'none';
    }
};

const loadHistory = async (sessionId) => {
    try {
        chatMessages.innerHTML = '';
        showTypingIndicator();
        
        const response = await fetch(`/history/${sessionId}`);
        const history = await response.json();
        
        hideTypingIndicator();
        chatMessages.innerHTML = ''; // Clear fully after loading

        if (history.length === 0) {
            chatMessages.innerHTML = '<div class="message ai"><div class="content">New conversation started! How can I help?</div></div>';
        } else {
            history.forEach(item => {
                const type = item.role === 'assistant' ? 'ai' : 'user';
                addMessage(item.content, type);
            });
        }
        updateHeaderInfo();
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
            title.textContent = s.title || s.session_id;
            title.title = s.title || s.session_id;
            content.appendChild(title);

            if (s.summary) {
                // If it's already summarized, we can potentially hide the button
                // But the button logic relies on child nodes in chat box currently.
            }

            content.onclick = () => {
                currentSessionId = s.session_id;
                localStorage.setItem('chat_session_id', currentSessionId);
                
                document.querySelectorAll('.session-item-container').forEach(el => {
                    el.classList.toggle('active', el.dataset.sessionId === currentSessionId);
                });
                
                loadHistory(currentSessionId);
            };

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>`;
            delBtn.title = "Delete Conversation";
            delBtn.onclick = async (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this conversation?')) {
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
        updateHeaderInfo();
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
};

summarizeBtn.onclick = async () => {
    const originalText = summarizeBtn.textContent;
    summarizeBtn.textContent = 'Summarizing...';
    summarizeBtn.disabled = true;
    showTypingIndicator();
    try {
        const response = await fetch(`/sessions/${currentSessionId}/summarize`, { method: 'POST' });
        if (response.ok) {
            hideTypingIndicator();
            await loadHistory(currentSessionId);
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
    loadSessions();
    loadHistory(currentSessionId);
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
    sendBtn.innerHTML = '<div class="loading"></div>';

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
