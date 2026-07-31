const sysStatus = document.getElementById('sys-status');
const transcriptBox = document.getElementById('transcript-box');
const aiResponse = document.getElementById('ai-response');
const videoElement = document.getElementById('webcam');

// --- THREE.JS NEURAL CORE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const coreGeom = new THREE.SphereGeometry(6, 32, 32);
const coreMat = new THREE.MeshBasicMaterial({ color: 0xff3300, wireframe: true });
const coreMesh = new THREE.Mesh(coreGeom, coreMat);
scene.add(coreMesh);

const particleCount = 2000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for(let i=0; i < particleCount * 3; i+=3) {
    positions[i] = (Math.random() - 0.5) * 40;
    positions[i+1] = (Math.random() - 0.5) * 40;
    positions[i+2] = (Math.random() - 0.5) * 40;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
    color: 0xffaa00,
    size: 0.25,
    transparent: true,
    opacity: 0.8
});
const particleSystem = new THREE.Points(particles, particleMat);
scene.add(particleSystem);

camera.position.z = 30;

let isSpeaking = false;

function animate() {
    requestAnimationFrame(animate);
    
    coreMesh.rotation.y += 0.005;
    particleSystem.rotation.y -= 0.002;

    if(isSpeaking) {
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.25;
        coreMesh.scale.set(pulse, pulse, pulse);
        particleSystem.scale.set(pulse * 1.1, pulse * 1.1, pulse * 1.1);
    }

    renderer.render(scene, camera);
}
animate();

// --- BROWSER VOICE SPEECH SYNTHESIS ---
function speakUltron(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const deepVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Male") || v.lang === "en-US");
    if(deepVoice) utterance.voice = deepVoice;

    utterance.pitch = 0.5; // Deep voice
    utterance.rate = 0.9;

    utterance.onstart = () => { isSpeaking = true; };
    utterance.onend = () => { 
        isSpeaking = false;
        coreMesh.scale.set(1, 1, 1);
        particleSystem.scale.set(1, 1, 1);
    };

    window.speechSynthesis.speak(utterance);
}

// --- SPEECH RECOGNITION (NO PASSCODE NEEDED) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';

recognition.onresult = async (event) => {
    const text = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
    transcriptBox.innerText = `>> ${text}`;

    // Direct command execution
    try {
        const res = await fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: text })
        });
        const data = await res.json();
        
        if(data.status === "success") {
            aiResponse.innerText = data.response;
            speakUltron(data.response);
        }
    } catch (e) {
        aiResponse.innerText = "Ultron: Link connection failed.";
    }
};

recognition.onend = () => recognition.start();
recognition.start();

// --- MEDIAPIPE HAND TRACKING CONTROL ---
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        const indexX = landmarks[8].x;
        const indexY = landmarks[8].y;

        coreMesh.rotation.y = (indexX - 0.5) * 10;
        coreMesh.rotation.x = (indexY - 0.5) * 10;
        particleSystem.rotation.y = (indexX - 0.5) * 5;
    }
});

const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
cameraUtils.start();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
