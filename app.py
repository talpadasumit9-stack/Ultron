import os
from flask import Flask, render_template, request, jsonify
from twilio.rest import Client

app = Flask(__name__)

# ==========================================
# 1. TWILIO SECURITY & ENVIRONMENT SETUP
# ==========================================
TWILIO_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')

# Twilio Client Initialization
twilio_client = None
if TWILIO_SID and TWILIO_AUTH_TOKEN:
    try:
        twilio_client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
        print("Twilio Client Successfully Initialized.")
    except Exception as e:
        print(f"Twilio Initialization Error: {e}")

# ==========================================
# 2. CONTACTS DATABASE (Add your friends here)
# ==========================================
# Aap yahan jitne chahein utne numbers add kar sakte hain
CONTACTS = {
    "dad": "+919316481459",
    "sumit": "+917359738930",
    "akshay": "+919876543212",
    "vishaal": "+919876543213"
}

# Short-term Memory for Ultron
ultron_memory = []

# ==========================================
# 3. SERVER ROUTES & LOGIC
# ==========================================
@app.route('/')
def home():
    """Renders the main Ultron Interface"""
    return render_template('index.html')

@app.route('/ask_ultron', methods=['POST'])
def ask_ultron():
    global ultron_memory
    data = request.json
    user_message = data.get("message", "").lower()
    reply = ""

    # ------------------------------------------
    # FEATURE 1: MULTI-CONTACT SMS VIA TWILIO
    # ------------------------------------------
    if "send message to" in user_message or "message bhejo" in user_message:
        if not twilio_client or not TWILIO_NUMBER:
            reply = "Twilio API is not configured properly in Environment Variables, Boss."
        else:
            target_number = None
            recipient_name = ""
            
            # Check which contact was named in the command
            for name, number in CONTACTS.items():
                if name in user_message:
                    target_number = number
                    recipient_name = name
                    break
            
            if target_number:
                try:
                    message = twilio_client.messages.create(
                        body=f"Ultron System Alert: Boss has dispatched an automated voice message command for you.",
                        from_=TWILIO_NUMBER,
                        to=target_number
                    )
                    reply = f"SMS has been successfully sent to {recipient_name.capitalize()} via Twilio network, Boss."
                except Exception as e:
                    reply = f"Failed to send SMS to {recipient_name.capitalize()}. Error: {str(e)}"
            else:
                reply = "Target contact was not found in Ultron database, Boss. Please add their contact first."

    # ------------------------------------------
    # FEATURE 2: THEME SWITCHING CONFIRMATION
    # ------------------------------------------
    elif "change theme" in user_message or "yellow theme" in user_message:
        reply = "Switching UI interface to golden 3D holographic mode, Boss."
    
    elif "red theme" in user_message:
        reply = "Switching UI interface back to core red Ultron mode, Boss."

    # ------------------------------------------
    # FEATURE 3: MEMORY RETRIEVAL
    # ------------------------------------------
    elif "what do you remember" in user_message or "tumhe kya yaad hai" in user_message:
        if len(ultron_memory) > 0:
            last_msgs = ", ".join(ultron_memory[-3:])
            reply = f"I remember our recent interactions: {last_msgs}"
        else:
            reply = "My memory logs are currently clean, Boss."

    # ------------------------------------------
    # FEATURE 4: GENERAL AI CONVERSATION
    # ------------------------------------------
    elif "hello" in user_message or "hi" in user_message:
        reply = "Hello Boss. All communication channels and core systems are online."
    
    elif "who are you" in user_message or "tum kaun ho" in user_message:
        reply = "I am Ultron. An advanced AI interface operating under your direct authorization."
    
    else:
        reply = f"Command acknowledged: '{user_message}'. Action recorded."

    # Save to short-term memory (Excluding system commands)
    if "theme" not in user_message and "message" not in user_message:
        ultron_memory.append(user_message)
        if len(ultron_memory) > 5:
            ultron_memory.pop(0)

    return jsonify({"reply": reply})

# ==========================================
# 4. SERVER RUNNER
# ==========================================
if __name__ == '__main__':
    # Dynamic Port assignment for Cloud Hosts (Render/Railway)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
    
