const aiResponse = document.getElementById('ai-response');
const videoElement = document.getElementById('webcam');

// --- THREE.JS ORANGE/GOLD ULTRON CORE (00:27 VIDEO THEME) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const coreGeom = new THREE.SphereGeometry(6, 36, 36);
const coreMat = new THREE.MeshBasicMaterial({ color: 0xff4400, wireframe: true });
const coreMesh = new THREE.Mesh(coreGeom, coreMat);
scene.add(coreMesh);

const particleCount = 2500;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for(let i=0; i < particleCount * 3; i+=3) {
    positions[i] = (Math.random() - 0.5) * 50;
    positions[i+1] = (Math.random() - 0.5) * 50;
    positions[i+2] = (Math.random() - 0.5) * 50;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
    color: 0xffaa00,
    size: 0.28,
    transparent: true,
    opacity: 0.85
});
const particleSystem = new THREE.Points(particles, particleMat);
scene.add(particleSystem);

camera.position.z = 30;

let targetScale = 1.0;
let currentScale = 1.0;
let rotationSpeed = 0.005;

function animate() {
    requestAnimationFrame(animate);

    currentScale += (targetScale - currentScale) * 0.1;
    coreMesh.scale.set(currentScale, currentScale, currentScale);
    particleSystem.scale.set(currentScale * 1.1, currentScale * 1.1, currentScale * 1.1);

    coreMesh.rotation.y += rotationSpeed;
    particleSystem.rotation.y -= 0.002;

    renderer.render(scene, camera);
}
animate();

// --- DEEP ULTRON ROBOTIC VOICE ---
function speakUltron(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const deepVoice = voices.find(v => v.name.includes("David") || v.name.includes("Google UK English Male") || v.lang === "en-US");
    if(deepVoice) utterance.voice = deepVoice;

    utterance.pitch = 0.1;
    utterance.rate = 0.82;

    window.speechSynthesis.speak(utterance);
}

// --- VOICE COMMAND RECOGNITION ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';

recognition.onresult = async (event) => {
    const text = event.results[event.resultIndex][0].transcript.toLowerCase().trim();

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

            setTimeout(() => { aiResponse.innerText = ""; }, 5000);
        }
    } catch (e) {
        aiResponse.innerText = "Link connection failed.";
    }
};

recognition.onend = () => recognition.start();
recognition.start();

// --- MULTI GESTURE HAND CONTROL ---
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

        const thumb = landmarks[4];
        const index = landmarks[8];
        const middle = landmarks[12];

        // Gesture 1: Hand Open/Close (Scale Core)
        const distanceHand = Math.hypot(thumb.x - index.x, thumb.y - index.y);
        targetScale = Math.min(Math.max(distanceHand * 4.5, 0.3), 2.8);

        // Gesture 2: Two Fingers Raised (Hyper Spin + Glow)
        const isTwoFingersUp = (index.y < landmarks[6].y) && (middle.y < landmarks[10].y) && (landmarks[16].y > landmarks[14].y);

        if(isTwoFingersUp) {
            rotationSpeed = 0.05;
            coreMat.color.setHex(0xffaa00);
        } else {
            rotationSpeed = 0.005;
            coreMat.color.setHex(0xff4400);
        }
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
                
