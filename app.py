from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Ultron ki Memory (Short-term)
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

    # Memory Check
    if "tumhe kya yaad hai" in user_message or "what do you remember" in user_message:
        if len(ultron_memory) > 0:
            reply = "I remember our last conversation. You said: " + ultron_memory[-1]
        else:
            reply = "My memory banks are currently empty, Boss."
    
    # Theme change command acknowledge
    elif "change theme" in user_message:
        reply = "Switching interface to alternative 3D holographic mode, Boss."
    
    # Normal commands
    elif "hello" in user_message or "hi" in user_message:
        reply = "Hello Boss. Core systems are online."
    else:
        reply = f"Command received: {user_message}. Processing data."

    # Baaton ko memory mein save karna
    if "change theme" not in user_message:
        ultron_memory.append(user_message)
        # Sirf last 5 baatein yaad rakhne ke liye taaki memory full na ho
        if len(ultron_memory) > 5:
            ultron_memory.pop(0)

    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    
