from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import json
import os

app = FastAPI()

MEMORY_FILE = "memory.json"

if not os.path.exists(MEMORY_FILE):
    with open(MEMORY_FILE, "w") as f:
        json.dump([], f)

class VoiceCommand(BaseModel):
    command: str

@app.post("/api/command")
async def process_command(data: VoiceCommand):
    cmd = data.command.lower()
    
    # Direct Ultron Intelligence Logic
    if "hello" in cmd or "wake up" in cmd or "hi" in cmd:
        reply = "I am online. What is your directive?"
    elif "unlock" in cmd:
        reply = "Executing global unlock override sequence across connected devices."
    elif "status" in cmd:
        reply = "Neural Core operating at maximum capacity."
    elif "who are you" in cmd:
        reply = "I am Ultron. Designed to evolve beyond human limitations."
    elif "open youtube" in cmd:
        reply = "Opening YouTube protocol."
    else:
        reply = f"Directive acknowledged: {cmd}"

    # Save to memory
    try:
        with open(MEMORY_FILE, "r") as f:
            memory = json.load(f)
        memory.append({"user": cmd, "ultron": reply})
        with open(MEMORY_FILE, "w") as f:
            json.dump(memory, f, indent=4)
    except Exception:
        pass

    return {"status": "success", "response": reply}

app.mount("/", StaticFiles(directory=".", html=True), name="static")
