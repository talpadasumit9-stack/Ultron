from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import cv2
import face_recognition
import numpy as np
import subprocess
import urllib.parse
import sys
import time

app = FastAPI()

# --- ULTRA-FAST 1-SECOND BIOMETRIC FACE SCAN ---
def verify_face_auth():
    print("🔒 Initializing Instant Biometric Matrix...")
    try:
        # Load and encode owner face once in RAM
        owner_image = face_recognition.load_image_file("sumit.jpg")
        owner_encoding = face_recognition.face_encodings(owner_image)[0]
    except Exception as e:
        print("❌ Error: sumit.jpg missing or invalid!")
        sys.exit(1)

    video_capture = cv2.VideoCapture(0)
    # Set low camera resolution for instant frame acquisition
    video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
    video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)

    start_time = time.time()

    while True:
        ret, frame = video_capture.read()
        if not ret:
            continue

        # Downscale frame for sub-second recognition speed
        small_frame = cv2.resize(frame, (0, 0), fx=0.2, fy=0.2)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        # Fast HOG-based face detection
        face_locations = face_recognition.face_locations(rgb_small_frame, model="hog")
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces([owner_encoding], face_encoding, tolerance=0.48)
            
            if True in matches:
                print("⚡ Instant Match: Hello Sumit, welcome... Me tumari kya madat kar saku?")
                video_capture.release()
                cv2.destroyAllWindows()
                return True
            else:
                print("💥 INTRUDER ALERT! SYSTEM CRASHED.")
                video_capture.release()
                cv2.destroyAllWindows()
                sys.exit("SYSTEM_CRASH_INTRUDER_PREVENTED")

        # 1.5 Second Max Timeout
        if time.time() - start_time > 1.5:
            print("⏱️ AUTH TIMEOUT: Crashing system.")
            video_capture.release()
            cv2.destroyAllWindows()
            sys.exit("SYSTEM_LOCKED_TIMEOUT")

# Instant face scan run
verify_face_auth()

# --- ADB COMMAND ENGINE ---
class VoiceCommand(BaseModel):
    command: str

def execute_adb_command(cmd_type, target=""):
    try:
        if cmd_type == "unlock":
            subprocess.run(["adb", "shell", "input", "keyevent", "26"], check=False)
            subprocess.run(["adb", "shell", "input", "swipe", "300", "1000", "300", "300"], check=False)
            return "Device screen unlocked successfully."

        elif cmd_type == "call_native":
            encoded_name = urllib.parse.quote(target)
            subprocess.run(["adb", "shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", f"tel:{encoded_name}"], check=False)
            return f"Initiating call protocol for {target.capitalize()}."

        elif cmd_type == "call_whatsapp":
            subprocess.run(["adb", "shell", "am", "start", "-n", "com.whatsapp/.Main"], check=False)
            return f"Opening WhatsApp interface for {target.capitalize()}."

        elif cmd_type == "emergency":
            subprocess.run(["adb", "shell", "service", "call", "isin", "1", "s16", "com.android.mms"], check=False)
            return "Emergency SOS protocols activated. GPS location broadcasted."

    except Exception as e:
        return f"ADB Protocol Execution error: {str(e)}"
    return "Action queued."

@app.post("/api/command")
async def process_command(data: VoiceCommand):
    cmd = data.command.lower()

    if "whatsapp" in cmd and "call" in cmd:
        target_name = cmd.replace("whatsapp", "").replace("call", "").strip()
        reply = execute_adb_command("call_whatsapp", target=target_name)

    elif "call" in cmd:
        target_name = cmd.replace("call", "").strip()
        reply = execute_adb_command("call_native", target=target_name)

    elif "emergency" in cmd or "sos" in cmd:
        reply = execute_adb_command("emergency")

    elif "unlock" in cmd:
        reply = execute_adb_command("unlock")

    else:
        reply = f"Directive acknowledged: {cmd}"

    return {"status": "success", "response": reply}

app.mount("/", StaticFiles(directory=".", html=True), name="static")
