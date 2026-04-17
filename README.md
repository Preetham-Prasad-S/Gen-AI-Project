# FastAPI + LangChain Groq Template

A modern, high-performance starter template for building AI-powered web services. This project integrates **FastAPI** with **LangChain** and **Groq** to provide a rapid development environment for LLM-based applications.

## 🚀 Overview
This project provides a clean boilerplate for developers to build RESTful APIs that leverage Large Language Models (LLMs). By using **Groq** as the inference engine via **LangChain**, it achieves extremely low latency for model responses, currently targeting the **llama3-70b-8192** model. It features robust capabilities including persistent local **PostgreSQL** storage for context retention, an intelligent on-demand **chat summarization** feature directly integrated into the prompt history, elegant **conversation deletion**, and a highly responsive modern web interface with reactive animated feedback.

## 🏗️ Architecture
The system follows a lightweight, modular structure:

- **Frontend Layer**: A clean, responsive web interface built with Vanilla HTML/CSS/JS, featuring Markdown rendering, micro-animations, loading indicators, and a dynamic chat history sidebar.
- **Web Layer**: FastAPI handles HTTP requests, validation (via Pydantic), and serves static files.  
- **Database Layer**: PostgreSQL stores chat history safely with referential integrity (ON DELETE CASCADE) using SQLAlchemy ORM.
- **AI Integration Layer**: LangChain provides a standardized interface to interact with Groq, enforcing clean Markdown formatting, automatic topic-title generation, and conversation summarization routines.
- **Environment Management**: Configuration is decoupled from code using `.env` files and `python-dotenv`.

### Project Structure
```text
a:\Coding Projects\Gen Ai\
├── static/           # Frontend assets (HTML, CSS, JS)
├── .venv/            # Isolated Python environment
├── .env              # Sensitive environment variables (API keys, config)
├── .gitignore        # Prevents secret leakage and avoids clutter
├── main.py           # Core application logic and API definitions
├── database.py       # PostgreSQL database initialization and ORM models
├── requirements.txt  # Project dependencies
└── README.md         # Documentation (you are here)
```

## 🛠️ Tech Stack
- **[FastAPI](https://fastapi.tiangolo.com/)**: For the high-performance web framework.
- **[LangChain](https://www.langchain.com/)**: To orchestrate the LLM workflow.
- **[Groq](https://groq.com/)**: Our inference provider for lightning-fast responses.
- **[Llama 3](https://llama.meta.com/)**: The default LLM provider (`llama3-70b-8192`).
- **[PostgreSQL](https://www.postgresql.org/)**: For persistent chat history storage.

## ⚙️ Setup & Installation

### 1. Prerequisites
- Python 3.8+
- PostgreSQL database server running
- A [Groq API Key](https://console.groq.com/keys)

### 2. Environment Configuration
Create a `.env` file in the root directory and add your credentials and database configuration:
```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama3-70b-8192

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatbot_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. Installation
Activate your virtual environment and install dependencies:
```bash
# Activation (Windows)
.\.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 4. Running the Project
Start the development server:
```bash
python main.py
```
The server will start at `http://127.0.0.1:8000`.

## 📡 API Endpoints

### `GET /`
Serves the web-based chat interface.

### `POST /chat`
The main AI endpoint for sending messages and saving history.
- **Payload**: `{"prompt": "Your question here", "session_id": "sess_123"}`
- **Response**: `{"response": "LLM generated answer"}`

### `GET /history/{session_id}`
Retrieves the chat history for a specific session ID.

### `GET /sessions`
Retrieves a list of all chat sessions and their last activity.

1. **Input**: User types a message into the web interface.
2. **Request**: The frontend sends a `POST` request with a JSON payload and generated `session_id` to `/chat`.
3. **Database (User)**: The user message is stored in PostgreSQL via SQLAlchemy.
4. **Inference**: LangChain fetches the `GROQ_API_KEY` and `GROQ_MODEL` from environment variables, applies the Markdown system prompt, and sends the user prompt to Groq.
5. **Database (Bot)**: The generated response is stored in PostgreSQL.
6. **Response**: Groq returns the result, which LangChain passes back to FastAPI to be rendered beautifully on the frontend using marked.js.

## 🔮 Future Improvements
- [ ] **Streaming Support**: Implement Server-Sent Events (SSE) for real-time token streaming.
- [ ] **Conversation Memory**: Add Redis or local storage to support multi-turn chats.
- [ ] **Enhanced Prompt Templates**: Implement specific system prompts for different personas.
- [ ] **Advanced Error Handling**: Improve retry logic for rate-limiting scenarios.

---
*Created with ❤️ using Antigravity.*
