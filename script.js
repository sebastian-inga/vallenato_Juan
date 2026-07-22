document.addEventListener('DOMContentLoaded', function() {
    console.log("Página Premium con Pac-Man, Radio y Paint cargada.");
    inicializarPaint();
    inicializarPacman();
});

// ==============================================
// 1. LÓGICA DEL REPRODUCTOR DE MÚSICA
// ==============================================
function reproducirCancion(elemento) {
    const audio = elemento.querySelector('audio');
    const iconoPlay = elemento.querySelector('.icono-play i');
    const todasLasCanciones = document.querySelectorAll('.tarjeta-cancion');
    
    todasLasCanciones.forEach(cancion => {
        if (cancion !== elemento) {
            const otrosAudios = cancion.querySelector('audio');
            const otrosIconos = cancion.querySelector('.icono-play i');
            if (otrosAudios) { otrosAudios.pause(); otrosAudios.currentTime = 0; }
            if (otrosIconos) { otrosIconos.classList.remove('fa-pause-circle'); otrosIconos.classList.add('fa-play-circle'); }
            cancion.classList.remove('reproduciendo');
        }
    });

    if (audio.paused) {
        audio.play();
        iconoPlay.classList.remove('fa-play-circle');
        iconoPlay.classList.add('fa-pause-circle');
        elemento.classList.add('reproduciendo');
    } else {
        audio.pause();
        iconoPlay.classList.remove('fa-pause-circle');
        iconoPlay.classList.add('fa-play-circle');
        elemento.classList.remove('reproduciendo');
    }
    audio.onended = function() {
        iconoPlay.classList.remove('fa-pause-circle');
        iconoPlay.classList.add('fa-play-circle');
        elemento.classList.remove('reproduciendo');
    };
}

// ==============================================
// 2. LÓGICA DE LA PIZARRA (PAINT)
// ==============================================
function inicializarPaint() {
    const canvas = document.getElementById('pizarra');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = rect.height;

    let dibujando = false;
    const colorPicker = document.getElementById('colorPicker');
    const sizePicker = document.getElementById('sizePicker');
    const toolPicker = document.getElementById('toolPicker');
    const clearBtn = document.getElementById('clearBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    let color = colorPicker.value; let size = sizePicker.value; let tool = toolPicker.value;
    let history = []; let historyIndex = -1;

    function guardarEstado() {
        if (historyIndex < history.length - 1) history = history.slice(0, historyIndex + 1);
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        historyIndex++;
        if (history.length > 20) { history.shift(); historyIndex--; }
    }
    guardarEstado();

    colorPicker.addEventListener('input', (e) => color = e.target.value);
    sizePicker.addEventListener('input', (e) => size = e.target.value);
    toolPicker.addEventListener('change', (e) => tool = e.target.value);

    function getMousePos(evt) {
        const rect = canvas.getBoundingClientRect();
        return { x: (evt.clientX - rect.left) * (canvas.width / rect.width), y: (evt.clientY - rect.top) * (canvas.height / rect.height) };
    }

    canvas.addEventListener('mousedown', (e) => { dibujando = true; const pos = getMousePos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); });
    canvas.addEventListener('mousemove', (e) => {
        if (!dibujando) return;
        const pos = getMousePos(e);
        ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (tool === 'eraser') { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = parseInt(size) + 5; } 
        else { ctx.strokeStyle = color; }
        ctx.lineTo(pos.x, pos.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    });
    canvas.addEventListener('mouseup', () => { if (dibujando) { dibujando = false; guardarEstado(); } });
    canvas.addEventListener('mouseout', () => { if (dibujando) { dibujando = false; guardarEstado(); } });

    undoBtn.addEventListener('click', () => { if (historyIndex > 0) { historyIndex--; ctx.putImageData(history[historyIndex], 0, 0); } });
    redoBtn.addEventListener('click', () => { if (historyIndex < history.length - 1) { historyIndex++; ctx.putImageData(history[historyIndex], 0, 0); } });
    clearBtn.addEventListener('click', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); guardarEstado(); });
}

// ==============================================
// 3. LÓGICA DEL JUEGO PAC-MAN (MOTOR AVANZADO)
// ==============================================
function inicializarPacman() {
    const canvas = document.getElementById('juegoCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800; canvas.height = 550;

    // Configuración del Laberinto (1 = Pared, 0 = Camino, 2 = Punto)
    const map = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
        [1,2,1,0,1,2,1,0,1,2,2,2,1,0,1,2,1,0,1,2,1],
        [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
        [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
        [1,2,2,2,2,2,1,2,2,2,0,2,2,2,1,2,2,2,2,2,1],
        [1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        [0,0,0,0,1,2,1,0,1,1,1,1,1,0,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,0,1,0,0,0,1,0,1,2,1,1,1,1,1],
        [0,0,0,0,0,2,2,2,1,0,0,0,1,2,2,2,0,0,0,0,0],
        [1,1,1,1,1,2,1,0,1,0,0,0,1,0,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,1,1,1,1,1,0,1,2,1,0,0,0,0],
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
        [1,2,1,1,1,2,1,1,1,2,2,2,1,1,1,2,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    const TILE_SIZE = 24;
    let score = 0;
    let lives = 3;

    // Jugador (Pac-Man)
    let pacman = { x: 10, y: 11, dx: 0, dy: 0, mouth: 0 };

    // Fantasmas (IA)
    let ghosts = [
        { x: 10, y: 9, dx: 0, dy: 1, color: '#FF0000' },
        { x: 9, y: 11, dx: 1, dy: 0, color: '#FFB8FF' },
        { x: 11, y: 11, dx: -1, dy: 0, color: '#00FFFF' },
        { x: 10, y: 13, dx: 0, dy: -1, color: '#FFB852' }
    ];

    // Variables de control
    let keys = {};
    document.addEventListener('keydown', (e) => { keys[e.key] = true; });
    document.addEventListener('keyup', (e) => { keys[e.key] = false; });

    function getTile(x, y) {
        if (x < 0 || x >= map[0].length || y < 0 || y >= map.length) return 1;
        return map[y][x];
    }

    function moveEntity(entity, speed) {
        let newX = entity.x + entity.dx * speed;
        let newY = entity.y + entity.dy * speed;
        // Movimiento continuo basado en píxeles flotantes
        if (getTile(Math.round(newX), Math.round(newY)) !== 1) {
            entity.x = newX;
            entity.y = newY;
        } else {
            // Si choca con una pared, se detiene en la celda exacta
            entity.x = Math.round(entity.x);
            entity.y = Math.round(entity.y);
            if (entity.dx !== 0) entity.dx = 0;
            if (entity.dy !== 0) entity.dy = 0;
        }
    }

    function update() {
        // 1. Movimiento de Pac-Man
        if (keys['ArrowUp'] && getTile(Math.round(pacman.x), Math.round(pacman.y - 1)) !== 1) { pacman.dx = 0; pacman.dy = -0.05; }
        if (keys['ArrowDown'] && getTile(Math.round(pacman.x), Math.round(pacman.y + 1)) !== 1) { pacman.dx = 0; pacman.dy = 0.05; }
        if (keys['ArrowLeft'] && getTile(Math.round(pacman.x - 1), Math.round(pacman.y)) !== 1) { pacman.dx = -0.05; pacman.dy = 0; }
        if (keys['ArrowRight'] && getTile(Math.round(pacman.x + 1), Math.round(pacman.y)) !== 1) { pacman.dx = 0.05; pacman.dy = 0; }
        
        moveEntity(pacman, 1);
        pacman.mouth += 0.2;

        // 2. Comer puntos y frutas
        let tileX = Math.round(pacman.x);
        let tileY = Math.round(pacman.y);
        if (map[tileY][tileX] === 2) {
            map[tileY][tileX] = 0;
            score += 10;
        }
        // Cerezas especiales
        if (tileX === 10 && tileY === 11) { score += 100; }

        // 3. Movimiento de Fantasmas (IA simple de persecución)
        ghosts.forEach(g => {
            // Si no se mueve, calcular nueva dirección hacia Pac-Man
            if (g.dx === 0 && g.dy === 0) {
                let dx = pacman.x - g.x;
                let dy = pacman.y - g.y;
                if (Math.abs(dx) > Math.abs(dy)) {
                    g.dx = Math.sign(dx) * 0.03;
                    g.dy = 0;
                } else {
                    g.dx = 0;
                    g.dy = Math.sign(dy) * 0.03;
                }
            }
            moveEntity(g, 1);
            // Si un fantasma se atasca, reiniciar lógica de movimiento
            if (g.dx === 0 && g.dy === 0) {
                let dx = pacman.x - g.x;
                let dy = pacman.y - g.y;
                g.dx = Math.sign(dx) * 0.03;
                g.dy = Math.sign(dy) * 0.03;
            }
        });

        // 4. Colisiones con Fantasmas
        ghosts.forEach(g => {
            if (Math.abs(pacman.x - g.x) < 0.5 && Math.abs(pacman.y - g.y) < 0.5) {
                lives--;
                if (lives <= 0) {
                    resetGame();
                } else {
                    resetPositions();
                }
            }
        });
    }

    function resetPositions() {
        pacman.x = 10; pacman.y = 11; pacman.dx = 0; pacman.dy = 0;
        ghosts[0] = { x: 10, y: 9, dx: 0, dy: 1, color: '#FF0000' };
        ghosts[1] = { x: 9, y: 11, dx: 1, dy: 0, color: '#FFB8FF' };
        ghosts[2] = { x: 11, y: 11, dx: -1, dy: 0, color: '#00FFFF' };
        ghosts[3] = { x: 10, y: 13, dx: 0, dy: -1, color: '#FFB852' };
    }

    function resetGame() {
        score = 0; lives = 3;
        // Resetear mapa
        for(let y=0; y<map.length; y++) {
            for(let x=0; x<map[y].length; x++) {
                if(map[y][x] === 0 && !(y===11 && x===10)) map[y][x] = 2;
            }
        }
        resetPositions();
    }

    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar Laberinto
        for(let y=0; y<map.length; y++) {
            for(let x=0; x<map[y].length; x++) {
                let px = x * TILE_SIZE + 10, py = y * TILE_SIZE + 10;
                if (map[y][x] === 1) { ctx.fillStyle = '#1a1aff'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); }
                else if (map[y][x] === 2) { ctx.fillStyle = '#ffb8ff'; ctx.beginPath(); ctx.arc(px+12, py+12, 4, 0, 2*Math.PI); ctx.fill(); }
            }
        }
        
        // Dibujar Pac-Man (Animación boca)
        ctx.fillStyle = '#ffff00';
        let angle = 0.2 * Math.sin(pacman.mouth * 5);
        ctx.beginPath();
        ctx.arc(pacman.x * TILE_SIZE + 12 + 10, pacman.y * TILE_SIZE + 12 + 10, 12, angle, 2*Math.PI - angle);
        ctx.lineTo(pacman.x * TILE_SIZE + 12 + 10, pacman.y * TILE_SIZE + 12 + 10);
        ctx.fill();

        // Dibujar Fantasmas
        ghosts.forEach(g => {
            ctx.fillStyle = g.color;
            ctx.beginPath();
            ctx.arc(g.x * TILE_SIZE + 12 + 10, g.y * TILE_SIZE + 12 + 10, 12, Math.PI, 0);
            ctx.fill();
            // Ojos de los fantasmas
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(g.x * TILE_SIZE + 8 + 10, g.y * TILE_SIZE + 10 + 10, 5, 0, 2*Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(g.x * TILE_SIZE + 16 + 10, g.y * TILE_SIZE + 10 + 10, 5, 0, 2*Math.PI); ctx.fill();
        });

        // UI: Puntaje y Vidas
        ctx.fillStyle = '#fff'; ctx.font = '20px Arial';
        ctx.fillText('Puntaje: ' + score, 20, 40);
        ctx.fillText('Vidas: ' + lives, 20, 80);
        if(lives === 0) { ctx.fillStyle = '#ff0000'; ctx.font = '40px Arial'; ctx.fillText('GAME OVER', 250, 300); }
    }

    function loop() {
        if(lives > 0) update();
        draw();
        requestAnimationFrame(loop);
    }
    loop();
}