const sysStatus = document.getElementById('sys-status');
const transcriptBox = document.getElementById('transcript-box');
const aiResponse = document.getElementById('ai-response');

const SECRET_CODE = "ultron initiate";
let isUnlocked = false;

// THREE.JS NEURAL CORE
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
    
    coreMesh.rotation.y += 0.008;
    coreMesh.rotation.x += 0.003;
    particleSystem.rotation.y -= 0.002;

    if(isSpeaking) {
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.25;
        coreMesh.scale.set(pulse, pulse, pulse);
        particleSystem.scale.set(pulse * 1.1, pulse * 1.1, pulse * 1.1);
    } else {
        coreMesh.scale.set(1, 1, 1);
        particleSystem.scale.set(1, 1, 1);
    }

    renderer.render(scene, camera);
}
animate();

// SPEECH RECOGNITION
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';

recognition.onresult = async (event) => {
    const text = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
    transcriptBox.innerText = `>> ${text}`;

    if (!isUnlocked) {
        if (text.includes(SECRET_CODE)) {
            isUnlocked = true;
            sysStatus.innerText = "SYSTEM ONLINE";
            sysStatus.style.borderColor = "#00ff66";
            sysStatus.style.color = "#00ff66";
            aiResponse.innerText = "Ultron: Neural connection established.";
        }
        return;
    }

    if (isUnlocked) {
        try {
            const res = await fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode: SECRET_CODE, command: text })
            });
            const data = await res.json();
            
            if(data.status === "success") {
                aiResponse.innerText = data.response;
                
                if(data.audio) {
                    const audio = new Audio(data.audio + "?t=" + new Date().getTime());
                    isSpeaking = true;
                    audio.play();
                    audio.onended = () => { isSpeaking = false; };
                }
            }
        } catch (e) {
            aiResponse.innerText = "Ultron: System link unstable.";
        }
    }
};

recognition.onend = () => recognition.start();
recognition.start();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
      
