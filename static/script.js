const correctCode = "1234"; 

// UI Elements
const micBtn = document.getElementById('mic-btn');
const chatBox = document.getElementById('chat-box');
const bodyTheme = document.getElementById('body-theme');
const systemTitle = document.getElementById('system-title');

// Speech Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; 
recognition.continuous = true; // Hamesha background mein sunne ke liye
recognition.interimResults = false;

const synth = window.speechSynthesis;
let isAwake = false; // Check karne ke liye ki Ultron alert hai ya nahi

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

// Lock Screen Logic - Unlock hote hi sunna shuru
function checkCode() {
    const entered = document.getElementById("passcode").value;
    if (entered === correctCode) {
        document.getElementById("lock-screen").classList.remove("active");
        document.getElementById("main-ui").classList.add("active");
        speak("Access granted. Initializing background listening protocol.");
        recognition.start(); // Unlock hote hi mic on
    } else {
        document.getElementById("lock-error").innerText = "ACCESS DENIED!";
    }
}

// Background Listening Logic
recognition.onresult = async (event) => {
    const last = event.results.length - 1;
    const userText = event.results[last][0].transcript.toLowerCase().trim();
    
    // Agar Ultron stand-by par hai aur usne apna naam suna
    if (!isAwake && userText.includes("ultron")) {
        isAwake = true;
        speak("Yes Boss, I am online and listening.");
        micBtn.classList.add('listening');
        micBtn.innerText = "ONLINE - WAITING FOR COMMAND";
        return; // Naam sun liya, ab agli line ka wait karega
    }

    // Agar Ultron alert hai aur command aati hai
    if (isAwake) {
        appendMessage("You", userText);
        micBtn.classList.remove('listening');
        micBtn.innerText = "PROCESSING...";

        // Theme check client-side
        if (userText.includes("change theme") || userText.includes("yellow theme")) {
            bodyTheme.className = "theme-yellow";
            systemTitle.innerText = "HOLOGRAPHIC OS";
        } else if (userText.includes("red theme")) {
            bodyTheme.className = "theme-red";
            systemTitle.innerText = "ULTRON OS";
        }

        // Server par request bhejna
        try {
            const response = await fetch('/ask_ultron', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });
            const data = await response.json();
            appendMessage("Ultron", data.reply);
            speak(data.reply);
        } catch (e) {
            appendMessage("System", "Network Error.");
        }

        // Command puri hone ke baad wapas so jayega aur "Ultron" wake word ka wait karega
        isAwake = false;
        micBtn.innerText = "STANDBY - WAITING FOR WAKE WORD";
    }
};

// Agar browser safety ki wajah se mic band kar de, toh use dobara chalu karna
recognition.onend = () => {
    if (document.getElementById("main-ui").classList.contains("active")) {
        recognition.start();
    }
};
