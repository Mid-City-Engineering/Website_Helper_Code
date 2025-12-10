/*
==================================================
PARALLAX EFFECT (UNIVERSAL)
==================================================
Multi-layer parallax scrolling effect for any section
Uses data-parallax-speed attribute to control scroll speed

Usage in HTML:
<div data-parallax-speed="0.3">Content moves slower</div>
<div data-parallax-speed="0.5">Content moves faster</div>

Speed values: 0.1 (slowest) to 1.0 (fastest)
==================================================
*/

(function () {
    // Find all elements with parallax data attribute
    const parallaxElements = document.querySelectorAll('[data-parallax-speed]');

    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-parallax-speed')) || 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
})();
