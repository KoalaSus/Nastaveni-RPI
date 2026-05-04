import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- DOM ELEMENTY ---
const canvas = document.getElementById('viewer');
const downloadBtn = document.getElementById("downloadBtn");

// --- STAV APLIKACE ---
let mesh = null;
let selectedFile = null;

// --- NASTAVENÍ THREE.JS ---
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
cam.position.set(30, 30, 50);

// --- SVĚTLA ---
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(100, 150, 100);
scene.add(dirLight);

// --- OVLÁDÁNÍ ---
const controls = new OrbitControls(cam, renderer.domElement);
controls.enableDamping = true;

// --- POMOCNÉ PRVKY (MŘÍŽKA) ---
const gridSize = 100;
const gridMM = new THREE.GridHelper(gridSize, 100, 0x444444, 0xcccccc);
scene.add(gridMM);

const gridCM = new THREE.GridHelper(gridSize, 10, 0x222222, 0x888888);
gridCM.position.y = -0.01;
scene.add(gridCM);

const axes = new THREE.AxesHelper(20);
axes.position.y = 0.1;
scene.add(axes);

// --- FUNKCE ---

/**
 * Inicializuje posluchače na položky seznamu vygenerované Flaskem
 */
function initFileItems() {
    const items = document.querySelectorAll('.file-item');
    
    items.forEach(li => {
        li.onclick = () => {
            // Vizuální označení aktivního souboru
            document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            
            // Získání názvu souboru z data-atributu, který jsme nastavili v HTML
            selectedFile = li.getAttribute('data-file');
            
            // Cesta k modelu (v rámci Flask statických souborů)
            loadModel('/static/scans/' + selectedFile);
            
            if (downloadBtn) downloadBtn.disabled = false;
        };
    });
}

/**
 * Načte STL model a umístí ho na scénu
 */
function loadModel(url) {
    const loader = new STLLoader();
    loader.load(url, (geometry) => {
        if (mesh) scene.remove(mesh);

        const material = new THREE.MeshPhongMaterial({ 
            color: 0x0077ff, 
            specular: 0x111111, 
            shininess: 100 
        });
        
        mesh = new THREE.Mesh(geometry, material);
        
        geometry.computeBoundingBox();
        const offset = geometry.boundingBox.getCenter(new THREE.Vector3());
        const size = geometry.boundingBox.getSize(new THREE.Vector3());
        
        // Zarovnání na střed mřížky a posazení "na zem" (Y=0)
        mesh.position.set(-offset.x, -geometry.boundingBox.min.y, -offset.z);
        mesh.scale.set(1, 1, 1); 

        scene.add(mesh);
        
        // Kamera se zaměří na střed modelu
        controls.target.set(0, size.y / 2, 0);
        controls.update();
    }, 
    // OnProgress
    undefined,
    // OnError
    (err) => {
        console.error("Chyba při načítání modelu:", err);
        alert("Model se nepodařilo načíst. Zkontrolujte cestu k souboru.");
    });
}

// Obsluha tlačítka pro stažení
if (downloadBtn) {
    downloadBtn.onclick = () => {
        if (selectedFile) {
            // Přímý odkaz na soubor ve static složce
            window.location.href = '/static/scans/' + selectedFile;
        }
    };
}

// Resizing
function onWindowResize() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    cam.aspect = canvas.clientWidth / canvas.clientHeight;
    cam.updateProjectionMatrix();
}

window.addEventListener('resize', onWindowResize);
onWindowResize();

// Animační smyčka
function anim() {
    requestAnimationFrame(anim);
    controls.update();
    renderer.render(scene, cam);
}

// --- SPUŠTĚNÍ ---
anim();
initFileItems(); // Aktivujeme klikání na seznam vygenerovaný serverem