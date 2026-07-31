from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask_ultron', methods=['POST'])
def ask_ultron():
    data = request.json
    user_message = data.get("message", "").lower()
    
    # Ultron Core Logic (Yahan aap baad mein asli AI API laga sakte hain)
    if "hello" in user_message or "hi" in user_message:
        reply = "Hello boss. All systems are online and fully functional."
    elif "who are you" in user_message or "tum kaun ho" in user_message:
        reply = "I am Ultron. An advanced artificial intelligence designed to assist you."
    elif "status" in user_message:
        reply = "Server is running perfectly on Render. Network connections are stable."
    else:
        reply = f"I received your command: {user_message}. I am still learning complex tasks."

    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
  
