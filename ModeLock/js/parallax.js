/*
==================================================
PARALLAX EFFECT
==================================================
Multi-layer hero section parallax scrolling effect
Used by: Hero section image layers
==================================================
*/

(function () {
    const layers = {
        midCity: { element: document.querySelector('.mid-city-heading'), speed: 0.3 },
        modelock: { element: document.querySelector('.modelock-title'), speed: 0.4 },
        subtitle: { element: document.querySelector('.tagline'), speed: 0.5 },
        // car: { element: document.querySelector('."middle-half'), speed: 0.5 }
    };

    const hasElements = Object.values(layers).some(layer => layer.element !== null);

    if (hasElements) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            // Apply parallax to each layer
            Object.values(layers).forEach(layer => {
                if (layer.element) {
                    // Add parallax translateY
                    layer.element.style.transform = `translateY(${scrolled * layer.speed}px)`;
                }
            });
        });
    }
})();
