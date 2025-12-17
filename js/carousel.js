document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionar elementos clave del DOM
    const track = document.querySelector('.carousel-track');
    const container = document.querySelector('.carousel-container'); 
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');

    // Detectar solo las tarjetas originales
    const originalCards = Array.from(document.querySelectorAll('.carousel-card'));

    // --- INICIO: Añadir descripciones unificadas a las tarjetas ---
    const descripcionesUnificadas = [ // Descripciones resumidas
        "Visita el Cuarto del Rescate, único vestigio Inca en la ciudad y escenario de la promesa de un tesoro que Atahualpa ofreció por su libertad. Este lugar histórico marcó un punto de inflexión en el encuentro de dos mundos, definiendo el destino del imperio.", // Cuarto del Rescate
        "Asciende al cerro de Santa Apolonia, el mirador natural más icónico de Cajamarca, para disfrutar de vistas panorámicas inigualables. Conecta con la historia al descubrir vestigios como la 'Silla del Inca' en un entorno lleno de misticismo y paz.", // Santa Apolonia
        "Admira el Santuario de Polloc, una joya del arte religioso moderno. Sus fachadas e interior están adornados con impresionantes mosaicos de estilo italiano, creados por artesanos locales con piedras de la región, reflejando una profunda devoción popular.", // Iglesia de Polloc
        "Explora las misteriosas Ventanillas de Otuzco, una necrópolis pre-incaica tallada en roca volcánica. Estas enigmáticas cavidades sirvieron como tumbas para las élites de la cultura Cajamarca, ofreciendo una ventana a sus antiguos rituales funerarios.", // Ventanillas de Otuzco
    ];

    originalCards.forEach((card, index) => {
        const info = card.querySelector('.card-info');
        const titulo = info.querySelector('h2');
        if (titulo && descripcionesUnificadas[index]) {
            const p = document.createElement('p');
            // --- INICIO: Estilos para fondo difuminado y texto ---
            p.textContent = descripcionesUnificadas[index];
            p.style.fontSize = '1em';
            p.style.color = 'rgba(255, 255, 255, 0.95)';
            p.style.padding = '10px';
            p.style.borderRadius = '10px';
            p.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Fondo oscuro semitransparente
            p.style.backdropFilter = 'blur(4px)'; // Efecto de desenfoque
            p.style.webkitBackdropFilter = 'blur(4px)'; // Para compatibilidad con Safari
            p.style.marginBottom = '20px'; // Un poco más de espacio antes del botón
            titulo.insertAdjacentElement('afterend', p);
        }
    });
    // --- FIN: Añadir descripciones unificadas ---
    
    // 🚩 PASO 1: DUPLICACIÓN DINÁMICA DE TARJETAS
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.removeAttribute('data-index');
        track.appendChild(clone);
    });
    
    // Ahora 'cards' incluye el set original y los clones (8 tarjetas en total)
    const cards = Array.from(document.querySelectorAll('.carousel-card')); 
    
    // Parámetros de las tarjetas
    const originalCardCount = originalCards.length; // Ahora es 4
    const totalCardCount = cards.length; // Ahora es 8
    
    // 🚩 CLAVE JS: El valor del gap debe coincidir con el CSS (60px)
    const gap = 60; 
    
    let cardWidth = cards.length > 0 ? cards[0].getBoundingClientRect().width : 0;
    let originalTrackSize = (cardWidth + gap) * originalCardCount; 
    
    // Parámetros de Movimiento Automático (requestAnimationFrame)
    let currentPosition = 0; 
    const autoSpeed = 0.05; // Velocidad muy lenta
    let animationFrameId; 
    
    // Parámetros de Movimiento Manual (Clic de flecha)
    let isManualMode = false; 
    let currentManualIndex = 0; 
    const transitionTime = 300; 
    const pauseTime = 3000; 

    // 🚩 Parámetros de Arrastre (Drag)
    let isDragging = false;
    let startX = 0; 
    let startPosition = 0; 
    
    if (cards.length === 0 || cardWidth === 0) return;

    // 2. Preparación inicial
    track.style.transition = 'none';
    cards.forEach(card => card.style.left = 'unset');

    // --- FUNCIONES DE MOVIMIENTO AUTOMÁTICO Y FLUJO ---

    const animateAutoScroll = () => {
        if (isManualMode || isDragging) return; 
        
        currentPosition += autoSpeed;
        
        // Bucle sin fin: Reiniciar la posición
        if (currentPosition >= originalTrackSize) {
            currentPosition -= originalTrackSize;
        }

        track.style.transform = `translateX(-${currentPosition}px)`;
        animationFrameId = requestAnimationFrame(animateAutoScroll);
    };

    // --- FUNCIONES DE ARRASTRE (DRAG) ---

    const handleDragStart = (e) => {
        if (isDragging || e.button !== 0) return; 
        
        e.preventDefault(); 
        
        cancelAnimationFrame(animationFrameId);
        isDragging = true;
        isManualMode = true; 
        
        startX = e.clientX; 
        startPosition = currentPosition;
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;

        const dragDistance = e.clientX - startX;
        let newPosition = startPosition - dragDistance; 
        
        track.style.transform = `translateX(-${newPosition}px)`;
        currentPosition = newPosition; 
    };

    const handleDragEnd = () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);

        if (!isDragging) return;

        isDragging = false;
        
        const cardSize = cardWidth + gap;
        // Calcula el índice exacto donde debe hacer el snap
        let snappedIndex = Math.round(currentPosition / cardSize); 
        
        const snappedPosition = cardSize * snappedIndex;
        
        // 1. Deslizamiento suave (snap) a la posición más cercana
        track.style.transition = `transform ${transitionTime / 1000}s ease-out`;
        track.style.transform = `translateX(-${snappedPosition}px)`;
        currentPosition = snappedPosition;
        
        setTimeout(() => {
            track.style.transition = 'none';

            let resetIndex = snappedIndex;

            if (snappedIndex >= originalCardCount) {
                // Caso: Arrastre a la derecha (aterrizó en la copia)
                // Ej: snappedIndex 4 -> resetIndex 0
                resetIndex = snappedIndex % originalCardCount;
            } else if (snappedIndex < 0) {
                // 🚩 CLAVE CORREGIDA: Caso: Arrastre a la izquierda (índice negativo)
                // Usamos el módulo para calcular el índice dentro del total (8), y luego lo llevamos al set original (4-7)
                // Ej: snappedIndex -1 (tarjeta 3 original) -> ((-1 % 8) + 8) % 4 -> 3
                // La solución más simple es sumarle el total de tarjetas al índice negativo y luego tomar el módulo del original.
                resetIndex = (snappedIndex % originalCardCount + originalCardCount) % originalCardCount;
            }

            const resetPosition = cardSize * resetIndex;

            track.style.transform = `translateX(-${resetPosition}px)`;
            currentPosition = resetPosition;
            
            isManualMode = false;
            animateAutoScroll();
        }, transitionTime); 
    };

    // --- FUNCIONES DE NAVEGACIÓN MANUAL (Flechas) ---

    const activateManualMode = (direction) => {
        if (isManualMode || isDragging) return; 
        
        cancelAnimationFrame(animationFrameId); 
        isManualMode = true;
        
        currentManualIndex = Math.round(currentPosition / (cardWidth + gap)); 
        
        let targetIndex = currentManualIndex + direction;

        if (targetIndex >= cards.length) {
            targetIndex = 0;
        } else if (targetIndex < 0) {
            targetIndex = cards.length - 1;
        }

        const targetPosition = (cardWidth + gap) * targetIndex;

        track.style.transition = `transform ${transitionTime / 1000}s ease-in-out`;
        track.style.transform = `translateX(-${targetPosition}px)`;
        
        currentManualIndex = targetIndex;
        
        // Pausa de 3 segundos antes de reanudar el auto-scroll
        setTimeout(() => {
            track.style.transition = 'none';

            if (currentManualIndex >= originalCardCount) {
                const resetIndex = currentManualIndex - originalCardCount; 
                const resetPositionPx = (cardWidth + gap) * resetIndex;

                track.style.transform = `translateX(-${resetPositionPx}px)`;
                currentPosition = resetPositionPx;
                currentManualIndex = resetIndex;
            } else {
                currentPosition = targetPosition;
            }
            
            isManualMode = false;
            animateAutoScroll();
            
        }, transitionTime + pauseTime); 
    };
    
    // --- ASIGNACIÓN DE EVENTOS ---

    if (nextButton) nextButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        activateManualMode(1);
    });
    if (prevButton) prevButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        activateManualMode(-1);
    });

    // 🚩 Asignar los manejadores de eventos de ARRASTRE al contenedor principal
    container.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mouseleave', () => {
        if (isDragging) handleDragEnd();
    });

    // 6. Manejo de Redimensionamiento 
    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrameId); 
        
        // Recalcular dimensiones
        cardWidth = cards[0].getBoundingClientRect().width;
        originalTrackSize = (cardWidth + gap) * originalCardCount;
        const cardSize = cardWidth + gap;

        if (isDragging) handleDragEnd();
        
        // Recalcular la posición al centro de la tarjeta más cercana
        const targetPosition = cardSize * Math.round(currentPosition / cardSize);
        
        track.style.transition = 'none';
        track.style.transform = `translateX(-${targetPosition}px)`;
        currentPosition = targetPosition;
        
        // Reiniciar el scroll automático
        if (!isManualMode && !isDragging) {
            animateAutoScroll();
        }
    });

    // 7. INICIAR EL MOVIMIENTO AUTOMÁTICO
    animateAutoScroll();
});