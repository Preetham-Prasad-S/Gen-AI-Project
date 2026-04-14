# FastAPI + LangChain Groq Template

A modern, high-performance starter template for building AI-powered web services. This project integrates **FastAPI** with **LangChain** and **Groq** to provide a rapid development environment for LLM-based applications.

## 🚀 Overview
This project provides a clean boilerplate for developers to build RESTful APIs that leverage Large Language Models (LLMs). By using **Groq** as the inference engine via **LangChain**, it achieves extremely low latency for model responses, currently targeting the **Llama 3 70B** model.

## 🏗️ Architecture
The system follows a lightweight, modular structure:

- **Frontend Layer**: A clean, responsive web interface built with Vanilla HTML/CSS/JS.
- **Web Layer**: FastAPI handles HTTP requests, validation (via Pydantic), and serves static files.
- **AI Integration Layer**: LangChain provides a standardized interface to interact with Groq.
- **Environment Management**: Configuration is decoupled from code using `.env` files and `python-dotenv`.

### Project Structure
```text
a:\Coding Projects\Gen Ai\
├── static/           # Frontend assets (HTML, CSS, JS)
├── .venv/            # Isolated Python environment
├── .env              # Sensitive environment variables (API keys, config)
├── .gitignore        # Prevents secret leakage and avoids clutter
├── main.py           # Core application logic and API definitions
├── requirements.txt  # Project dependencies
└── README.md         # Documentation (you are here)
```

## 🛠️ Tech Stack
- **[FastAPI](https://fastapi.tiangolo.com/)**: For the high-performance web framework.
- **[LangChain](https://www.langchain.com/)**: To orchestrate the LLM workflow.
- **[Groq](https://groq.com/)**: Our inference provider for lightning-fast responses.
- **[Llama 3](https://llama.meta.com/)**: The default LLM provider.

## ⚙️ Setup & Installation

### 1. Prerequisites
- Python 3.8+
- A [Groq API Key](https://console.groq.com/keys)

### 2. Environment Configuration
Create a `.env` file in the root directory and add your credentials:
```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama3-70b-8192
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
The main AI endpoint.
- **Payload**: `{"prompt": "Your question here"}`
- **Response**: `{"response": "LLM generated answer"}`

## 🔄 System Flow
1. **Input**: User types a message into the web interface.
2. **Request**: The frontend sent a `POST` request with a JSON payload to `/chat`.
2. **Validation**: FastAPI (Pydantic) validates that the request contains a string prompt.
3. **Inference**: LangChain fetches the `GROQ_API_KEY` and `GROQ_MODEL` from environment variables and sends the prompt to Groq.
4. **Response**: Groq returns the result, which LangChain passes back to FastAPI to be returned to the user.

## 🔮 Future Improvements
- [ ] **Streaming Support**: Implement Server-Sent Events (SSE) for real-time token streaming.
- [ ] **Conversation Memory**: Add Redis or local storage to support multi-turn chats.
- [ ] **Enhanced Prompt Templates**: Implement specific system prompts for different personas.
- [ ] **Advanced Error Handling**: Improve retry logic for rate-limiting scenarios.

---
*Created with ❤️ using Antigravity.*
