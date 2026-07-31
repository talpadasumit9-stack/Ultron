// --- SECURITY SYSTEM ---
const correctCode = "xo23"; // Yahan apna secret code daalein!

function checkCode() {
    const entered = document.getElementById("passcode").value;
    if (entered === correctCode) {
        document.getElementById("lock-screen").classList.remove("active");
        document.getElementById("main-ui").classList.add("active");
        speak("Access granted. Welcome back, Boss.");
    } else {
        document.getElementById("lock-error").innerText = "ACCESS DENIED!";
    }
}

// --- VOICE & THEME SYSTEM ---
const micBtn = document.getElementById('mic-btn');
const chatBox = document.getElementById('chat-box');
const bodyTheme = document.getElementById('body-theme');
const systemTitle = document.getElementById('system-title');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; 
const synth = window.speechSynthesis;

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.2; 
    utterance.rate = 0.9;
    synth.speak(utterance);
}

function appendMessage(sender, message) {
    chatBox.innerHTML += `<p><strong>${sender}:</strong> ${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

micBtn.addEventListener('click', () => {
    recognition.start();
    micBtn.classList.add('listening');
    micBtn.innerText = "LISTENING...";
});

recognition.onresult = async (event) => {
    const userText = event.results[0][0].transcript.toLowerCase();
    appendMessage("You", userText);
    micBtn.classList.remove('listening');
    micBtn.innerText = "🎙️ INITIATE COMMAND";

    // CLIENT SIDE THEME SWITCH LOGIC
    if (userText.includes("change theme") || userText.includes("yellow theme")) {
        bodyTheme.className = "theme-yellow";
        systemTitle.innerText = "HOLOGRAPHIC OS";
    } else if (userText.includes("red theme")) {
        bodyTheme.className = "theme-red";
        systemTitle.innerText = "ULTRON OS";
    }

    // SERVER KO MESSAGE BHEJNA
    try {
        const response = await fetch('/ask_ultron', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });
        const data = await response.json();
        appendMessage("System", data.reply);
        speak(data.reply);
    } catch (e) {
        appendMessage("System", "Network Error.");
    }
};

recognition.onerror = () => {
    micBtn.classList.remove('listening');
    micBtn.innerText = "🎙️ INITIATE COMMAND";
};
