document.addEventListener('DOMContentLoaded', function() {
    console.log("Página Web con reproductor de música cargada.");
});

// Función para manejar la reproducción
function reproducirCancion(elemento) {
    // 1. Obtener el elemento <audio> dentro de la tarjeta clickeada
    const audio = elemento.querySelector('audio');
    const iconoPlay = elemento.querySelector('.icono-play i');

    // 2. Detener todas las demás canciones
    const todasLasCanciones = document.querySelectorAll('.tarjeta-cancion');
    todasLasCanciones.forEach(cancion => {
        if (cancion !== elemento) {
            const otrosAudios = cancion.querySelector('audio');
            const otrosIconos = cancion.querySelector('.icono-play i');
            
            if (otrosAudios) {
                otrosAudios.pause();
                otrosAudios.currentTime = 0; // Rebobinar al inicio
            }
            if (otrosIconos) {
                // Volver a poner el icono de "Play"
                otrosIconos.classList.remove('fa-pause-circle');
                otrosIconos.classList.add('fa-play-circle');
            }
            // Quitar la clase visual de "reproduciendo"
            cancion.classList.remove('reproduciendo');
        }
    });

    // 3. Reproducir o Pausar la canción clickeada
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

    // 4. Evento para cuando la canción termina sola
    audio.onended = function() {
        iconoPlay.classList.remove('fa-pause-circle');
        iconoPlay.classList.add('fa-play-circle');
        elemento.classList.remove('reproduciendo');
    };
}