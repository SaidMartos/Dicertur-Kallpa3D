import { addInteraction, updateDisplay, reset, counterInstance } from './counter.js';

// Mapa para rastrear el estado de las teclas presionadas
const pressedKeys = {};
const keyCounted = {}; 

// ---------------------------------------------------------------------
// 1. Detección de Entorno y Configuración de UI
// ---------------------------------------------------------------------
const isUnityScene = document.getElementById('unity-canvas') !== null;
const statusElement = document.getElementById('current-status');
const detectorElement = document.getElementById('interaction-detector');
const toggleButton = document.getElementById('toggle-button');
const resetButton = document.getElementById('reset-button');
const finishButton = document.getElementById('finish-button'); 
const detectorToggleButton = document.getElementById('detector-toggle-btn'); // Botón del menú
const detectorCloseButton = document.getElementById('detector-close-btn'); // Botón para cerrar menú
const detectorContent = document.getElementById('detector-content'); // Contenido del menú

// 🚨 SOLUCIÓN DE LA RUTA: Definimos la URL de forma condicional/relativa
let FORM_URL;

if (isUnityScene) {
    // Si estamos en una escena 3D (ej: /Modelos 3D/Cuarto_De_Rescate/Cuarto_De_Rescate.html)
    // Necesitamos subir 2 niveles desde la carpeta de la escena para llegar a la raíz.
    // Cuarto_De_Rescate.html sube a Modelos 3D/, luego sube a la raíz (donde está formulario.html)
    FORM_URL = "../../encuesta.html"; 
    
    // NOTA: Si usaras una ruta absoluta (ej: /formulario.html), funcionaría,
    // pero depende de que se sirva desde un servidor raíz. Usamos rutas relativas.
    
} else {
    // Si estamos en carrucel.html (que está en la raíz)
    // El script está en /js/, así que la ruta correcta para salir y llegar a formulario.html es ../
    FORM_URL = "encuesta.html"; 
}


let isRecording = true; 

if (!isUnityScene) {
    if (statusElement) {
        statusElement.innerText = "En Menú (No cuenta interacciones)";
    }
    if (detectorElement) {
        detectorElement.classList.add('is-menu');
    }
}


// ---------------------------------------------------------------------
// 2. Lógica de Control (Pausar/Reiniciar/FINALIZAR)
// ---------------------------------------------------------------------

function toggleRecording() {
    isRecording = !isRecording;
    if (statusElement) {
        statusElement.innerText = isRecording ? "Grabando" : "Pausado";
    }
    if (toggleButton) {
        document.getElementById('button-icon').innerText = isRecording ? '⏸️' : '▶️';
    }
}

function handleReset() {
    if ((window.confirm || console.log)('¿Estás seguro de que quieres reiniciar el contador a cero?')) {
        reset();
        isRecording = true;
        if (statusElement) {
            statusElement.innerText = "Grabando";
        }
        if (toggleButton) {
            document.getElementById('button-icon').innerText = '⏸️';
        }
    }
}

// FUNCIÓN CLAVE: Maneja el clic en el botón de finalizar
function handleFinish() {
    if (!(window.confirm || console.log)('¿Deseas finalizar la interacción y acceder a la encuesta?')) {
        return;
    }
    
    reset();
    
    // Usa la URL definida condicionalmente arriba.
    window.location.replace(FORM_URL); 
}

// FUNCIÓN PARA EL MENÚ DESPLEGABLE
function toggleDetectorMenu() {
    const isOpen = detectorElement.classList.toggle('is-open');
    const arrow = document.getElementById('detector-arrow');
    if (arrow) {
        arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)'; // La flecha sigue girando
    }
    // --- INICIO: Lógica para mostrar/ocultar botones ---
    // Si el menú está abierto, oculta el botón de abrir (▼). Si está cerrado, lo muestra.
    if (detectorToggleButton) detectorToggleButton.style.display = isOpen ? 'none' : 'block';
    // --- FIN: Lógica para mostrar/ocultar botones ---
}


// ---------------------------------------------------------------------
// 3. Lógica de Teclado y Conteo
// ---------------------------------------------------------------------

function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    
    pressedKeys[key] = true;

    if (key === ' ' || key === 'w' || key === 'g') {
        event.preventDefault();
    }

    if (!isUnityScene || !isRecording) {
        return; 
    }

    if (pressedKeys[' ']) {
        const targetKeys = ['w', 'g'];
        if (targetKeys.includes(key)) {
            const comboKey = `space+${key}`; 
            if (!keyCounted[comboKey]) {
                addInteraction(key);
                keyCounted[comboKey] = true;
            }
        }
    }
}

function handleKeyUp(event) {
    const key = event.key.toLowerCase();
    pressedKeys[key] = false;

    if (key === 'w' || key === 'g') {
        keyCounted[`space+${key}`] = false;
    }
    if (key === ' ') {
        keyCounted['space+w'] = false;
        keyCounted['space+g'] = false;
    }
}

// ---------------------------------------------------------------------
// 4. Attach Event Listeners
// ---------------------------------------------------------------------

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

if (toggleButton) {
    toggleButton.addEventListener('click', toggleRecording);
}
if (resetButton) {
    resetButton.addEventListener('click', handleReset);
}
// EVENT LISTENER para el botón de finalizar
if (finishButton) {
    finishButton.addEventListener('click', handleFinish);
}

// EVENT LISTENER para el menú desplegable
if (detectorToggleButton) {
    detectorToggleButton.addEventListener('click', toggleDetectorMenu);
}

// EVENT LISTENER para el nuevo botón de cierre
if (detectorCloseButton) {
    detectorCloseButton.addEventListener('click', toggleDetectorMenu);
}

document.addEventListener('DOMContentLoaded', updateDisplay);

window.confirm = window.confirm || function(message) {
    console.log("Simulación de confirmación: " + message);
    return true; 
};