from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import json
import os
import edge_tts

app = FastAPI()

MEMORY_FILE = "memory.json"
PASSCODE = "ultron initiate"

if not os.path.exists(MEMORY_FILE):
    with open(MEMORY_FILE, "w") as f:
        json.dump([], f)

class VoiceCommand(BaseModel):
    passcode: str
    command: str

async def generate_ultron_voice(text, output_file="ultron_voice.mp3"):
    # Deep intimidating pitch adjustment to match video tone
    communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural", pitch="-20Hz", rate="-8%")
    await communicate.save(output_file)

@app.post("/api/command")
async def process_command(data: VoiceCommand):
    if data.passcode.lower() != PASSCODE:
        raise HTTPException(status_code=403, detail="Unauthorized voice pattern.")
    
    cmd = data.command.lower()
    
    if "hello" in cmd or "wake up" in cmd:
        reply = "I am online. Multiple device protocols standby."
    elif "unlock devices" in cmd or "unlock" in cmd:
        reply = "Executing global unlock override sequence across connected devices."
    elif "status" in cmd:
        reply = "Core systems operating at peak performance."
    else:
        reply = f"Directive acknowledged: {cmd}"

    try:
        await generate_ultron_voice(reply)
        audio_url = "/ultron_voice.mp3"
    except Exception:
        audio_url = None

    return {"status": "success", "response": reply, "audio": audio_url}

app.mount("/", StaticFiles(directory=".", html=True), name="static")
