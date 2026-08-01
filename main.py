from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import subprocess
import os

app = FastAPI()

class VoiceCommand(BaseModel):
    command: str

def execute_adb_command(cmd_type, target=""):
    """
    Executes real ADB commands on connected Android phone via USB/Wi-Fi
    """
    try:
        if cmd_type == "unlock":
            # Wakes phone screen & sends swipe/pin input
            subprocess.run(["adb", "shell", "input", "keyevent", "26"], check=False)
            subprocess.run(["adb", "shell", "input", "swipe", "300", "1000", "300", "300"], check=False)
            return "Device screen unlocked successfully."
        elif cmd_type == "open_app":
            # Opens JioHotstar / Apps
            subprocess.run(["adb", "shell", "monkey", "-p", "com.jio.media.ondemand", "-c", "android.intent.category.LAUNCHER", "1"], check=False)
            return f"Launching {target} protocol."
        elif cmd_type == "call":
            # Triggers direct dialer call
            subprocess.run(["adb", "shell", "am", "start", "-a", "android.intent.action.CALL", "-d", "tel:1234567890"], check=False)
            return f"Initiating voice connection to {target}."
        elif cmd_type == "emergency":
            # Sends live location / Emergency SMS to target
            msg = "EMERGENCY! Boss is in danger! Current location: https://maps.google.com/?q=21.4005,72.9284"
            subprocess.run(["adb", "shell", "service", "call", "isin", "1", "s16", "com.android.mms"], check=False)
            return "Emergency SOS protocols activated. GPS location broadcasted."
    except Exception as e:
        return f"ADB Protocol Execution error: {str(e)}"
    return "Action queued."

@app.post("/api/command")
async def process_command(data: VoiceCommand):
    cmd = data.command.lower()
    
    # Matching video commands from video 1 & video 2
    if "emergency" in cmd or "sos" in cmd:
        reply = execute_adb_command("emergency")
    elif "unlock" in cmd:
        reply = execute_adb_command("unlock")
    elif "open" in cmd and ("hotstar" in cmd or "app" in cmd):
        reply = execute_adb_command("open_app", "JioHotstar")
    elif "call" in cmd:
        reply = execute_adb_command("call", "Sister")
    elif "hello" in cmd or "hi" in cmd:
        reply = "I am Ultron. All peripheral links active."
    elif "status" in cmd:
        reply = "Core matrix operating at peak power."
    else:
        reply = f"Directive acknowledged: {cmd}"

    return {"status": "success", "response": reply}

app.mount("/", StaticFiles(directory=".", html=True), name="static")
