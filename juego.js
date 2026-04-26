const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

// Elementos de la interfaz
const menu = document.getElementById('menu');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const hud = document.getElementById('hud');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const menuTitle = document.getElementById('menu-title');

// --- SISTEMA RESPONSIVO ---
const ANCHO_BASE = 400;
const ALTO_BASE = 600;

function ajustarResolucion() {
    // Escala basada en el ancho y alto de la pantalla, dejando un pequeño margen (10px)
    const escala = Math.min((window.innerWidth - 10) / ANCHO_BASE, (window.innerHeight - 10) / ALTO_BASE);
    
    // Mantiene la lógica del juego constante
    canvas.width = ANCHO_BASE;
    canvas.height = ALTO_BASE;
    
    // Aplica la escala al contenedor completo para que los botones (HUD) también se adapten
    container.style.width = `${ANCHO_BASE * escala}px`;
    container.style.height = `${ALTO_BASE * escala}px`;
}

// Ejecutar al cargar la página y al cambiar el tamaño de la ventana (rotar celular)
window.addEventListener('resize', ajustarResolucion);
window.addEventListener('load', ajustarResolucion);

// Variables del juego
let animacionId;
let jugando = false;
let pause = false;
let puntos = 0;
let vidas = 3;
let frameCount = 0;

// Cargar Imágenes
const jugadorImg = new Image();
jugadorImg.src = 'img/panda.png';

const cocodriloImg = new Image();
cocodriloImg.src = 'img/cocodrilo.png';

// Objeto Jugador
const jugador = {
    x: 175,
    y: 500,
    width: 50,
    height: 50,
    velocidad: 5,
    dx: 0
};

let cocodrilos = [];

// --- CONTROLES DE TECLADO (PC) ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') jugador.dx = -jugador.velocidad;
    if (e.key === 'ArrowRight' || e.key === 'd') jugador.dx = jugador.velocidad;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') {
        jugador.dx = 0;
    }
});

// --- CONTROLES TÁCTILES (CELULAR) ---
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;

    // Si toca la mitad izquierda del canvas visual
    if (touchX < rect.width / 2) {
        jugador.dx = -jugador.velocidad;
    } else {
        jugador.dx = jugador.velocidad;
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    jugador.dx = 0;
}, { passive: false });


// --- LÓGICA PRINCIPAL ---
function generarCocodrilos() {
    if (frameCount % 60 === 0) {
        let xAleatorio = Math.random() * (canvas.width - 80);
        cocodrilos.push({
            x: xAleatorio,
            y: -50,
            width: 80,
            height: 30,
            velocidad: 3 + Math.random() * 2
        });
    }
}

function actualizarJuego() {
    if (!jugando || pause) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mover jugador
    jugador.x += jugador.dx;
    if (jugador.x < 0) jugador.x = 0;
    if (jugador.x + jugador.width > canvas.width) jugador.x = canvas.width - jugador.width;
    
    // Dibujar jugador
    if(jugadorImg.complete && jugadorImg.naturalWidth !== 0) {
        ctx.drawImage(jugadorImg, jugador.x, jugador.y, jugador.width, jugador.height);
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(jugador.x, jugador.y, jugador.width, jugador.height);
    }

    // Cocodrilos
    generarCocodrilos();

    for (let i = 0; i < cocodrilos.length; i++) {
        let croc = cocodrilos[i];
        croc.y += croc.velocidad;

        if(cocodriloImg.complete && cocodriloImg.naturalWidth !== 0) {
            ctx.drawImage(cocodriloImg, croc.x, croc.y, croc.width, croc.height);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(croc.x, croc.y, croc.width, croc.height);
        }

        // Colisiones
        if (
            jugador.x < croc.x + croc.width &&
            jugador.x + jugador.width > croc.x &&
            jugador.y < croc.y + croc.height &&
            jugador.y + jugador.height > croc.y
        ) {
            vidas--;
            livesDisplay.innerText = vidas;
            cocodrilos.splice(i, 1);
            
            if (vidas <= 0) {
                terminarJuego();
            }
        }

        // Puntos
        if (croc && croc.y > canvas.height) {
            cocodrilos.splice(i, 1);
            puntos += 10;
            scoreDisplay.innerText = puntos;
            i--; 
        }
    }
    
    frameCount++;
    animacionId = requestAnimationFrame(actualizarJuego);
}

// --- FUNCIONES DE BOTONES E INTERFAZ ---
function iniciarJuego() {
    menu.style.display = 'none';
    hud.style.display = 'flex'; 
    
    jugando = true;
    pause = false; 
    puntos = 0;
    vidas = 3;
    cocodrilos = [];
    jugador.x = 175;
    
    scoreDisplay.innerText = puntos;
    livesDisplay.innerText = vidas;
    pauseBtn.innerText = 'Pausar';
    
    frameCount = 0;
    ajustarResolucion(); // Re-ajusta por si hubo un cambio
    actualizarJuego();
}

function terminarJuego() {
    jugando = false;
    cancelAnimationFrame(animacionId);
    menu.style.display = 'flex';
    hud.style.display = 'none';
    menuTitle.innerText = `¡Terminado! Puntos: ${puntos}`;
    startBtn.innerText = 'Reiniciar';
}

// Eventos de los botones
startBtn.addEventListener('click', iniciarJuego);

homeBtn.addEventListener('click', () => {
    jugando = false;
    pause = false; 
    cancelAnimationFrame(animacionId);
    
    hud.style.display = 'none';
    menu.style.display = 'flex';
    menuTitle.innerText = 'El Río Peligroso';
    startBtn.innerText = 'Jugar';
});

restartBtn.addEventListener('click', () => {
    cancelAnimationFrame(animacionId);
    iniciarJuego();
});

pauseBtn.addEventListener('click', () => {
    if (!jugando) return; 
    pause = !pause; 
    if (pause) { 
        cancelAnimationFrame(animacionId);
        pauseBtn.innerText = 'Reanudar'; 
    } else {
        pauseBtn.innerText = 'Pausar'; 
        actualizarJuego();
    }
});