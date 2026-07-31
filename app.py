import os
from flask import Flask, render_template, request, jsonify
from twilio.rest import Client

app = Flask(__name__)

# --- TWILIO ENVIRONMENT VARIABLES SETUP ---
# System variables se details retrieve karna
TWILIO_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')

# Twilio Client Initialization
twilio_client = None
if TWILIO_SID and TWILIO_AUTH_TOKEN:
    try:
        twilio_client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
    except Exception as e:
        print(f"Twilio initialization error: {e}")

ultron_memory = []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask_ultron', methods=['POST'])
def ask_ultron():
    global ultron_memory
    data = request.json
    user_message = data.get("message", "").lower()
    reply = ""

    # --- SMS COMMAND HANDLING ---
    if "send message" in user_message or "message bhejo" in user_message:
        if not twilio_client or not TWILIO_NUMBER:
            reply = "Twilio API is not configured properly, Boss. Please check Environment Variables."
        else:
            try:
                # Aap dynamic recipient number & message logic pass kar sakte hain
                target_number = os.environ.get('DEFAULT_TARGET_NUMBER', '+910000000000')
                
                message = twilio_client.messages.create(
                    body=f"Ultron Alert: Command executed - '{user_message}'",
                    from_=TWILIO_NUMBER,
                    to=target_number
                )
                reply = f"SMS has been successfully dispatched via Twilio Network, Boss."
            except Exception as e:
                reply = f"Failed to send SMS via Twilio. Error: {str(e)}"

    # --- THEME COMMANDS ---
    elif "change theme" in user_message or "yellow theme" in user_message:
        reply = "Switching interface to alternative holographic mode, Boss."
    
    # --- GENERAL RESPONSES ---
    elif "hello" in user_message or "hi" in user_message:
        reply = "Hello Boss. All systems and communication protocols are online."
    else:
        reply = f"Command processed: {user_message}."

    # Memory Tracking
    if "theme" not in user_message and "message" not in user_message:
        ultron_memory.append(user_message)
        if len(ultron_memory) > 5:
            ultron_memory.pop(0)

    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
                              
