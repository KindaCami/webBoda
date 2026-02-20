import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('container-3d').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(0, 10, 10);
scene.add(dirLight);

const fadeOverlay = document.getElementById('fade-overlay');
const welcomeMsg  = document.getElementById('welcome-msg');

let controls, spaceModel, nave2, mixer;
let isTraveling = false;
let travelTime  = 0;
let fadeFired   = false;
const clock = new THREE.Clock();

// ── AUDIO ──────────────────────────────────────────
const audio = new Audio('/audio/Aerea.mp3');
audio.currentTime = 39;
audio.volume = 0;   // empieza en 0 para hacer fade in
audio.loop = false;

let audioStarted = false;

// Fade in suave desde 0 hasta 0.75
function fadeInAudio(targetVol = 0.75, duration = 3000) {
    const steps = duration / 50;
    const step  = targetVol / steps;
    const interval = setInterval(() => {
        if (audio.volume < targetVol - step) {
            audio.volume = Math.min(targetVol, audio.volume + step);
        } else {
            audio.volume = targetVol;
            clearInterval(interval);
        }
    }, 50);
}

function startAudio() {
    if (audioStarted) return;
    audioStarted = true;
    audio.currentTime = 39;
    audio.volume = 0;
    audio.play()
        .then(() => fadeInAudio(0.75, 3000))
        .catch(e => {
            console.log('Autoplay bloqueado, esperando interacción:', e);
            audioStarted = false;
        });
}

function onFirstGesture() {
    startAudio();
    document.removeEventListener('click',      onFirstGesture);
    document.removeEventListener('keydown',    onFirstGesture);
    document.removeEventListener('touchstart', onFirstGesture);
}
document.addEventListener('click',      onFirstGesture);
document.addEventListener('keydown',    onFirstGesture);
document.addEventListener('touchstart', onFirstGesture);

// Fade out suave — guarda la posición para que login-form continúe
function fadeOutAudio(duration = 1500) {
    // Guardar posición actual para que login-form arranque desde aquí
    localStorage.setItem('audioTime',   audio.currentTime.toString());
    localStorage.setItem('audioContinue', '1');

    const startVol = audio.volume;
    const steps    = duration / 50;
    const step     = startVol / steps;
    const interval = setInterval(() => {
        if (audio.volume > step) {
            audio.volume = Math.max(0, audio.volume - step);
        } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(interval);
        }
    }, 50);
}
// ───────────────────────────────────────────────────

// Mostrar mensaje de bienvenida e intentar arrancar audio
setTimeout(() => {
    if (welcomeMsg) welcomeMsg.classList.add('visible');
    startAudio(); // intento directo (funciona si el navegador lo permite)
}, 300);

const loader = new GLTFLoader();

loader.load('/models/espacio.glb', (gltf) => {
    spaceModel = gltf.scene;

    const box    = new THREE.Box3().setFromObject(spaceModel);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());

    spaceModel.position.x += (spaceModel.position.x - center.x);
    spaceModel.position.y += (spaceModel.position.y - center.y);
    spaceModel.position.z += (spaceModel.position.z - center.z);

    scene.add(spaceModel);

    nave2 = spaceModel.getObjectByName('Nave_2');

    if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(spaceModel);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    }

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov    = camera.fov * (Math.PI / 180);
    let cameraZ  = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 0.9;

    camera.position.set(0, 0, cameraZ);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom    = true;
    controls.autoRotate    = false;

    // Después de 5s: ocultar mensaje y empezar viaje
    setTimeout(() => {
        if (welcomeMsg) welcomeMsg.classList.remove('visible');
        setTimeout(() => {
            isTraveling = true;
            travelTime  = 0;
            if (controls) controls.enabled = false;
        }, 800);
    }, 5000);

}, undefined, (err) => console.error(err));

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    if (spaceModel) {
        if (!isTraveling) {
            if (controls) controls.update();
        } else {
            travelTime += delta;

            const naveWorldPos = new THREE.Vector3();
            nave2.getWorldPosition(naveWorldPos);

            const distanceBehind = Math.max(150 * Math.exp(-travelTime * 0.15), 5);
            const heightOffset   = Math.max(30  * Math.exp(-travelTime * 0.2),  0);

            const targetCamPos = new THREE.Vector3(
                naveWorldPos.x,
                naveWorldPos.y + heightOffset,
                naveWorldPos.z - distanceBehind
            );

            const lerpSpeed = Math.min(0.03 + travelTime * 0.01, 0.15);
            camera.position.lerp(targetCamPos, lerpSpeed);
            camera.lookAt(naveWorldPos);

            camera.fov = Math.min(75 + travelTime * 3, 110);
            camera.updateProjectionMatrix();

            if (travelTime > 8 && !fadeFired) {
                fadeFired = true;
                fadeOutAudio(1500); // fade out sincronizado con el negro
                fadeOverlay.style.opacity = '1';
                setTimeout(() => {
                    window.location.href = '/login-form';
                }, 1600);
            }
        }
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
