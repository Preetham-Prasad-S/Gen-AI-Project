import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from database import init_db, get_db, ChatHistory

# Load environment variables from .env file
load_dotenv()

# Initialize Database
try:
    init_db()
except Exception as e:
    print(f"Database initialization failed: {e}")

app = FastAPI(
    title="FastAPI + LangChain Groq Template",
    description="A template featuring FastAPI and LangChain with Groq integration and SQL history.",
    version="0.1.1"
)

# Initialize Groq LLM
try:
    model_name = os.getenv("GROQ_MODEL", "llama3-70b-8192")
    llm = ChatGroq(
        model=model_name,
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
    )
except Exception as e:
    print(f"Error initializing Groq LLM: {e}")
    llm = None

class ChatRequest(BaseModel):
    prompt: str
    session_id: str

@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    if not llm:
        raise HTTPException(status_code=500, detail="LLM not initialized. Check your GROQ_API_KEY.")
    
    try:
        messages = [
            SystemMessage(content=(
                "You are a helpful AI assistant. Always format your responses using strictly clean Markdown.\n"
                "1. Use ## for main headings and ### for subheadings.\n"
                "2. Use bullet points (-) for lists.\n"
                "3. Use **bold** for emphasis.\n"
                "4. Avoid unstructured large text blocks. Keep responses concise and well-organized."
            )),
            HumanMessage(content=request.prompt)
        ]
        response = llm.invoke(messages)
        
        # Save to database
        db_history = ChatHistory(
            session_id=request.session_id,
            user_message=request.prompt,
            bot_response=response.content
        )
        db.add(db_history)
        db.commit()

        return {"response": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{session_id}")
async def get_history(session_id: str, db: Session = Depends(get_db)):
    history = db.query(ChatHistory).filter(ChatHistory.session_id == session_id).order_by(ChatHistory.timestamp.asc()).all()
    return history

@app.get("/sessions")
async def get_sessions(db: Session = Depends(get_db)):
    # Returns unique session IDs with their last message timestamp
    from sqlalchemy import func
    sessions = db.query(
        ChatHistory.session_id, 
        func.max(ChatHistory.timestamp).label("last_activity")
    ).group_by(ChatHistory.session_id).order_by(func.max(ChatHistory.timestamp).desc()).all()
    return [{"session_id": s.session_id, "last_activity": s.last_activity} for s in sessions]

# Mount static files (HTML, CSS, JS)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
