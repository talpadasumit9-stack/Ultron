from flask import Flask, render_template, request, jsonify
from twilio.rest import Client

app = Flask(__name__)

# --- TWILIO SETUP ---
# Yahan apni Twilio details dalein
TWILIO_SID = 'YOUR_TWILIO_ACCOUNT_SID'
TWILIO_AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN'
TWILIO_NUMBER = '+1234567890' # Twilio wala number

client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

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

    # SMS Bhejne ka Logic
    if "send message to dhaval" in user_message:
        try:
            # Dhaval ka real number yahan dalein (country code ke sath, jaise +91...)
            dhaval_number = "+919876543210" 
            msg = client.messages.create(
                body="Hello from Ultron. This is an automated system message.",
                from_=TWILIO_NUMBER,
                to=dhaval_number
            )
            reply = "Message has been successfully sent to Dhaval, Boss."
        except Exception as e:
            reply = "Sorry Boss, there was an error sending the message over the Twilio network."

    # Theme Logic
    elif "change theme" in user_message or "yellow theme" in user_message:
        reply = "Switching interface to alternative holographic mode."
    
    # Normal Conversation
    elif "hello" in user_message:
        reply = "Hello Boss. All systems are online."
    else:
        reply = f"Command processed: {user_message}."

    # Memory
    if "theme" not in user_message and "message" not in user_message:
        ultron_memory.append(user_message)
        if len(ultron_memory) > 5:
            ultron_memory.pop(0)

    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    
