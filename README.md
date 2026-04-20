# The Curator | AI Curation Assistant

A modern, high-performance AI chatbot platform. This project integrates **FastAPI** with **LangChain** and **Groq** to provide a rapid, low-latency development environment for LLM-based applications with persistent memory and summarization.

---

## 🚀 Overview
The Curator is an AI-powered chat application that leverages Large Language Models (LLMs) for intelligent conversation. By using **Groq** as the inference engine via **LangChain**, it achieves extremely low latency.

**Key Features:**
- **Persistent Memory**: Full chat history stored in **PostgreSQL**.
- **Context-Aware**: AI remembers previous messages in a session.
- **Auto-Titling**: Automatically generates topic-based titles for new conversations.
- **Dedicated Summarization**: One-click conversation summaries displayed in a dedicated sidebar.
- **Clean UI**: Modern, dark-themed interface built with Bootstrap 5 and Markdown support.

---

## 🏗️ Architecture
- **Frontend**: Vanilla HTML/CSS/JS with Bootstrap 5 and `marked.js` for Markdown rendering.
- **Backend**: FastAPI (Python) serving RESTful API endpoints.
- **AI Layer**: LangChain orchestrating Groq (Llama 3) models.
- **Database**: PostgreSQL with SQLAlchemy ORM for reliable data persistence.

---

## ⚙️ Setup & Installation

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- **Python 3.8+** installed.
- **PostgreSQL** installed and running.
- A **Groq API Key** (Get one at [console.groq.com](https://console.groq.com/)).

### 2. Clone the Repository
```bash
git clone <your-repo-url>
cd "Gen Ai"
```

### 3. Python Environment Setup
Create and activate a virtual environment to manage dependencies:

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. PostgreSQL Database Setup
1. Open your PostgreSQL client (like pgAdmin or psql).
2. Create a new database:
   ```sql
   CREATE DATABASE curator_db;
   ```
3. Ensure your PostgreSQL service is running on the default port (5432).

### 6. Environment Configuration
Create a `.env` file in the root directory and populate it with your credentials:

```env
# AI Configuration
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama3-70b-8192

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=curator_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

---

## 🚀 Running the Application

1. **Start the Backend:**
   Run the following command in your terminal:
   ```bash
   python main.py
   ```
   *The script will automatically initialize the database tables on its first run.*

2. **Access the Interface:**
   Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)

---

## 📖 Usage Guide

- **Starting a Chat**: Simply type your message in the bottom input bar and press enter. A new session will be created automatically if none is active.
- **New Conversation**: Click **"+ New Curation"** in the left sidebar to start a fresh session.
- **Switching Sessions**: Click any session under **"Global Archives"** in the sidebar to load its history.
- **Summarization**: Click the **"SUMMARIZE CHAT"** button in the right sidebar. The summary will appear exclusively in that tab without cluttering your chat flow.
- **Deleting History**: Click the **trash icon** next to any session in the sidebar to permanently delete it.

---

## 🛠️ Troubleshooting

- **Database connection errors**: 
  - Ensure PostgreSQL is running.
  - Double-check `DB_USER` and `DB_PASSWORD` in your `.env`.
  - Verify the `DB_NAME` exists.
- **LLM not initializing**:
  - Check that your `GROQ_API_KEY` is valid and has not expired.
  - Ensure you have an active internet connection.
- **API not responding**:
  - Ensure no other process is using port 8000.
  - Check the terminal output for Python tracebacks or error logs.

---

## 🛡️ Best Practices
- **Security**: Never commit your `.env` file to version control.
- **API Limits**: Be mindful of Groq's rate limits if using a free tier key.
- **Clean Shutdown**: Use `Ctrl+C` in the terminal to gracefully stop the FastAPI server.

---
*Developed as a modern starter for AI-driven applications.*