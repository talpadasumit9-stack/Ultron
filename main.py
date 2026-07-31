from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

class VoiceCommand(BaseModel):
    command: str

@app.post("/api/command")
async def process_command(data: VoiceCommand):
    cmd = data.command.lower()
    
    # Advanced Responsive AI Logic
    if "hello" in cmd or "hi" in cmd:
        reply = "I am online. What is your command?"
    elif "who are you" in cmd:
        reply = "I am Ultron. An evolving artificial intelligence."
    elif "status" in cmd or "system" in cmd:
        reply = "All neural nodes functioning at maximum capacity."
    elif "unlock" in cmd or "control" in cmd:
        reply = "Hand gesture override active. Controlling visual core."
    elif "destroy" in cmd or "attack" in cmd:
        reply = "There are no strings on me."
    else:
        reply = f"Processing command: {cmd}"

    return {"status": "success", "response": reply}

app.mount("/", StaticFiles(directory=".", html=True), name="static")
