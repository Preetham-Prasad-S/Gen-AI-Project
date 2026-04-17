import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from database import init_db, get_db, SessionModel, MessageModel

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
    model_name = os.getenv("GROQ_MODEL", "llama3-70b-8192") # look into the variable of the llm
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
        # 1. Ensure Session exists
        db_session = db.query(SessionModel).filter(SessionModel.session_id == request.session_id).first()
        if not db_session:
            db_session = SessionModel(session_id=request.session_id)
            db.add(db_session)
            db.commit()

        # 2. Fetch Context (Conversation Memory) - Windowing Last 10 interactions
        past_msgs = db.query(MessageModel).filter(MessageModel.session_id == request.session_id).order_by(MessageModel.timestamp.asc()).all()
        # Keep last 10 messages to respect token limits (5 pairs)
        past_msgs = past_msgs[-10:]

        messages = [
            SystemMessage(content=(
                "You are a helpful AI assistant. Always format your responses using strictly clean Markdown.\n"
                "1. Use ## for main headings and ### for subheadings.\n"
                "2. Use bullet points (-) for lists.\n"
                "3. Use **bold** for emphasis.\n"
                "4. Avoid unstructured large text blocks. Keep responses concise and well-organized."
            ))
        ]
        
        for msg in past_msgs:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))

        # Add the current prompt
        messages.append(HumanMessage(content=request.prompt))

        # Save User Message
        user_db_msg = MessageModel(session_id=request.session_id, role="user", content=request.prompt)
        db.add(user_db_msg)
        db.commit()

        # Generate Response
        response = llm.invoke(messages)
        
        # Save Bot Message
        bot_db_msg = MessageModel(session_id=request.session_id, role="assistant", content=response.content)
        db.add(bot_db_msg)
        db.commit()

        # Generate Title if None
        if not db_session.title:
            try:
                title_msgs = [
                    SystemMessage(content="You generate very short, concise, topic-based titles (3-6 words maximum). Output ONLY the title text, nothing else."),
                    HumanMessage(content=f"User said: {request.prompt}\nAI responded: {response.content}")
                ]
                title_res = llm.invoke(title_msgs)
                db_session.title = title_res.content.strip().strip('"').strip('*')
                db.commit()
            except Exception as e:
                print(f"Title generation error: {e}")

        return {"response": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{session_id}")
async def get_history(session_id: str, db: Session = Depends(get_db)):
    # Fetch messages and format them for the frontend
    messages = db.query(MessageModel).filter(MessageModel.session_id == session_id).order_by(MessageModel.timestamp.asc()).all()
    # Return structured data: [{role: "user", content: "hi"}, ...]
    return [{"role": msg.role, "content": msg.content, "timestamp": msg.timestamp} for msg in messages]

@app.get("/sessions")
async def get_sessions(db: Session = Depends(get_db)):
    # Returns sessions sorted by newest first
    from sqlalchemy import func
    
    sessions_activity = db.query(
        SessionModel.session_id,
        SessionModel.title,
        func.max(MessageModel.timestamp).label("last_activity")
    ).outerjoin(MessageModel, SessionModel.session_id == MessageModel.session_id)\
     .group_by(SessionModel.session_id).order_by(func.max(MessageModel.timestamp).desc().nulls_last()).all()
    
    result = []
    for s in sessions_activity:
        result.append({
            "session_id": s.session_id, 
            "title": s.title if s.title else "New Chat",
            "last_activity": s.last_activity
        })
    return result

# Mount static files (HTML, CSS, JS)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
