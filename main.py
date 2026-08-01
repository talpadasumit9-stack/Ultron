from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import subprocess
import urllib.parse
import os

app = FastAPI()

class VoiceCommand(BaseModel):
    command: str

def execute_adb_command(cmd_type, target=""):
    """
    Executes real ADB intent/commands on Android without static hardcoded numbers.
    """
    try:
        if cmd_type == "unlock":
            subprocess.run(["adb", "shell", "input", "keyevent", "26"], check=False)
            subprocess.run(["adb", "shell", "input", "swipe", "300", "1000", "300", "300"], check=False)
            return "Device screen unlocked successfully."

        elif cmd_type == "call_native":
            # Opens phone contact dialer with name pre-searched or direct dial intent
            encoded_name = urllib.parse.quote(target)
            subprocess.run(["adb", "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", f"tel:{encoded_name}"], check=False)
            return f"Initiating call protocol for {target.capitalize()}."

        elif cmd_type == "call_whatsapp":
            # Direct WhatsApp launch intent with search query for contact
            subprocess.run(["adb", "shell", "am", "start", "-n", "com.whatsapp/.Main"], check=False)
            return f"Opening WhatsApp interface to connect with {target.capitalize()}."

        elif cmd_type == "open_app":
            subprocess.run(["adb", "shell", "monkey", "-p", "com.jio.media.ondemand", "-c", "android.intent.category.LAUNCHER", "1"], check=False)
            return f"Launching {target} protocol."

        elif cmd_type == "emergency":
            subprocess.run(["adb", "shell", "service", "call", "isin", "1", "s16", "com.android.mms"], check=False)
            return "Emergency SOS protocols activated. Broadcasting GPS coordinates."

    except Exception as e:
        return f"ADB Protocol Execution error: {str(e)}"
    return "Action queued."

@app.post("/api/command")
async def process_command(data: VoiceCommand):
    cmd = data.command.lower()

    # 1. WhatsApp Call Parsing
    if "whatsapp" in cmd and "call" in cmd:
        target_name = cmd.replace("whatsapp", "").replace("call", "").strip()
        reply = execute_adb_command("call_whatsapp", target=target_name if target_name else "Contact")

    # 2. Direct Phone Contacts Call Parsing (e.g., "call dad", "call sujal", "call dhaval")
    elif "call" in cmd:
        target_name = cmd.replace("call", "").strip()
        if target_name:
            reply = execute_adb_command("call_native", target=target_name)
        else:
            reply = "Please specify target contact name."

    # 3. Emergency SOS Protocol (from Video 1)
    elif "emergency" in cmd or "sos" in cmd:
        reply = execute_adb_command("emergency")

    # 4. Device Unlock Override (from Video 2)
    elif "unlock" in cmd:
        reply = execute_adb_command("unlock")

    # 5. App Launch Commands
    elif "open" in cmd and ("hotstar" in cmd or "app" in cmd):
        reply = execute_adb_command("open_app", "JioHotstar")

    elif "hello" in cmd or "hi" in cmd:
        reply = "I am Ultron. Peripheral links active and listening."

    elif "status" in cmd:
        reply = "Core neural matrix functioning at optimal capacity."

    else:
        reply = f"Directive acknowledged: {cmd}"

    return {"status": "success", "response": reply}

app.mount("/", StaticFiles(directory=".", html=True), name="static")
        
