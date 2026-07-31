const aiResponse = document.getElementById('ai-response');
const videoElement = document.getElementById('webcam');

// --- THREE.JS ULTRON CORE ---
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

let targetScale = 1.0;
let currentScale = 1.0;

function animate() {
    requestAnimationFrame(animate);
    
    // Smooth Scale Transition according to Hand Gestures
    currentScale += (targetScale - currentScale) * 0.1;
    coreMesh.scale.set(currentScale, currentScale, currentScale);
    particleSystem.scale.set(currentScale * 1.1, currentScale * 1.1, currentScale * 1.1);

    coreMesh.rotation.y += 0.005;
    particleSystem.rotation.y -= 0.002;

    renderer.render(scene, camera);
}
animate();

// --- DEEP ULTRON VOICE PROCESSOR ---
function speakUltron(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const deepVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
    if(deepVoice) utterance.voice = deepVoice;

    utterance.pitch = 0.2; // Maximum Deep Pitch
    utterance.rate = 0.85;  // Intimidating pacing

    window.speechSynthesis.speak(utterance);
}

// --- SPEECH RECOGNITION ---
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
            
            // Text automatically fades out after 5 seconds
            setTimeout(() => {
                aiResponse.innerText = "";
            }, 5000);
        }
    } catch (e) {
        aiResponse.innerText = "Connection Error";
    }
};

recognition.onend = () => recognition.start();
recognition.start();

// --- HAND GESTURE CONTROL (OPEN = BIG, CLOSE = SMALL) ---
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
        
        // Landmark 4 = Thumb tip, Landmark 8 = Index finger tip
        const thumb = landmarks[4];
        const index = landmarks[8];

        // Euclidean Distance between Thumb and Index
        const distance = Math.hypot(thumb.x - index.x, thumb.y - index.y);

        // Hand open (distance large) -> Core scales UP
        // Hand close/fist (distance small) -> Core scales DOWN
        targetScale = Math.min(Math.max(distance * 4.5, 0.4), 2.5);
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
