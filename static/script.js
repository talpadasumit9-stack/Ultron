const micBtn = document.getElementById('mic-btn');
const chatBox = document.getElementById('chat-box');
const statusText = document.getElementById('status-text');

// Speech Recognition Setup (Aapki aawaz sunne ke liye)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; // Isko 'hi-IN' kar sakte hain hindi ke liye
recognition.interimResults = false;

// Speech Synthesis Setup (Ultron ki aawaz bolne ke liye)
const synth = window.speechSynthesis;

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    // Voice ko thoda bhari aur robotic banane ke settings
    utterance.pitch = 0.1; 
    utterance.rate = 0.9;
    synth.speak(utterance);
}

function appendMessage(sender, message) {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
}

micBtn.addEventListener('click', () => {
    recognition.start();
    micBtn.classList.add('listening');
    micBtn.innerText = "Listening...";
    statusText.innerText = "Ultron is listening to your command...";
});

recognition.onresult = async (event) => {
    const userText = event.results[0][0].transcript;
    appendMessage("You", userText);
    
    micBtn.classList.remove('listening');
    micBtn.innerText = "🎙️ Start Voice Command";
    statusText.innerText = "Processing command...";

    try {
        // Render server par message bhejna
        const response = await fetch('/ask_ultron', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });
        
        const data = await response.json();
        const ultronReply = data.reply;
        
        appendMessage("Ultron", ultronReply);
        speak(ultronReply);
        statusText.innerText = "System Standby...";

    } catch (error) {
        console.error("Error:", error);
        statusText.innerText = "Connection Failed!";
        appendMessage("System", "Error connecting to Ultron Core.");
    }
};

recognition.onerror = (event) => {
    micBtn.classList.remove('listening');
    micBtn.innerText = "🎙️ Start Voice Command";
    statusText.innerText = "Audio capture failed. Try again.";
};

