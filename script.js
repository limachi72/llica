const container = document.getElementById('svg-container');
let svgElement;
let scale = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX, startY;
let startTouches; // Para gestionar el zoom táctil

// Cargar el SVG dinámicamente
fetch('mapa/AnyConv.com__PlanogeneraldeLlica_Urbanizaciones.svg')
    .then(response => response.text())
    .then(svgContent => {
        container.innerHTML += svgContent;
        svgElement = container.querySelector('svg');
        
        const bbox = svgElement.getBBox();
        svgElement.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        setupZoomAndPan(svgElement);
    })
    .catch(error => console.error('Error cargando el SVG:', error));

function setupZoomAndPan(svg) {
    // Soporte para zoom con rueda
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const direction = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
        scale = Math.min(Math.max(scale + direction, 0.1), 10);
        requestAnimationFrame(updateTransform);
    });

    // Soporte para arrastrar con mouse
    svg.addEventListener('mousedown', (e) => {
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        svg.style.cursor = 'grabbing';
    });

    svg.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX -= (e.clientX - startX) / scale;
        panY -= (e.clientY - startY) / scale;
        startX = e.clientX;
        startY = e.clientY;

        requestAnimationFrame(updateTransform);
    });

    svg.addEventListener('mouseup', () => {
        isPanning = false;
        svg.style.cursor = 'grab';
    });

    svg.addEventListener('mouseleave', () => {
        isPanning = false;
        svg.style.cursor = 'grab';
    });

    // Soporte para pantallas táctiles
    svg.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) { // Arrastre con un dedo
            isPanning = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else if (e.touches.length === 2) { // Zoom con dos dedos
            isPanning = false;
            startTouches = [...e.touches];
        }
    });

    svg.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isPanning) {
            panX -= (e.touches[0].clientX - startX) / scale;
            panY -= (e.touches[0].clientY - startY) / scale;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;

            requestAnimationFrame(updateTransform);
        } else if (e.touches.length === 2) {
            const [touch1, touch2] = e.touches;
            const startDistance = Math.hypot(
                startTouches[0].clientX - startTouches[1].clientX,
                startTouches[0].clientY - startTouches[1].clientY
            );
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );

            scale *= currentDistance / startDistance;
            startTouches = [...e.touches];

            requestAnimationFrame(updateTransform);
        }
    });

    svg.addEventListener('touchend', () => {
        isPanning = false;
    });
}

function updateTransform() {
    const bbox = svgElement.getBBox();
    svgElement.setAttribute('viewBox', `${panX} ${panY} ${bbox.width / scale} ${bbox.height / scale}`);
}
